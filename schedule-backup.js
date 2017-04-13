var fetch = require('node-fetch');
var fs = require('fs');
var path = require('path');

var apiUrl = 'http://frab.paralelnipolis.cz/en/hcpp2016/public/events?format=json';

function formatData(jsonData) {

  var conference_events = jsonData.conference_events.events;

  conference_events.forEach(function(event, eventIndex) {
    event.speakers.forEach(function(speaker, speakerIndex) {
      speaker.image = '/backup-images/image_' + speaker.id + '.jpg';
    });
  });

  return jsonData;
}

fetch(apiUrl)
  .then(function(res) {
    return res.json();
  })
  .then(function(jsonData) {
    return formatData(jsonData);
  })
  .then(function(jsonData) {
    console.log('Writing backup JSON file');
    fs.writeFile(path.join(__dirname + '/schedule_backup.json'), JSON.stringify(jsonData), function(err) {
      if (err) throw err;

      console.log('Backup JSON saved!');
    });
  })
  .catch(function(err) {
    console.log(err);
  });
