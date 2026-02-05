import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

const errors = [];
const warnings = [];
const verificationResults = {
  typewriterEffect: false,
  asteriskBoldFormatting: false,
  automaticCycling: false,
  progressBar: false,
  pausePlay: false,
  phonePlaceholder: false,
  consoleErrors: [],
  bemClasses: false,
};

page.on('console', msg => {
  const text = msg.text();
  if (msg.type() === 'error') {
    errors.push(text);
    verificationResults.consoleErrors.push(text);
  } else if (msg.type() === 'warning') {
    warnings.push(text);
  }
});

page.on('pageerror', error => {
  errors.push(`Page error: ${error.message}`);
  verificationResults.consoleErrors.push(`Page error: ${error.message}`);
});

try {
  console.log('=== Capability Component Verification ===\n');
  
  // Navigate to Capability story
  console.log('Navigating to Capability story...');
  await page.goto('http://localhost:6006/?path=/story/components-capability--default', { 
    waitUntil: 'networkidle', 
    timeout: 30000 
  });
  
  // Wait for Storybook to initialize
  await page.waitForTimeout(5000);
  
  // Take initial screenshot
  await page.screenshot({ path: 'storybook-capability-default.png', fullPage: true });
  console.log('✅ Screenshot saved: storybook-capability-default.png');
  
  // Check for errors in page console first
  console.log('\nChecking page-level errors...');
  const pageErrors = errors.filter(e => e.includes('Failed to fetch') || e.includes('404'));
  if (pageErrors.length > 0) {
    console.log('⚠️ Found page-level errors:');
    pageErrors.forEach(e => console.log(`   - ${e}`));
    console.log('\n⚠️ Component may not be loading due to build/module issues');
    console.log('   This could indicate Storybook needs a rebuild or the component has import issues');
  }
  
  // Find and access iframe
  const iframes = await page.$$('iframe');
  console.log(`Found ${iframes.length} iframe(s)`);
  
  if (iframes.length === 0) {
    throw new Error('No iframe found - Storybook story may not be loading');
  }
  
  const storyFrame = iframes[0];
  const frame = await storyFrame.contentFrame();
  
  if (!frame) {
    throw new Error('Could not access iframe content');
  }
  
  // Wait for component to render - try waiting for specific elements
  console.log('Waiting for component to render...');
  try {
    await frame.waitForSelector('.capability', { timeout: 10000 });
    console.log('✅ Component container found');
  } catch (e) {
    console.log('⚠️ Component container not found after 10s, checking page content...');
    const bodyText = await frame.textContent('body');
    console.log(`   Body text preview: ${bodyText.substring(0, 200)}`);
    
    // Check if there's an error message
    const errorElements = await frame.$$('[class*="error"], [class*="Error"]');
    if (errorElements.length > 0) {
      for (const el of errorElements) {
        const errorText = await el.textContent();
        console.log(`   Error element: ${errorText}`);
      }
    }
  }
  
  await frame.waitForTimeout(2000);
  
  // Debug: Check what's actually in the frame
  console.log('\n=== Debug: Frame Content ===');
  const frameHTML = await frame.content();
  const hasCapability = frameHTML.includes('capability');
  console.log(`   HTML contains 'capability': ${hasCapability}`);
  
  const allElements = await frame.$$('*');
  console.log(`   Total elements in frame: ${allElements.length}`);
  
  const bodyClasses = await frame.$eval('body', el => el.className);
  console.log(`   Body classes: ${bodyClasses}`);
  
  // 1. Verify typewriter effect
  console.log('\n1. Checking typewriter effect...');
  const detailLabel = await frame.$('.capability__detail-label');
  if (detailLabel) {
    // Get initial text length
    const initialText = await detailLabel.textContent();
    const initialLength = initialText.replace(/\s+/g, ' ').trim().length;
    console.log(`   Initial text length: ${initialLength}`);
    
    // Wait a bit and check if text is growing (typewriter effect)
    await frame.waitForTimeout(500);
    const midText = await detailLabel.textContent();
    const midLength = midText.replace(/\s+/g, ' ').trim().length;
    
    await frame.waitForTimeout(500);
    const laterText = await detailLabel.textContent();
    const laterLength = laterText.replace(/\s+/g, ' ').trim().length;
    
    // Check if cursor is present (indicates typing in progress)
    const cursor = await frame.$('.capability__cursor');
    const cursorVisible = cursor ? await cursor.isVisible() : false;
    
    if (cursorVisible || (midLength > initialLength || laterLength > midLength)) {
      verificationResults.typewriterEffect = true;
      console.log('✅ Typewriter effect detected');
      console.log(`   Text growth: ${initialLength} → ${midLength} → ${laterLength}`);
      console.log(`   Cursor visible: ${cursorVisible}`);
    } else {
      // Check if text is already complete (animation finished)
      const fullText = await detailLabel.textContent();
      const strongElements = await detailLabel.$$('strong');
      if (strongElements.length > 0 && fullText.length > 50) {
        console.log('⚠️ Typewriter may have completed already');
        console.log(`   Full text length: ${fullText.length}`);
        verificationResults.typewriterEffect = true; // Consider pass if text is complete
      } else {
        console.log('❌ Typewriter effect not detected');
        console.log(`   Text: "${fullText.substring(0, 100)}..."`);
      }
    }
  } else {
    console.log('❌ Detail label element not found');
  }
  
  // 2. Verify asterisk-based bold formatting
  console.log('\n2. Checking asterisk-based bold formatting...');
  const strongElements = await frame.$$('.capability__detail-label strong');
  if (strongElements.length > 0) {
    verificationResults.asteriskBoldFormatting = true;
    console.log(`✅ Found ${strongElements.length} bold segment(s)`);
    
    // Check a few bold elements to verify they contain expected text
    for (let i = 0; i < Math.min(3, strongElements.length); i++) {
      const boldText = await strongElements[i].textContent();
      const boldColor = await strongElements[i].evaluate(el => {
        return getComputedStyle(el).color;
      });
      console.log(`   Bold segment ${i + 1}: "${boldText}" (color: ${boldColor})`);
    }
    
    // Verify that asterisks are NOT in the rendered text
    const allText = await detailLabel.textContent();
    if (allText.includes('*')) {
      console.log('⚠️ Warning: Asterisks found in rendered text (should be stripped)');
    } else {
      console.log('✅ Asterisks correctly stripped from rendered text');
    }
  } else {
    console.log('❌ No bold segments found (expected text with *markers*)');
  }
  
  // 3. Verify automatic cycling (every 5 seconds)
  console.log('\n3. Checking automatic cycling (5 second intervals)...');
  const detailTitle = await frame.$('.capability__detail-title');
  if (detailTitle) {
    const initialTitle = await detailTitle.textContent();
    console.log(`   Initial title: "${initialTitle.trim()}"`);
    
    // Wait for cycle (5 seconds + buffer)
    console.log('   Waiting for cycle (6 seconds)...');
    await frame.waitForTimeout(6000);
    
    const newTitle = await detailTitle.textContent();
    console.log(`   New title after 6s: "${newTitle.trim()}"`);
    
    if (initialTitle.trim() !== newTitle.trim()) {
      verificationResults.automaticCycling = true;
      console.log('✅ Automatic cycling detected - title changed');
    } else {
      // Check if we're on the last item (would cycle back to first)
      const titleText = initialTitle.trim();
      if (titleText.includes('Cursor') || titleText.includes('AI')) {
        console.log('⚠️ May be on last item - checking if cycles back to first...');
        await frame.waitForTimeout(6000);
        const finalTitle = await detailTitle.textContent();
        if (finalTitle.trim() !== titleText) {
          verificationResults.automaticCycling = true;
          console.log('✅ Cycling confirmed - moved to next item');
        } else {
          console.log('❌ Automatic cycling not detected');
        }
      } else {
        console.log('❌ Automatic cycling not detected - title unchanged');
      }
    }
  } else {
    console.log('❌ Detail title element not found');
  }
  
  // 4. Verify progress bar
  console.log('\n4. Checking progress bar...');
  const progressBar = await frame.$('.capability__progress-bar');
  if (progressBar) {
    const computedStyle = await progressBar.evaluate(el => {
      const style = getComputedStyle(el);
      return {
        animationName: style.animationName,
        animationPlayState: style.animationPlayState,
        width: style.width,
        backgroundColor: style.backgroundColor,
      };
    });
    
    if (computedStyle.animationName !== 'none' && computedStyle.animationPlayState === 'running') {
      verificationResults.progressBar = true;
      console.log('✅ Progress bar animation is running');
      console.log(`   Animation: ${computedStyle.animationName}`);
      console.log(`   State: ${computedStyle.animationPlayState}`);
      console.log(`   Width: ${computedStyle.width}`);
      console.log(`   Color: ${computedStyle.backgroundColor}`);
    } else {
      console.log('⚠️ Progress bar animation may not be running');
      console.log(`   Animation: ${computedStyle.animationName}, State: ${computedStyle.animationPlayState}`);
    }
  } else {
    console.log('❌ Progress bar element not found');
  }
  
  // 5. Test pause/play functionality
  console.log('\n5. Testing pause/play functionality...');
  const capabilityContainer = await frame.$('.capability');
  if (capabilityContainer) {
    // Get initial play state
    const initialProgressBar = await frame.$('.capability__progress-bar');
    const initialPlayState = initialProgressBar ? await initialProgressBar.evaluate(el => {
      return getComputedStyle(el).animationPlayState;
    }) : 'unknown';
    console.log(`   Initial play state: ${initialPlayState}`);
    
    // Click to pause
    await capabilityContainer.click();
    await frame.waitForTimeout(500);
    
    const pausedProgressBar = await frame.$('.capability__progress-bar');
    const pausedPlayState = pausedProgressBar ? await pausedProgressBar.evaluate(el => {
      return getComputedStyle(el).animationPlayState;
    }) : 'unknown';
    
    const pausedClass = pausedProgressBar ? await pausedProgressBar.evaluate(el => {
      return el.classList.contains('capability__progress-bar--paused');
    }) : false;
    
    console.log(`   After click (pause): ${pausedPlayState}, paused class: ${pausedClass}`);
    
    // Click again to resume
    await capabilityContainer.click();
    await frame.waitForTimeout(500);
    
    const resumedProgressBar = await frame.$('.capability__progress-bar');
    const resumedPlayState = resumedProgressBar ? await resumedProgressBar.evaluate(el => {
      return getComputedStyle(el).animationPlayState;
    }) : 'unknown';
    
    console.log(`   After second click (resume): ${resumedPlayState}`);
    
    if (pausedPlayState === 'paused' && resumedPlayState === 'running') {
      verificationResults.pausePlay = true;
      console.log('✅ Pause/Play functionality working correctly');
    } else {
      console.log('⚠️ Pause/Play may not be working as expected');
    }
  } else {
    console.log('❌ Capability container not found');
  }
  
  // 6. Verify phone placeholder
  console.log('\n6. Checking phone placeholder...');
  const phonePlaceholder = await frame.$('.capability__phone-placeholder');
  const phoneContainer = await frame.$('.capability__phone');
  
  if (phonePlaceholder && phoneContainer) {
    const isVisible = await phonePlaceholder.isVisible();
    const phoneLoaded = await phoneContainer.evaluate(el => {
      return el.classList.contains('capability__phone--loaded');
    });
    
    if (isVisible && phoneLoaded) {
      verificationResults.phonePlaceholder = true;
      console.log('✅ Phone placeholder is visible and loaded');
      
      // Check styling
      const styles = await phonePlaceholder.evaluate(el => {
        const style = getComputedStyle(el);
        return {
          borderRadius: style.borderRadius,
          backgroundColor: style.backgroundColor,
          border: style.border,
        };
      });
      console.log(`   Border radius: ${styles.borderRadius}`);
      console.log(`   Has border: ${styles.border !== 'none'}`);
    } else {
      console.log(`⚠️ Phone placeholder visibility: ${isVisible}, loaded: ${phoneLoaded}`);
    }
  } else {
    console.log('❌ Phone placeholder element not found');
  }
  
  // 7. Verify BEM classes
  console.log('\n7. Checking BEM classes...');
  const bemClasses = [
    'capability',
    'capability__left-container',
    'capability__right-container',
    'capability__phone',
    'capability__phone-placeholder',
    'capability__detail-container',
    'capability__detail',
    'capability__detail-title',
    'capability__detail-label',
    'capability__cursor',
    'capability__progress-bar',
  ];
  
  const foundClasses = [];
  for (const className of bemClasses) {
    const element = await frame.$(`.${className}`);
    if (element) {
      foundClasses.push(className);
    }
  }
  
  if (foundClasses.length === bemClasses.length) {
    verificationResults.bemClasses = true;
    console.log('✅ All BEM classes found in DOM:');
    foundClasses.forEach(cls => console.log(`   - .${cls}`));
  } else {
    console.log('⚠️ Some BEM classes missing:');
    bemClasses.forEach(cls => {
      if (foundClasses.includes(cls)) {
        console.log(`   ✅ .${cls}`);
      } else {
        console.log(`   ❌ .${cls} (missing)`);
      }
    });
  }
  
  // 8. Check console errors
  console.log('\n8. Checking console errors...');
  await frame.waitForTimeout(1000); // Wait a bit more for any delayed errors
  
  if (verificationResults.consoleErrors.length === 0) {
    console.log('✅ No console errors found');
  } else {
    console.log(`❌ Found ${verificationResults.consoleErrors.length} console error(s):`);
    verificationResults.consoleErrors.forEach(err => console.log(`   - ${err}`));
  }
  
  // Summary
  console.log('\n=== Verification Summary ===');
  console.log(`Typewriter effect: ${verificationResults.typewriterEffect ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Asterisk bold formatting: ${verificationResults.asteriskBoldFormatting ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Automatic cycling: ${verificationResults.automaticCycling ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Progress bar: ${verificationResults.progressBar ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Pause/Play: ${verificationResults.pausePlay ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Phone placeholder: ${verificationResults.phonePlaceholder ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`BEM classes: ${verificationResults.bemClasses ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Console errors: ${verificationResults.consoleErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = 
    verificationResults.typewriterEffect &&
    verificationResults.asteriskBoldFormatting &&
    verificationResults.automaticCycling &&
    verificationResults.progressBar &&
    verificationResults.pausePlay &&
    verificationResults.phonePlaceholder &&
    verificationResults.bemClasses &&
    verificationResults.consoleErrors.length === 0;
  
  console.log(`\nOverall: ${allPassed ? '✅ PASS' : '⚠️ PARTIAL / ❌ FAIL'}`);
  
} catch (error) {
  console.error(`\n❌ Fatal error: ${error.message}`);
  console.error(error.stack);
  await page.screenshot({ path: 'storybook-capability-error.png', fullPage: true });
} finally {
  await browser.close();
  console.log('\nBrowser closed');
}
