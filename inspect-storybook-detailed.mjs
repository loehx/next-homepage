import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

const errors = [];
const allConsoleMessages = [];

// Capture ALL console messages
page.on('console', msg => {
  const text = msg.text();
  const location = msg.location();
  const type = msg.type();
  
  allConsoleMessages.push({
    type,
    text,
    location: location ? {
      url: location.url,
      lineNumber: location.lineNumber,
      columnNumber: location.columnNumber
    } : null
  });
  
  if (type === 'error') {
    errors.push({
      text,
      location: location ? {
        url: location.url,
        lineNumber: location.lineNumber,
        columnNumber: location.columnNumber
      } : null
    });
  }
});

// Capture page errors with stack traces
page.on('pageerror', error => {
  errors.push({
    text: error.message,
    stack: error.stack,
    name: error.name
  });
});

// Monitor network
const networkRequests = [];
page.on('response', response => {
  if (!response.ok()) {
    networkRequests.push({
      url: response.url(),
      status: response.status(),
      statusText: response.statusText()
    });
  }
});

page.on('requestfailed', request => {
  networkRequests.push({
    url: request.url(),
    status: 'FAILED',
    failure: request.failure()?.errorText || 'Unknown'
  });
});

try {
  console.log('Navigating to Storybook docs page...');
  await page.goto('http://localhost:6006/?path=/docs/components-button--docs', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  console.log('Waiting for Storybook to initialize...');
  await page.waitForTimeout(8000);
  
  // Check if React is defined in main context
  const reactInMain = await page.evaluate(() => {
    return typeof window.React !== 'undefined' || typeof React !== 'undefined';
  });
  console.log(`React defined in main context: ${reactInMain}`);
  
  // Try to access the iframe
  const iframes = await page.$$('iframe');
  console.log(`\nFound ${iframes.length} iframe(s)`);
  
  if (iframes.length > 0) {
    const storyFrame = iframes[0];
    const frame = await storyFrame.contentFrame();
    
    if (frame) {
      console.log('Accessing story iframe...');
      
      // Capture iframe console
      frame.on('console', msg => {
        const text = msg.text();
        const location = msg.location();
        const type = msg.type();
        
        allConsoleMessages.push({
          type: `[IFRAME] ${type}`,
          text,
          location: location ? {
            url: location.url,
            lineNumber: location.lineNumber,
            columnNumber: location.columnNumber
          } : null
        });
        
        if (type === 'error') {
          errors.push({
            text: `[IFRAME] ${text}`,
            location: location ? {
              url: location.url,
              lineNumber: location.lineNumber,
              columnNumber: location.columnNumber
            } : null
          });
        }
      });
      
      frame.on('pageerror', error => {
        errors.push({
          text: `[IFRAME] ${error.message}`,
          stack: error.stack,
          name: error.name
        });
      });
      
      // Wait for iframe to load
      await frame.waitForTimeout(5000);
      
      // Check if React is defined in iframe
      try {
        const reactInIframe = await frame.evaluate(() => {
          return typeof window.React !== 'undefined' || typeof React !== 'undefined';
        });
        console.log(`React defined in iframe: ${reactInIframe}`);
      } catch (e) {
        console.log(`Could not check React in iframe: ${e.message}`);
      }
      
      // Try to get error messages from the iframe DOM
      try {
        const errorElements = await frame.$$('[class*="error"], [class*="Error"], [id*="error"]');
        console.log(`Found ${errorElements.length} potential error elements in iframe`);
        
        for (const elem of errorElements.slice(0, 5)) {
          const text = await elem.textContent();
          if (text && (text.includes('React') || text.includes('error') || text.includes('Error'))) {
            console.log(`Error element text: ${text.substring(0, 200)}`);
          }
        }
      } catch (e) {
        console.log(`Could not check error elements: ${e.message}`);
      }
    }
  }
  
  // Take screenshot
  await page.screenshot({ path: 'storybook-error-check.png', fullPage: true });
  
  // Print all console messages related to React
  console.log('\n=== CONSOLE MESSAGES (React-related) ===');
  const reactMessages = allConsoleMessages.filter(msg => 
    msg.text.toLowerCase().includes('react') || 
    msg.text.toLowerCase().includes('not defined')
  );
  
  if (reactMessages.length > 0) {
    reactMessages.forEach((msg, idx) => {
      console.log(`\nMessage ${idx + 1} [${msg.type}]:`);
      console.log(`  Text: ${msg.text}`);
      if (msg.location) {
        console.log(`  File: ${msg.location.url}`);
        console.log(`  Line: ${msg.location.lineNumber}, Column: ${msg.location.columnNumber}`);
      }
    });
  } else {
    console.log('No React-related console messages found');
  }
  
  // Print all errors
  console.log('\n=== ALL ERRORS ===');
  if (errors.length > 0) {
    errors.forEach((err, idx) => {
      console.log(`\nError ${idx + 1}:`);
      console.log(`  Message: ${err.text}`);
      if (err.location) {
        console.log(`  File: ${err.location.url}`);
        console.log(`  Line: ${err.location.lineNumber}, Column: ${err.location.columnNumber}`);
      }
      if (err.stack) {
        console.log(`  Stack:\n${err.stack}`);
      }
    });
  } else {
    console.log('No errors captured');
  }
  
  // Print network failures
  console.log('\n=== NETWORK STATUS ===');
  if (networkRequests.length > 0) {
    networkRequests.forEach((req, idx) => {
      console.log(`\nRequest ${idx + 1}:`);
      console.log(`  URL: ${req.url}`);
      console.log(`  Status: ${req.status || 'FAILED'}`);
      if (req.failure) {
        console.log(`  Failure: ${req.failure}`);
      }
    });
  } else {
    console.log('No failed network requests');
  }
  
  // Keep browser open
  console.log('\n⚠️  Browser will stay open for 60 seconds for manual inspection...');
  console.log('   Please check DevTools console and Network tab manually');
  await page.waitForTimeout(60000);
  
} catch (error) {
  console.error(`\n❌ Fatal error: ${error.message}`);
  console.error(error.stack);
  await page.screenshot({ path: 'storybook-fatal-error.png', fullPage: true });
} finally {
  await browser.close();
  console.log('\nBrowser closed');
}
