const express = require("express")
const userRouter = express.Router()
const lang = require("../../lang/lang.json")
const checker = require("../helpers/functions/checker")
const { addProfileImage, updateUserInfo, getOldProfileImage, getUserProfile, createClassroom, checkJoinCodeFlag, joinClass, userClassroomStatus, getClassrooms } = require("../modules/user")
const lengthChecker = require("../helpers/functions/lengthChecker")
const rules = require("../../rules/rules.json")
const { getTimeString } = require("../helpers/functions/timeToWordDate")
const fs = require("fs")
const bcrypt = require("bcrypt")
const joinCodeGenerator = require("../helpers/functions/codeGenerator")

userRouter.post("/profile/update",async (req,res)=>{
    const body = req.body;
    const user = req.user;
    const files = req.files;
    const fields = Object.keys(body)
    const fields_length = fields.length
    const verifyDataType = () =>{
        for (let i=0;i<fields_length;i++){
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
                        const saveProfileImageResponse = await saveProfileImage()
                            if (saveProfileImageResponse){
                                const updateUserInfoResponse = await updateUserInfo({user_id:user.user_id,first_name:body.first_name,last_name:body.last_name,dob:body.dob,bio:body.bio,city:body.city,state:body.state,country:body.country}) 
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
    
})
userRouter.get("/profile",async (req,res)=>{
    const user = req.user
    const getUserProfileResponse = await getUserProfile({user_id:user.user_id})
    const getOldProfileImageResponse = await getOldProfileImage({user_id:user.user_id})
    if (getUserProfileResponse&&getOldProfileImageResponse){
        res.send({
            status:200,
            error:false,
            message:"",
            data:{
                ...getUserProfileResponse,...getOldProfileImageResponse
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
userRouter.post("/class/new",async (req,res)=>{
    const body = req.body;
    const user = req.user;
    const checkerResponse = checker(body,["class_name","class_description"])
    if (!checkerResponse.error){
        if (typeof(body.class_name)=="string" && typeof(body.class_description)=="string"){
            const lengthCheckerResponse = lengthChecker(body,rules)
            if (lengthCheckerResponse.error){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lengthCheckerResponse.message,
                    data:{}
                })
            }else{
                let joinCode = joinCodeGenerator()
                console.log(joinCode)
                while (true){
                    const checkJoinCodeFlagResponse = await checkJoinCodeFlag({join_code:joinCode})
                    if (checkJoinCodeFlagResponse.length==0){break}
                    else{joinCode = joinCodeGenerator()}
                }
                const createClassroomResponse = await createClassroom({class_name:body.class_name,class_description:body.class_description,user_id:user.user_id,join_code:joinCode})
                if (createClassroomResponse){
                    res.send({
                        status:200,
                        error:false,
                        message:"Classroom Created!!",
                        data:{
                            join_code:joinCode,
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
            }
        }else{
            res.status(400).send({
                status:400,
                error:true,
                message:lang.STRING_VALUES,
                data:{}
            })
        }
    }else{
        res.status(400).send({
            status:400,
            error:true,
            message:lang.PLEASE_ENTER+checkerResponse.empty.join(", ")+"!!",
            data:{}
        })
    }
})
userRouter.post("/class/join",async (req,res)=>{
    const body = req.body;
    const user = req.user;
    const checkerResponse = checker(body,["join_code"])
    if (checkerResponse.error){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.PLEASE_ENTER+checkerResponse.empty.join(", ")+"!!",
            data:{}
        })
    }else{
        if (!(typeof(body.join_code)=="string")){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.STRING_VALUES,
                data:{}
            })
        }else{
            const checkJoinCodeFlagResponse = await checkJoinCodeFlag({join_code:body.join_code})
            if (checkJoinCodeFlagResponse.length==0){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.NO_CLASSROOM_EXIST,
                    data:{}
                })
            }else{
                const userClassroomStatusResponse = await userClassroomStatus({class_id:checkJoinCodeFlagResponse[0].class_id,user_id:user.user_id})
                    if (userClassroomStatusResponse.flag==0){
                        const joinClassResponse = await joinClass({user_id:user.user_id,class_id:checkJoinCodeFlagResponse[0].class_id,role:"student"})
                            if (joinClassResponse){
                                res.send({
                                    status:200,
                                    error:false,
                                    message:"Join Classroom!!",
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
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.ALREADY_IN_CLASSROOM,
                            data:{}
                        })
                    }
            }
        }
    }
})
userRouter.get("/classrooms",async (req,res)=>{
    const user = req.user;
    const getClassroomsResponse = await getClassrooms({user_id:user.user_id})
    if (getClassroomsResponse){
        res.send({
            status:200,
            error:false,
            message:"",
            data:getClassroomsResponse
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