import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

const errors = [];
const warnings = [];
const storyResults = {};

page.on('console', msg => {
  const text = msg.text();
  if (msg.type() === 'error') {
    errors.push({ story: 'current', text });
  } else if (msg.type() === 'warning') {
    warnings.push({ story: 'current', text });
  }
});

page.on('pageerror', error => {
  errors.push({ story: 'current', text: `Page error: ${error.message}` });
});

const stories = [
  { name: 'Menu', path: '/story/components-menu--default', title: 'Components/Menu' },
  { name: 'MenuButton', path: '/story/components-menubutton--closed', title: 'Components/MenuButton' },
  { name: 'MenuItem', path: '/story/components-menuitem--start', title: 'Components/MenuItem' },
  { name: 'MenuOverlay', path: '/story/components-menuoverlay--closed', title: 'Components/MenuOverlay' },
];

try {
  console.log('Navigating to Storybook...');
  await page.goto('http://localhost:6006', { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  // Wait for Storybook to initialize
  await page.waitForTimeout(5000);
  
  // Take screenshot of sidebar to verify hierarchy
  await page.screenshot({ path: 'storybook-menu-sidebar.png', fullPage: true });
  console.log('✅ Screenshot saved: storybook-menu-sidebar.png');
  
  // Test each story
  for (const story of stories) {
    console.log(`\n=== Testing ${story.name} Story ===`);
    const storyErrors = [];
    const storyWarnings = [];
    
    try {
      const url = `http://localhost:6006/?path=${story.path}`;
      console.log(`Navigating to: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for story to load
      await page.waitForTimeout(3000);
      
      // Capture console messages for this story
      const currentErrors = errors.filter(e => e.story === 'current');
      const currentWarnings = warnings.filter(w => w.story === 'current');
      
      storyErrors.push(...currentErrors.map(e => e.text));
      storyWarnings.push(...currentWarnings.map(w => w.text));
      
      // Clear current markers
      errors.forEach(e => { if (e.story === 'current') e.story = story.name; });
      warnings.forEach(w => { if (w.story === 'current') w.story = story.name; });
      
      // Take screenshot of Menu story specifically
      if (story.name === 'Menu') {
        await page.screenshot({ path: 'storybook-menu-story.png', fullPage: true });
        console.log('✅ Screenshot saved: storybook-menu-story.png');
      }
      
      // Check if story rendered (look for common Storybook elements)
      const storyContent = await page.$('[data-testid="storybook-root"], [class*="story"], [id*="story"]');
      if (storyContent) {
        console.log(`✅ ${story.name} story rendered`);
      } else {
        console.log(`⚠️ Could not verify ${story.name} story rendering`);
      }
      
      storyResults[story.name] = {
        loaded: true,
        errors: storyErrors,
        warnings: storyWarnings,
      };
      
    } catch (err) {
      console.log(`❌ Error testing ${story.name}: ${err.message}`);
      storyResults[story.name] = {
        loaded: false,
        error: err.message,
        errors: storyErrors,
        warnings: storyWarnings,
      };
    }
  }
  
  // Verify sidebar hierarchy
  console.log('\n=== Verifying Sidebar Hierarchy ===');
  await page.goto('http://localhost:6006', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Look for sidebar elements
  const sidebarText = await page.textContent('body');
  const hasComponentsMenu = sidebarText?.includes('Components/Menu') || sidebarText?.includes('Menu');
  const hasComponentsMenuButton = sidebarText?.includes('Components/MenuButton') || sidebarText?.includes('MenuButton');
  const hasComponentsMenuItem = sidebarText?.includes('Components/MenuItem') || sidebarText?.includes('MenuItem');
  const hasComponentsMenuOverlay = sidebarText?.includes('Components/MenuOverlay') || sidebarText?.includes('MenuOverlay');
  
  console.log(`Components/Menu found: ${hasComponentsMenu ? '✅' : '❌'}`);
  console.log(`Components/MenuButton found: ${hasComponentsMenuButton ? '✅' : '❌'}`);
  console.log(`Components/MenuItem found: ${hasComponentsMenuItem ? '✅' : '❌'}`);
  console.log(`Components/MenuOverlay found: ${hasComponentsMenuOverlay ? '✅' : '❌'}`);
  
  // Summary
  console.log('\n=== Summary ===');
  let allPassed = true;
  
  for (const [name, result] of Object.entries(storyResults)) {
    if (!result.loaded) {
      console.log(`❌ ${name}: Failed to load - ${result.error}`);
      allPassed = false;
    } else if (result.errors.length > 0) {
      console.log(`❌ ${name}: ${result.errors.length} console error(s)`);
      result.errors.forEach(err => console.log(`   - ${err}`));
      allPassed = false;
    } else {
      console.log(`✅ ${name}: Loaded successfully`);
      if (result.warnings.length > 0) {
        console.log(`   ⚠️ ${result.warnings.length} warning(s)`);
      }
    }
  }
  
  const sidebarPassed = hasComponentsMenu && hasComponentsMenuButton && hasComponentsMenuItem && hasComponentsMenuOverlay;
  
  console.log(`\nSidebar hierarchy: ${sidebarPassed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Overall: ${allPassed && sidebarPassed ? '✅ PASS' : '❌ FAIL'}`);
  
} catch (error) {
  console.error(`\n❌ Fatal error: ${error.message}`);
  console.error(error.stack);
  await page.screenshot({ path: 'storybook-menu-fatal-error.png', fullPage: true });
} finally {
  await browser.close();
  console.log('\nBrowser closed');
}
