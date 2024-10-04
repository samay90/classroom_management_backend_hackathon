const express = require("express")
const classRouter = express.Router()
const lang = require("../../lang/lang.json") 
const { userClassroomStatus, getUserRole, updateClassroom, removeUser, updateRole } = require("../modules/classroom")
const lengthChecker = require("../helpers/functions/lengthChecker")
const rules = require("../../rules/rules.json")
const bcrypt = require('bcrypt')
const checker = require("../helpers/functions/checker")
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
    // const body
})
module.exports = classRouter