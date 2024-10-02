const express = require("express")
const classRouter = express.Router()
const lang = require("../../lang/lang.json") 
const { userClassroomStatus, getUserRole, updateClassroom } = require("../modules/classroom")
const lengthChecker = require("../helpers/functions/lengthChecker")
const rules = require("../../rules/rules.json")
const bcrypt = require('bcrypt')
classRouter.post("/:class_id/edit",async (req,res)=>{
    const body = req.body
    const user = req.user
    const {class_id} = req.params
    if (!parseInt(class_id)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_CLASSROOM,
            data:{}
        })
    }else{
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

module.exports = classRouter