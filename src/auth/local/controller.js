const errors = require('./errors');
const trycatch = require('@helpers/trycatch');
const authService = require('./service');

function authController({ model: User, fields, options }) {
  //Login
  const service = authService(User, fields, options);

  async function login(req, res) {
    const { username, password: inputPassword } = req.body;

    const user = await service.findByUsername(username);
    await service.authorizeOrFail(user, inputPassword);

    return res.json({
      user,
      token: service.getToken(user),
    });
  }

  //Register
  async function register(req, res) {
    const user = await service.createOrFail(req.body);
    return res.json(user);
  }

  // @auth Change Password with old one
  async function changePassword(req, res) {
    const user = req.user;
    const { oldPassword, confirmPassword, newPassword } = req.body;
    if (!(newPassword === confirmPassword))
      return res.status(500).json(errors.PASSWORD_MISMATCH);

    await service.authorizeOrFail(user, oldPassword);
    await service.setPassword(user, newPassword);
    res.json(user);
  }

  // request to reset password
  async function requestResetPassword(req, res) {
    const { username } = req.body;
    const user = await service.findByUsername(username);
    await service.setResetPasswordHash(user);
    await service.sendResetPasswordMail(user);
    res.send({ success: true });
  }

  async function resetPassword(req, res) {
    const { password, confirmPassword, userId, resetPasswordHash } = req.body;
    const user = await service.findOrFail(userId);
    service.matchHashOrFail(user, resetPasswordHash);

    if (password !== confirmPassword)
      return res.status(500).json(errors.PASSWORD_MISMATCH);
    await service.setPassword(user, password);
    res.send({ success: true, user });
  }

  return trycatch({
    login,
    register,
    requestResetPassword,
    resetPassword,
    changePassword,
  });
}

module.exports = authController;
