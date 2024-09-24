const db = require("../helpers/database/db");

const verifyUser = ({user_id}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select is_deleted,is_verified from users where user_id=?;`;
        db.query(q,[user_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
module.exports = {verifyUser}