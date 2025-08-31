const { generateToken } = require("../../src/middleware/auth");

const mockManager = {
  id: 1,
  email: "demo22@hostaway.com",
  name: "Demo Hostaway22",
  properties: '["2B-N1-A-29-Shoreditch-Heights", "Studio-1A-Central-London"]',
};

function getValidTestToken() {
  return generateToken(mockManager);
}

module.exports = {
  getValidTestToken,
  mockManager,
};
