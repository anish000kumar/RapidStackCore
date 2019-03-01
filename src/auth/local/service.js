const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('@config');
const { hash: hashPassword, compare } = require('bcryptjs');

function AuthService(User, fields, options) {
  const {
    password = 'password',
    hash = 'hash',
    username = ['email'],
    email = 'email',
  } = fields;

  const { sendResetMail } = options;

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
    return jwt.sign({ id: user.id }, config.jwtSecret, {
      expiresIn: config.jwtExpiry,
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
    const hash = value || crypto.randomBytes(64).toString('hex');
    user[hash] = hash;
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
