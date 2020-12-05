const Router = require('koa-router');
const multer = require('@koa/multer');
const path = require('path');
const createHash = require('../../utils/createHash');
// const fs = require('fs');
const actions = require('./actions');
const parseFilename = require('../../utils/parseFilename');

// const fileNameRegExp = /(.+)\.(.+$)/gi;

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(`${__dirname}/../../../music`));
  },
  filename: (req, file, cb) => {
    const { filename, fileExtension } = parseFilename(file.originalname);

    if (fileExtension !== 'mp3' && fileExtension !== 'wav') return cb('Error: wrong type');
    const hashName = createHash();

    cb(null, `${filename}-${hashName}.${fileExtension}`);
  },
});

module.exports = new Router({ prefix: '/api/splitter' })
  .post('/', multer({ storage: storageConfig }).single('music'), actions.postSplitMusic)
  .post('/youtube', actions.postYoutubeUrl);
