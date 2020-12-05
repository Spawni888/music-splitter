const crypto = require('crypto');

module.exports = () => {
  const curDate = (new Date()).valueOf().toString();
  const randomSalt = Math.random().toString();

  return crypto.createHash('sha256')
    .update(curDate + randomSalt)
    .digest('hex');
};
