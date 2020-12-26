const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const promiseFromChildProcess = (child, childName) => new Promise(((resolve, reject) => {
  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  child.stderr.on('data', (data) => {
    console.log(`${childName}: ${data}`);
  });
  child.on('exit', (code) => {
    console.log(`${childName} exited with code ${code}`);
    if (parseInt(code, 10) !== 0) {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(`Error from: ${childName} exited with code ${code}`);
    }
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
  return promiseFromChildProcess(childProcess, 'splitMusic');
};

const convertFile = (inputFile, outputFile) => new Promise((resolve, reject) => {
  ffmpeg(fs.createReadStream(inputFile))
    .audioBitrate(128)
    .audioChannels(2)
    .audioFrequency(44100)
    .noVideo()
    .on('error', reject)
    .on('end', () => resolve(true))
    .save(outputFile);
});

module.exports = {
  splitMusic,
  convertFile,
};
