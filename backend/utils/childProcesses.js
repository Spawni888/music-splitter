const { execFile } = require('child_process');
const path = require('path');
// const fs = require('fs');
// const ffmpeg = require('fluent-ffmpeg');
// const parseFilename = require('./parseFilename');

const promiseFromChildProcess = (child, childName) => new Promise(((resolve, reject) => {
  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  child.stderr.on('data', (data) => {
    console.log(`${childName}: ${data}`);
  });
  child.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
    resolve(true);
  });
  child.on('error', reject);
}));

const splitMusic = (INPUT_FILE) => {
  const childProcess = execFile('sh', [path.resolve(__dirname, '../sh/split_docker.sh')], {
    env: {
      PATH_TO_ROOT: path.resolve(__dirname, '../../'),
      INPUT_FILE,
    },
  });
  return promiseFromChildProcess(childProcess, 'splitMusic');
};

const convertFile = (INPUT_FILE, OUTPUT_FILE) => {
  // ffmpeg(fs.createReadStream(inputFile))
  //   // .audioBitrate(128)
  //   // .audioChannels(2)
  //   // .audioFrequency(44100)
  //   .noVideo()
  //   .on('error', reject)
  //   .on('end', resolve(true))
  //   .save(outputFile);
  const childProcess = execFile('sh', [path.resolve(__dirname, '../sh/convert-docker.sh')], {
    env: {
      PATH_TO_MUSIC: path.resolve(__dirname, '../../music'),
      INPUT_FILE,
      OUTPUT_FILE,
    },
  });
  return promiseFromChildProcess(childProcess, 'convertFile');
};

module.exports = {
  splitMusic,
  convertFile,
};
