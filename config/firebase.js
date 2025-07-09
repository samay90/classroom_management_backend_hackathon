require('dotenv').config();
const admin = require('firebase-admin');

const serviceAccount = {'type':'service_account','project_id':'use-db','private_key_id':'541b4c9edcdd2b302a119eeab5abfe79ba0142b5','private_key':'-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCoXA/QdsFIKYWr\nfjjfc2S62DKpIM+VC7S50nrM2eIFJ4064LR4I3KXIHVoQCZv0PEpiOTuf3coeqsG\nLFsRm7mm7fBXWrXCXPHAm2iG9fE8XuEY9705DJMuPbhMa/DHhDs6X/EQ/ePYrzc+\ntHfGDwCsj44RltjAEeV06xGqTiw2Qs+Eir3in43S1CCw6QREuxgvzAvmf3lb9ABZ\n2DKJ69LYptgJ3YyEZo2PnBqroIaP+861aF4mlqVteCqpuFDD1kpVygKy3lCMrznZ\nmoUg5Odsow99Sm2Jm70noSoxbuhyEQH9RjfyIHp7WH1y05iICNiVNfe+OLkdgi1e\npZtYosg3AgMBAAECggEAFYa74OgmO29Pr4cyh2OOOBOnmpde40w9XdsLJ4EeVJFj\njekoOgoyPx9/04YMRBS/mRNvTg1PM4ZHssDeHgi+upjGt6yZ+9F9eaaFPWhZ4WGy\nP0qBz7cLZIiwtVjBzwjZt9OHk6gax1xT4HkbrV/Css2iGR6j9R70qzfZKODY51D7\nd66H4YuVG33WnFlaHwga7CNMXZpxvQXBDc8mwRfQrOPSS0uNnq7jUfnqITPXmZYW\nIBaFhHJUq37gezfXDDLCBC7mweHeN3jfvXgtm2ibdZtddJUvUFkD4G/3uTN4r1vC\nNeDMRmo/FEi9bkCZUTa9LH08RbTuGRR5EVFQS6oHsQKBgQDQClMiNmI2opHEYY84\nJR0hP1rmexkvGZlnO6wniOr1hTEd9+7P6Yx/NdgJPE8pRBXhxQg8Jttva5qO6EFC\ni+J/YZAfSnmHGyXayq6RHYjPCS1DEzRoIbZRlsul8mlAbr4yruacxEjVx3UkkD7a\nN0MxsvkQ1qdOGvE+Yqh19KKE8QKBgQDPK/I9nrjWWo7yvHLZkcNUXwtSBtEpU5Wy\nOog6WaEExqq2JAX1OTYa+OXHEhu9Fy1YwzOlz6Yobsr9CquMg6HpBIrw9rH8ULzT\n28wprEDFiyqM0xmVXCeWFB2I+fTHzmVh7idTtuCIp/qTEbhNZ9n4uOPmT4LCdhOM\netbU+1L/pwKBgDwH7qs9pCN9z7AqMqiR1REF9hXxyXeU3HY0et3BnYMRVvX92BR4\noQkIIXmwxGr08Zd/QnwQ/lrtYuD/1ez87nOxVGQjGmRJCihTOgI30oVjcYMcZI/z\nwmdSqxsMkyB7lDiNzY/I9/dwIbZWRTy0m5gYu9QHDKn2DkzhLRk0aT0RAoGBAKEA\nAxKWLgkPeXX0s8CXgdgowNBvUc8vEO/ggwvtqa/fgL1qA2NOodiWQ2PQk9QAlhIc\nKSAb3oIfkArUZvsdNQ+0oxGedjWivQxcDS75maCrhVbJm2Eyq+T7HvTbY7p/kNRp\nUxDA13/8I0R2CefF5GRhs2LBudnMD2cl85yy8A6TAoGBAL/Bgqprg8F6MOgbMZxK\nbcGBG6foB1rHzkjv/nmwIXnNp6vKaPh7vlzLiP8osA3g6LlyFPG+7/gnA+//pGg0\nM5FGdUSVzJjOgG6n8WXtUYB4BnZMCZ8RucbT41j01MDDe0byiTHSDzqV9jBZzdzt\nbZXJPe1FkUBiFE9EbWPrdCzE\n-----END PRIVATE KEY-----\n','client_email':'firebase-adminsdk-baapf@use-db.iam.gserviceaccount.com','client_id':'106217520769342525322','auth_uri':'https://accounts.google.com/o/oauth2/auth','token_uri':'https://oauth2.googleapis.com/token','auth_provider_x509_cert_url':'https://www.googleapis.com/oauth2/v1/certs','client_x509_cert_url':'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-baapf%40use-db.iam.gserviceaccount.com','universe_domain':'googleapis.com'};

admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
    }),
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });
const bucket = admin.storage().bucket();
module.exports = {bucket};