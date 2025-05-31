const axios = require('axios');
require('dotenv').config();

async function numberVerification(token) {
  const res = await axios.post(
    `${process.env.SANDBOX_BASE_URL}/sim-verification/v1/check`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return res.data;
}

module.exports = { numberVerification };
