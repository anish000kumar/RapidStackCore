const log = require('@helpers/log');
const nodeMailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

/* 
 Each driver should return:
 - sendMail()
 - mailable() 
*/
function mailgunDriver({ api_key, domain, config }) {
  const {
    orgName = 'Organisation',
    from,
    templates_path = './templates',
  } = config;

  //errors
  if (!api_key)
    throw new Error("'api_key' not specified in mail-driver configuration");
  if (!domain)
    throw new Error("'domain' not specified in mail-driver configuration");
  if (!from)
    throw new Error("'config.from' not specified in mail-driver configuration");

  function setup(api_key, domain) {
    const auth = {
      auth: {
        api_key,
        domain,
      },
    };
    return nodeMailer.createTransport(mg(auth));
  }

  function onError(err, info) {
    if (err) {
      log.error(`Error: ${JSON.stringify(err)}`);
      reject(err);
    } else {
      log.success(`Response: ${JSON.stringify(info)}`);
      resolve(true);
    }
  }

  function sendMail(mailData) {
    const {
      to,
      subject = `Mail from ${orgName}`,
      template = 'default',
      data = {},
    } = mailData;

    const driver = setup(api_key, domain);

    return new Promise((resolve, reject) => {
      driver.sendMail(
        {
          to,
          from: config.from,
          subject,
          html: require(`${templates_path}/${template}.mail`)(data),
        },
        onError
      );
    });
  }

  function mailable({ schema, emailField = 'email' }) {
    schema.methods.mail = function mail(metaData = {}) {
      const self = this;
      return function(data = {}) {
        const {
          subject = `Mail from ${config.companyName}`,
          template = 'default',
        } = metaData;

        return sendMail({
          to: self[emailField],
          subject,
          template,
          data,
        });
      };
    };
  }

  return {
    sendMail,
    mailable,
  };
}

module.exports = { sendMail, mailable };
