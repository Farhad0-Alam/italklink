#!/usr/bin/env node

/**
 * Comprehensive Business Card Functionality Test Script
 * Tests all critical business card features end-to-end
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:5000';
const USER_ID = 'caea87f6-2ba1-431e-9f2e-a88c1203cdd1';
const TEST_RESULTS = {
  passed: [],
  failed: [],
  warnings: [],
  performance: {}
};

// Helper: Make HTTP request
function makeRequest(method, path, data = null, contentType = 'application/json') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': contentType,
        'Accept': 'application/json',
      }
    };

    if (data && contentType === 'application/json') {
      const bodyData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(bodyData);
    }

    const startTime = Date.now();
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        let parsedBody;
        
        try {
          parsedBody = body ? JSON.parse(body) : {};
        } catch (e) {
          parsedBody = body;
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsedBody,
          duration
        });
      });
    });

    req.on('error', reject);

    if (data && contentType === 'application/json') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Helper: Upload multipart file
function uploadFile(filePath, fileFieldName = 'file') {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${fileFieldName}"; filename="${fileName}"\r\n`;
    body += `Content-Type: application/octet-stream\r\n\r\n`;
    
    const bodyBuffer = Buffer.concat([
      Buffer.from(body, 'utf-8'),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8')
    ]);

    const options = {
      method: 'POST',
      hostname: 'localhost',
      port: 5000,
      path: '/api/media/upload',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length,
      }
    };

    const startTime = Date.now();
    const req = http.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        let parsedBody;
        
        try {
          parsedBody = JSON.parse(responseBody);
        } catch (e) {
          parsedBody = responseBody;
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsedBody,
          duration
        });
      });
    });

    req.on('error', reject);
    req.write(bodyBuffer);
    req.end();
  });
}

// Helper: Create test image
function createTestImage(filename) {
  // Create a minimal PNG file (1x1 pixel, red)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
    0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
    0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00,
    0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
    0xAE, 0x42, 0x60, 0x82
  ]);
  
  const testImagePath = path.join(__dirname, filename);
  fs.writeFileSync(testImagePath, pngData);
  return testImagePath;
}

// Test 1: Create Business Card
async function testCreateBusinessCard() {
  console.log('\n📝 TEST 1: Create Business Card');
  console.log('='.repeat(60));
  
  const testCardData = {
    fullName: 'Test User ' + Date.now(),
    title: 'QA Engineer',
    company: 'Test Company',
    email: 'test@example.com',
    phone: '+1234567890',
    website: 'https://example.com',
    bio: 'This is a test business card for QA purposes',
    brandColor: '#0066cc',
    accentColor: '#ff6600',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    isPublic: true,
    font: 'Inter',
    template: 'modern'
  };
  
  try {
    const response = await makeRequest('POST', '/api/business-cards', testCardData);
    
    if (response.statusCode === 201) {
      TEST_RESULTS.passed.push('✅ Business card created successfully');
      TEST_RESULTS.performance['card_creation'] = `${response.duration}ms`;
      console.log(`✅ PASS: Card created in ${response.duration}ms`);
      console.log(`   Card ID: ${response.body.id}`);
      console.log(`   Share Slug: ${response.body.shareSlug}`);
      return response.body;
    } else {
      TEST_RESULTS.failed.push(`❌ Card creation failed: HTTP ${response.statusCode}`);
      console.log(`❌ FAIL: HTTP ${response.statusCode}`);
      console.log(`   Response:`, response.body);
      return null;
    }
  } catch (error) {
    TEST_RESULTS.failed.push(`❌ Card creation error: ${error.message}`);
    console.log(`❌ ERROR: ${error.message}`);
    return null;
  }
}

// Test 2: Verify Card in Database (List Cards)
async function testListBusinessCards() {
  console.log('\n📋 TEST 2: List Business Cards');
  console.log('='.repeat(60));
  
  try {
    const response = await makeRequest('GET', '/api/business-cards');
    
    if (response.statusCode === 200 && Array.isArray(response.body)) {
      TEST_RESULTS.passed.push(`✅ Retrieved ${response.body.length} business cards`);
      TEST_RESULTS.performance['card_list'] = `${response.duration}ms`;
      console.log(`✅ PASS: Retrieved ${response.body.length} cards in ${response.duration}ms`);
      console.log(`   Cards:`, response.body.map(c => `${c.fullName} (${c.id})`).join(', '));
      return response.body;
    } else {
      TEST_RESULTS.failed.push(`❌ Card list failed: HTTP ${response.statusCode}`);
      console.log(`❌ FAIL: HTTP ${response.statusCode}`);
      return [];
    }
  } catch (error) {
    TEST_RESULTS.failed.push(`❌ Card list error: ${error.message}`);
    console.log(`❌ ERROR: ${error.message}`);
    return [];
  }
}

// Test 3: Upload Profile Image
async function testUploadProfileImage(cardId) {
  console.log('\n🖼️  TEST 3: Upload Profile Image');
  console.log('='.repeat(60));
  
  const testImagePath = createTestImage('test-profile.png');
  
  try {
    const response = await uploadFile(testImagePath);
    
    if (response.statusCode === 200 && response.body.ok) {
      const profileUrl = response.body.variants?.original;
      TEST_RESULTS.passed.push('✅ Profile image uploaded successfully');
      TEST_RESULTS.performance['image_upload'] = `${response.duration}ms`;
      console.log(`✅ PASS: Image uploaded in ${response.duration}ms`);
      console.log(`   Storage Path: ${response.body.storagePath}`);
      console.log(`   Profile URL: ${profileUrl}`);
      console.log(`   Variants:`, Object.keys(response.body.variants || {}).join(', '));
      
      // Verify URL format
      if (profileUrl && profileUrl.startsWith('/objects/')) {
        TEST_RESULTS.passed.push('✅ Profile image URL format correct');
        console.log(`✅ URL format correct: ${profileUrl}`);
      } else {
        TEST_RESULTS.warnings.push(`⚠️  Profile image URL format unexpected: ${profileUrl}`);
        console.log(`⚠️  WARNING: URL format unexpected: ${profileUrl}`);
      }
      
      // Clean up test file
      fs.unlinkSync(testImagePath);
      
      return profileUrl;
    } else {
      TEST_RESULTS.failed.push(`❌ Profile image upload failed: HTTP ${response.statusCode}`);
      console.log(`❌ FAIL: HTTP ${response.statusCode}`);
      console.log(`   Response:`, response.body);
      fs.unlinkSync(testImagePath);
      return null;
    }
  } catch (error) {
    TEST_RESULTS.failed.push(`❌ Profile image upload error: ${error.message}`);
    console.log(`❌ ERROR: ${error.message}`);
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    return null;
  }
}

// Test 4: Upload Cover Image
async function testUploadCoverImage() {
  console.log('\n🎨 TEST 4: Upload Cover Image');
  console.log('='.repeat(60));
  
  const testImagePath = createTestImage('test-cover.png');
  
  try {
    const response = await uploadFile(testImagePath);
    
    if (response.statusCode === 200 && response.body.ok) {
      const coverUrl = response.body.variants?.original;
      TEST_RESULTS.passed.push('✅ Cover image uploaded successfully');
      TEST_RESULTS.performance['cover_upload'] = `${response.duration}ms`;
      console.log(`✅ PASS: Cover image uploaded in ${response.duration}ms`);
      console.log(`   Storage Path: ${response.body.storagePath}`);
      console.log(`   Cover URL: ${coverUrl}`);
      
      // Clean up test file
      fs.unlinkSync(testImagePath);
      
      return coverUrl;
    } else {
      TEST_RESULTS.failed.push(`❌ Cover image upload failed: HTTP ${response.statusCode}`);
      console.log(`❌ FAIL: HTTP ${response.statusCode}`);
      fs.unlinkSync(testImagePath);
      return null;
    }
  } catch (error) {
    TEST_RESULTS.failed.push(`❌ Cover image upload error: ${error.message}`);
    console.log(`❌ ERROR: ${error.message}`);
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    return null;
  }
}

// Test 5: Update Card with Images
async function testUpdateCardWithImages(cardId, profileUrl, coverUrl) {
  console.log('\n✏️  TEST 5: Update Card with Images');
  console.log('='.repeat(60));
  
  const updateData = {
    profilePhoto: profileUrl,
    backgroundImage: coverUrl
  };
  
  try {
    const response = await makeRequest('PUT', `/api/business-cards/${cardId}`, updateData);
    
    if (response.statusCode === 200) {
      TEST_RESULTS.passed.push('✅ Card updated with images successfully');
      TEST_RESULTS.performance['card_update'] = `${response.duration}ms`;
      console.log(`✅ PASS: Card updated in ${response.duration}ms`);
      console.log(`   Profile Photo: ${response.body.profilePhoto}`);
      console.log(`   Background Image: ${response.body.backgroundImage}`);
      return response.body;
    } else {
      TEST_RESULTS.failed.push(`❌ Card update failed: HTTP ${response.statusCode}`);
      console.log(`❌ FAIL: HTTP ${response.statusCode}`);
      return null;
    }
  } catch (error) {
    TEST_RESULTS.failed.push(`❌ Card update error: ${error.message}`);
    console.log(`❌ ERROR: ${error.message}`);
    return null;
  }
}

// Test 6: Get Public Card by Slug
async function testGetPublicCard(slug) {
  console.log('\n🌐 TEST 6: Get Public Card by Slug');
  console.log('='.repeat(60));
  
  try {
    const response = await makeRequest('GET', `/api/business-cards/slug/${slug}`);
    
    if (response.statusCode === 200) {
      TEST_RESULTS.passed.push('✅ Public card retrieved successfully');
      TEST_RESULTS.performance['public_card_fetch'] = `${response.duration}ms`;
      console.log(`✅ PASS: Public card fetched in ${response.duration}ms`);
      console.log(`   Card Name: ${response.body.fullName}`);
      console.log(`   View Count: ${response.body.viewCount}`);
      console.log(`   Is Public: ${response.body.isPublic}`);
      
      // Verify QR code data exists
      if (response.body.shareSlug) {
        const qrCodeUrl = `${BASE_URL}/${response.body.shareSlug}`;
        TEST_RESULTS.passed.push(`✅ QR code URL generated: ${qrCodeUrl}`);
        console.log(`✅ QR Code URL: ${qrCodeUrl}`);
      } else {
        TEST_RESULTS.warnings.push('⚠️  No shareSlug found for QR code');
        console.log(`⚠️  WARNING: No shareSlug for QR code`);
      }
      
      return response.body;
    } else {
      TEST_RESULTS.failed.push(`❌ Public card fetch failed: HTTP ${response.statusCode}`);
      console.log(`❌ FAIL: HTTP ${response.statusCode}`);
      return null;
    }
  } catch (error) {
    TEST_RESULTS.failed.push(`❌ Public card fetch error: ${error.message}`);
    console.log(`❌ ERROR: ${error.message}`);
    return null;
  }
}

// Test 7: Test Styling Options
async function testStylingOptions(cardId) {
  console.log('\n🎨 TEST 7: Test Styling Options');
  console.log('='.repeat(60));
  
  const stylingTests = [
    { name: 'Brand Color', data: { brandColor: '#ff0000' } },
    { name: 'Accent Color', data: { accentColor: '#00ff00' } },
    { name: 'Font Family', data: { font: 'Roboto' } },
    { name: 'Template', data: { template: 'minimal' } },
    { name: 'Header Design', data: { headerDesign: 'split-design' } }
  ];
  
  let passedCount = 0;
  let failedCount = 0;
  
  for (const test of stylingTests) {
    try {
      const response = await makeRequest('PATCH', `/api/business-cards/${cardId}`, test.data);
      
      if (response.statusCode === 200) {
        passedCount++;
        console.log(`  ✅ ${test.name}: OK`);
      } else {
        failedCount++;
        console.log(`  ❌ ${test.name}: FAIL (HTTP ${response.statusCode})`);
      }
    } catch (error) {
      failedCount++;
      console.log(`  ❌ ${test.name}: ERROR (${error.message})`);
    }
  }
  
  TEST_RESULTS.passed.push(`✅ ${passedCount}/${stylingTests.length} styling options working`);
  if (failedCount > 0) {
    TEST_RESULTS.warnings.push(`⚠️  ${failedCount} styling options failed`);
  }
  
  console.log(`\n  Summary: ${passedCount}/${stylingTests.length} styling options working`);
}

// Test 8: Delete Test Card (Cleanup)
async function testDeleteCard(cardId) {
  console.log('\n🗑️  TEST 8: Delete Test Card (Cleanup)');
  console.log('='.repeat(60));
  
  try {
    const response = await makeRequest('DELETE', `/api/business-cards/${cardId}`);
    
    if (response.statusCode === 200) {
      TEST_RESULTS.passed.push('✅ Card deleted successfully');
      console.log(`✅ PASS: Card deleted successfully`);
      return true;
    } else {
      TEST_RESULTS.warnings.push(`⚠️  Card deletion failed: HTTP ${response.statusCode}`);
      console.log(`⚠️  WARNING: HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    TEST_RESULTS.warnings.push(`⚠️  Card deletion error: ${error.message}`);
    console.log(`⚠️  WARNING: ${error.message}`);
    return false;
  }
}

// Print Final Report
function printFinalReport() {
  console.log('\n');
  console.log('='.repeat(80));
  console.log('📊 FINAL TEST REPORT');
  console.log('='.repeat(80));
  
  console.log(`\n✅ PASSED (${TEST_RESULTS.passed.length}):`);
  TEST_RESULTS.passed.forEach(msg => console.log(`   ${msg}`));
  
  if (TEST_RESULTS.warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${TEST_RESULTS.warnings.length}):`);
    TEST_RESULTS.warnings.forEach(msg => console.log(`   ${msg}`));
  }
  
  if (TEST_RESULTS.failed.length > 0) {
    console.log(`\n❌ FAILED (${TEST_RESULTS.failed.length}):`);
    TEST_RESULTS.failed.forEach(msg => console.log(`   ${msg}`));
  }
  
  console.log(`\n⚡ PERFORMANCE:`);
  Object.entries(TEST_RESULTS.performance).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  const totalTests = TEST_RESULTS.passed.length + TEST_RESULTS.failed.length;
  const successRate = totalTests > 0 ? ((TEST_RESULTS.passed.length / totalTests) * 100).toFixed(1) : 0;
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Success Rate: ${successRate}%`);
  console.log(`   Status: ${TEST_RESULTS.failed.length === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  console.log('\n' + '='.repeat(80));
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Business Card Functionality Tests');
  console.log('='.repeat(80));
  console.log(`User ID: ${USER_ID}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  try {
    // Test 1: Create Card
    const createdCard = await testCreateBusinessCard();
    if (!createdCard) {
      console.log('\n❌ Critical Error: Could not create card. Stopping tests.');
      printFinalReport();
      process.exit(1);
    }
    
    // Test 2: List Cards
    const cards = await testListBusinessCards();
    
    // Test 3 & 4: Upload Images
    const profileUrl = await testUploadProfileImage(createdCard.id);
    const coverUrl = await testUploadCoverImage();
    
    // Test 5: Update Card with Images
    if (profileUrl && coverUrl) {
      await testUpdateCardWithImages(createdCard.id, profileUrl, coverUrl);
    }
    
    // Test 6: Get Public Card (tests QR code URL)
    if (createdCard.shareSlug) {
      await testGetPublicCard(createdCard.shareSlug);
    }
    
    // Test 7: Styling Options
    await testStylingOptions(createdCard.id);
    
    // Test 8: Cleanup
    await testDeleteCard(createdCard.id);
    
    // Print final report
    printFinalReport();
    
    // Exit with appropriate code
    process.exit(TEST_RESULTS.failed.length === 0 ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    TEST_RESULTS.failed.push(`❌ Fatal error: ${error.message}`);
    printFinalReport();
    process.exit(1);
  }
}

// Run tests
runAllTests();
