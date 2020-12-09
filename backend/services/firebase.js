const firebaseAdmin = require('firebase-admin');
const parseFilename = require('../utils/parseFilename');

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

    return true;
  } catch (err) {
    return null;
  }
};

const clearDB = (saveFilesCount) => {
  firebaseFirestore.orderBy('uploadTime', 'desc')
    .limit(saveFilesCount)
    .get()
    .then(firestoreSnapshot => {
      let lastValidDoc;

      firestoreSnapshot.forEach(doc => {
        lastValidDoc = doc;
      });

      // delete all except `saveFilesCount` last values
      firebaseFirestore.orderBy('uploadTime').endBefore(lastValidDoc).get()
        .then(snapToDelete => {
          snapToDelete.forEach(doc => {
            const data = doc.data();
            const { fileExtension, filename } = parseFilename(data.name);

            // delete from storage;
            Promise.all([
              firebaseStorage.deleteFiles({ directory: filename }),
              firebaseStorage.deleteFiles({ prefix: `${filename}.${fileExtension}` }),
            ])
              .then(() => console.log(`remove ${filename} from storage`))
              .catch((err) => console.log(err));

            // delete meta-data
            doc.ref.delete()
              .then(() => console.log(`remove ${filename} meta-data from firestore`))
              .catch((err) => console.log(err));
          });
        });
    });
};

module.exports = {
  uploadFileToStore,
  uploadMetaData,
  clearDB,
};
