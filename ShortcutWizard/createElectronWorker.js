var electronWorkers = require('electron-workers')({
  connectionMode: 'server',
  pathToScript: 'main.development.js',
  timeout: 5000,
  numberOfWorkers: 1
});

var ReadShortcuts = require('./ReadShortcuts.js');

module.exports = function(appName) {
  console.log('entered electronworker');
  electronWorkers.start(function(startErr) {
    if (startErr) {
      return console.error(startErr);
    }

    // `electronWorkers` will send your data in a POST request to your electron script
    electronWorkers.execute(appName, function(err, data) {
      if (err) {
        return console.error(err);
      }

      console.log('inside electronWorkers.execute');
      ReadShortcuts(appName);

      electronWorkers.kill(); // kill all workers explicitly
    });
  });
}