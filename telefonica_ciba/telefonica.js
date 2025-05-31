const axios = require('axios');
require('dotenv').config();

class TelefonicaAPI {
  constructor() {
    this.token = null;
  }

  // Authenticate via CIBA
  async authenticate(loginHint) {
    const response = await axios.post('http://localhost:3000/auth/ciba', {
      login_hint: loginHint // e.g., phone/email
    });
    this.token = response.data.access_token;
  }

  // Number Verification API
  async verifyNumber(phoneNumber) {
    if (!this.token) throw new Error('Not authenticated');
    return axios.get(`${process.env.API_BASE_URL}/number-verification`, {
      headers: { Authorization: `Bearer ${this.token}` },
      params: { phoneNumber }
    });
  }

  // Device Location API
  async verifyLocation(phoneNumber, latitude, longitude, radius) {
    if (!this.token) throw new Error('Not authenticated');
    return axios.get(`${process.env.API_BASE_URL}/device-location`, {
      headers: { Authorization: `Bearer ${this.token}` },
      params: { phoneNumber, latitude, longitude, radius }
    });
  }
}

module.exports = new TelefonicaAPI();