const jwt = {
  sign: (payload, secret) => {
    return `test-token-${payload.id}`;
  },
  verify: (token, secret) => {
    if (!token) {
      throw new Error('No token provided');
    }
    if (!token.startsWith('test-token-')) {
      throw new Error('Invalid token');
    }
    const id = token.split('-')[2];
    return { id };
  },
};

module.exports = jwt; 