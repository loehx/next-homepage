import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

let errorDetails = null;

// Override console.error to capture React errors
await page.addInitScript(() => {
  const originalError = console.error;
  console.error = function(...args) {
    originalError.apply(console, args);
    if (args.some(arg => String(arg).includes('React is not defined'))) {
      window.__storybookError = {
        message: args.map(a => String(a)).join(' '),
        stack: new Error().stack
      };
    }
  };
  
  // Also catch unhandled errors
  window.addEventListener('error', (e) => {
    if (e.message.includes('React is not defined')) {
      window.__storybookError = {
        message: e.message,
        stack: e.stack,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      };
    }
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    const msg = String(e.reason);
    if (msg.includes('React is not defined')) {
      window.__storybookError = {
        message: msg,
        stack: e.reason?.stack || new Error().stack
      };
    }
  });
});

try {
  console.log('Navigating to Storybook docs page...');
  await page.goto('http://localhost:6006/?path=/docs/components-button--docs', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  console.log('Waiting for page to load...');
  await page.waitForTimeout(10000);
  
  // Try to get error from main context
  const mainError = await page.evaluate(() => {
    return window.__storybookError || null;
  });
  
  if (mainError) {
    errorDetails = mainError;
    console.log('\n✅ Captured error in main context:');
    console.log(`Message: ${mainError.message}`);
    console.log(`Stack: ${mainError.stack}`);
    if (mainError.filename) {
      console.log(`File: ${mainError.filename}`);
      console.log(`Line: ${mainError.lineno}, Column: ${mainError.colno}`);
    }
  }
  
  // Try to access iframe
  const iframes = await page.$$('iframe');
  console.log(`\nFound ${iframes.length} iframe(s)`);
  
  if (iframes.length > 0 && !errorDetails) {
    const storyFrame = iframes[0];
    const frame = await storyFrame.contentFrame();
    
    if (frame) {
      console.log('Checking iframe for errors...');
      
      // Inject error capture into iframe
      await frame.addScriptTag({
        content: `
          (function() {
            const originalError = console.error;
            console.error = function(...args) {
              originalError.apply(console, args);
              if (args.some(arg => String(arg).includes('React is not defined'))) {
                window.__storybookError = {
                  message: args.map(a => String(a)).join(' '),
                  stack: new Error().stack
                };
              }
            };
            
            window.addEventListener('error', (e) => {
              if (e.message.includes('React is not defined')) {
                window.__storybookError = {
                  message: e.message,
                  stack: e.stack,
                  filename: e.filename,
                  lineno: e.lineno,
                  colno: e.colno
                };
              }
            });
          })();
        `
      });
      
      await frame.waitForTimeout(5000);
      
      const iframeError = await frame.evaluate(() => {
        return window.__storybookError || null;
      });
      
      if (iframeError) {
        errorDetails = iframeError;
        console.log('\n✅ Captured error in iframe:');
        console.log(`Message: ${iframeError.message}`);
        console.log(`Stack: ${iframeError.stack}`);
        if (iframeError.filename) {
          console.log(`File: ${iframeError.filename}`);
          console.log(`Line: ${iframeError.lineno}, Column: ${iframeError.colno}`);
        }
      }
    }
  }
  
  // Also try to get console logs directly
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    const location = msg.location();
    if (msg.type() === 'error' && text.includes('React')) {
      consoleMessages.push({
        text,
        location: location ? {
          url: location.url,
          lineNumber: location.lineNumber,
          columnNumber: location.columnNumber
        } : null
      });
    }
  });
  
  await page.waitForTimeout(2000);
  
  if (consoleMessages.length > 0) {
    console.log('\n=== Console Errors Found ===');
    consoleMessages.forEach((msg, idx) => {
      console.log(`\nError ${idx + 1}:`);
      console.log(`  Text: ${msg.text}`);
      if (msg.location) {
        console.log(`  File: ${msg.location.url}`);
        console.log(`  Line: ${msg.location.lineNumber}, Column: ${msg.location.columnNumber}`);
      }
    });
  }
  
  // Take screenshot
  await page.screenshot({ path: 'storybook-error-capture.png', fullPage: true });
  
  if (!errorDetails && consoleMessages.length === 0) {
    console.log('\n⚠️  No error captured automatically.');
    console.log('   Please check the browser DevTools console manually.');
    console.log('   The error should show a file path and line number.');
    console.log('   Browser will stay open for 60 seconds...');
    await page.waitForTimeout(60000);
  }
  
} catch (error) {
  console.error(`\n❌ Fatal error: ${error.message}`);
  console.error(error.stack);
} finally {
  await browser.close();
  console.log('\nBrowser closed');
}
