const express = require("express")
const classRouter = express.Router()
const lang = require("../../lang/lang.json") 
const { userClassroomStatus, getUserRole, updateClassroom, removeUser, updateRole, addResource, addClassDocument, checkResourceFlag, getResource, deleteResource, deleteResourceAttachement, updateResource, getResourceAttachments, askQuery, editQuery, checkQueryFlag, deleteQuery, checkQueryFlagUsingResourceId, writeSolution, checkStudentsFlag, markAttendance, deleteOldAttendance, createAssignment, checkAssignmentFlag, getAssignmentAttachments, deleteAssignmenteAttachement, updateAssignment } = require("../modules/classroom")
const lengthChecker = require("../helpers/functions/lengthChecker")
const rules = require("../../rules/rules.json")
const bcrypt = require('bcrypt')
const checker = require("../helpers/functions/checker")
const { getTimeString } = require("../helpers/functions/timeToWordDate")
const isDictionary = require("../helpers/functions/isDictionary.js")
const fs = require('fs');
classRouter.post("/:class_id/edit",async (req,res)=>{
    const body = req.body
    const user = req.user
    let {class_id} = req.params
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        class_id=parseInt(class_id)
        if (!(body.class_name || body.class_description || body.join_password)){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.EMPTY_INPUTS,
                data:{}
            })
        }else{
            if (!((typeof(body.class_name)=="string" || !body.class_name) && (typeof(body.class_description)=="string"|| !body.class_description) && (typeof(body.join_password)=="string")|| !body.join_password)){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.STRING_VALUES,
                    data:{}
                })
            }else{
                const lengthCheckerResponse = lengthChecker(body,rules)
                if (lengthCheckerResponse.error){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lengthCheckerResponse.message,
                        data:{}
                    })
                }else{
                    const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id:class_id})
                    if (userClassroomStatusResponse.flag==0){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INVALID_CLASSROOM,
                            data:{}
                        })
                    }else{
                        const getUserRoleResponse = await getUserRole({class_id:class_id,user_id:user.user_id})
                        if (getUserRoleResponse.role!=="creator"){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.INVALID_ROLE_ELIGIBLE,
                                data:{}
                            })
                        }else{
                            let hassPass = null
                            if (body.join_password){
                                hassPass=bcrypt.hashSync(body.join_password,2)
                            }
                            const updateClassroomResponse = await updateClassroom({class_id:class_id,class_name:body.class_name,class_description:body.class_description,join_password:hassPass})
                            if (updateClassroomResponse){
                                res.send({
                                    status:200,
                                    error:false,
                                    message:"Classroom Updated!!",
                                    data:{}
                                })
                            }else{
                                res.status(501).send({
                                    status:501,
                                    error:true,
                                    message:lang.SOMETHING_WENT_WRONG,
                                    data:{}
                                })
                            }
                        }
                    }
                }
            }
        }
    }
})
classRouter.post("/:class_id/manage",async (req,res)=>{
    const body = req.body
    const user = req.user
    let {class_id} = req.params
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        class_id=parseInt(class_id)
        const checkerResponse = checker(body,["action_type","user_id"])
        if (checkerResponse.error){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.PLEASE_ENTER+checkerResponse.empty.join(", ")+"!!",
                data:{}
            })
        }else{
            if (!(body.action_type=="M" || body.action_type=="R")){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:"Action type must be of either Manage (M) OR Remove (R)!!",
                    data:{}
                })
            }else{
                let managePass = false
                if (body.action_type=="M"){
                    if (!(body.action=="T" || body.action=="S")){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:"Invalid action it should Teacher (T) or Student (S)!!",
                            data:{}
                        })
                    }else{
                        managePass=true
                    }
                }else{ managePass=true}
                if (managePass){
                    const userClassroomStatusResponse = await userClassroomStatus({class_id,user_id:body.user_id})
                    if (userClassroomStatusResponse.flag==0){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INVALID_CLASSROOM,
                            data:{}
                        })
                    }else{
                        const getUserRoleResponse = await getUserRole({class_id,user_id:user.user_id})
                        if (getUserRoleResponse.role!=="creator"){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.INVALID_ROLE_ELIGIBLE,
                                data:{}
                            })
                        }else{
                            if (body.user_id==user.user_id){
                                res.status(400).send({
                                    status:400,
                                    error:true,
                                    message:lang.CANNOT_TAKE_ACTION_YOURSELF,
                                    data:{}
                                })
                            }else{
                                const actionUserClassResponse = await userClassroomStatus({class_id,user_id:body.user_id})
                                if (actionUserClassResponse.flag==0){
                                    res.status(400).send({
                                        status:400, 
                                        error:true,
                                        message:lang.USER_NOT_IN_CLASSROOM,
                                        data:{}
                                    })
                                }else{
                                    if (body.action_type=="R"){
                                        const removeUserResponse = await removeUser({class_id,user_id:body.user_id})
                                        if (removeUserResponse){
                                            res.send({
                                                status:200,
                                                error:false,
                                                message:"User removed!!",
                                                data:{}
                                            })
                                        }else{
                                            res.status(501).send({
                                                status:501,
                                                error:true,
                                                message:lang.SOMETHING_WENT_WRONG,
                                                data:{}
                                            })
                                        }
                                    }else{
                                        if (!(body.action=="T" || body.action=="S")){
                                            res.status(400).send({
                                                status:400,
                                                error:true,
                                                message:"Action should contain Teacher (T) or Student (S) only!!"
                                            })
                                        }else{
                                            const updateRoleResponse = await updateRole({class_id,user_id:body.user_id,role:body.action=="T"?"teacher":"student"})
                                            if (updateRoleResponse){
                                                res.send({
                                                    status:200,
                                                    error:false,
                                                    message:"User role updated!!",
                                                    data:{}
                                                })
                                            }else{
                                                res.status(501).send({
                                                    status:501,
                                                    error:true,
                                                    message:lang.SOMETHING_WENT_WRONG,
                                                    data:{}
                                                })
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
})
classRouter.post("/:class_id/resource/new",async (req,res)=>{
    const body = req.body;
    const user = req.user;
    let files = req.files;
    let {class_id} = req.params;
    if (parseInt(class_id)){
        class_id = parseInt(class_id)
        if (!body.title){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.TITLE_REQUIRED,
                data:{}
            })
        }else{
            if (!((typeof(body.title)=="string" && (!body.body || typeof(body.body)=="string")))){
                res.status(400).send({
                    status:400,  
                    error:true,
                    message:lang.STRING_VALUES,
                    data:{}
                })
            }else{
                const lengthCheckerResponse = lengthChecker(body,rules)
                if (lengthCheckerResponse.error){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lengthCheckerResponse.message,
                        data:{}
                    })
                }else{
                    const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id})
                    if (userClassroomStatusResponse.flag==0){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INVALID_CLASSROOM,
                            data:{}
                        })
                    }else{
                        const getUserRoleResponse = await getUserRole({user_id:user.user_id,class_id})
                        if (!(getUserRoleResponse.role=="creator" || getUserRoleResponse.role=="teacher")){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.INVALID_ROLE_ELIGIBLE,
                                data:{}
                            })
                        }else{
                            const addResourceResponse = await addResource({class_id,user_id:user.user_id,title:body.title,body:body.body})
                            let resourceFlag = false
                            if (addResourceResponse){
                                if (files && files.attachments){
                                    if (!Array.isArray(files.attachments)){
                                        files.attachments = [files.attachments]
                                    }   
                                    const len = files.attachments.length
                                    for (let i=0;i<len;i++){	
                                        const fileName = getTimeString()+"q"+user.user_id.toString()+"i"+i.toString()+"."+files.attachments[i].mimetype.split("/")[1]
                                        files.attachments[i].mv(`./public/classrooms/${class_id}/resources/${fileName}`)
                                        await addClassDocument({class_id,ra_id:`r${addResourceResponse.insertId}`,cd_type:"resource",user_id:user.user_id,title:body.title,body:body.body,file_name:fileName,path:"http://"+req.get("host")+"/classrooms/"+class_id.toString()+"/resources/"+fileName})
                                        if (i+1==len){
                                            resourceFlag=true
                                        }
                                    }
                                }else{
                                    resourceFlag = true
                                }
                                if (resourceFlag){
                                    res.send({
                                        status:200,
                                        error:false,
                                        message:"Resource added!!",
                                        data:{}
                                    })
                                }
                            }else{
                                res.status(501).send({
                                    status:501,
                                    error:true,
                                    message:lang.SOMETHING_WENT_WRONG,
                                    data:{}
                                })
                            }
                        }
                    }   
                }   
            }
        }
    }else{
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INTEGRAL_CLASS_ID,
            data:{}
        })
    }
})
classRouter.get("/:class_id/resource/:resource_id",async (req,res)=>{
    let {class_id,resource_id} = req.params
    const user = req.user
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        if (!parseInt(resource_id)){  
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_RESOURCE_ID,
                data:{}
            })
        }else{
            class_id = parseInt(class_id)
            resource_id = parseInt(resource_id)
            const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id})
            if (userClassroomStatusResponse.flag==0){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_CLASSROOM,
                    data:{}
                })
            }else{
                const checkResourceFlagResponse = await checkResourceFlag({class_id,resource_id})                
                if (checkResourceFlagResponse.flag==0){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.INVALID_RESOURCE_ID,
                        data:{}
                    })
                }else{
                    const getResourceResponse = await getResource({resource_id})
                    if (getResourceResponse){
                        res.send({
                            status:200,
                            error:false,
                            message:"",
                            data:getResourceResponse
                        })
                    }else{
                        res.status(501).send({
                            status:501,
                            error:true,
                            message:lang.SOMETHING_WENT_WRONG,
                            data:{}
                        })
                    }
                }
            }
        }
    }
})
classRouter.post("/:class_id/resource/:resource_id/delete",async (req,res)=>{
    const body = req.body
    const user = req.user
    let {class_id,resource_id} = req.params
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        if (!parseInt(resource_id)){  
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_RESOURCE_ID,
                data:{}
            })
        }else{
            class_id = parseInt(class_id)
            resource_id = parseInt(resource_id)
            const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id})
            if (userClassroomStatusResponse.flag==0){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_CLASSROOM,
                    data:{}
                })
            }else{
                const getUserRoleResponse = await getUserRole({user_id:user.user_id,class_id})
                if (!(getUserRoleResponse.role=="creator" || getUserRoleResponse.role=="teacher")){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.INVALID_ROLE_ELIGIBLE,
                        data:{}
                    })
                }else{
                    const checkResourceFlagResponse = await checkResourceFlag({class_id,resource_id})                
                    if (checkResourceFlagResponse.flag==0){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INVALID_RESOURCE_ID,
                            data:{}
                        })
                    }else{
                        const deleteResourceResponse = await deleteResource({resource_id})
                        if (deleteResourceResponse){
                            if (deleteResourceResponse.length>0){
                                const len = deleteResourceResponse.length
                                for (let i=0;i<len;i++){
                                    fs.unlinkSync(`./public/classrooms/${class_id}/resources/${deleteResourceResponse[i].file_name}`,(err)=>{console.log(err)})
                                    if (i+1==len){
                                        res.send({
                                            status:200,
                                            error:false,
                                            message:"Resource deleted!!",
                                            data:{}
                                        })
                                    }
                                }
                            }else{
                                res.send({
                                    status:200,
                                    error:false,
                                    message:"Resource deleted!!",
                                    data:{}
                                })
                            }
                        }else{
                            res.status(501).send({
                                status:501,
                                error:true,
                                message:lang.SOMETHING_WENT_WRONG,
                                data:{}
                            })
                        }
                    }
                }
            }
        }
    }
})
classRouter.post("/:class_id/resource/:resource_id/edit",async (req,res)=>{
    const body = req.body
    const user = req.user
    let files = req.files;
    let {class_id,resource_id} = req.params
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        if (!parseInt(resource_id)){  
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_RESOURCE_ID,
                data:{}
            })
        }else{
            class_id = parseInt(class_id)
            resource_id = parseInt(resource_id)
            const lengthCheckerResponse = await lengthChecker(body,rules)
            if (lengthCheckerResponse.error){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lengthCheckerResponse.message,
                    data:{}
                })
            }else{
                if ((body.delete_attachments && !JSON.parse(body.delete_attachments))){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.INVALID_DELETE_ATTACHMENTS_TYPE,
                        data:{}
                    })
                }else{
                    const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id})
                    if (userClassroomStatusResponse.flag==0){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INVALID_CLASSROOM,
                            data:{}
                        })
                    }else{
                        const getUserRoleResponse = await getUserRole({user_id:user.user_id,class_id})
                        if (!(getUserRoleResponse.role=="creator" || getUserRoleResponse.role=="teacher")){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.INVALID_ROLE_ELIGIBLE,
                                data:{}
                            })
                        }else{
                            const checkResourceFlagResponse = await checkResourceFlag({class_id,resource_id})
                            if (checkResourceFlagResponse.flag==0){
                                res.status(400).send({
                                    status:400,
                                    error:true,
                                    message:lang.INVALID_RESOURCE_ID,
                                    data:{}
                                })
                            }else{
                                let deleteAttachmentsFlag = false
                                if (body.delete_attachments){
                                    const delete_attachments = JSON.parse(body.delete_attachments)                                    
                                    if (delete_attachments.length>0){
                                        const getResourceAttachmentsResponse = await getResourceAttachments({resource_id})
                                        const getResourceAttachmentsResponseList = await getResourceAttachmentsResponse.map(i=>i.cd_id)
                                        const flag = delete_attachments.some((i)=>getResourceAttachmentsResponseList.includes(i))
                                        if(!flag){
                                            res.status(400).send({
                                                status:400,
                                                error:true,
                                                message:lang.INVALID_DELETE_ATTACHMENTS,
                                                data:{}
                                            })
                                        }else{
                                            const toDeleteattachments = getResourceAttachmentsResponse.filter(i=>delete_attachments.includes(i.cd_id))
                                            const len = toDeleteattachments.length
                                            for (let i=0;i<len;i++){
                                                await deleteResourceAttachement({class_id,file_name:toDeleteattachments[i].file_name,cd_id:toDeleteattachments[i].cd_id}) 
                                            }
                                            deleteAttachmentsFlag = true
                                        }
                                    }else{
                                        deleteAttachmentsFlag = true
                                    }
                                }else{
                                    deleteAttachmentsFlag = true
                                }
                                if (deleteAttachmentsFlag){
                                    let addResourceAttachementFlag = false
                                    if (files && files.attachments){
                                        if (!Array.isArray(files.attachments)){
                                            files.attachments = [files.attachments]
                                        }   
                                        const len = files.attachments.length
                                        for (let i=0;i<len;i++){	
                                            const fileName = getTimeString()+"q"+user.user_id.toString()+"i"+i.toString()+"."+files.attachments[i].mimetype.split("/")[1]
                                            files.attachments[i].mv(`./public/classrooms/${class_id}/resources/${fileName}`)
                                            await addClassDocument({class_id,ra_id:`r${resource_id}`,cd_type:"resource",user_id:user.user_id,title:body.title,body:body.body,file_name:fileName,path:"http://"+req.get("host")+"/classrooms/"+class_id.toString()+"/resources/"+fileName})
                                            if (i+1==len){
                                                addResourceAttachementFlag=true
                                            }
                                        }
                                    }else{
                                        addResourceAttachementFlag = true
                                    }
                                    if (addResourceAttachementFlag){
                                        const updateResourceResponse = await updateResource({resource_id,title:body.title,body:body.body})
                                        if (updateResourceResponse){
                                            res.send({
                                                status:200,
                                                error:false,
                                                message:"Resource updated!!",
                                                data:{}
                                            })
                                        }else{
                                            res.status(501).send({
                                                status:501,
                                                error:true,
                                                message:lang.SOMETHING_WENT_WRONG,
                                                data:{}
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
})
classRouter.post("/:class_id/resource/:resource_id/query/ask",async (req,res)=>{
    const body = req.body
    const user = req.user
    let {class_id,resource_id} = req.params
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        if (!parseInt(resource_id)){  
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_RESOURCE_ID,
                data:{}
            })
        }else{
            if (!body.query_body){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_QUERY_CONTENT,
                    data:{}
                })
            }else{
                const lengthCheckerResponse = lengthChecker(body,rules)
                if (lengthCheckerResponse.error){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lengthCheckerResponse.message,
                        data:{}
                    })
                }else{
                    class_id = parseInt(class_id)
                    resource_id = parseInt(resource_id)
                    const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id})
                    if (userClassroomStatusResponse.flag==0){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INVALID_CLASSROOM,
                            data:{}
                        })
                    }else{
                        const getUserRoleResponse = await getUserRole({user_id:user.user_id,class_id})
                        if (!(getUserRoleResponse.role=="student")){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.INVALID_ROLE_ELIGIBLE,
                                data:{}
                            })
                        }else{
                            const checkResourceFlagResponse = await checkResourceFlag({class_id,resource_id})
                            if (checkResourceFlagResponse.flag==0){
                                res.status(400).send({
                                    status:400,
                                    error:true,
                                    message:lang.INVALID_RESOURCE_ID,
                                    data:{}
                                })
                            }else{
                                const askQueryResponse = await askQuery({resource_id,user_id:user.user_id,query_title:body.query_title,query_body:body.query_body,class_id})
                                if (askQueryResponse){
                                    res.send({
                                        status:200,
                                        error:false,
                                        message:"Asked your query!!",
                                        data:{}
                                    })
                                }else{
                                    res.status(501).send({
                                        status:501,
                                        error:true,
                                        message:lang.SOMETHING_WENT_WRONG,
                                        data:{}
                                    })
                                }
                            }
                        }
                    }
                }
            }
        }
    }
})
classRouter.post("/:class_id/resource/:resource_id/query/:query_id/edit",async (req,res)=>{
    const body = req.body
    const user = req.user
    let {class_id,resource_id,query_id} = req.params
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        if (!parseInt(resource_id)){  
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_RESOURCE_ID,
                data:{}
            })
        }else{
            if (!parseInt(query_id)){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_QUERY_ID,
                    data:{}
                })
            }else{
                if (!(body.query_body || body.query_title)){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.EMPTY_INPUTS,
                        data:{}
                    })
                }else{
                    const lengthCheckerResponse = lengthChecker(body,rules)
                    if (lengthCheckerResponse.error){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lengthCheckerResponse.message,
                            data:{}
                        })
                    }else{
                        class_id = parseInt(class_id)
                        resource_id = parseInt(resource_id)
                        query_id = parseInt(query_id)
                        const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id})
                        if (userClassroomStatusResponse.flag==0){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.INVALID_CLASSROOM,
                                data:{}
                            })
                        }else{
                            const getUserRoleResponse = await getUserRole({user_id:user.user_id,class_id})
                            if (!(getUserRoleResponse.role=="student")){
                                res.status(400).send({
                                    status:400,
                                    error:true,
                                    message:lang.INVALID_ROLE_ELIGIBLE,
                                    data:{}
                                })
                            }else{
                                const checkResourceFlagResponse = await checkResourceFlag({class_id,resource_id})
                                if (checkResourceFlagResponse.flag==0){
                                    res.status(400).send({
                                        status:400,
                                        error:true,
                                        message:lang.INVALID_RESOURCE_ID,
                                        data:{}
                                    })
                                }else{
                                    const checkQueryFlagResponse = await checkQueryFlag({resource_id,user_id:user.user_id,query_id})
                                    console.log(checkQueryFlagResponse)
                                    if (checkQueryFlagResponse.flag==0){
                                        res.status(400).send({
                                            status:400,
                                            error:true,
                                            message:lang.INVALID_QUERY_ID,
                                            data:{}
                                        })
                                    }else{
                                        const editQueryResponse = await editQuery({query_id,query_title:body.query_title,query_body:body.query_body})
                                        if (editQueryResponse){
                                            res.send({
                                                status:200,
                                                error:false,
                                                message:"Edited your query!!",
                                                data:{}
                                            })
                                        }else{
                                            res.status(501).send({
                                                status:501,
                                                error:true,
                                                message:lang.SOMETHING_WENT_WRONG,
                                                data:{}
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
})
classRouter.delete("/:class_id/resource/:resource_id/query/:query_id/delete",async (req,res)=>{
    const user = req.user
    let {class_id,resource_id,query_id} = req.params
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        if (!parseInt(resource_id)){  
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_RESOURCE_ID,
                data:{}
            })
        }else{
            if (!parseInt(query_id)){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_QUERY_ID,
                    data:{}
                })
            }else{
                class_id = parseInt(class_id)
                resource_id = parseInt(resource_id)
                query_id = parseInt(query_id)
                const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id})
                if (userClassroomStatusResponse.flag==0){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.INVALID_CLASSROOM,
                        data:{}
                    })
                }else{
                    const getUserRoleResponse = await getUserRole({user_id:user.user_id,class_id})
                    if (!(getUserRoleResponse.role=="student")){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INVALID_ROLE_ELIGIBLE,
                            data:{}
                        })
                    }else{
                        const checkResourceFlagResponse = await checkResourceFlag({class_id,resource_id})
                        if (checkResourceFlagResponse.flag==0){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.INVALID_RESOURCE_ID,
                                data:{}
                            })
                        }else{
                            const checkQueryFlagResponse = await checkQueryFlag({resource_id,user_id:user.user_id,query_id})
                            if (checkQueryFlagResponse.flag==0){
                                res.status(400).send({
                                    status:400,
                                    error:true,
                                    message:lang.INVALID_QUERY_ID,
                                    data:{}
                                })
                            }else{
                                const deleteQueryResponse = await deleteQuery({query_id})
                                if (deleteQueryResponse){
                                    res.send({
                                        status:200,
                                        error:false,
                                        message:"Deleted your query!!",
                                        data:{}
                                    })
                                }else{
                                    res.status(501).send({
                                        status:501,
                                        error:true,
                                        message:lang.SOMETHING_WENT_WRONG,
                                        data:{}
                                    })
                                }
                            }
                        }
                    }
                }
            }
        }
    }
})
classRouter.post("/:class_id/resource/:resource_id/query/:query_id/solve",async (req,res)=>{
    const user = req.user
    let {class_id,resource_id,query_id} = req.params
    const {solution} = req.body
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        if (!solution){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.EMPTY_INPUTS,
                data:{}
            })
        }else{
            const lengthCheckerResponse = lengthChecker({solution},rules)
            if (lengthCheckerResponse.error){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lengthCheckerResponse.message,
                    data:{}
                })
            }else{
                if (!parseInt(resource_id)){  
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.INVALID_RESOURCE_ID,
                        data:{}
                    })
                }else{
                    if (!parseInt(query_id)){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INVALID_QUERY_ID,
                            data:{}
                        })
                    }else{
                        class_id = parseInt(class_id)
                        resource_id = parseInt(resource_id)
                        query_id = parseInt(query_id)
                        const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id})
                        if (userClassroomStatusResponse.flag==0){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.INVALID_CLASSROOM,
                                data:{}
                            })
                        }else{
                            const getUserRoleResponse = await getUserRole({user_id:user.user_id,class_id})
                            if (!(getUserRoleResponse.role=="creator" || getUserRoleResponse.role=="teacher")){
                                res.status(400).send({
                                    status:400,
                                    error:true,
                                    message:lang.INVALID_ROLE_ELIGIBLE,
                                    data:{}
                                })
                            }else{
                                const checkResourceFlagResponse = await checkResourceFlag({class_id,resource_id})
                                if (checkResourceFlagResponse.flag==0){
                                    res.status(400).send({
                                        status:400,
                                        error:true,
                                        message:lang.INVALID_RESOURCE_ID,
                                        data:{}
                                    })
                                }else{
                                    const checkQueryFlagResponse = await checkQueryFlagUsingResourceId({resource_id,query_id})
                                    if (checkQueryFlagResponse.flag==0){
                                        res.status(400).send({
                                            status:400,
                                            error:true,
                                            message:lang.INVALID_QUERY_ID,
                                            data:{}
                                        })
                                    }else{
                                        const solveQueryResponse = await writeSolution({query_id,solution,user_id:user.user_id})
                                        if (solveQueryResponse){
                                            res.send({
                                                status:200,
                                                error:false,
                                                message:"Solved the query!!",
                                                data:{}
                                            })
                                        }else{
                                            res.status(501).send({
                                                status:501,
                                                error:true,
                                                message:lang.SOMETHING_WENT_WRONG,
                                                data:{}
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
})
classRouter.post("/:class_id/resource/:resource_id/attendance/mark",async (req,res)=>{
    const user = req.user
    let {class_id,resource_id} = req.params
    const {attendance,date} = req.body
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        if (!parseInt(resource_id)){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_RESOURCE_ID,
                data:{}
            })
        }else{
            const checkerResponse = checker({attendance,date},["attendance","date"])
            if (checkerResponse.error){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.PLEASE_ENTER+checkerResponse.empty.join(", ")+"!!",
                    data:{}
                })
            }else{
                class_id = parseInt(class_id)
                resource_id = parseInt(resource_id)
                const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id})
                if (userClassroomStatusResponse.flag==0){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.INVALID_CLASSROOM,
                        data:{}
                    })
                }else{
                    const getUserRoleResponse = await getUserRole({user_id:user.user_id,class_id})
                    if (!(getUserRoleResponse.role=="creator" || getUserRoleResponse.role=="teacher")){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INVALID_ROLE_ELIGIBLE,
                            data:{}
                        })
                    }else{
                        const checkResourceFlagResponse = await checkResourceFlag({class_id,resource_id})
                        if (checkResourceFlagResponse.flag==0){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.INVALID_RESOURCE_ID,
                                data:{}
                            })
                        }else{
                            if (!isDictionary(attendance)){
                                res.status(400).send({
                                    status:400,
                                    error:true,
                                    message:lang.INVALID_ATTENDANCE_TYPE,
                                    data:{}
                                })
                            }else{
                                const attend_date = new Date(date)
                                if (attend_date=="Invalid Date"){
                                    res.status(400).send({
                                        status:400,
                                        error:true,
                                        message:lang.INVALID_DATE,
                                        data:{}
                                    })
                                }else{
                                    const user_ids = Object.keys(attendance)
                                    if (user_ids.length==0){
                                        res.status(400).send({
                                            status:400,
                                            error:true,
                                            message:lang.EMPTY_INPUTS,
                                            data:{}
                                        })
                                    }else{
                                        const attendanceFlag = user_ids.some((i)=> !(attendance[i]==1 || attendance[i]==0))
                                        if (attendanceFlag){
                                            res.status(400).send({
                                                status:400,
                                                error:true,
                                                message:lang.INVALID_ATTENDANCE_VALUE,
                                                data:{}
                                            })
                                        }else{
                                            const checkStudentsFlagResponse = await checkStudentsFlag({class_id,user_ids})
                                            if (checkStudentsFlagResponse.flag!==user_ids.length){
                                                res.status(400).send({
                                                    status:400,
                                                    error:true,
                                                    message:lang.INVALID_ATTENDANCE_ID,
                                                    data:{}
                                                })
                                            }else{
                                                const deleteOldAttendanceResponse = await deleteOldAttendance({resource_id,class_id,user_ids})
                                                if (deleteOldAttendanceResponse){
                                                    const markAttendanceResponse = await markAttendance({resource_id,class_id,attendance,attend_date:attend_date.getTime().toString()})
                                                    if (markAttendanceResponse){
                                                        res.send({
                                                            status:200,
                                                            error:false,
                                                            message:"Marked attendance!!",
                                                            data:{}
                                                        })
                                                    }else{
                                                        res.status(501).send({
                                                            status:501,
                                                            error:true,
                                                            message:lang.SOMETHING_WENT_WRONG,
                                                            data:{}
                                                        })
                                                    }
                                                }else{
                                                    res.status(501).send({
                                                        status:501,
                                                        error:true,
                                                        message:lang.SOMETHING_WENT_WRONG,
                                                        data:{}
                                                    })
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
})
classRouter.post("/:class_id/assignment/new",async (req,res)=>{
    const body = req.body
    const user = req.user
    const files = req.files
    let {class_id} = req.params
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        class_id = parseInt(class_id)
        const checkerResponse = checker(body,["title","total_marks","due_date_time"])
        if (checkerResponse.error){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.PLEASE_ENTER+checkerResponse.empty.join(", ")+"!!",
                data:{}
            })
        }else{
            const lengthCheckerResponse = await lengthChecker(body,rules)
            if (lengthCheckerResponse.error){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.PLEASE_ENTER+lengthCheckerResponse.empty.join(", ")+"!!",
                    data:{}
                })
            }else{
                const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id})
                if (userClassroomStatusResponse.flag==0){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.INVALID_CLASSROOM,
                        data:{}
                    })
                }else{
                    const getUserRoleResponse = await getUserRole({user_id:user.user_id,class_id})
                    if (!(getUserRoleResponse.role=="creator" || getUserRoleResponse.role=="teacher")){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INVALID_ROLE_ELIGIBLE,
                            data:{}
                        })
                    }else{
                        const due_date_time = new Date(body.due_date_time)
                        if (due_date_time=="Invalid Date"){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.INVALID_DATE,
                                data:{}
                            })
                        }else{
                            if (!parseInt(body.total_marks)){
                                res.status(400).send({
                                    status:400,
                                    error:true,
                                    message:lang.TOTAL_MARKS_REQUIRED,
                                    data:{}
                                })
                            }else{
                                const createAssignmentResponse = await createAssignment({class_id,title:body.title,body:body.body,due_date_time:due_date_time.getTime().toString(),user_id:user.user_id,total_marks:parseInt(body.total_marks)})
                                if (createAssignmentResponse){
                                    let resourceFlag = false
                                    if (files && files.attachments){
                                        if (!Array.isArray(files.attachments)){
                                            files.attachments = [files.attachments]
                                        }   
                                        const len = files.attachments.length
                                        for (let i=0;i<len;i++){	
                                            const fileName = getTimeString()+"q"+user.user_id.toString()+"i"+i.toString()+"."+files.attachments[i].mimetype.split("/")[1]
                                            files.attachments[i].mv(`./public/classrooms/${class_id}/assignments/${fileName}`)
                                            await addClassDocument({class_id,ra_id:`a${createAssignmentResponse.insertId}`,cd_type:"assignment",user_id:user.user_id,file_name:fileName,path:"http://"+req.get("host")+"/classrooms/"+class_id.toString()+"/resources/"+fileName})
                                            if (i+1==len){
                                                resourceFlag=true
                                            }
                                        }
                                    }else{
                                        resourceFlag = true
                                    }
                                    if (resourceFlag){
                                        res.send({
                                            status:200,
                                            error:false,
                                            message:"Assigned to students!!",
                                            data:{}
                                        })
                                    }else{
                                        res.status(501).send({
                                            status:501,
                                            error:true,
                                            message:lang.SOMETHING_WENT_WRONG,
                                            data:{}
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
})
classRouter.post("/:class_id/assignment/:assignment_id/edit",async (req,res)=>{
    const body = req.body
    const user = req.user
    let files = req.files;
    let {class_id,assignment_id} = req.params
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        if (!parseInt(assignment_id)){  
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_ASSIGNMENT_ID,
                data:{}
            })
        }else{
            class_id = parseInt(class_id)
            assignment_id = parseInt(assignment_id)
            let dueDateTimeFlag = false
            if (body.due_date_time){
                var temp = new Date(body.due_date_time)
                if (temp.toString()=="Invalid Date"){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.INVALID_DATE,
                        data:{}
                    })
                }else{
                    dueDateTimeFlag=true
                }
            }else{
                dueDateTimeFlag=true
            }
            if (dueDateTimeFlag){
                let totalMarksFlag = false
                if(body.total_marks){
                    if (!parseInt(body.total_marks)){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INTEGER_MARKS,
                            data:{}
                        })
                    }else{
                        totalMarksFlag=true
                    }
                }else{
                    totalMarksFlag= true
                }
                if (totalMarksFlag){
                    const lengthCheckerResponse = lengthChecker(body,rules)
                    if (lengthCheckerResponse.error){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lengthCheckerResponse.message,
                            data:{}
                        })
                    }else{
                        if ((body.delete_attachments && !JSON.parse(body.delete_attachments))){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.INVALID_DELETE_ATTACHMENTS_TYPE,
                                data:{}
                            })
                        }else{
                            const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id})
                            if (userClassroomStatusResponse.flag==0){
                                res.status(400).send({
                                    status:400,
                                    error:true,
                                    message:lang.INVALID_CLASSROOM,
                                    data:{}
                                })
                            }else{
                                const getUserRoleResponse = await getUserRole({user_id:user.user_id,class_id})
                                if (!(getUserRoleResponse.role=="creator" || getUserRoleResponse.role=="teacher")){
                                    res.status(400).send({
                                        status:400,
                                        error:true,
                                        message:lang.INVALID_ROLE_ELIGIBLE,
                                        data:{}
                                    })
                                }else{
                                    const checkAssignmentFlagResponse = await checkAssignmentFlag({class_id,assignment_id})
                                    if (checkAssignmentFlagResponse.flag==0){
                                        res.status(400).send({
                                            status:400,
                                            error:true,
                                            message:lang.INVALID_ASSIGNMENT_ID,
                                            data:{}
                                        })
                                    }else{
                                        let deleteAttachmentsFlag = false
                                        if (body.delete_attachments){
                                            const delete_attachments = JSON.parse(body.delete_attachments)                                    
                                            if (delete_attachments.length>0){
                                                const getAssignmentsAttachmentsResponse = await getAssignmentAttachments({assignment_id})
                                                const getAssignmentseAttachmentsResponseList = await getAssignmentsAttachmentsResponse.map(i=>i.cd_id)
                                                const flag = delete_attachments.some((i)=>getAssignmentseAttachmentsResponseList.includes(i))
                                                if(!flag){
                                                    res.status(400).send({
                                                        status:400,
                                                        error:true,
                                                        message:lang.INVALID_DELETE_ATTACHMENTS,
                                                        data:{}
                                                    })
                                                }else{
                                                    const toDeleteattachments = getAssignmentsAttachmentsResponse.filter(i=>delete_attachments.includes(i.cd_id))
                                                    const len = toDeleteattachments.length
                                                    for (let i=0;i<len;i++){
                                                        await deleteAssignmenteAttachement({class_id,file_name:toDeleteattachments[i].file_name,cd_id:toDeleteattachments[i].cd_id}) 
                                                    }
                                                    deleteAttachmentsFlag = true
                                                }
                                            }else{
                                                deleteAttachmentsFlag = true
                                            }
                                        }else{
                                            deleteAttachmentsFlag = true
                                        }
                                        if (deleteAttachmentsFlag){
                                            let addAssignementAttachementFlag = false
                                            if (files && files.attachments){
                                                if (!Array.isArray(files.attachments)){
                                                    files.attachments = [files.attachments]
                                                }   
                                                const len = files.attachments.length
                                                for (let i=0;i<len;i++){	
                                                    const fileName = getTimeString()+"q"+user.user_id.toString()+"i"+i.toString()+"."+files.attachments[i].mimetype.split("/")[1]
                                                    files.attachments[i].mv(`./public/classrooms/${class_id}/assignments/${fileName}`)
                                                    await addClassDocument({class_id,ra_id:`a${assignment_id}`,cd_type:"assignment",user_id:user.user_id,title:body.title,body:body.body,file_name:fileName,path:"http://"+req.get("host")+"/classrooms/"+class_id.toString()+"/assignments/"+fileName})
                                                    if (i+1==len){
                                                        addAssignementAttachementFlag=true
                                                    }
                                                }
                                            }else{
                                                addAssignementAttachementFlag = true
                                            }
                                            if (addAssignementAttachementFlag){
                                                let due_date_time = null
                                                if (body.due_date_time){
                                                    due_date_time = new Date(body.due_date_time)
                                                }
                                                const updateAssignmentResponse = await updateAssignment({assignment_id,title:body.title,body:body.body,due_date_time:due_date_time?.getTime().toString(),total_marks:parseInt(body.total_marks)})
                                                if (updateAssignmentResponse){
                                                    res.send({
                                                        status:200,
                                                        error:false,
                                                        message:"Assignment updated!!",
                                                        data:{}
                                                    })
                                                }else{
                                                    res.status(501).send({
                                                        status:501,
                                                        error:true,
                                                        message:lang.SOMETHING_WENT_WRONG,
                                                        data:{}
                                                    })
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
})
module.exports = classRouter