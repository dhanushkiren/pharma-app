export const STATIC_AUTH = {
  // Logged In User
  isLoggedIn: true,
  authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTJjNmNmYjc0MTQ4MWJmMTkwZGFmODgiLCJleHAiOjE3NjQ2MDU0OTh9.cSmkWS7cv0TGn_QMw_jKPMsgBbX9vLaPLtbOtDpn9kI',
  user: {
    id: '1',
    email: 'dkdk@example.com',
    name: 'dkdk',
    phone: '1234567890',
  },
};

export const STATIC_AUTH_LOGOUT = {
  // Logged Out User
  isLoggedIn: false,
  authToken: null,
  user: null,
};