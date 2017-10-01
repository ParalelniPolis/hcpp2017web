var fetch = require('node-fetch');
var FormData = require('form-data');

var captchaSecret = process.env.CAPTCHA_SECRET_KEY;
var captchaHashes = process.env.CAPTCHA_HASHES;

var coinhiveCaptcha = function (req, res, next) {
  var requestBody = new FormData();
  requestBody.append('token', req.body['coinhive-captcha-token']);
  requestBody.append('hashes', captchaHashes);
  requestBody.append('secret', captchaSecret);

  fetch('https://api.coinhive.com/token/verify', {
    method: 'POST',
    body: requestBody
  }).then(function (response) {
    console.log(response);
    return response.json();
  }).then(function (data) {
    console.log(data);
    if (data.success === true) {
      req.captcha = {
        error: null
      };

      next();
    }
    else {
      req.captcha = {
        error: 'Error with captcha validation: ' + data.error
      };

      next();
    }
  }).catch(function (error) {
    req.captcha = {
      error: error
    };

    next();
  });
};

module.exports = coinhiveCaptcha;
