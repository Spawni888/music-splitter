const fs = require('fs');
const path = require('path');
const parseFilename = require('./parseFilename');

const convert = async () => {
  try {
    const {
      fileExtension: inFileExt,
      filename: inFilename,
    } = parseFilename(process.env.inputFile);
    const {
      fileExtension: outFileExt,
      filename: outFilename,
    } = parseFilename(process.env.outputFile);

    process.send('success');
    process.exit(0);
  }
  catch (err) {
    console.log(err);
    process.send(err);
    process.exit(1);
  }
};

process.on('message', () => convert());
