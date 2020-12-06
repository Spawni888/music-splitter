const { execFile } = require('child_process');
const path = require('path');

const promiseFromChildProcess = child => new Promise(((resolve, reject) => {
  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  child.stderr.on('data', (data) => {
    console.log(`child log: ${data}`);
  });
  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    resolve(true);
  });
  child.on('error', reject);
}));

const splitMusic = (AUDIO_INPUT, AUDIO_OUTPUT) => {
  const childProcess = execFile('sh', [path.resolve(__dirname, '../sh/split_music.sh')], {
    env: {
      AUDIO_INPUT,
      AUDIO_OUTPUT,
    },
  });
  return promiseFromChildProcess(childProcess);
};

const convertFile = (INPUT_FILE, OUTPUT_FILE) => {
  const childProcess = execFile('sh', [path.resolve(__dirname, '../sh/convert.sh')], {
    env: {
      INPUT_FILE,
      OUTPUT_FILE,
    },
  });
  return promiseFromChildProcess(childProcess);
};

module.exports = {
  splitMusic,
  convertFile,
};
