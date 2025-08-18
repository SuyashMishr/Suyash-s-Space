#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';

async function testAdminAPI() {
  try {
    console.log('🔄 Testing Admin API Endpoints...\n');

    // 1. Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'Suyash Mishra',
      password: 'MummyPapa895745@1'
    });

    if (loginResponse.status === 200) {
      console.log('✅ Login successful!');
      const token = loginResponse.data.token;
      
      // 2. Test profile endpoint
      console.log('\n2. Testing profile endpoint...');
      const profileResponse = await axios.get(`${API_BASE}/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.status === 200) {
        console.log('✅ Profile endpoint working!');
        console.log('📋 Profile data:', JSON.stringify(profileResponse.data, null, 2));
      }

    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testAdminAPI();
