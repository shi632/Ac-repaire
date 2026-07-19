const http = require('http');

function test() {
  console.log("=== NEXT.JS PROXY & BACKEND TEST ===");

  // 1. Authenticate with backend directly
  const loginData = 'username=Shivam&password=Shivam5001';
  const options = {
    hostname: '127.0.0.1',
    port: 8000,
    path: '/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': loginData.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log(`\nDirect Backend Login status: ${res.statusCode}`);
      try {
        const loginRes = JSON.parse(body);
        if (loginRes.access_token) {
          console.log("Login successful! Token acquired.");
          fetchBookingsDirectly(loginRes.access_token);
          fetchBookingsThroughProxy(loginRes.access_token);
        } else {
          console.log("No token in response:", body);
        }
      } catch (e) {
        console.log("Failed to parse login response:", body);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Direct Backend Login failed: ${e.message}`);
  });

  req.write(loginData);
  req.end();
}

function fetchBookingsDirectly(token) {
  const options = {
    hostname: '127.0.0.1',
    port: 8000,
    path: '/admin/bookings?limit=100',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log(`\nDirect Fetch /admin/bookings status: ${res.statusCode}`);
      try {
        const bookings = JSON.parse(body);
        console.log(`Direct bookings count: ${bookings.length}`);
      } catch (e) {
        console.log("Failed to parse direct bookings response");
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Direct bookings fetch failed: ${e.message}`);
  });

  req.end();
}

function fetchBookingsThroughProxy(token) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/admin/bookings?limit=100',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log(`\nProxy Fetch /admin/bookings (via localhost:3000) status: ${res.statusCode}`);
      try {
        const bookings = JSON.parse(body);
        console.log(`Proxy bookings count: ${bookings.length}`);
        if (bookings.length > 0) {
          console.log("First booking item:", bookings[0]);
        }
      } catch (e) {
        console.log("Failed to parse proxy bookings response:", body.substring(0, 300));
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Proxy bookings fetch failed: ${e.message}`);
  });

  req.end();
}

test();
