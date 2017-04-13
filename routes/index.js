var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var fs = require('fs');
var moment = require('moment');
var _ = require('lodash');

/* GET home page. */

var hashTitle = '#HCPP2017';
var pageDescription = 'Hackers Congress Paralelní Polis is one of the premier events for hackers, artists, activists, libertarians, and cryptoenthusiasts in Europe.';
var includeHeader = true;

var formatApiData = function(apiData, fullSchedule) {
  var speakers = apiData.schedule_speakers.speakers.map(function(speaker, index) {
    var orderMatch = speaker.description.match(/{{(.*)}}/) || [0, 100];
    speaker.order = parseInt(orderMatch[1]);
    if (speaker.description.length > 0) {
      if (speaker.description.indexOf('{{') > -1) {
        speaker.description = speaker.description.substring(0, speaker.description.indexOf('{{'));
      }
    }
    else {
      speaker.description = speaker.abstract;
    }

    speaker.events = speaker.events.map(function(event, index) {
      var speakerEvent = _.find(fullSchedule, {'guid': event.guid});

      if(speakerEvent) {
        event.abstract = speakerEvent.abstract;
        event.room = speakerEvent.room;
        event.dayTime = moment(speakerEvent.start_time).format('dddd HH:mm');
      }

      return event;
    });

    return speaker;
  });

  // Hardcoded MakersLab removal
  _.remove(speakers, function(speaker) {
    return speaker.id == 72;
  })

  speakers.sort(function(a, b) {
    if (a.order > b.order) {
      return 1;
    }

    if (a.order < b.order) {
      return -1;
    }

    return 0;
  })

  var speakerRows = [];

  while (speakers.length) {
    speakerRows.push(speakers.splice(0, 4));
  }

  return speakerRows;
}

var formatSchedule = function(apiDataSchedule, returnSliced) {

  var smallSchedule = apiDataSchedule.conference_events.events.map(function(event, index) {
    event.format_start_time = moment(event.start_time).format('HH.mm A');
    event.duration = moment(event.end_time).diff(moment(event.start_time), 'minutes');
    event.valid = true;

    if (moment(event.start_time).format() < moment().format()) {
      event.valid = false;
    }

    return event;

  });

  smallSchedule.sort(function(a, b) {
    if (moment(a.start_time).valueOf() > moment(b.start_time).valueOf()) {
      return 1;
    }

    if (moment(a.start_time).valueOf() < moment(b.start_time).valueOf()) {
      return -1;
    }

    return 0;
  });

  if (returnSliced) {
    var validIndex = _.findLastIndex(smallSchedule, function(o) {
      return o.valid == false;
    });

    smallSchedule.splice(0, validIndex);
    smallSchedule.splice(7);
  }

  return smallSchedule;
}

router.get('/', recaptcha.middleware.render, function(req, res) {

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

  fs.readFile('schedule_backup.json', function(err, data) {
    if (err) throw err;

    var apiDataSchedule = JSON.parse(data);

    var smallSchedule = formatSchedule(apiDataSchedule, true);
    var fullSchedule = formatSchedule(apiDataSchedule, false);

    fs.readFile('speakers_backup.json', function(err, data) {
      if (err) throw err;

      var apiData = JSON.parse(data);

      var speakerRows = formatApiData(apiData, fullSchedule);

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
        smallSchedule: smallSchedule,
        captcha: req.recaptcha
      });
    });
  });
});

module.exports = router;
