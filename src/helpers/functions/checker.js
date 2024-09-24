const checker = (data,fields)=>{
    if (!data){
        return {status:false}
    }else{
        let status = true;
        let fieldsEmpty = []
        fields.map((i)=>{if (!data[i]) {status=false;fieldsEmpty.push(i)}})
        return {error:!status,empty:fieldsEmpty}
    }
}
module.exports = checker