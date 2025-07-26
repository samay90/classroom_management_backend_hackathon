const express = require("express")
const classRouter = express.Router()
const lang = require("../../lang/lang.json") 
const { userClassroomStatus, getUserRole, updateClassroom, removeUser, updateRole, addResource, addClassDocument, checkResourceFlag, getResource, deleteResource, deleteResourceAttachment, updateResource, getResourceAttachments, askQuery, editQuery, checkQueryFlag, deleteQuery, checkQueryFlagUsingResourceId, writeSolution, checkStudentsFlag, markAttendance, deleteOldAttendance, createAssignment, checkAssignmentFlag, getAssignmentAttachments, deleteAssignmenteAttachment, updateAssignment, deleteAssignment, submitAssignment, checkedMarkedFlag, getDueDate, markSubmission, checkSubmissionFlag, getTotalMarks, getClassroomResources, getClassroomAssignments, getAssignment, getUserQuery, getClassroomSensitive, getClassroomClass, getUserClassProfile, getAssignmentSubmissions, getResourceAttendances, getResourceQueries, getClassRoomStream, getTopics, getClasswork, deleteQueries, deleteAttendance, deleteSubmissions } = require("../modules/classroom")
const lengthChecker = require("../helpers/functions/lengthChecker")
const rules = require("../../rules/rules.json")
const bcrypt = require('bcrypt')
const checker = require("../helpers/functions/checker")
const { getTimeString } = require("../helpers/functions/timeToWordDate")
const isDictionary = require("../helpers/functions/isDictionary.js")
const fs = require('fs');
const { parse } = require("path")
const { isNumber } = require("util")
const path = require("path")
const { FieldPath } = require("firebase-admin/firestore")
const { uploadFile, deleteFile } = require("../helpers/firebase/file")
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
        if (!(body.class_name || body.class_description || body.banner_id)){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.EMPTY_INPUTS,
                data:{}
            })
        }else{
            if (!((typeof(body.class_name)=="string" || !body.class_name) && (typeof(body.class_description)=="string"|| !body.class_description)) ){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.STRING_VALUES,
                    data:{}
                })
            }else{
                if (!(typeof(body.banner_id)=="number"|| !body.banner_id)){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.NUMBER_VALIES,
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
                                const updateClassroomResponse = await updateClassroom({class_id:class_id,class_name:body.class_name,class_description:body.class_description,banner_id:body.banner_id})
                                if (updateClassroomResponse){
                                    res.send({
                                        status:200,
                                        error:false,
                                        message:"Classroom Updated.",
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
                message:lang.PLEASE_ENTER+checkerResponse.empty.join(", ")+".",
                data:{}
            })
        }else{
            if (!(body.action_type=="M" || body.action_type=="R")){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:"Action type must be of either Manage (M) OR Remove (R).",
                    data:{}
                })
            }else{
                let managePass = false
                if (body.action_type=="M"){
                    if (!(body.action=="T" || body.action=="S")){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:"Invalid action it should Teacher (T) or Student (S).",
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
                                                message:"User removed.",
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
                                                message:"Action should contain Teacher (T) or Student (S) only."
                                            })
                                        }else{
                                            const updateRoleResponse = await updateRole({class_id,user_id:body.user_id,role:body.action=="T"?"teacher":"student"})
                                            if (updateRoleResponse){
                                                res.send({
                                                    status:200,
                                                    error:false,
                                                    message:"User role updated.",
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
            if (!body.title){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.TITLE_REQUIRED,
                    data:{}
                })
            }else{
                if (!(((typeof(body.title)=="string") && (!body.body || typeof(body.body)=="string"))) ){
                    res.status(400).send({
                        status:400,  
                        error:true,
                        message:lang.STRING_VALUES,
                        data:{}
                    })
                }else{
                    if (body.topic && typeof(body.topic)!="string"){
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
                                const addResourceResponse = await addResource({class_id,user_id:user.user_id,title:body.title,body:body.body,topic:body.topic})
                                let resourceFlag = false
                                if (addResourceResponse){
                                    if (files && files.attachments){
                                        if (!Array.isArray(files.attachments)){
                                            files.attachments = [files.attachments]
                                        }   
                                        const len = files.attachments.length
                                        for (let i=0;i<len;i++){	
                                            const fileName = getTimeString()+"q"+user.user_id.toString()+"i"+i.toString()+path.extname(files.attachments[i].name)
                                            const filepath = `classrooms/${class_id}/resources/${addResourceResponse.insertId}/${fileName}`
                                            const url = await uploadFile(files.attachments[i],filepath)
                                            await addClassDocument({class_id,ra_id:`r${addResourceResponse.insertId}`,cd_type:"resource",user_id:user.user_id,title:body.title,body:body.body,path:filepath,url})
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
                                            message:"Resource added.",
                                            data:addResourceResponse
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
                    const getResourceResponse = await getResource({resource_id,user_id:user.user_id})
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
                            await deleteFile("classrooms/"+class_id+"/resources/"+resource_id+"/")
                            await deleteQueries({resource_id});
                            await deleteAttendance({resource_id});
                            res.send({
                                status:200,
                                error:false,
                                message:"Resource deleted.",
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
})
classRouter.get("/:class_id/topics",async (req,res)=>{
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
        class_id = parseInt(class_id)
        const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id})
        if (userClassroomStatusResponse.flag==0){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_CLASSROOM,
                data:{}
            })
        }else{
            const getTopicsResponse = await getTopics({class_id})
            
            if (getTopicsResponse){
                res.send({
                    status:200,
                    error:false,
                    message:"",
                    data:getTopicsResponse
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
                                                await deleteFile(toDeleteattachments[i].path)
                                                await deleteResourceAttachment({cd_id:toDeleteattachments[i].cd_id}) 
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
                                    let addResourceAttachmentFlag = false
                                    if (files && files.attachments){
                                        if (!Array.isArray(files.attachments)){
                                            files.attachments = [files.attachments]
                                        }   
                                        const len = files.attachments.length
                                        for (let i=0;i<len;i++){	
                                            const fileName = getTimeString()+"q"+user.user_id.toString()+"i"+i.toString()+path.extname(files.attachments[i].name)
                                            const  filePath = `classrooms/${class_id}/resources/${resource_id}/${fileName}`
                                            const url = await uploadFile(files.attachments[i],filePath)
                                            await addClassDocument({class_id,ra_id:`r${resource_id}`,cd_type:"resource",user_id:user.user_id,title:body.title,body:body.body,url,path:filePath})
                                            if (i+1==len){
                                                addResourceAttachmentFlag=true
                                            }
                                        }
                                    }else{
                                        addResourceAttachmentFlag = true
                                    }
                                    if (addResourceAttachmentFlag){
                                        const updateResourceResponse = await updateResource({resource_id,title:body.title,body:body.body,topic:body.topic})
                                        if (updateResourceResponse){
                                            res.send({
                                                status:200,
                                                error:false,
                                                message:"Resource updated.",
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
                                        message:"Asked your query.",
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
                                                message:"Edited your query.",
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
                                        message:"Deleted your query.",
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
                                                message:"Solved the query.",
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
    const {attendance} = req.body
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
            const checkerResponse = checker({attendance},["attendance"])
            if (checkerResponse.error){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.PLEASE_ENTER+checkerResponse.empty.join(", ")+".",
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
                                                    const markAttendanceResponse = await markAttendance({resource_id,class_id,attendance})
                                                    if (markAttendanceResponse){
                                                        res.send({
                                                            status:200,
                                                            error:false,
                                                            message:"Marked attendance.",
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
                message:lang.PLEASE_ENTER+checkerResponse.empty.join(", ")+".",
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
                        const due_date_time = new Date(body.due_date_time)
                        
                        if (due_date_time=="Invalid Date" || due_date_time<new Date()){
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
                                const createAssignmentResponse = await createAssignment({class_id,title:body.title,body:body.body,topic:body.topic,due_date_time:due_date_time.getTime().toString(),user_id:user.user_id,total_marks:parseInt(body.total_marks)})
                                if (createAssignmentResponse){
                                    let resourceFlag = false
                                    if (files && files.attachments){
                                        if (!Array.isArray(files.attachments)){
                                            files.attachments = [files.attachments]
                                        }   
                                        const len = files.attachments.length
                                        for (let i=0;i<len;i++){	
                                            const fileName = getTimeString()+"q"+user.user_id.toString()+"i"+i.toString()+path.extname(files.attachments[i].name)
                                            const filePath = `classrooms/${class_id}/assignments/${createAssignmentResponse.insertId}/${fileName}`
                                            const url = await uploadFile(files.attachments[i],filePath)
                                            await addClassDocument({class_id,ra_id:`a${createAssignmentResponse.insertId}`,cd_type:"assignment",user_id:user.user_id,url,path:filePath})
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
                                            message:"Assigned to students.",
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
                                                        await deleteFile(toDeleteattachments[i].path)
                                                        await deleteAssignmenteAttachment({cd_id:toDeleteattachments[i].cd_id}) 
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
                                            let addAssignementAttachmentFlag = false
                                            if (files && files.attachments){
                                                if (!Array.isArray(files.attachments)){
                                                    files.attachments = [files.attachments]
                                                }   
                                                const len = files.attachments.length
                                                for (let i=0;i<len;i++){	
                                                    const fileName = getTimeString()+"q"+user.user_id.toString()+"i"+i.toString()+path.extname(files.attachments[i].name);
                                                    const filePath = `classrooms/${class_id}/assignments/${assignment_id}/${fileName}`
                                                    const url = await uploadFile(files.attachments[i],filePath)
                                                    await addClassDocument({class_id,ra_id:`a${assignment_id}`,cd_type:"assignment",user_id:user.user_id,title:body.title,body:body.body,url,path:filePath})
                                                    if (i+1==len){
                                                        addAssignementAttachmentFlag=true
                                                    }
                                                }
                                            }else{
                                                addAssignementAttachmentFlag = true
                                            }
                                            if (addAssignementAttachmentFlag){
                                                let due_date_time = null
                                                if (body.due_date_time){
                                                    due_date_time = new Date(body.due_date_time)
                                                }
                                                const updateAssignmentResponse = await updateAssignment({assignment_id,topic:body.topic,title:body.title,body:body.body,due_date_time:due_date_time?.getTime().toString(),total_marks:parseInt(body.total_marks)})
                                                if (updateAssignmentResponse){
                                                    res.send({
                                                        status:200,
                                                        error:false,
                                                        message:"Assignment updated.",
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
classRouter.post("/:class_id/assignment/:assignment_id/delete",async (req,res)=>{
    const user = req.user
    let {class_id,assignment_id} = req.params
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
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
            if (!parseInt(assignment_id)){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_ASSIGNMENT_ID,
                    data:{}
                })
            }else{
                const getUserRoleResponse = await getUserRole({user_id:user.user_id,class_id})
                if (!(getUserRoleResponse.role=="creator" || getUserRoleResponse.role=="teacher")){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.INVALID_CLASSROOM,
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
                        const deleteAssignmentResponse = await deleteAssignment({class_id,assignment_id})
                        if (deleteAssignmentResponse){
                            await deleteFile(`classrooms/${class_id}/assignments/${assignment_id}/`)
                            await deleteSubmissions({assignment_id})
                            res.send({
                                status:200,
                                error:false,
                                message:"Assignment deleted.",
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
})
classRouter.get('/:class_id/assignment/:assignment_id',async (req,res)=>{
    const user = req.user
    let {class_id,assignment_id} = req.params
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
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
            if (!parseInt(assignment_id)){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_ASSIGNMENT_ID,
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
                    const getAssignmentResponse = await getAssignment({user_id:user.user_id,assignment_id})
                    if (getAssignmentResponse){
                        res.send({
                            status:200,
                            error:false,
                            message:"Assignment fetched.",
                            data:getAssignmentResponse
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
classRouter.post("/:class_id/assignment/:assignment_id/submit",async (req,res)=>{
    const user = req.user;
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
        if (!(files && files.attachments)){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.EMPTY_INPUTS,
                data:{}
            })
        }else{
            if (!Array.isArray(files.attachments)){
                files.attachments = [files.attachments]   
            }
            const userClassroomStatusResponse = await userClassroomStatus({user_id:user.user_id,class_id})
            if (userClassroomStatusResponse.flag==0){
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
                    assignment_id = parseInt(assignment_id)
                    class_id = parseInt(class_id)
                    const getUserRoleResponse = await getUserRole({user_id:user.user_id,class_id})
                    if (!(getUserRoleResponse.role=="student")){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INVALID_ROLE_ELIGIBLE,
                            data:{}
                        })  
                    }else{
                        const checkedMarkedFlagResponse = await checkedMarkedFlag({class_id,assignment_id,user_id:user.user_id})
                        if (checkedMarkedFlagResponse.flag==1){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.ALREADY_MARKED,
                                data:{}
                            })
                        }else{
                            const getDueDateResponse = await getDueDate({assignment_id})
                            const currentTime = getTimeString()
                            if (parseInt(getDueDateResponse.due_date_time)<parseInt(currentTime)){
                                res.status(400).send({
                                    status:400,
                                    error:true,
                                    message:lang.ASSIGNMENT_DEADLINE_OVER,
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
                                    const nextProcess = async (completedFlag,paths,urls) =>{
                                        if (completedFlag){
                                            const submitAssignmentResponse = await submitAssignment({class_id,assignment_id,user_id:user.user_id,path:paths,url:urls})
                                            if (submitAssignmentResponse){
                                                res.send({
                                                    status:200,
                                                    error:false,
                                                    message:"Assignment submitted.",
                                                    data:{
                                                        path:paths
                                                    }
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
                                    await deleteFile("classrooms/"+class_id+"/assignments/"+assignment_id+"/submissions/"+user.user_id+"/")
                                    const len = files.attachments.length
                                    let paths = []
                                    let urls =[]
                                    for (let i=0;i<len;i++){	
                                        const fileName = getTimeString()+"q"+user.user_id.toString()+"i"+i.toString()+path.extname(files.attachments[i].name)
                                        const filePath = `classrooms/${class_id}/assignments/${assignment_id}/submissions/${user.user_id}/${fileName}`
                                        const url = await uploadFile(files.attachments[i],filePath)
                                        paths.push(filePath)
                                        urls.push(url)
                                        
                                        if (i+1==len){
                                            nextProcess(true,paths,urls)
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
classRouter.post("/:class_id/assignment/:assignment_id/submission/:submission_id/mark",async (req,res)=>{
    const user = req.user;
    const body = req.body;
    let {class_id,assignment_id,submission_id} = req.params
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
            if (!parseInt(submission_id)){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_ASSIGNMENT_ID,
                    data:{}
                })
            }else{
                class_id = parseInt(class_id)
                assignment_id = parseInt(assignment_id)
                submission_id = parseInt(submission_id)
                if (!body.marks || !Number.isInteger(body.marks)){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.MARKS_INTEGER,
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
                        if (!(getUserRoleResponse.role=="teacher" || getUserRoleResponse.role=="creator")){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.INVALID_ROLE_ELIGIBLE,
                                data:{}
                            })  
                        }else{
                            const getTotalMarksResponse = await getTotalMarks({assignment_id})
                            if (body.marks>getTotalMarksResponse.total_marks){
                                res.status(400).send({
                                    status:400,
                                    error:true,
                                    message:lang.INVALID_MARKS,
                                    data:{}
                                })
                            }else{
                                const checkSubmissionFlagResponse = await checkSubmissionFlag({class_id,assignment_id,submission_id})
                                if (checkSubmissionFlagResponse.flag==0){
                                    res.status(400).send({
                                        status:400,
                                        error:true,
                                        message:lang.INVALID_SUBMISSION_ID,
                                        data:{}
                                    })
                                }else{
                                    const markSubmissionResponse = await markSubmission({class_id,assignment_id,submission_id,user_id:user.user_id,marks:body.marks})
                                    if (markSubmissionResponse){
                                        res.send({
                                            status:200,
                                            error:false,
                                            message:"Marks marked.",
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

// Get Requests
classRouter.get("/:class_id",async (req,res)=>{
    const class_id = req.params.class_id
    const pageNo = req.query.page;
    const user = req.user;
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        const userClassroomStatusResponse = await userClassroomStatus({class_id,user_id:user.user_id})
        if (userClassroomStatusResponse.flag==0){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_CLASSROOM,
                data:{}
            })
        }else{
            const getClassRoomStreamResponse = await getClassRoomStream({class_id,pageNo:pageNo??1})
            if (getClassRoomStreamResponse){
                res.send({
                    status:200,
                    error:false,
                    message:"Classroom Stream",
                    count:getClassRoomStreamResponse.length,
                    data:getClassRoomStreamResponse
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
})
classRouter.get("/:class_id/classwork",async (req,res)=>{
    const class_id = req.params.class_id
    const pageNo = req.query.page;
    const user = req.user;
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        const userClassroomStatusResponse = await userClassroomStatus({class_id,user_id:user.user_id})
        if (userClassroomStatusResponse.flag==0){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_CLASSROOM,
                data:{}
            })
        }else{
            const getClassworkResponse = await getClasswork({class_id})
            if (getClassworkResponse){
                res.send({
                    status:200,
                    error:false,
                    message:"Classroom Stream",
                    data:getClassworkResponse
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
})
classRouter.get("/:class_id/resource/:resource_id/queries",async (req,res)=>{
    const {class_id,resource_id} = req.params
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
            const userClassroomStatusResponse = await userClassroomStatus({class_id,user_id:user.user_id})
            if (userClassroomStatusResponse.flag==0){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_CLASSROOM,
                    data:{}
                })
            }else{
                const getUserQueryResponse = await getUserQuery({class_id,resource_id,user_id:user.user_id})
                if (getUserQueryResponse){
                    res.send({
                        status:200,
                        error:false,
                        message:"",
                        data:getUserQueryResponse
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

})
classRouter.get("/:class_id/sensitive",async (req,res)=>{
    const class_id = req.params.class_id
    const user = req.user
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        const userClassroomStatusResponse = await userClassroomStatus({class_id,user_id:user.user_id})
        if (userClassroomStatusResponse.flag==0){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_CLASSROOM,
                data:{}
            })
        }else{
            const userRoleResponse = await getUserRole({class_id,user_id:user.user_id})
            if (userRoleResponse.role=="creator"){
                const getClassroomSensitiveResponse = await getClassroomSensitive({class_id})
                if (getClassroomSensitiveResponse){
                    res.send({
                        status:200,
                        error:false,
                        message:"Classroom sensitive fetched.",
                        data:getClassroomSensitiveResponse
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
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_ROLE_ELIGIBLE,
                    data:{}
                })
            }
        }
    }
})
classRouter.get("/:class_id/class",async (req,res)=>{
    const class_id = req.params.class_id
    const user = req.user
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        const userClassroomStatusResponse = await userClassroomStatus({class_id,user_id:user.user_id})
        if (userClassroomStatusResponse.flag==0){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_CLASSROOM,
                data:{}
            })
        }else{
            const getClassroomClassResponse = await getClassroomClass({class_id})
            if (getClassroomClassResponse){
                res.send({
                    status:200,
                    error:false,
                    message:"Classroom class fetched.",
                    data:getClassroomClassResponse
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
})
classRouter.get("/:class_id/class/:user_id",async (req,res)=>{
    const class_id = req.params.class_id
    const user_id = req.params.user_id
    const user = req.user
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        const userClassroomStatusResponse = await userClassroomStatus({class_id,user_id:user.user_id})
        if (userClassroomStatusResponse.flag==0){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_CLASSROOM,
                data:{}
            })
        }else{
            const getUserClassProfileResponse = await getUserClassProfile({class_id,user_id})
            if (getUserClassProfileResponse){
                res.send({
                    status:200,
                    error:false,
                    message:"Classroom class fetched.",
                    data:getUserClassProfileResponse
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
})
classRouter.get("/:class_id/assignment/:assignment_id/submissions",async (req,res)=>{
    const class_id = req.params.class_id
    const assignment_id = req.params.assignment_id
    const user = req.user
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        const userClassroomStatusResponse = await userClassroomStatus({class_id,user_id:user.user_id})
        if (userClassroomStatusResponse.flag==0){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_CLASSROOM,
                data:{}
            })
        }else{
            const userRoleResponse = await getUserRole({class_id,user_id:user.user_id})
            if (userRoleResponse.role=="creator" || userRoleResponse.role=="teacher"){
                const checkAssignmentFlagResponse = await checkAssignmentFlag({class_id,assignment_id})
                if (checkAssignmentFlagResponse.flag==0){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.INVALID_ASSIGNMENT,
                        data:{}
                    })
                }else{
                    const getAssignmentSubmissionsResponse = await getAssignmentSubmissions({class_id,assignment_id})
                    if (getAssignmentSubmissionsResponse){
                        res.send({
                            status:200,
                            error:false,
                            message:"Assignment submissions fetched.",
                            data:getAssignmentSubmissionsResponse
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
            }else{
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_ROLE_ELIGIBLE,
                    data:{}
                })
            }
        }
    }
})
classRouter.get("/:class_id/resource/:resource_id/attendances",async (req,res)=>{
    const class_id = req.params.class_id
    const resource_id = req.params.resource_id
    const user = req.user
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        const userClassroomStatusResponse = await userClassroomStatus({class_id,user_id:user.user_id})
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
                    message:lang.INVALID_RESOURCE,
                    data:{}
                })
            }else{
                const getResourceAttendancesResponse = await getResourceAttendances({class_id,resource_id})
                if (getResourceAttendancesResponse){
                    res.send({
                        status:200,
                        error:false,
                        message:"Resource attendances fetched.",
                        data:getResourceAttendancesResponse
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
})
classRouter.get("/:class_id/resource/:resource_id/queries/all",async (req,res)=>{
    const class_id = req.params.class_id
    const resource_id = req.params.resource_id
    const user = req.user
    
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
        const userClassroomStatusResponse = await userClassroomStatus({class_id,user_id:user.user_id})
        if (userClassroomStatusResponse.flag==0){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.INVALID_CLASSROOM,
                data:{}
            })
        }else{
            const userRoleResponse = await getUserRole({class_id,user_id:user.user_id})
            if (userRoleResponse.role=="creator" || userRoleResponse.role=="teacher"){
                const checkResourceFlagResponse = await checkResourceFlag({class_id,resource_id})
                if (checkResourceFlagResponse.flag==0){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.INVALID_RESOURCE_ID,
                        data:{}
                    })
                }else{
                    const getResourceQueriesResponse = await getResourceQueries({class_id,resource_id})
                    if (getResourceQueriesResponse){
                        res.send({
                            status:200,
                            error:false,
                            message:"Resource queries fetched.",
                            data:getResourceQueriesResponse
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
            else{
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_ROLE_ELIGIBLE,
                    data:{}
                })
            }
        }
    }
})
module.exports = classRouter