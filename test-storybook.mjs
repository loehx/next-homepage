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
  console.log('Navigating to Storybook...');
  await page.goto('http://localhost:6006', { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  // Wait a bit for Storybook to initialize
  await page.waitForTimeout(5000);
  
  // Take screenshot of initial state
  await page.screenshot({ path: 'storybook-initial.png', fullPage: true });
  console.log('✅ Screenshot saved: storybook-initial.png');
  
  // Try to find sidebar - Storybook uses various selectors
  const sidebarSelectors = [
    '[data-side="left"]',
    '[class*="sidebar"]',
    '[class*="Sidebar"]',
    'nav',
    '[role="navigation"]'
  ];
  
  let sidebarFound = false;
  for (const selector of sidebarSelectors) {
    const element = await page.$(selector);
    if (element) {
      console.log(`✅ Found sidebar with selector: ${selector}`);
      sidebarFound = true;
      break;
    }
  }
  
  if (!sidebarFound) {
    console.log('⚠️ Could not find sidebar, but continuing...');
  }
  
  // Try direct navigation to Button story
  console.log('\n=== Testing Button Component ===');
  try {
    await page.goto('http://localhost:6006/?path=/story/components-button--primary', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForTimeout(3000);
    
    // Check for iframe
    const iframes = await page.$$('iframe');
    console.log(`Found ${iframes.length} iframes`);
    
    if (iframes.length > 0) {
      const storyFrame = iframes[0];
      const frame = await storyFrame.contentFrame();
      
      if (frame) {
        await frame.waitForTimeout(2000);
        
        // Check for button element
        const buttonElement = await frame.$('button');
        if (buttonElement) {
          const buttonText = await buttonElement.textContent();
          console.log(`✅ Button story rendered: "${buttonText}"`);
          await page.screenshot({ path: 'storybook-button-success.png', fullPage: true });
        } else {
          console.log('⚠️ Button story loaded but no button element found');
          
          // Check for errors in iframe
          const iframeBody = await frame.$('body');
          if (iframeBody) {
            const bodyText = await iframeBody.textContent();
            if (bodyText.includes('error') || bodyText.includes('Error')) {
              console.log('❌ Error detected in iframe content');
              console.log(`Body content: ${bodyText.substring(0, 200)}`);
            }
          }
        }
        
        // Get console logs from iframe
        const iframeErrors = [];
        frame.on('console', msg => {
          if (msg.type() === 'error') {
            iframeErrors.push(msg.text());
          }
        });
        await frame.waitForTimeout(1000);
        
        if (iframeErrors.length > 0) {
          console.log('❌ Errors in Button story iframe:');
          iframeErrors.forEach(err => console.log(`   ${err}`));
        }
      } else {
        console.log('⚠️ Could not access iframe content');
      }
    } else {
      console.log('❌ No iframe found - Storybook may not be loading correctly');
    }
    
    await page.screenshot({ path: 'storybook-button-page.png', fullPage: true });
    
  } catch (err) {
    console.log(`❌ Error testing Button: ${err.message}`);
    await page.screenshot({ path: 'storybook-button-error.png', fullPage: true });
  }
  
  // Try direct navigation to Card story
  console.log('\n=== Testing Card Component ===');
  try {
    await page.goto('http://localhost:6006/?path=/story/components-card--default', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForTimeout(3000);
    
    const iframes = await page.$$('iframe');
    if (iframes.length > 0) {
      const storyFrame = iframes[0];
      const frame = await storyFrame.contentFrame();
      
      if (frame) {
        await frame.waitForTimeout(2000);
        
        const cardElement = await frame.$('.card');
        if (cardElement) {
          console.log('✅ Card story rendered successfully');
          await page.screenshot({ path: 'storybook-card-success.png', fullPage: true });
        } else {
          console.log('⚠️ Card story loaded but no card element found');
          
          const iframeBody = await frame.$('body');
          if (iframeBody) {
            const bodyText = await iframeBody.textContent();
            console.log(`Iframe body preview: ${bodyText.substring(0, 300)}`);
          }
        }
        
        // Get console logs from iframe
        const iframeErrors = [];
        frame.on('console', msg => {
          if (msg.type() === 'error') {
            iframeErrors.push(msg.text());
          }
        });
        await frame.waitForTimeout(1000);
        
        if (iframeErrors.length > 0) {
          console.log('❌ Errors in Card story iframe:');
          iframeErrors.forEach(err => console.log(`   ${err}`));
        }
      }
    }
    
    await page.screenshot({ path: 'storybook-card-page.png', fullPage: true });
    
  } catch (err) {
    console.log(`❌ Error testing Card: ${err.message}`);
    await page.screenshot({ path: 'storybook-card-error.png', fullPage: true });
  }
  
  // Summary
  console.log('\n=== Summary ===');
  console.log(`Main page console errors: ${errors.length}`);
  if (errors.length > 0) {
    errors.forEach(err => console.log(`  ❌ ${err}`));
  } else {
    console.log('  ✅ No main page console errors');
  }
  
  console.log(`Main page console warnings: ${warnings.length}`);
  if (warnings.length > 0 && warnings.length <= 10) {
    warnings.forEach(warn => console.log(`  ⚠️ ${warn}`));
  } else if (warnings.length > 10) {
    console.log(`  ⚠️ ${warnings.length} warnings (showing first 5)`);
    warnings.slice(0, 5).forEach(warn => console.log(`  ⚠️ ${warn}`));
  }
  
} catch (error) {
  console.error(`\n❌ Fatal error: ${error.message}`);
  console.error(error.stack);
  await page.screenshot({ path: 'storybook-fatal-error.png', fullPage: true });
} finally {
  await browser.close();
  console.log('\nBrowser closed');
}
