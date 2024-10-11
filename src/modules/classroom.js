const db = require("../helpers/database/db");
const { getTimeString } = require("../helpers/functions/timeToWordDate"); 
const fs = require('fs');

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
const addResource = ({class_id,user_id,title,body}) =>{
    return new Promise((resolve,reject)=>{
        const currentTime = getTimeString()
        const q = `insert into resources (class_id,user_id,title,body,is_deleted,created_at,updated_at) values (?);`;
        db.query(q,[[class_id,user_id,title,body,0,currentTime,currentTime]],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
const addClassDocument = ({class_id,ra_id,cd_id,cd_type,user_id,file_name,path}) =>{
    return new Promise((resolve,reject)=>{
        const q = `insert into class_documents (class_id,ra_id,cd_id,cd_type,user_id,file_name,path) values (?);`;
        db.query(q,[[class_id,ra_id,cd_id,cd_type,user_id,file_name,path]],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
const checkResourceFlag = ({class_id,resource_id}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select count(*) as flag from resources where class_id=? and resource_id=? and is_deleted=0;`;
        db.query(q,[class_id,resource_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result[0])
            }
        })
    })
}
const getResource = ({resource_id}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select * from resources where resource_id=? and is_deleted=0;`;
        db.query(q,[resource_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                const q2 = `select cd_id,path,file_name from class_documents where ra_id=? and cd_type="resource" and is_deleted=0;`;
                db.query(q2,[`r${resource_id}`],(err2,result2)=>{
                    if (err2){
                        reject(err2)
                    }else{
                        resolve({
                            ...result[0],
                            attachements:result2
                        })
                    }
                })
            }
        })
    })
}
const deleteResource = ({resource_id}) =>{
    return new Promise((resolve,reject)=>{
        const q = `update resources set is_deleted=1 where resource_id=?;`;
        db.query(q,[resource_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                const q2 = `select file_name from class_documents where ra_id=? and cd_type="resource" and is_deleted=0;`;
                db.query(q2,[`r${resource_id}`],(err2,result2)=>{
                    if (err2){
                        reject(err2)
                    }else{
                        const q3 = `update class_documents set is_deleted=1 where ra_id=? and cd_type="resource";`;
                        db.query(q3,[`r${resource_id}`],(err3,result3)=>{
                            if (err3){
                                reject(err3)
                            }else{
                                resolve(result2)
                            }
                        })
                    }
                })
            }
        })
    })
}
const getResourceAttachments = ({resource_id}) =>{
    return new Promise((resolve,reject)=>{
        const q = `select cd_id,file_name from class_documents where ra_id=? and cd_type="resource" and is_deleted=0;`;
        db.query(q,[`r${resource_id}`],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
const deleteResourceAttachement = ({cd_id,file_name,class_id}) =>{
    return new Promise((resolve,reject)=>{
        const currentTime = getTimeString()
        const q = `update class_documents set is_deleted=1 where cd_id=?;`;
        db.query(q,[cd_id],(err,result)=>{
            if (err){
                reject(err)
            }else{
                fs.unlinkSync(`./public/classrooms/${class_id}/resources/${file_name}`,(err)=>{console.log(err)})
                resolve(result)
            }
        })
    })
}
const updateResource = ({resource_id,title,body}) =>{
    return new Promise((resolve,reject)=>{
        const currentTime = getTimeString()
        let fields = []
        if (title)fields.push(`title="${title}"`)
        if (body)fields.push(`body="${body}"`)
        fields.push(`updated_at="${currentTime}"`)
        const q = `update resources set ${fields.join(",")} where resource_id=?;`;
        db.query(q,[resource_id],(err,result)=>{
                if (err){
                    reject(err)
                }else{
                    resolve(result)
                }
            })
        })
}
const askQuery = ({resource_id,user_id,query_title,query_body,class_id}) =>{
    return new Promise((resolve,reject)=>{
        const currentTime = getTimeString()
        const q = `insert into queries (class_id,resource_id,user_id,query_title,query_body,created_at,updated_at,is_deleted) values (?,?,?,?,?,?,?,0);`;
        db.query(q,[class_id,resource_id,user_id,query_title,query_body,currentTime,currentTime],(err,result)=>{
            if (err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
module.exports = {userClassroomStatus,askQuery,updateResource,deleteResourceAttachement,getResourceAttachments,getResource,removeUser,updateRole,getUserRole,updateClassroom,addResource,addClassDocument,checkResourceFlag,deleteResource}