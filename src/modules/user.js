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
const updateUserInfo = ({user_id,first_name,last_name,dob,bio,city,state,country}) =>{
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
        if  (city)fields.push(`city="${city}"`)
        if  (state)fields.push(`state="${state}"`)
        if  (country)fields.push(`country="${country}"`)
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
        const q = `select user_id,email,phone_no,is_deleted,is_verified,first_name,last_name,dob,created_at,updated_at,bio,city,state,country from users where user_id=?;`;
        db.query(q,[user_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const checkUserDetails = ({user_id}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select dob,city,state,country where user_id=?;`;
        db.query(q,[user_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                const {dob,city,state,country} = result[0]
                if (dob && city && state && country){
                    resolve({
                        valid:true
                    })
                }else{
                    resolve({
                        valid:false
                    })
                }
            }
        })
    })
}
const joinClass = ({user_id,class_id,role,currentTime = getTimeString()}) =>{
    return new Promise((resolve,reject)=>{
        const q = `insert into connections (user_id,class_id,role,is_deleted,created_at,updated_at) values (?);`;
        db.query(q,[[user_id,class_id,role,0,currentTime,currentTime]],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
const checkJoinCodeFlag = ({join_code}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select count(*) as flag from classrooms where join_code=?;`;
        db.query(q,[join_code],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const createClassroom = ({class_name,class_description,join_password,user_id,join_code}) =>{
    return new Promise((resolve,reject)=>{
        const currentTime = getTimeString()
        const q = `insert into classrooms (class_name,class_description,join_password,created_at,updated_at,is_deleted,join_code) values (?);`;
        db.query(q,[[class_name,class_description,join_password,currentTime,currentTime,0,join_code]],async (err,result)=>{
            if (err){
                reject((err))
            }else{
                const joinClassResponse = await joinClass({user_id,class_id:result.insertId,role:"creator",currentTime})
                if (joinClassResponse){
                    resolve(result)
                }else{
                    reject(joinClassResponse)
                }
            }
        })
    })
}
const userClassroomStatus = ({user_id,class_id}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select count(*) as flag from connections where user_id=? and class_id=? and is_deleted=0;`;
        db.query(q,[user_id,class_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const getClassJoinPassword = ({join_code}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select join_password,class_id from classrooms where join_code=?;`;
        db.query(q,[join_code],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
module.exports = {verifyUser,getUserProfile,getClassJoinPassword,userClassroomStatus,checkUserDetails,checkJoinCodeFlag,getOldProfileImage,joinClass,createClassroom,updateUserInfo,addProfileImage}