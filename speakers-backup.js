var fetch = require('node-fetch');
var fs = require('fs');
var path = require('path');
var imagemin = require('imagemin');
var imageminMozjpeg = require('imagemin-mozjpeg');
var imageminPngquant = require('imagemin-pngquant');

var apiUrl = 'http://frab.paralelnipolis.cz/en/hcpp2016/public/speakers.json';

function formatData(jsonData) {

  var speakers = jsonData.schedule_speakers.speakers;

  speakers.forEach(function(speaker, index) {
    fetch('http://frab.paralelnipolis.cz' + speaker.image)
      .then(function(res) {
        return res.buffer();
      })
      .then(function(blob) {
        console.log('Writing file image_' + speaker.id + '.jpg');
        fs.writeFile(path.join(__dirname + '/assets/backup-images/image_') + speaker.id + '.jpg', blob, function(err) {
          if (err) throw err;

          console.log('File image_' + speaker.id + '.jpg saved!');

          imagemin([path.join(__dirname + '/assets/backup-images/image_') + speaker.id + '.jpg'], path.join(__dirname + '/assets/backup-images/'), {
              plugins: [
                  imageminMozjpeg({quality: 70}),
                  imageminPngquant({quality: '65-80'})
              ]
          }).then(files => {
              console.log(files);
              //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
          });
        });
      })
      .catch(function(err) {
        console.log(err);
      });

    speaker.image = '/backup-images/image_' + speaker.id + '.jpg';
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
    fs.writeFile(path.join(__dirname + '/speakers_backup.json'), JSON.stringify(jsonData), function(err) {
      if (err) throw err;

      console.log('Backup JSON saved!');
    });
  })
  .catch(function(err) {
    console.log(err);
  });
