module.exports = {
  INVALID_CREDENTIALS: {
    error: true,
    message: 'Invalid credentials',
    errorCode: 'AUTH1',
  },

  INVALID_TOKEN: {
    error: true,
    message: 'Invalid Token',
    errorCode: 'AUTH2',
  },

  INVALID_USER_DETAILS: error => ({
    error: true,
    message: error || 'User details are not valid',
    errorCode: 'AUTH3',
  }),

  INVALID_PASSWORD: {
    error: true,
    message: 'Invalid password',
    errorCode: 'AUTH4',
  },

  PASSWORD_MISMATCH: {
    error: true,
    message: 'passwords do not match',
    errorCode: 'AUTH5',
  },

  INVALID_EMAIL: {
    error: true,
    message: 'invalid Email',
    errorCode: 'AUTH6',
  },
};
