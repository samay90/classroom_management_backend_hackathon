const express = require("express")
const userRouter = express.Router()
const lang = require("../../lang/lang.json")
const checker = require("../helpers/functions/checker")
const { checkDoctorFlag, addDoctorRequest, addProfileImage, updateUserInfo, updateDoctorInfo, getOldProfileImage, getUserProfile, getDoctorProfile } = require("../modules/user")
const lengthChecker = require("../helpers/functions/lengthChecker")
const rules = require("../../rules/rules.json")
const { getTimeString } = require("../helpers/functions/timeToWordDate")
const fs = require("fs")
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
userRouter.post("/profile/update",async (req,res)=>{
    const body = req.body;
    const user = req.user;
    const files = req.files;
    const fields = Object.keys(body)
    const fields_length = fields.length
    const number_data_type = ["open_time","close_time"]
    const verifyDataType = () =>{
        for (let i=0;i<fields_length;i++){
            if (number_data_type.includes(fields[i])){
                if (typeof(body[fields[i]])!=="number"){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.NUMBER_VALIES,
                        data:{}
                    })
                    return false
                }
            }else{
                if (typeof(body[fields[i]])!=="string"){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.STRING_VALUES,
                        data:{}
                    })
                    return false
                }
            }
        }
        return true
    }
    const verifyProfileImage = () =>{
        if (files && files.profile){
            if (Array.isArray(files.profile)){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.MULTIPLE_PROFILE_IMAGES,
                    data:{}
                })
            }else{
                if (files.profile.size>1000000){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.INVALID_PROFILE_IMAGE_SIZE,
                        data:{}
                    })
                }else{
                    if (!(files.profile.mimetype=="image/png" || files.profile.mimetype=="image/jpeg")){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INVALID_PROFILE_IMAGE_TYPE,
                            data:{}
                        })
                    }else{
                        return true
                    }
                }
            }
        }else{
            return true
        }
    }
    const saveProfileImage = () =>{
        if (files && files.profile){
            return new Promise(async(resolve,reject)=>{
                const getOldProfileImageResponse =await getOldProfileImage({user_id:user.user_id})
                if (getOldProfileImageResponse.file_name){
                    fs.unlinkSync(__dirname+"/../../public/profile/"+getOldProfileImageResponse.file_name,(err)=>{
                        if (err){}
                    })
                }
                const fileName = getTimeString()+"q"+user.user_id.toString()+"0."+files.profile.mimetype.split("/")[1]
                const domain = "http://"+req.get("host")
                files.profile.mv(__dirname+"/../../public/profile/"+fileName,async (err)=>{
                        const addProfileImageResponse = await addProfileImage({user_id:user.user_id,path:domain+"/profile/"+fileName,file_name:fileName})
                        if (addProfileImageResponse){
                            resolve({error:false})
                        }else{
                            reject(err)
                        }
                })
            })
        }else{
            return true
        }
    }
    const verifyDOB= () =>{
        if (body.dob){
            if ((new Date(body.dob))=="Invalid Date"){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_DOB,
                    data:{}
                })
                return false
            }
        }
        return true
    }
    const startAndCloseTime = () =>{
        if (body.open_time && body.close_time){
            const st = body.open_time
            const et = body.close_time
            if (!((st>=0 && st<=24) || (et>=0 && et<=24))){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_TIME,
                    data:{}
                })
                return false
            }
            if (st>et) {
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_CLOSE_TIME,
                    data:{}
                })
                return false
            }
        }
        return true
    }
    if (user.is_doctor==1){
        if (!(body.first_name || body.last_name || body.dob || body.bio || body.education || body.specialization || body.hospital || body.open_time || body.city||body.state||body.country || body.close_time || (files && files.profile))){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.EMPTY_INPUTS,
                data:{}
            })
        }else{
            if (verifyDataType()){
                const lengthCheckerResponse = lengthChecker(body,rules)
                if (lengthCheckerResponse.error){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lengthCheckerResponse.message,
                        data:{}
                    })
                }else{
                    if (verifyProfileImage()){
                        if (verifyDOB()){
                            if (startAndCloseTime()){
                                const saveProfileImageResponse = await saveProfileImage()
                                console.log(saveProfileImageResponse);
                                
                                if (saveProfileImageResponse){
                                    const updateUserInfoResponse = await updateUserInfo({user_id:user.user_id,first_name:body.first_name,last_name:body.last_name,dob:body.dob,bio:body.bio}) 
                                    const updateDoctorInfoResponse = await updateDoctorInfo({user_id:user.user_id,hospital:body.hospital,specialization:body.specialization,education:body.education,open_time:body.open_time,close_time:body.close_time}) 
                                    if (updateDoctorInfoResponse && updateUserInfoResponse){
                                        res.send({
                                            status:200,
                                            error:false,
                                            message:"Profile Updated!!",
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
    }else{
        if (!(body.first_name || body.last_name || body.dob || body.bio || body.city||body.state||body.country|| (files && files.profile))){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.EMPTY_INPUTS,
                data:{}
            })
        }else{
            if (verifyDataType()){
                const lengthCheckerResponse = lengthChecker(body,rules)
                if (lengthCheckerResponse.error){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lengthCheckerResponse.message,
                        data:{}
                    })
                }else{
                    if (verifyProfileImage()){
                        if (verifyDOB()){
                            if (startAndCloseTime()){
                                const saveProfileImageResponse = await saveProfileImage()
                                if (saveProfileImageResponse){
                                    const updateUserInfoResponse = await updateUserInfo({user_id:user.user_id,first_name:body.first_name,last_name:body.last_name,dob:body.dob,bio:body.bio}) 
                                    if (updateUserInfoResponse){
                                        res.send({
                                            status:200,
                                            error:false,
                                            message:"Profile Updated!!",
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
    
})
userRouter.get("/profile",async (req,res)=>{
    const user = req.user
    const getUserProfileResponse = await getUserProfile({user_id:user.user_id})
    const getOldProfileImageResponse = await getOldProfileImage({user_id:user.user_id})
    let getDoctorProfileResponse = null
    if (user.is_doctor==1){
         getDoctorProfileResponse= await getDoctorProfile({user_id:user.user_id})
    }
    if (getUserProfileResponse&&getOldProfileImageResponse){
        res.send({
            status:200,
            error:false,
            message:"",
            data:{
                ...getUserProfileResponse,...getOldProfileImageResponse,...getDoctorProfileResponse
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
})
module.exports = userRouter