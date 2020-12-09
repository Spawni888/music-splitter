const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ytdl = require('ytdl-core');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);
const parseFilename = require('../../utils/parseFilename');
const { uploadMetaData, uploadFileToStore, clearDB } = require('../../services/firebase');
const { splitMusic, convertFile } = require('../../utils/childProcesses');
const createHash = require('../../utils/createHash');
const { YT_MAX_DURATION } = require('../../utils/constants');

const postSplitMusic = async ctx => {
  const destination = path.resolve(__dirname, '../../../music/');
  let originalUrl;
  let filePath;
  let filename;
  let fileExtension;

  // youtube link
  if (ctx.request.body.originalUrl) {
    originalUrl = ctx.request.body.originalUrl;
    filename = ctx.request.body.filename;
    fileExtension = 'mp3';
    filePath = path.resolve(destination, `${filename}.${fileExtension}`);

    const res = await axios.get(originalUrl, { responseType: 'stream' });
    res.data.pipe(fs.createWriteStream(filePath));
  }
  else {
    // file
    filePath = ctx.request.file.path;
    const fileInfo = parseFilename(filePath);
    filename = fileInfo.filename;
    fileExtension = fileInfo.fileExtension;

    originalUrl = await uploadFileToStore(
      filePath,
      `${filename}.${fileExtension}`,
      filename,
      filename,
      fileExtension,
      'Original Track',
    );

    ctx.assert(originalUrl, 'Can\'t get original file URL');
  }

  // split music
  const musicSplitted = await splitMusic(filePath, destination);
  ctx.assert(musicSplitted === true, 'Music wasn\'t splitted');

  // convert result to needed format
  if (fileExtension !== 'wav') {
    const accompanimentConverted = await convertFile(
      `${destination}/${filename}/accompaniment.wav`,
      `${destination}/${filename}/accompaniment.${fileExtension}`,
    );
    const vocalsConverted = await convertFile(
      `${destination}/${filename}/vocals.wav`,
      `${destination}/${filename}/vocals.${fileExtension}`,
    );

    ctx.assert(accompanimentConverted === true, 'Accompaniment wasn\'t converted!');
    ctx.assert(vocalsConverted === true, 'Vocals wasn\'t converted!');
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

  // rm audios from server
  fs.unlink(filePath, () => console.log('Delete ORIGINAL file from server'));
  fs.rm(path.resolve(destination, filename), {
    recursive: true,
    force: true,
  }, () => console.log('Delete PARSED files from server'));

  // upload meta-data to firestore
  const metaDataUploaded = await uploadMetaData(filename, {
    name: `${filename}.${fileExtension}`,
    uploadTime: Date.now(),
    originalUrl,
    vocalsUrl,
    accompanimentUrl,
  });
  ctx.assert(metaDataUploaded, 'Can\'t upload meta-data');

  // clear files except last 6 files;
  await clearDB(6);

  ctx.body = [
    { name: 'Original', url: originalUrl },
    { name: 'Accompaniment', url: accompanimentUrl },
    { name: 'Vocals', url: vocalsUrl },
  ];
};

const postYoutubeUrl = async ctx => {
  const { ytUrl } = ctx.request.body;
  const videoInfo = await ytdl.getInfo(ytUrl);
  ctx.assert(videoInfo, 'Wrong yt-link!');

  const videoDuration = videoInfo.videoDetails.lengthSeconds;
  const videoTitle = videoInfo.videoDetails.title;
  ctx.assert(videoDuration < (YT_MAX_DURATION * 60), `Video longer than ${YT_MAX_DURATION} minutes!`);

  const format = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
  ctx.assert(format, 'Can\'t get info about audio');

  // download file
  const filename = `${videoTitle}-${createHash()}`;
  const destination = path.resolve(__dirname, '../../../music/');
  const filePath = path.resolve(destination, `${filename}.mp4`);

  await pipeline(
    ytdl(ytUrl, { format }),
    fs.createWriteStream(filePath),
  );
  // convert file to mp3
  const fileConverted = await convertFile(filePath, path.resolve(destination, `${filename}.mp3`));
  ctx.assert(fileConverted, 'File wasn\'t converted!');

  // upload file to store
  const originalUrl = await uploadFileToStore(
    filePath,
    `${filename}.mp3`,
    filename,
    filename,
    'mp3',
  );
  ctx.assert(originalUrl, 'Can\'t get originalUrl!');

  // upload Meta-data
  const metaDataUploaded = uploadMetaData(filename, {
    originalUrl,
    uploadTime: Date.now(),
  });
  ctx.assert(metaDataUploaded, 'Can\'t upload meta-data');

  // rm files from server
  fs.unlink(filePath, () => console.log('Delete ORIGINAL MP4 file from server'));
  fs.unlink(`${filename}.mp3`, () => console.log('Delete ORIGINAL MP3 file from server'));

  ctx.body = { originalUrl, filename };
};

module.exports = {
  postSplitMusic,
  postYoutubeUrl,
};
