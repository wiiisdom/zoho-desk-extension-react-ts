var { spawn } = require('child_process');
var os = require('os');

var manifest = require('./plugin-manifest.json');
var { moduleSupport } = manifest;

function runPrePack() {
  let npm = os.platform() === 'win32' ? 'npm.cmd' : 'npm';
  return new Promise((resolve, reject) => {
    let execution = spawn(npm, ['run', 'build']);
    let error = '';

    execution.stdout.on('data', data => {
      console.log(data.toString());
    });

    execution.stderr.on('data', data => {
      error += data.toString().trim();
    });

    execution.on('error', error => {
      reject(error);
    });

    execution.on('close', code => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

if (moduleSupport) {
  runPrePack()
    .then(() => {
      process.exit();
    })
    .catch(err => {
      throw err;
    });
} else {
  process.exit();
}
