const express = require('express');
const { getAccessToken } = require('./services/auth');
const { numberVerification } = require('./services/numberVerification');
const { getDeviceLocation } = require('./services/location');
const { getQoD } = require('./services/qod');

const app = express();

app.get('/test-all', async (req, res) => {
  try {
    const token = await getAccessToken();
    const number = await numberVerification(token);
    const location = await getDeviceLocation(token);
    const qod = await getQoD(token);

    res.json({ number, location, qod });
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).send('Error in API call');
  }
});

app.listen(3000, () => {
  console.log('Pointr API running at http://localhost:3000');
});
