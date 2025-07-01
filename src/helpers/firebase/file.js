const {bucket} = require('../../../config/firebase');
const uploadFile = async (file,filepath) =>{
    const blob = bucket.file(filepath);

    await new Promise((resolve, reject) => {
      const blobStream = blob.createWriteStream({
        metadata: { contentType: file.mimetype }
      });

      blobStream.on('error', reject);
      blobStream.on('finish', resolve);
      blobStream.end(file.data);
    });

    await blob.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    return publicUrl;
}
const deleteFile = async (filePath) => {
  try {
    const file = bucket.file(filePath);
    await file.delete();
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
module.exports = {uploadFile,deleteFile};