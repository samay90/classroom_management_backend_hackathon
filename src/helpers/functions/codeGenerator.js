const joinCodeGenerator = () =>{
    const d = new Date()
    const timeString = (d.getTime()*(d.getTime()%100+1)*765897865465).toString(16).slice(0,16)
    return timeString
}
module.exports = joinCodeGenerator