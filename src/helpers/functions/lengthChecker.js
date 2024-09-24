const lengthChecker = (data,lens) =>{
    let fields = []
    Object.keys(lens).map((i)=>{   
        if (data[i]&&data[i].length>lens[i])fields.push(i)
    })
    var msg = []
    fields.map((i)=>{
        msg.push(`${i} should be less than ${lens[i]} chars`)
    })    
    return {
        error:!msg.length==0,
        message:msg.join(", ")
    }
}
module.exports = lengthChecker