import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

const errors = [];
const warnings = [];

page.on('console', msg => {
  const text = msg.text();
  if (msg.type() === 'error') {
    errors.push(text);
  } else if (msg.type() === 'warning') {
    warnings.push(text);
  }
});

page.on('pageerror', error => {
  errors.push(`Page error: ${error.message}`);
});

try {
  console.log('Navigating to Button docs page...');
  const url = 'http://localhost:6006/?path=/docs/components-button--docs';
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait for Storybook to fully load
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: 'storybook-button-docs-test.png', fullPage: true });
  console.log('✅ Screenshot saved: storybook-button-docs-test.png');
  
  // Check if docs content is rendered
  const docsSelectors = [
    '[data-testid="storybook-docs"]',
    '[class*="docs"]',
    '[class*="Docs"]',
    'article',
    '[role="article"]',
    'main'
  ];
  
  let docsFound = false;
  for (const selector of docsSelectors) {
    const element = await page.$(selector);
    if (element) {
      const text = await element.textContent();
      if (text && text.length > 100) {
        console.log(`✅ Found docs content with selector: ${selector}`);
        console.log(`   Content preview: ${text.substring(0, 200)}...`);
        docsFound = true;
        break;
      }
    }
  }
  
  // Check for iframe (Storybook docs may use iframe)
  const iframes = await page.$$('iframe');
  console.log(`Found ${iframes.length} iframe(s)`);
  
  if (iframes.length > 0) {
    for (let i = 0; i < iframes.length; i++) {
      const storyFrame = iframes[i];
      const frame = await storyFrame.contentFrame();
      
      if (frame) {
        await frame.waitForTimeout(2000);
        
        // Check for docs content in iframe
        const iframeBody = await frame.$('body');
        if (iframeBody) {
          const bodyText = await iframeBody.textContent();
          if (bodyText && bodyText.length > 100) {
            console.log(`✅ Found docs content in iframe ${i + 1}`);
            console.log(`   Content preview: ${bodyText.substring(0, 200)}...`);
            docsFound = true;
            
            // Check for Button component in docs
            if (bodyText.includes('Button') || bodyText.includes('button')) {
              console.log('✅ Button component referenced in docs');
            }
          }
        }
        
        // Get console logs from iframe
        const iframeErrors = [];
        const iframeWarnings = [];
        frame.on('console', msg => {
          if (msg.type() === 'error') {
            iframeErrors.push(msg.text());
          } else if (msg.type() === 'warning') {
            iframeWarnings.push(msg.text());
          }
        });
        await frame.waitForTimeout(2000);
        
        if (iframeErrors.length > 0) {
          console.log(`❌ Errors in iframe ${i + 1}:`);
          iframeErrors.forEach(err => console.log(`   ${err}`));
          errors.push(...iframeErrors.map(e => `[iframe ${i + 1}] ${e}`));
        }
        
        if (iframeWarnings.length > 0) {
          console.log(`⚠️ Warnings in iframe ${i + 1}:`);
          iframeWarnings.slice(0, 5).forEach(warn => console.log(`   ${warn}`));
          warnings.push(...iframeWarnings.map(w => `[iframe ${i + 1}] ${w}`));
        }
      }
    }
  }
  
  // Check page title
  const title = await page.title();
  console.log(`\nPage title: ${title}`);
  
  // Check URL
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);
  
  if (!docsFound) {
    console.log('⚠️ Could not find docs content - checking page structure...');
    const bodyText = await page.textContent('body');
    console.log(`Body text length: ${bodyText?.length || 0}`);
    if (bodyText) {
      console.log(`Body preview: ${bodyText.substring(0, 500)}...`);
    }
  }
  
  // Summary
  console.log('\n=== Summary ===');
  console.log(`Docs rendered: ${docsFound ? '✅ YES' : '❌ NO'}`);
  console.log(`Console errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(err => console.log(`  ${err}`));
  } else {
    console.log('  ✅ No console errors');
  }
  
  console.log(`\nConsole warnings: ${warnings.length}`);
  if (warnings.length > 0 && warnings.length <= 10) {
    warnings.forEach(warn => console.log(`  ⚠️ ${warn}`));
  } else if (warnings.length > 10) {
    console.log(`  ⚠️ ${warnings.length} warnings (showing first 10)`);
    warnings.slice(0, 10).forEach(warn => console.log(`  ⚠️ ${warn}`));
  } else {
    console.log('  ✅ No console warnings');
  }
  
} catch (error) {
  console.error(`\n❌ Fatal error: ${error.message}`);
  console.error(error.stack);
  await page.screenshot({ path: 'storybook-button-docs-error.png', fullPage: true });
} finally {
  await browser.close();
  console.log('\nBrowser closed');
}
