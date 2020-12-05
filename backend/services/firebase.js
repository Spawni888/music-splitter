const firebaseAdmin = require('firebase-admin');
// 1 hour
// const REMOVE_FILE_TIMER = 60000000 * 6;

// 24 hours
const REMOVE_FILE_TIMER = 60000000 * 6 * 24;
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: 'https://sound-whale.firebaseio.com',
});
const firebaseStorage = firebaseAdmin.storage().bucket('sound-whale.appspot.com');
const firebaseFirestore = firebaseAdmin.firestore().collection('music');

const uploadFileToStore = async (
  filePath,
  storagePath,
  filename,
  finalFilename,
  fileExtension,
  logName,
) => {
  try {
    // upload to firebase-store
    await firebaseStorage.upload(filePath, {
      destination: storagePath,
    });
    console.log(`${logName} was uploaded to the storage`);

    // get url to this file
    const url = await firebaseStorage.file(storagePath).getSignedUrl({
      action: 'read',
      expires: Date.now() + 316224000000,
      responseDisposition: `attachment; filename="${finalFilename}.${fileExtension}"`,
    });
    console.log(`Got url to ${logName}!`);

    // set delete timer
    setTimeout(() => {
      const deleteOptions = finalFilename === filename
        ? { prefix: `${filename}.${fileExtension}` }
        : { directory: filename };

      firebaseStorage.deleteFiles(deleteOptions)
        .then(() => console.log(`${finalFilename} has been deleted from firebase storage`))
        .catch((err) => {
          // console.log(`${finalFilename} has NOT been deleted from firebase!`)
          console.log(err);
        });
    }, REMOVE_FILE_TIMER);

    return url[0];
  } catch (err) {
    return null;
  }
};

const uploadMetaData = async (docName, docObj) => {
  try {
    // upload meta-data to firestore
    await firebaseFirestore
      .doc(docName)
      .set(docObj);

    // set delete timer
    setTimeout(() => {
      firebaseFirestore.doc(docName).delete()
        .then(() => console.log(`${docName} has been deleted from firestore`))
        .catch(() => console.log(`${docName} has NOT been deleted from firestore!`));
    }, REMOVE_FILE_TIMER);

    return true;
  } catch (err) {
    return null;
  }
};

module.exports = {
  uploadFileToStore,
  uploadMetaData,
};
