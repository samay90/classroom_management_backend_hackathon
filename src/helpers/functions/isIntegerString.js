const isInteger = (d)=>{
    let flag =false
    for (let i of d){
      if ((parseInt(i).toString()=="NaN")){flag =true}
    }
    return !flag
  }

module.exports = isInteger