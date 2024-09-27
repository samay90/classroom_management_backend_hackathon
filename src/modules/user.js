const db = require("../helpers/database/db");
const {getTimeString} = require("../helpers/functions/timeToWordDate")

const verifyUser = ({user_id}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select is_deleted,is_verified,is_doctor from users where user_id=?;`;
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
        const q = `select count(*) as flag from doctors where user_id=? and is_verified=1;`;
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
const addProfileImage = ({user_id,path,file_name}) =>{
    return new Promise((resolve,reject)=>{
        const q2 = `update documents set is_deleted=1 where user_id=? and is_deleted=0 and doc_type="profile";`;
        db.query(q2,[user_id],(err2,result2)=>{
            const q = `insert into documents (doc_type,path,file_name,is_deleted,user_id) values (?);`;
            db.query(q,[["profile",path,file_name,0,user_id]],(err,result)=>{
                if (err){
                    reject(err)
                }else{
                    resolve(result)
                }
            })
        })
    })
}
const updateUserInfo = ({user_id,first_name,last_name,dob,bio}) =>{
    return new Promise((resolve,reject)=>{
        const currentTime = getTimeString()
        let fields = [`updated_at='${currentTime}'`]
        if  (first_name)fields.push(`first_name="${first_name}"`)
        if  (last_name)fields.push(`last_name="${last_name}"`)
        if  (dob){
            const new_dob = new Date(dob)
            fields.push(`dob="${new_dob.getTime()}"`)
        }
        if  (bio)fields.push(`bio="${bio}"`)
        const q = `update users set ${fields.join(",")} where user_id=?;`;
        db.query(q,[user_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
const updateDoctorInfo = ({user_id,hospital,specialization,education,open_time,close_time}) =>{
    return new Promise((resolve,reject)=>{
        const currentTime = getTimeString()
        let fields = [`updated_at='${currentTime}'`]
        if  (hospital)fields.push(`hospital="${hospital}"`)
        if  (specialization)fields.push(`specialization="${specialization}"`)
        if  (education)fields.push(`education="${education}"`)
        if  (open_time)fields.push(`open_time="${open_time}"`)
        if  (close_time)fields.push(`close_time="${close_time}"`)
        const q = `update doctors set ${fields.join(",")} where user_id=?;`;
        db.query(q,[user_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
const getOldProfileImage = ({user_id}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select file_name,path from documents where user_id=? and is_deleted=0 and doc_type='profile';`;
        db.query(q,[user_id],(err,result)=>{
            if (err){                
                reject(err)
            }else{                
                if (result.length==0){
                    resolve({path:null,file_name:null})
                }else{
                    resolve(result[0])
                }
            }
        })
    })
}
const getUserProfile = ({user_id}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select user_id,email,phone_no,is_doctor,is_deleted,is_verified,first_name,last_name,dob,created_at,updated_at,bio,city,state,country,true_bookings,false_bookings from users where user_id=?;`;
        db.query(q,[user_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const getDoctorProfile = ({user_id}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select hospital,specialization,education,ratings,appointment_count,open_time,close_time,appointment_status from doctors where user_id=?;`;
        db.query(q,[user_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
module.exports = {verifyUser,getUserProfile,updateDoctorInfo,getDoctorProfile,getOldProfileImage,updateUserInfo,addProfileImage,checkDoctorFlag,addDoctorRequest}