const lang = require("../../../lang/lang.json")
const jwt = require("jsonwebtoken")
const dotEnv = require("dotenv")
const { verifyUser } = require("../../modules/user")
dotEnv.config()
const userVerifier = async (req,res,next) =>{
    const rawToken = req.headers.authorization
    if (!rawToken){
        res.status(401).send({
            status:401,
            error:true,
            message:lang.NO_TOKEN_FOUND,
            data:{}
        })
    }else{
        const token = rawToken.split(" ")
        if (token.length==2){
            const parsedToken = token[1]
            jwt.verify(parsedToken,process.env.TOKEN_SECRET,async (err,result)=>{
                if (err){
                    res.status(401).send({
                        status:401,
                        error:true,
                        message:lang.TOKEN_EXPIRED,
                        data:{}
                    })
                }else{
                    const verifyUserReponse = await verifyUser({user_id:result.user_id})
                    if (verifyUserReponse.length==0){
                        res.status(401).send({
                            status:401,
                            error:true,
                            message:lang.NO_SUCH_EXIST,
                            data:{}
                        })
                    }else{
                        if (verifyUserReponse[0].is_deleted==1){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.USER_DELETED,
                                data:{}
                            })
                        }else if(verifyUserReponse[0].is_verified==0){
                            res.status(400).send({
                                status:400,
                                error:true,
                                message:lang.USER_UNVERIFIED,
                                data:{}
                            })
                        }else{
                            req.user = {...result,is_doctor:verifyUserReponse[0].is_doctor}
                            next()
                        }
                    }
                }
                
            })

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
module.exports = userVerifier