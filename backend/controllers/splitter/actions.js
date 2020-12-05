const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const ytdl = require('youtube-dl');
const { promisify } = require('util');
const parseFilename = require('../../utils/parseFilename');
const { uploadMetaData, uploadFileToStore } = require('../../services/firebase');

// in minutes
const YT_MAX_DURATION = 15;

const postSplitMusic = async ctx => {
  console.log('postSplitMusic: enter');
  const { path: filePath, destination } = ctx.request.file;
  const { filename, fileExtension } = parseFilename(filePath);

  const originalUrl = await uploadFileToStore(
    filePath,
    `${filename}.${fileExtension}`,
    filename,
    filename,
    fileExtension,
    'Original Track',
  );
  ctx.assert(originalUrl, 'Can\'t get original file URL');

  // split music
  const splitProcess = execFile('sh', [path.resolve(__dirname, '../../sh/split_music.sh')], {
    env: {
      AUDIO_INPUT: filePath,
      AUDIO_OUTPUT: destination,
      OUTPUT_ACCOMPANIMENT: `${destination}/${filename}/accompaniment.wav`,
      OUTPUT_VOCALS: `${destination}/${filename}/vocals.wav`,
    },
  });
  // eslint-disable-next-line no-use-before-define
  await promiseFromChildProcess(splitProcess);

  // convert result to needed format
  if (fileExtension !== 'wav') {
    const convertProcess = execFile('sh', [path.resolve(__dirname, '../../sh/convert.sh')], {
      env: {
        INPUT_ACCOMPANIMENT: `${destination}/${filename}/accompaniment.wav`,
        INPUT_VOCALS: `${destination}/${filename}/vocals.wav`,
        OUTPUT_ACCOMPANIMENT: `${destination}/${filename}/accompaniment.${fileExtension}`,
        OUTPUT_VOCALS: `${destination}/${filename}/vocals.${fileExtension}`,
      },
    });
    // eslint-disable-next-line no-use-before-define
    await promiseFromChildProcess(convertProcess);
  }

  // upload parsed music to firebase
  // accompaniment
  const accompanimentUrl = await uploadFileToStore(
    `${destination}/${filename}/accompaniment.${fileExtension}`,
    `${filename}/accompaniment.${fileExtension}`,
    filename,
    'accompaniment',
    fileExtension,
    'Parsed accompaniment',
  );
  ctx.assert(accompanimentUrl, 'Can\'t get accompaniment file URL');

  const vocalsUrl = await uploadFileToStore(
    `${destination}/${filename}/vocals.${fileExtension}`,
    `${filename}/vocals.${fileExtension}`,
    filename,
    'vocals',
    fileExtension,
    'Parsed vocals',
  );
  ctx.assert(accompanimentUrl, 'Can\'t get vocals file URL');

  Promise.all([
    promisify(fs.unlink)(filePath),
    // promisify(fs.rmdir)(path.resolve(destination, `/${filename}`)),
    promisify(fs.rm)(path.resolve(destination, `/${filename}`), { recursive: true, force: true }),
  ])
    .then(() => console.log(`${filename} has been deleted out of the server!`));

  // rm audios from server
  fs.unlink(filePath, () => console.log('Delete ORIGINAL file from server'));
  fs.rm(path.resolve(destination, filename), {
    recursive: true,
    force: true,
  }, () => console.log('Delete PARSED files from server'));

  const metaDataUploaded = uploadMetaData(filename, {
    name: `${filename}.${fileExtension}`,
    uploadTime: Date.now(),
    originalUrl: originalUrl[0],
    vocalsUrl: vocalsUrl[0],
    accompanimentUrl: accompanimentUrl[0],
  });
  ctx.assert(metaDataUploaded, 'Can\'t upload meta-data');

  ctx.body = [
    { name: 'Original', url: originalUrl },
    { name: 'Accompaniment', url: accompanimentUrl },
    { name: 'Vocals', url: vocalsUrl },
  ];
};

function promiseFromChildProcess(child) {
  return new Promise(((resolve, reject) => {
    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    child.stderr.on('data', (data) => {
      console.error(`child log: ${data}`);
    });
    child.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      if (code !== 0) {
        reject();
      }
    });

    child.on('error', reject);
    child.on('close', resolve);
  }));
}

const postYoutubeUrl = async ctx => {
  const { ytUrl } = ctx.request.body;
  const getInfo = promisify(ytdl.getInfo);
  const clipInfo = await getInfo(ytUrl, null, null);

  ctx.assert(clipInfo, 'Wrong YT-URL. Can\'t get info');
  // eslint-disable-next-line no-underscore-dangle
  ctx.assert(clipInfo._duration_raw < (YT_MAX_DURATION * 60), `Clip are longer than ${YT_MAX_DURATION} minutes`);

  ctx.body = {
    title: clipInfo,
  };
};

module.exports = {
  postSplitMusic,
  postYoutubeUrl,
};
