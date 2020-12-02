const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const parseFilename = require('../../utils/parseFilename');
// 1 hour
const REMOVE_FILE_TIMER = 60000000 * 6;

const postSplitMusic = async (ctx) => {
  console.log('enter');
  const { path: filePath, destination } = ctx.request.file;
  console.log(filePath, destination);
  const childProcess = execFile('sh', [path.resolve(__dirname, '../../sh/split_music.sh')], {
    env: {
      AUDIO_INPUT: filePath,
      AUDIO_OUTPUT: destination,
    },
  });

  childProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  childProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  childProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code !== 0) {
      ctx.throw('Something happened with your music. Try again!');
    }
  });
  // eslint-disable-next-line no-use-before-define
  await promiseFromChildProcess(childProcess)
    .then(() => {
      const { filename } = parseFilename(filePath);

      // remove from server
      setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
          }
        });
        fs.rmdir(path.resolve(__dirname, `../../../dist/static/music/${filename}`), { recursive: true }, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }, REMOVE_FILE_TIMER);

      // get info about past tracks
      let existingMusic = fs.readdirSync(path.resolve(__dirname, '../../../dist/static/music'))
        .filter(file => (file.endsWith('.mp3') || file.endsWith('.wav')) && !file.includes(filename));

      // push placeholders if there are nothing.
      while (existingMusic.length < 3) {
        existingMusic.push(`/placeholders/${3 - existingMusic.length}.mp3`);
      }
      existingMusic = existingMusic.map(track => `/static/music/${track}`);

      ctx.body = {
        vocalFilePath: `/static/music/${filename}/vocals.wav`,
        minusFilePath: `/static/music/${filename}/accompaniment.wav`,
        existingMusic,
      };
    })
    .catch((err) => {
      ctx.throw(err);
    });
};

function promiseFromChildProcess(child) {
  return new Promise(((resolve, reject) => {
    child.on('error', reject);
    child.on('close', resolve);
  }));
}

module.exports = {
  postSplitMusic,
};
