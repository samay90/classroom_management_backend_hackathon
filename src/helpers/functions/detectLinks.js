const detectLinks = (text) =>{
    const parsed = text.innerHTML.replace(/((http(s?)):\/\/[^\s]+)/g, "<a href='$1' title='$1'>$1</a>")
    return parsed
}
module.exports = detectLinks