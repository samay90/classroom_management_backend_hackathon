const db = require("../helpers/database/db");
const { getTimeString } = require("../helpers/functions/timeToWordDate"); 

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
const getUserRole = ({user_id,class_id}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select role from connections where class_id=? and user_id=? and is_deleted=0;`;
        db.query(q,[class_id,user_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const updateClassroom = ({class_id,class_name,class_description,join_password})=>{
    return new Promise((resolve,reject)=>{
        const currentTime = getTimeString()
        var fields = []
        if (class_name)fields.push(`class_name="${class_name}"`)
        if (class_description)fields.push(`class_description="${class_description}"`)
        if (join_password)fields.push(`join_password="${join_password}"`)
        const q = `update classrooms set ${fields.join(",")},updated_at=? where class_id=?;`;
        db.query(q,[currentTime,class_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
const removeUser = ({class_id,user_id}) =>{
    return new Promise((resolve,reject)=>{
        const currentTime = getTimeString()
        const q = `update connections set is_deleted=1,updated_at=? where user_id=? and class_id=?;`;
        db.query(q,[currentTime,user_id,class_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
const updateRole = ({class_id,user_id,role}) =>{
    return new Promise((resolve,reject)=>{
        const currentTime = getTimeString()
        const q = `update connections set role=?,updated_at=? where user_id=? and class_id=?;`;
        db.query(q,[role,currentTime,user_id,class_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
} 
module.exports = {userClassroomStatus,removeUser,updateRole,getUserRole,updateClassroom}