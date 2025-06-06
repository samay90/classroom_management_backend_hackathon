const express = require('express');
const authRouter = express.Router()
const checker = require("../helpers/functions/checker")
const lang = require("../../lang/lang.json")
const lengthChecker = require("../helpers/functions/lengthChecker")
const rules = require("../../rules/rules.json")
const {isEmail,isPassword} = require("../helpers/functions/credentials");
const { checkUniqueFlag, createUser, checkEmailOrPhoneNo, getPassword, getTokenDetails } = require('../modules/auth');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const dotEnv = require("dotenv")
const isInteger = require("../helpers/functions/isIntegerString")
dotEnv.config()

authRouter.post("/signup",async (req,res)=>{
    const body = req.body;
    const checkerResponse = checker(body,["email","phone_no","password","first_name","last_name"])
    if (checkerResponse.error){
        res.status(400).send({
            status:400,
            error:true,
            message:lang.PLEASE_ENTER+checkerResponse.empty.join(", ")+"!!",
            data:{}
        })
    }else{
        if (!(typeof(body.first_name)=="string" && typeof(body.last_name)=="string" && typeof(body.email)=="string" && typeof(body.password)=="string" && typeof(body.phone_no)=="string")){
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
                    if (!isInteger(body.phone_no)){
                        res.status(400).send({
                            status:400,
                            error:true,
                            message:lang.INVALID_PHONE_NO,
                            data:{}
                        })
                    }else{
                        const checkUniqueFlagResponse = await checkUniqueFlag({email:body.email,phone_no:body.phone_no})
                        if (checkUniqueFlagResponse.flag!==0){
                            res.status(401).send({
                                status:401,
                                error:true,
                                message:lang.DUBLICATE_EMAIL_OR_PHONENO,
                                data:{}
                            })
                        }else{
                            const hassPass = bcrypt.hashSync(body.password,10)
                            const createUserResponse = await createUser({email:body.email,phone_no:body.phone_no.toString(),password:hassPass,first_name:body.first_name,last_name:body.last_name})                            
                            if (createUserResponse){
                                const token = jwt.sign({
                                    user_id:createUserResponse.insertId,
                                    email:body.email,
                                    phone_no:body.phone_no
                                },process.env.TOKEN_SECRET,{ expiresIn:"100hr"})
                                res.send({
                                    status:200,
                                    error:false,
                                    message:"Account Created!!",
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
                            message:"Logged In!!",
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
module.exports = authRouter