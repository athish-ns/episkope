const { chromium } = require('playwright');

async function runAutomation() {
  const browser = await chromium.launch({ 
    headless: false, // Set to true if you want to run headless
    slowMo: 1000 // Slow down actions for better visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting automation...');
    
    // Step 1: Open login page
    console.log('📱 Opening login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Login with admin credentials
    console.log('🔐 Logging in as admin...');
    await page.fill('input[type="email"], input[label="Email Address"]', 'athish@rehabcenter.com');
    await page.fill('input[type="password"], input[label="Password"]', 'Athish@2005');
    await page.click('button[type="submit"], button:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
    
    // Wait for dashboard to load
    await page.waitForTimeout(3000);
    
    // Step 3: Navigate to User Management tab
    console.log('👥 Navigating to User Management...');
    await page.click('div[role="tab"]:has-text("User Management"), button:has-text("User Management")');
    await page.waitForTimeout(2000);
    
    // Step 4: Create Doctor User
    console.log('👨‍⚕️ Creating Doctor user...');
    await page.click('button:has-text("Create User")');
    await page.waitForTimeout(1000);
    
    // Fill doctor form
    await page.fill('input[label="Full Name"]', 'Dr. John Smith');
    await page.fill('input[label="Email"]', 'athishnsofficial@gmail.com');
    await page.fill('input[label="Password"]', 'Password123!');
    await page.selectOption('div[role="button"]:has-text("Role"), select', 'doctor');
    await page.fill('input[label="Department"]', 'Neurology');
    await page.fill('input[label="Phone"]', '+1-555-0123');
    
    await page.click('button:has-text("Create User")');
    await page.waitForTimeout(3000);
    
    // Step 5: Create Medical Buddy User
    console.log('🤝 Creating Medical Buddy user...');
    await page.click('button:has-text("Create User")');
    await page.waitForTimeout(1000);
    
    // Fill medical buddy form
    await page.fill('input[label="Full Name"]', 'Sarah Johnson');
    await page.fill('input[label="Email"]', 'athishn@karunya.edu.in');
    await page.fill('input[label="Password"]', 'Password123!');
    await page.selectOption('div[role="button"]:has-text("Role"), select', 'buddy');
    await page.selectOption('div[role="button"]:has-text("Tier"), select', 'gold');
    await page.fill('input[label="Max Patients"]', '5');
    await page.fill('input[label="Department"]', 'Rehabilitation');
    await page.fill('input[label="Phone"]', '+1-555-0456');
    
    await page.click('button:has-text("Create User")');
    await page.waitForTimeout(3000);
    
    // Step 6: Create Receptionist User
    console.log('📞 Creating Receptionist user...');
    await page.click('button:has-text("Create User")');
    await page.waitForTimeout(1000);
    
    // Fill receptionist form
    await page.fill('input[label="Full Name"]', 'Emily Davis');
    await page.fill('input[label="Email"]', 'emily.davis@rehabcenter.com');
    await page.fill('input[label="Password"]', 'Password123!');
    await page.selectOption('div[role="button"]:has-text("Role"), select', 'receptionist');
    await page.fill('input[label="Department"]', 'Front Desk');
    await page.fill('input[label="Phone"]', '+1-555-0789');
    
    await page.click('button:has-text("Create User")');
    await page.waitForTimeout(3000);
    
    // Step 7: Logout and login as receptionist
    console.log('🚪 Logging out...');
    await page.click('button:has-text("Logout"), button:has-text("Sign Out")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('📞 Logging in as receptionist...');
    await page.fill('input[type="email"], input[label="Email Address"]', 'emily.davis@rehabcenter.com');
    await page.fill('input[type="password"], input[label="Password"]', 'Password123!');
    await page.click('button[type="submit"], button:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Step 8: Create Patient as Receptionist
    console.log('🏥 Creating patient as receptionist...');
    // Look for patient creation form or tab
    await page.click('div[role="tab"]:has-text("Patient"), button:has-text("Patient"), a:has-text("Patient")');
    await page.waitForTimeout(2000);
    
    // Fill patient form
    await page.fill('input[label="First Name"]', 'Michael');
    await page.fill('input[label="Last Name"]', 'Brown');
    await page.fill('input[label="Email"]', 'michael.brown@email.com');
    await page.fill('input[label="Phone"]', '+1-555-0321');
    await page.fill('input[label="Date of Birth"]', '1985-06-15');
    await page.fill('input[label="Address"]', '123 Main Street, City, State 12345');
    await page.fill('input[label="Emergency Contact"]', 'Jane Brown, +1-555-0322');
    await page.fill('input[label="Medical History"]', 'No significant medical history');
    await page.fill('input[label="Current Condition"]', 'Post-accident rehabilitation');
    
    // Fill injury description
    await page.fill('textarea[label="Injury Description"], input[label="Injury Description"]', 
      'Severe head trauma with loss of consciousness, unequal pupils, and evidence of intracranial bleeding.');
    
    // Create password for patient
    await page.fill('input[label="Password"]', 'Patient123!');
    await page.fill('input[label="Confirm Password"]', 'Patient123!');
    
    // Select the newly created doctor
    await page.selectOption('div[role="button"]:has-text("Assigned Doctor"), select', 'athishnsofficial@gmail.com');
    
    await page.click('button:has-text("Create Patient"), button:has-text("Save"), button:has-text("Submit")');
    await page.waitForTimeout(3000);
    
    // Step 9: Logout and login as patient
    console.log('🚪 Logging out...');
    await page.click('button:has-text("Logout"), button:has-text("Sign Out")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('👤 Logging in as patient...');
    await page.fill('input[type="email"], input[label="Email Address"]', 'michael.brown@email.com');
    await page.fill('input[type="password"], input[label="Password"]', 'Patient123!');
    await page.click('button[type="submit"], button:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('✅ Automation completed successfully!');
    
    // Keep browser open for inspection
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Automation failed:', error);
    console.error('Error details:', error.message);
    
    // Take a screenshot for debugging
    try {
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      console.log('📸 Error screenshot saved as error-screenshot.png');
    } catch (screenshotError) {
      console.error('Failed to take screenshot:', screenshotError);
    }
  } finally {
    await browser.close();
  }
}

// Run the automation
runAutomation().catch(console.error);
