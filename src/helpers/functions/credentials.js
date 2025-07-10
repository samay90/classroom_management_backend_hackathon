const isPassword = (d)=>{
    const specialCharacters = [
      '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
      '-', '_', '+', '=', '[', ']', '{', '}', '|',
      ':', ';', '"',  '<', '>', ',', '.', '?', '/'];
    let validPasswordFlag = false
    for (let i of d){
      if (specialCharacters.includes(i)) validPasswordFlag=true
    }
    return validPasswordFlag
  }
  const isEmail = (email) =>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  module.exports = {isPassword,isEmail}