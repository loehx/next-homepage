import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

const errors = [];
const networkFailures = [];

// Capture console errors with full details
page.on('console', msg => {
  const text = msg.text();
  const location = msg.location();
  
  if (msg.type() === 'error') {
    errors.push({
      text,
      location: location ? {
        url: location.url,
        lineNumber: location.lineNumber,
        columnNumber: location.columnNumber
      } : null,
      args: msg.args().map(arg => arg.toString())
    });
    console.log('\n❌ Console Error:');
    console.log(`   Message: ${text}`);
    if (location) {
      console.log(`   File: ${location.url}`);
      console.log(`   Line: ${location.lineNumber}, Column: ${location.columnNumber}`);
    }
  }
});

// Capture page errors
page.on('pageerror', error => {
  errors.push({
    text: `Page error: ${error.message}`,
    stack: error.stack,
    location: null
  });
  console.log('\n❌ Page Error:');
  console.log(`   Message: ${error.message}`);
  if (error.stack) {
    console.log(`   Stack: ${error.stack}`);
  }
});

// Monitor network requests
page.on('requestfailed', request => {
  networkFailures.push({
    url: request.url(),
    failure: request.failure()?.errorText || 'Unknown failure'
  });
  console.log(`\n❌ Network Failure: ${request.url()}`);
  console.log(`   Error: ${request.failure()?.errorText || 'Unknown'}`);
});

try {
  console.log('Navigating to Storybook docs page...');
  await page.goto('http://localhost:6006/?path=/docs/components-button--docs', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  console.log('Waiting for page to load...');
  await page.waitForTimeout(5000);
  
  // Try to access the iframe where the story renders
  const iframes = await page.$$('iframe');
  console.log(`\nFound ${iframes.length} iframe(s)`);
  
  if (iframes.length > 0) {
    const storyFrame = iframes[0];
    const frame = await storyFrame.contentFrame();
    
    if (frame) {
      console.log('Accessing story iframe...');
      
      // Capture iframe console errors
      frame.on('console', msg => {
        const text = msg.text();
        const location = msg.location();
        
        if (msg.type() === 'error') {
          errors.push({
            text: `[IFRAME] ${text}`,
            location: location ? {
              url: location.url,
              lineNumber: location.lineNumber,
              columnNumber: location.columnNumber
            } : null,
            args: msg.args().map(arg => arg.toString())
          });
          console.log('\n❌ Iframe Console Error:');
          console.log(`   Message: ${text}`);
          if (location) {
            console.log(`   File: ${location.url}`);
            console.log(`   Line: ${location.lineNumber}, Column: ${location.columnNumber}`);
          }
        }
      });
      
      // Capture iframe page errors
      frame.on('pageerror', error => {
        errors.push({
          text: `[IFRAME] Page error: ${error.message}`,
          stack: error.stack,
          location: null
        });
        console.log('\n❌ Iframe Page Error:');
        console.log(`   Message: ${error.message}`);
        if (error.stack) {
          console.log(`   Stack: ${error.stack}`);
        }
      });
      
      await frame.waitForTimeout(3000);
    }
  }
  
  // Take screenshot
  await page.screenshot({ path: 'storybook-error-check.png', fullPage: true });
  console.log('\n✅ Screenshot saved: storybook-error-check.png');
  
  // Print summary
  console.log('\n=== ERROR SUMMARY ===');
  console.log(`Total errors: ${errors.length}`);
  console.log(`Network failures: ${networkFailures.length}`);
  
  if (errors.length > 0) {
    console.log('\n=== DETAILED ERROR REPORT ===');
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
  }
  
  if (networkFailures.length > 0) {
    console.log('\n=== NETWORK FAILURES ===');
    networkFailures.forEach((failure, idx) => {
      console.log(`\nFailure ${idx + 1}:`);
      console.log(`  URL: ${failure.url}`);
      console.log(`  Error: ${failure.failure}`);
    });
  }
  
  // Keep browser open for manual inspection
  console.log('\n⚠️  Browser will stay open for 30 seconds for manual inspection...');
  console.log('   Check the browser DevTools console and Network tab');
  await page.waitForTimeout(30000);
  
} catch (error) {
  console.error(`\n❌ Fatal error: ${error.message}`);
  console.error(error.stack);
  await page.screenshot({ path: 'storybook-fatal-error.png', fullPage: true });
} finally {
  await browser.close();
  console.log('\nBrowser closed');
}
