const encoder = (method, key, process, string) => {
  if (method == "RCT") {
    var ENCRYPTION_KEY = key.split("").map((item) => parseInt(item));
    if (process == "ENCRYPT") {
      const rawStr = string;
      const charArray = rawStr.split("");
      var array2dim = [];
      var encryptedArray2dim = [];
      var encryptedString = "";
      for (let i = 0; i < Math.ceil(charArray.length / 7); i++) {
        array2dim[i] = [];
        for (let j = 0; j < 7; j++) {
          if (charArray[i * 7 + j]) {
            array2dim[i] = [...array2dim[i], charArray[i * 7 + j]];
          } else {
            array2dim[i] = [...array2dim[i], " "];
          }
        }
      }
      for (let i = 0; i < array2dim.length; i++) {
        encryptedArray2dim[i] = [];
        for (let j = 0; j < 7; j++) {
          if (array2dim[i][ENCRYPTION_KEY.indexOf(j)]) {
            encryptedArray2dim[i][j] = array2dim[i][ENCRYPTION_KEY.indexOf(j)];
          } else {
            encryptedArray2dim[i][j] = " ";
          }
        }
      }
      for (let i = 0; i < encryptedArray2dim.length; i++) {
        for (let j = 0; j < 7; j++) {
          if (encryptedArray2dim[i][j]) {
            encryptedString = encryptedString + encryptedArray2dim[i][j];
          }
        }
      }
      return encryptedString;
    } else if (process == "DECRYPT") {
      const encryptedString = string;
      const encryptedArray = encryptedString.split("");
      var encryptedArray2dim = [];
      var decryptedArray2dim = [];
      var decryptedString = " ";
      for (let i = 0; i < Math.ceil(encryptedString.length / 7); i++) {
        encryptedArray2dim[i] = [];
        for (let j = 0; j < 7; j++) {
          if (encryptedArray[i * 7 + j]) {
            encryptedArray2dim[i] = [
              ...encryptedArray2dim[i],
              encryptedArray[i * 7 + j],
            ];
          } else {
            encryptedArray2dim[i] = [...encryptedArray2dim[i], ""];
          }
        }
      }
      for (let i = 0; i < encryptedArray2dim.length; i++) {
        decryptedArray2dim[i] = [];
        for (let j = 0; j < 7; j++) {
          if (encryptedArray2dim[i][ENCRYPTION_KEY[j]]) {
            decryptedArray2dim[i][j] = encryptedArray2dim[i][ENCRYPTION_KEY[j]];
          } else {
            decryptedArray2dim[i][j] = " ";
          }
        }
      }
      for (let i = 0; i < decryptedArray2dim.length; i++) {
        for (let j = 0; j < 7; j++) {
          if (decryptedArray2dim[i][j]) {
            decryptedString = decryptedString + decryptedArray2dim[i][j];
          }
        }
      }
      return decryptedString;
    }
  }
  if (method == "CC") {
    if (process == "ENCRYPT") {
      const text = string;
      const ENCRYPTION_KEY = parseInt(key);
      const stringArray = text.split("");
      var codeRawArray = [];
      var codeEncryptedArray = [];
      var encryptedString = "";
      for (let i = 0; i < stringArray.length; i++) {
        codeRawArray.push(stringArray[i].charCodeAt(0));
      }
      for (let i = 0; i < codeRawArray.length; i++) {
        const oldAsciiCode = codeRawArray[i];
        const newAsciiCode = (codeRawArray[i]-31 + ENCRYPTION_KEY) % 95;
      
        codeEncryptedArray.push(newAsciiCode);
      }
      for (let i = 0; i < codeEncryptedArray.length; i++) {
        encryptedString=encryptedString+ String.fromCharCode(codeEncryptedArray[i]+31)
      }

      return encryptedString;
    }else if (process=="DECRYPT"){
      const encryptedText = string;
      const ENCRYPTION_KEY = parseInt(key);
      const encryptedStringArray = encryptedText.split("");
      var encryptedCodeArray = [];
      var decryptedStringArray = [];
      var decryptedString = "";
      for (let i = 0; i < encryptedStringArray.length; i++) {
        var encryptedCode=encryptedStringArray[i].charCodeAt(0)
        encryptedCodeArray.push(encryptedCode)
      }
      for (let i = 0; i < encryptedCodeArray.length; i++) {
        var newAsciiCode = ((encryptedCodeArray[i]-31-ENCRYPTION_KEY)%95)+31
        decryptedStringArray.push(String.fromCharCode(newAsciiCode))
      }
      for (let i = 0; i < decryptedStringArray.length; i++) {
        decryptedString= decryptedString+decryptedStringArray[i]
        
      }
      return decryptedString
    }
  }
};
module.exports = encoder;
