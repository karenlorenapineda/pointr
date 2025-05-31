const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

async function getAccessToken() {
  const basicAuth = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

  const authReq = await axios.post(
    `${process.env.SANDBOX_BASE_URL}/oauth2/backchannel-authentication`,
    qs.stringify({
      scope: 'openid kyc-match',
      login_hint: process.env.LOGIN_HINT,
      binding_message: 'PointrDemo',
      client_notification_token: 'abc123'
    }),
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  const { auth_req_id, interval } = authReq.data;

  await new Promise(resolve => setTimeout(resolve, (interval + 1) * 1000));

  const tokenRes = await axios.post(
    `${process.env.SANDBOX_BASE_URL}/oauth2/token`,
    qs.stringify({
      grant_type: 'urn:openid:params:grant-type:ciba',
      auth_req_id
    }),
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return tokenRes.data.access_token;
}

module.exports = { getAccessToken };
