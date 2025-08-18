// Debug script for contact form - Run this in browser console
// Navigate to http://localhost:3001/contact and run this in the browser console

async function debugContactForm() {
    console.log('🔍 Starting contact form debug...');
    
    const testData = {
        name: 'Debug Test',
        email: 'debug@test.com',
        subject: 'Debug Test Subject',
        message: 'This is a debug test message to check the contact form functionality.'
    };
    
    try {
        console.log('📤 Sending test data:', testData);
        
        const response = await fetch('http://localhost:4000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(testData)
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('📊 Response data:', data);
        
        if (response.ok) {
            console.log('✅ Contact form is working correctly!');
        } else {
            console.log('❌ Contact form error:', data);
            
            if (response.status === 429) {
                console.log('⚠️  Rate limit exceeded. Wait a few minutes and try again.');
            } else if (response.status === 400) {
                console.log('⚠️  Validation error. Check the data format.');
            }
        }
        
    } catch (error) {
        console.error('❌ Network error:', error);
        console.log('🔍 Possible issues:');
        console.log('   1. Backend server is not running on port 4000');
        console.log('   2. CORS configuration issue');
        console.log('   3. Network connectivity problem');
    }
}

// Test with axios (if available on the page)
async function debugWithAxios() {
    if (typeof axios === 'undefined') {
        console.log('⚠️  Axios not available, skipping axios test');
        return;
    }
    
    console.log('🔍 Testing with axios...');
    
    try {
        const response = await axios.post('http://localhost:4000/api/contact', {
            name: 'Axios Test',
            email: 'axios@test.com',
            subject: 'Axios Test',
            message: 'Testing contact form with axios from browser console.'
        }, {
            withCredentials: true,
            timeout: 10000
        });
        
        console.log('✅ Axios test successful:', response.data);
    } catch (error) {
        console.error('❌ Axios test failed:', error);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

// Run both tests
console.log('🚀 Running contact form debug tests...');
debugContactForm();

// Wait a bit then run axios test
setTimeout(() => {
    debugWithAxios();
}, 2000);
