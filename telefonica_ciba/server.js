require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const { getDeviceLocation } = require('./services/location');

app.use(express.json());

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('Pointr Server is running!');
});

// CIBA Authentication Endpoint
app.post('/auth/ciba', async (req, res) => {
  try {
    const authResponse = await axios.post(process.env.CIBA_AUTH_URL, {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      scope: 'dpv:ResearchAndDevelopment#kyc-match:match',
      login_hint: req.body.login_hint,
      binding_message: 'Verify your identity'
    });

    const { auth_req_id } = authResponse.data;

    const token = await pollForToken(auth_req_id);
    res.json({ access_token: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Polling simplified
async function pollForToken(authReqId) {
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await axios.get(`${process.env.CIBA_TOKEN_URL}?auth_req_id=${authReqId}`);
      if (response.data.access_token) {
        return response.data.access_token;
      }
    } catch (error) {
      console.log('Polling attempt failed:', error.message);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }

  throw new Error('Token polling timeout');
}

// Device Location Endpoint
app.post('/api/location', async (req, res) => {
  try {
    const { msisdn, token } = req.body;
    const location = await getDeviceLocation(msisdn, token);
    res.json(location);
  } catch (error) {
    console.error('Error in /api/location:', error.message);
    res.status(500).json({ error: 'Failed to get device location' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Pointr Server running on http://localhost:${process.env.PORT || 3000}`);
});

