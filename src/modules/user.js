const db = require("../helpers/database/db");
const {getTimeString} = require("../helpers/functions/timeToWordDate")

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
const checkDoctorFlag = ({user_id}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select count(*) as flag from doctors where user_id=?;`;
        db.query(q,[user_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const addDoctorRequest = ({user_id,hospital,specialization,education,open_time,close_time}) =>{
    return new Promise((resolve,reject)=>{
        const currentTime = getTimeString()
        const q = `insert into doctors (user_id,hospital,specialization,is_verified,education,created_at,updated_at,ratings,appointment_count,open_time,close_time,appointment_status) values (?);`;
        db.query(q,[[user_id,hospital,specialization,0,education,currentTime,currentTime,0,0,open_time,close_time,0]],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
module.exports = {verifyUser,checkDoctorFlag,addDoctorRequest}