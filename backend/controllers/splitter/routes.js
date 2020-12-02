const Router = require('koa-router');
const multer = require('@koa/multer');
const path = require('path');
const crypto = require('crypto');
// const fs = require('fs');
const actions = require('./actions');
const parseFilename = require('../../utils/parseFilename');

// const fileNameRegExp = /(.+)\.(.+$)/gi;

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(`${__dirname}/../../../dist/static/music/`));
  },
  filename: (req, file, cb) => {
    const { filename, fileExtension } = parseFilename(file.originalname);

    const curDate = (new Date()).valueOf().toString();
    const randomSalt = Math.random().toString();
    const hashName = crypto.createHash('sha256')
      .update(curDate + randomSalt)
      .digest('hex');

    cb(null, `${filename}-${hashName}.${fileExtension}`);
  },
});

module.exports = new Router({ prefix: '/api' })
  .post('/splitter', multer({ storage: storageConfig }).single('music'), actions.postSplitMusic);
