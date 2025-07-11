const db = require("../helpers/database/db")
const {getTimeString} = require("../helpers/functions/timeToWordDate")

const checkUniqueFlag = ({email}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select count(*) as flag from users where email=?;`;
        db.query(q,[email],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const deleteNotVerified = ({email}) =>{
    return new Promise((resolve,reject)=>{
        const q = `delete from users where email=? and is_verified=0;`;
        db.query(q,[email],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
const createUser = ({email,password,first_name,last_name,code}) =>{
    return new Promise((resolve,reject)=>{
        const currentTime = getTimeString()
        const q = `insert into users (email, password, is_deleted, is_verified, first_name, last_name, dob, created_at, updated_at, bio,code) values (?);`;
        db.query(q,[[email,password,0,0,first_name,last_name,null,currentTime,currentTime,null,code]],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
const checkEmailOrPhoneNo = ({authenticator}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select count(*) as flag from users where email=? and is_deleted=0 and is_verified=1;`;
        db.query(q,[authenticator,authenticator],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const getPassword = ({authenticator}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select password from users where email=?;`;
        db.query(q,[authenticator,authenticator],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const getTokenDetails = ({authenticator}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select user_id,email from users where email=?;`;
        db.query(q,[authenticator,authenticator],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const getUserDetails = ({email}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select user_id,updated_at from users where email=?;`;
        db.query(q,[email],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const validateCredentials = ({email,user_id,updated_at}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select count(*) as flag from users where email=? and user_id=? and updated_at=? and is_verified=1;`;
        db.query(q,[email,user_id,updated_at],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const checkCode = ({email,code}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select created_at from users where email=? and code=? and is_verified=0;`;
        db.query(q,[email,code],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
const verifyCode = ({email}) =>{
    return new Promise((resolve,reject)=>{
        const q = `update users set is_verified=1,code=null where email=?;`;
        db.query(q,[email],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
const updatePassword = ({email,password}) =>{
    return new Promise((resolve,reject)=>{
        const q = `update users set password=?,updated_at=? where email=?;`;
        db.query(q,[password,getTimeString(),email],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
module.exports ={checkUniqueFlag,verifyCode,updatePassword,validateCredentials,getUserDetails,checkCode,getPassword,getTokenDetails,createUser,checkEmailOrPhoneNo,deleteNotVerified}