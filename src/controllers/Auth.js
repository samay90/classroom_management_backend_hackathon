const express = require('express');
const authRouter = express.Router()
const checker = require("../helpers/functions/checker")
const lang = require("../../lang/lang.json")
const lengthChecker = require("../helpers/functions/lengthChecker")
const rules = require("../../rules/rules.json")
const {isEmail,isPassword} = require("../helpers/functions/credentials");
const { checkUniqueFlag, createUser, checkEmailOrPhoneNo, getPassword, getTokenDetails, deleteNotVerified, verifyCode, checkCode, getUserDetails, updatePassword, validateCredentials } = require('../modules/auth');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const dotEnv = require("dotenv")
const isInteger = require("../helpers/functions/isIntegerString");
const { encrypt, decrypt } = require('node-encryption');
const { sendOtp, sendResetPassword } = require('../helpers/mail/mail');
const { getTimeString } = require('../helpers/functions/timeToWordDate');
dotEnv.config()

authRouter.post("/signup",async (req,res)=>{
    const body = req.body;
    const checkerResponse = checker(body,["email","password","first_name","last_name"])
    if (checkerResponse.error){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.PLEASE_ENTER+checkerResponse.empty.join(", ")+".",
            data:{}
        })
    }else{
        if (!(typeof(body.first_name)=="string" && typeof(body.last_name)=="string" && typeof(body.email)=="string" && typeof(body.password)=="string" )){
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
            if (!isEmail(body.email)){
                res.status(400).send({
                    status:400,
                    error:true,
                    message:lang.INVALID_EMAIL,
                    data:{}
                })
            }else{
                if (!isPassword(body.password)){
                    res.status(400).send({
                        status:400,
                        error:true,
                        message:lang.INVALID_PASSWORD,
                        data:{}
                    })
                }else{
                        await deleteNotVerified({email:body.email})
                        const checkUniqueFlagResponse = await checkUniqueFlag({email:body.email})
                        if (checkUniqueFlagResponse.flag!==0){
                            res.status(401).send({
                                status:401,
                                error:true,
                                message:lang.DUBLICATE_EMAIL_OR_PHONENO,
                                data:{}
                            })
                        }else{
                            const code = Math.floor(100000 + Math.random() * 900000);
                            const hassPass = bcrypt.hashSync(body.password,10)
                            const createUserResponse = await createUser({email:body.email,password:hassPass,first_name:body.first_name,last_name:body.last_name,code})                            
                            if (createUserResponse){
                                const slug = encrypt(body.email, process.env.ENCRYPTION_KEY);
                                await sendOtp({email:body.email,otp:code})
                                res.send({
                                    status:200,
                                    error:false,
                                    message:lang.SIGNUP_SUCCESS,
                                    data:{slug:slug}
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
authRouter.post("/login",async (req,res)=>{
    const body = req.body;
    if (!((body.authenticator) && body.password)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.INVALID_LOGIN_CREDENTIALS,
            data:{}
        })
    }else{
        if (!(typeof(body.authenticator)=="string" && typeof(body.password)=="string")){
            res.status(400).send({
                status:400,
                error:true,
                message:lang.STRING_VALUES,
                data:{}
            })
        }else{ 
            const checkEmailOrPhoneNoResponse = await checkEmailOrPhoneNo({authenticator:body.authenticator})
            if (checkEmailOrPhoneNoResponse.flag==0){
                res.status(401).send({
                    status:401,
                    error:true,
                    message:lang.INVALID_AUTHENTICATOR,
                    data:{}
                })
            }else{
                const getPasswordResponse = await getPassword({authenticator:body.authenticator})
                if (getPasswordResponse){
                    const passFlag = bcrypt.compareSync(body.password,getPasswordResponse.password)
                    if (passFlag){
                        const getTokenDetailsResponse = await getTokenDetails({authenticator:body.authenticator})
                        const token = jwt.sign({...getTokenDetailsResponse},process.env.TOKEN_SECRET,{expiresIn:"100hr"})
                        res.send({
                            status:200,
                            error:false,
                            message:"Logged In.",
                            data:{
                                token:token
                            }
                        })                        
                    }else{
                        res.status(401).send({
                            status:401,
                            error:true,
                            message:lang.UNAUTHORISED_ACCESS,
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
})
authRouter.post("/verify/:slug",async (req,res)=>{
    const body = req.body
    let {slug} = req.params
    if (!slug || !body.code){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.NO_SUCH_EXIST,
            data:{}
        })
    }else{
        const decrypted = decrypt(slug, process.env.ENCRYPTION_KEY);
        const checkCodeResponse = await checkCode({email:decrypted,code:body.code});
        if (checkCodeResponse.length==0){
            res.status(401).send({
                status:401,
                error:true,
                message:lang.INVALID_CODE,
                data:{}
            })
        }else{
            const creationDate = new Date(parseInt(checkCodeResponse[0].created_at))
            const now = new Date()
            const timeDiff = now.getTime() - creationDate.getTime()
            const diffMinutes = Math.round((timeDiff / 1000 )/ 60)
            if (diffMinutes>10){
                res.status(401).send({
                    status:401,
                    error:true,
                    message:lang.REQUEST_TIMEOUT,
                    data:{}
                })
                
            }else{
                await verifyCode({email:decrypted})
                const getTokenDetailsResponse = await getTokenDetails({authenticator:decrypted})
                const token = jwt.sign({...getTokenDetailsResponse},process.env.TOKEN_SECRET,{expiresIn:"100hr"})
                res.send({
                    status:200,
                    error:false,
                    message:"Successfully verified.",
                    data:{
                        token:token
                    }
                })
            }
        }
    }
})
authRouter.post("/reset/password",async (req,res)=>{
    const {email} = req.body;
    if (!email){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.PLEASE_ENTER+" email "+".",
            data:{}
        })
    }else{
        const checkEmailOrPhoneNoResponse = await checkEmailOrPhoneNo({authenticator:email});
        if (checkEmailOrPhoneNoResponse.flag==0){
            res.status(401).send({
                status:401,
                error:true,
                message:lang.INVALID_AUTHENTICATOR,
                data:{}
            })
        }else{
            const getUserDetailsResponse = await getUserDetails({email});            
            const date = new Date();
            const expTime = date.getTime() + 1000 * 60 * 10;
            const slug = encrypt(JSON.stringify({email:email,exp:expTime.toString(),...getUserDetailsResponse}), process.env.ENCRYPTION_KEY);
            await sendResetPassword({email:email,link:`${process.env.CLIENT_URL}/auth/reset/password/${slug}`})
            res.send({
                status:200,
                error:false,
                message:"Password reset link has been sent to your email.",
                data:{}
            })
        }
    }
})
authRouter.post("/reset/password/:slug",async (req,res)=>{
    const {password} = req.body;
    let {slug} = req.params;
    
    if (!slug || !password || !isPassword(password)){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.NO_SUCH_EXIST,
            data:{}
        })
    }else{
        const decrypted = decrypt(slug, process.env.ENCRYPTION_KEY);
        const {email,exp,user_id,updated_at} = JSON.parse(decrypted);
        const date = new Date();        
        if (date.getTime()>parseInt(exp) || !parseInt(exp) || !email || !user_id || !updated_at){
            res.status(401).send({
                status:401,
                error:true,
                message:lang.REQUEST_TIMEOUT,
                data:{}
            })
        }else{
            const validateCredentialsResponse = await validateCredentials({email:email,user_id:user_id,updated_at:updated_at})
            if (validateCredentialsResponse.flag===1){
                const hassPass = bcrypt.hashSync(password,10)
                const updatePasswordResponse = await updatePassword({email:email,password:hassPass})
                if (updatePasswordResponse){
                    const getTokenDetailsResponse = await getTokenDetails({authenticator:email})
                    const token = jwt.sign({...getTokenDetailsResponse},process.env.TOKEN_SECRET,{expiresIn:"100hr"})
                    res.send({
                        status:200,
                        error:false,
                        message:"Reset password successfully.",
                        data:{
                            token:token
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
                res.status(401).send({
                    status:401,
                    error:true,
                    message:lang.INVALID_TOKEN,
                    data:{}
                })
            }
        }
    }
})
module.exports = authRouter