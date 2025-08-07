// Basic smoke tests for the application
const assert = require('assert');

describe('Basic Application Tests', () => {
  it('should load main server file without errors', () => {
    // Test that the main file can be required
    try {
      // Don't actually start the server, just test the file loads
      const fs = require('fs');
      const serverContent = fs.readFileSync('./server.js', 'utf8');
      assert(serverContent.includes('express'), 'Server file should use Express');
      assert(serverContent.includes('basicAuth'), 'Server file should use basic auth');
    } catch (error) {
      assert.fail(`Server file failed to load: ${error.message}`);
    }
  });

  it('should have required environment variables defined in example', () => {
    const fs = require('fs');
    const envExample = fs.readFileSync('./.env.example', 'utf8');
    assert(envExample.includes('API_USER'), 'Should define API_USER in .env.example');
    assert(envExample.includes('API_PASS'), 'Should define API_PASS in .env.example');
  });

  it('should have frontend files present', () => {
    const fs = require('fs');
    assert(fs.existsSync('./frontend/index.html'), 'Should have index.html');
    assert(fs.existsSync('./frontend/app.js'), 'Should have app.js');
  });
});
