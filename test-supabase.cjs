// Test de connexion à Supabase
const https = require('https');

const data = JSON.stringify({
  email: 'sevankedesh11@gmail.com',
  password: '123456'
});

const options = {
  hostname: 'lqqnadahkkzofrxanbha.supabase.co',
  port: 443,
  path: '/auth/v1/token?grant_type=password',
  method: 'POST',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcW5hZGFoa2t6b2ZyeGFuYmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDU0MDUsImV4cCI6MjA4MzEyMTQwNX0.PDfeyjS-mOIeEHxnTWhVzBoKE22dDZcPFjiq7ccxsDQ',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Test de connexion à Supabase...');
console.log('URL:', `https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log(`headers:`, res.headers);
  
  let responseData = '';
  res.on('data', (d) => {
    responseData += d.toString();
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
