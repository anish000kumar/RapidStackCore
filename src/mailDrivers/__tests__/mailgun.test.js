require('dotenv').config();
const mailDriver = require('../index');
const { model, Schema } = require('mongoose');
require('./../../../../src/bootstrap')();

describe('Mail Service', () => {
  const mailService = mailDriver.mailgun({
    api_key: process.env.MAILGUN_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    config: {
      from: 'jesttest@rapidStack.com',
      orgName: 'Test',
    },
  });

  it('sendMail() should work', () => {
    return mailService
      .sendMail({
        to: 'anish000kumar@gmail.com',
        data: {
          name: 'AnishTest',
        },
      })
      .then(res => {
        console.log('jj');
        expect(res).toBe(true);
      });
  });

  it('mailable() should work', () => {
    const userSchema = new Schema({
      name: String,
      email: String,
    });
    mailService.mailable({
      schema: userSchema,
    });
    const User = model('User', userSchema);

    let user = new User({
      name: 'Mahesh',
      email: 'anish000kumar@gmail.com',
    });

    return user.mail()();
  });
});
