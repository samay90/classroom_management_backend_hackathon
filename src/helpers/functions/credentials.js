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
      if (!email){
        return false
      }else{
        if (!email.includes("@")){
          return false
      }else if (!email.split("@")[1].includes(".")){
          return false
      }else{
          return true
      }
      }
  }
  module.exports = {isPassword,isEmail}