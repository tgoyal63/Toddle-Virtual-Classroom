const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const { OAuth2 } = google.auth;
const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env;

// async..await is not allowed in global scope, must use a wrapper
const pushMail = async ({
  to, subject, text, html,
}) => {
  try {
    const myOAuth2Client = new OAuth2(CLIENT_ID,
      CLIENT_SECRET,
      'https://developers.google.com/oauthplayground');

    myOAuth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN,
    });

    const myAccessToken = myOAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'test.tgoyal63@gmail.com', // your gmail account you used to set the project up in google cloud console"
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: myAccessToken, // access token variable we defined earlier
      },
    });
    // send mail with defined transport object
    const info = await transport.sendMail({
      from: 'test.tgoyal63@gmail.com', // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.response);

    return info.response;
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = {
  pushMail,
};
