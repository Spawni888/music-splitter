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
    cb(null, path.resolve(`${__dirname}/../../../music`));
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

module.exports = new Router({ prefix: '/api/splitter' })
  .post('/', multer({ storage: storageConfig }).single('music'), actions.postSplitMusic)
  .get('/placeholders', actions.getPlaceholders);
