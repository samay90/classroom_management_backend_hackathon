const express = require("express")
const userRouter = express.Router()
const lang = require("../../lang/lang.json")
const checker = require("../helpers/functions/checker")
const { checkDoctorFlag, addDoctorRequest } = require("../modules/user")
const lengthChecker = require("../helpers/functions/lengthChecker")
const rules = require("../../rules/rules.json")
userRouter.post("/apply/doctor",async (req,res)=>{
    const body = req.body;
    const user = req.user;
    const checkerResponse = checker(body,["hospital","specialization","education","open_time","close_time"])
    if(checkerResponse.error){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.PLEASE_ENTER+checkerResponse.empty.join(", ")+"!!",
            data:{}
        })
    }else{
        if (!(typeof(body.hospital)=="string" && typeof(body.specialization)=="string" && typeof(body.education)=="string")){          
            res.status(400).send({
                status:400,
                error:true,
                message:lang.STRING_VALUES,
                data:{}
            })
        }else{
            if(!(typeof(body.open_time)=="number" && typeof(body.close_time)=="number")){
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
                    const checkDoctorFlagResponse = await checkDoctorFlag({user_id:user.user_id})
                    if (checkDoctorFlagResponse.flag==1){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.ALREADY_DOCTOR,
                            data:{}
                        })
                    }else{
                        if (!(0<=body.open_time && body.open_time<=24 && 0<=body.close_time && body.close_time<=24)){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.INVALID_TIME,
                                data:{}
                            })
                        }else{
                            if (body.close_time<=body.open_time){
                                res.status(400).send({
                                    status:400,
                                    error:true,
                                    message:lang.INVALID_CLOSE_TIME,
                                    data:{}
                                })
                            }else{
                                const addDoctorRequestResponse = await addDoctorRequest({user_id:user.user_id,hospital:body.hospital,specialization:body.specialization,education:body.education,open_time:body.open_time,close_time:body.close_time})
                                if (!addDoctorRequestResponse){
                                    res.status(501).send({
                                        status:501,
                                        error:true,
                                        message:lang.SOMETHING_WENT_WRONG,
                                        data:{}
                                    })
                                }else{
                                    res.send({
                                        status:200,
                                        error:false,
                                        message:"Request Successfully Added!!",
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
userRouter
module.exports = userRouter