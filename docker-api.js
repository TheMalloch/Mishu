const fs = require('fs');
const axios = require('axios');

// ...existing code...

// Around line 144, modify your container logs request
function getContainerLogs(containerId) {
  const options = {
    method: 'GET',
    url: `https://localhost:8443/api/containers/${containerId}/logs?tail=50`,
    // Add authentication - either use certificates
    cert: fs.readFileSync('/path/to/cert.pem'),
    key: fs.readFileSync('/path/to/key.pem'),
    ca: fs.readFileSync('/path/to/ca.pem'),
    // Or use basic authentication if applicable
    headers: {
      'Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
    },
    // Handle self-signed certificates if needed
    rejectUnauthorized: false
  };
  
  return axios(options);
}

// ...existing code...