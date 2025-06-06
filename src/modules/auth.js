const db = require("../helpers/database/db")
const {getTimeString} = require("../helpers/functions/timeToWordDate")

const checkUniqueFlag = ({email,phone_no}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select count(*) as flag from users where email=? or phone_no=?;`;
        db.query(q,[email,phone_no],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const createUser = ({email,phone_no,password,first_name,last_name}) =>{
    return new Promise((resolve,reject)=>{
        const currentTime = getTimeString()
        const q = `insert into users (email, phone_no, password, is_deleted, is_verified, first_name, last_name, dob, created_at, updated_at, bio) values (?);`;
        db.query(q,[[email,phone_no,password,0,1,first_name,last_name,null,currentTime,currentTime,null]],(err,result)=>{
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
        const q = `select count(*) as flag from users where (email=? or phone_no=?) and is_deleted=0 and is_verified=1;`;
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
        const q = `select password from users where email=? or phone_no=?;`;
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
        const q = `select user_id,email,phone_no from users where email=? or phone_no=?;`;
        db.query(q,[authenticator,authenticator],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
module.exports ={checkUniqueFlag,getPassword,getTokenDetails,createUser,checkEmailOrPhoneNo}