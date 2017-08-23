var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');

/* GET home page. */

var hashTitle = '#HCPP2017';
var pageDescription = 'Hackers Congress Paralelní Polis is one of the premier events for hackers, artists, activists, libertarians, and cryptoenthusiasts in Europe.';
var includeHeader = true;

router.get('/', recaptcha.middleware.render, function (req, res) {

  var mailchimpMessage = null;

  if (req.query.subscribe === 'success') {
    mailchimpMessage = 'You subscribed successfully! Look for the confirmation email.';
  }
  else if (req.query.subscribe === 'error') {
    mailchimpMessage = 'There was an error subscribing user. ' + req.session.subscribeErrorMsg;
  }

  var contactMessage = null;

  if (req.query.subscribe === 'success') {
    contactMessage = 'Your message was successfully sent! We will contact you soon.';
  }
  else if (req.query.subscribe === 'error') {
    contactMessage = 'There was an error sending message. ' + req.session.contactErrorMsg;
  }

  var requestBody = {
    operationName:"speakersQuery",
    query:"query speakersQuery { allSpeakers(filter: {status: ACTIVE}, orderBy: position_ASC) { id displayName shortDescription longDescription position photo{ url } talks(filter: {status: ACTIVE}){ name starts ends room{ name } } } }",
    variables:{}
  };

  fetch(process.env.GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(requestBody)
  }).then(function (data) {
    return data.json();
  }).then(function(speakers) {
    var speakerRows = [];

    while (speakers.data.allSpeakers.length) {
      speakerRows.push(speakers.data.allSpeakers.splice(0, 4));
    }

    res.render('index', {
      protocol: req.protocol,
      hostname: req.hostname,
      path: req.originalUrl,
      title_hash: hashTitle,
      description: pageDescription,
      include_header: includeHeader,
      mailchimp_message: mailchimpMessage,
      contact_message: contactMessage,
      speakerRows: speakerRows,
      // smallSchedule: smallSchedule,
      captcha: req.recaptcha
    });
  }).catch(function(error) {
    throw error;
  });
});

module.exports = router;
