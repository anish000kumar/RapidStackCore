const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const JWT_EXPIRY = 7 * 24 * 60 * 60;

const { hash: hashPassword, compare } = require('bcryptjs');

function AuthService(User, fields, options) {
  const { password = 'password', hash = 'hash', username = ['email'] } = fields;

  const {
    sendResetMail,
    jwtExpiry = JWT_EXPIRY,
    jwtSecret = '7SKJGJSG@38764JH29809832&#',
  } = options;

  async function findByUsername(inputUserName) {
    const queries = [];
    username.forEach(uname => {
      queries.push({
        [uname]: inputUserName,
      });
    });
    const user = await User.findOne({
      $or: queries,
    });
    if (!user) throw new Error('Invalid credentials');
    return user;
  }

  async function createOrFail(data) {
    try {
      const user = new User(data);
      await setPassword(user, user[password]);
      return user;
    } catch (err) {
      throw err;
    }
  }

  // saves hashed password for user
  async function setPassword(user, inputPassword) {
    user[password] = await hashPassword(inputPassword, 10);
    await user.save();
    await setResetPasswordHash(user, null);
    return true;
  }

  async function authorizeOrFail(user, inputPassword) {
    const isCorrect = await compare(inputPassword, user[password]);
    if (!isCorrect) throw new Error('Incorrect password');
    return true;
  }

  function getToken(user) {
    return jwt.sign({ id: user.id }, jwtSecret, {
      expiresIn: jwtExpiry,
    });
  }

  async function sendResetPasswordMail(user) {
    //send mail to the user
    if (sendResetMail) sendResetMail();
    else {
      throw new Error(
        'No method specified for sending mail for resetting password: localAuthDriver({ options: { sendResetMail: fn }  })'
      );
    }
    return true;
  }

  async function setResetPasswordHash(user, value) {
    const hashVal = value || crypto.randomBytes(64).toString('hex');
    user[hash] = hashVal;
    await user.save();
    return user;
  }

  function matchHashOrFail(user, hash) {
    if (user[hash] !== hash) throw new Error('Invalid hash');
    return true;
  }

  return {
    findByUsername,
    createOrFail,
    setPassword,
    authorizeOrFail,
    getToken,
    sendResetPasswordMail,
    setResetPasswordHash,
    matchHashOrFail,
  };
}

module.exports = AuthService;
