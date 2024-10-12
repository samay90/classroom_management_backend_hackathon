const express = require("express")
const classRouter = express.Router()
const lang = require("../../lang/lang.json") 
const { userClassroomStatus, getUserRole, updateClassroom, removeUser, updateRole, addResource, addClassDocument, checkResourceFlag, getResource, deleteResource, deleteResourceAttachement, updateResource, getResourceAttachments, askQuery, editQuery, checkQueryFlag, deleteQuery, checkQueryFlagUsingResourceId, writeSolution } = require("../modules/classroom")
const lengthChecker = require("../helpers/functions/lengthChecker")
const rules = require("../../rules/rules.json")
const bcrypt = require('bcrypt')
const checker = require("../helpers/functions/checker")
const { getTimeString } = require("../helpers/functions/timeToWordDate")
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
                                if (files && files.attachements){
                                    if (!Array.isArray(files.attachements)){
                                        files.attachements = [files.attachements]
                                    }   
                                    const len = files.attachements.length
                                    for (let i=0;i<len;i++){	
                                        const fileName = getTimeString()+"q"+user.user_id.toString()+"i"+i.toString()+"."+files.attachements[i].mimetype.split("/")[1]
                                        files.attachements[i].mv(`./public/classrooms/${class_id}/resources/${fileName}`)
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
                                            const toDeleteAttachements = getResourceAttachmentsResponse.filter(i=>delete_attachments.includes(i.cd_id))
                                            const len = toDeleteAttachements.length
                                            for (let i=0;i<len;i++){
                                                await deleteResourceAttachement({class_id,file_name:toDeleteAttachements[i].file_name,cd_id:toDeleteAttachements[i].cd_id}) 
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
                                    if (files && files.attachements){
                                        if (!Array.isArray(files.attachements)){
                                            files.attachements = [files.attachements]
                                        }   
                                        const len = files.attachements.length
                                        for (let i=0;i<len;i++){	
                                            const fileName = getTimeString()+"q"+user.user_id.toString()+"i"+i.toString()+"."+files.attachements[i].mimetype.split("/")[1]
                                            files.attachements[i].mv(`./public/classrooms/${class_id}/resources/${fileName}`)
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
module.exports = classRouter