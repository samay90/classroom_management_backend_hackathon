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
const deleteFile = async (prefix) => {
  try {
    const [files] = await bucket.getFiles({ prefix });    
    if (files.length === 0) {
      return { success: false, message: 'File not found' };
    }
    await Promise.all(files.map(file => file.delete()));
  } catch (error) {
    return { success: false, message: error.message };
  } finally {
    return { success: true , message: 'File deleted successfully' };
  }
}
module.exports = {uploadFile,deleteFile};