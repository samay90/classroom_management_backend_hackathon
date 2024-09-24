const convertTimeToNormalDate = (t) =>{
    const date = new Date(parseInt(t))
    return `${date.getDate()<10?"0"+date.getDate().toString():date.getDate().toString()}-${date.getMonth()+1<10?"0"+(date.getMonth()+1).toString():date.getMonth()+1}-${date.getFullYear()}`
}
const convertTimeToDateWords = (t) =>{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = new Date(parseInt(t))
    const temp_date = convertTimeToNormalDate(t).split("-")
    const words = temp_date[2] + " " + months[Number(temp_date[1]) - 1] + " " + temp_date[0];
    const time = (date.getHours()<10?"0":"")+date.getHours()+":"+(date.getMinutes()<10?"0":"")+date.getMinutes()
    return words+" , "+time
    
}
const getTimeString = (d = new Date()) =>{
    const date = new Date(d)
    return date.getTime().toString()
}
module.exports = {getTimeString}