const { execFile } = require('child_process');
// const fs = require('fs');
const path = require('path');

const postSplitMusic = async (ctx) => {
  // console.log(ctx.request.file);
  const { path: filePath, destination } = ctx.request.file;
  const childProcess = execFile('sh', [path.resolve(__dirname, '../../sh/split_music.sh')], {
    env: {
      AUDIO_INPUT: filePath,
      AUDIO_OUTPUT: destination,
    },
  });

  childProcess.addListener('close', () => console.log('finish'));
  // eslint-disable-next-line no-use-before-define
  await promiseFromChildProcess(childProcess)
    .then(() => {
      console.log(2);
      // const readable = fs.createReadStream(filePath);
      ctx.body = 'finish';
    })
    .catch((err) => {
      ctx.throw(err);
    });
};

function promiseFromChildProcess(child) {
  return new Promise(((resolve, reject) => {
    child.on('error', reject);
    child.on('end', resolve);
  }));
}

module.exports = {
  postSplitMusic,
};
