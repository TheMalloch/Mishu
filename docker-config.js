/**
 * Docker API Configuration
 * This file contains the configuration for connecting to the Docker API
 */

module.exports = {
  // Docker socket path (if using socket instead of HTTP)
  socketPath: '/var/run/docker.sock',
  
  // Docker HTTP API configuration
  apiUrl: 'https://localhost:8443',
  
  // TLS authentication (if using TLS)
  tlsVerify: true,
  tlsCert: '/path/to/cert.pem', 
  tlsKey: '/path/to/key.pem',
  tlsCA: '/path/to/ca.pem',
  
  // Basic auth (if using basic authentication)
  username: 'your_username',
  password: 'your_password',
  
  // Set to false to accept self-signed certificates
  rejectUnauthorized: false
};
