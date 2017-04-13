var moment = require('moment');
var _ = require('lodash');
var fs = require('fs');
var express = require('express');
var router = express.Router();

/* GET page. */

var pageTitle = 'Schedule';
var hashTitle = '#HCPP2017';
var pageDescription = 'Hackers Congress Paralelní Polis is one of the premier events for hackers, artists, activists, libertarians, and cryptoenthusiasts in Europe.';

var formatApiData = function(apiData) {
  var scheduleData = apiData.conference_events.events.map(function(event, index) {
    event.format_start_time = moment(event.start_time).format('HH.mm A');
    event.duration = moment(event.end_time).diff(moment(event.start_time), 'minutes');
    event.groupDate = moment(event.start_time).format('DD-MM-YYYY');

    return event;
  });

  scheduleData.sort(function(a, b) {
    if (moment(a.start_time).valueOf() > moment(b.start_time).valueOf()) {
      return 1;
    }

    if (moment(a.start_time).valueOf() < moment(b.start_time).valueOf()) {
      return -1;
    }

    return 0;
  })

  var groupedScheduledData = _.groupBy(scheduleData, 'groupDate');

  return groupedScheduledData;
}

router.get('/', function(req, res) {

  fs.readFile('schedule_backup.json', function(err, data) {
    if (err) throw err;

    var apiData = JSON.parse(data);

    var schedule = formatApiData(apiData);

    res.render('schedule', {
      protocol: req.protocol,
      hostname: req.hostname,
      path: req.originalUrl,
      title: pageTitle,
      title_hash: hashTitle,
      description: pageDescription,
      day1: schedule['30-09-2016'],
      day2: schedule['01-10-2016'],
      day3: schedule['02-10-2016']
    });

  });
});

module.exports = router;
