var common = require('../common/common');
var code = require('../common/responseCode');
var message = require('../common/responseMessage');
var fields = require('../common/required');
var User = require('../models/user_model');
var constant = require('../common/constant');
var randomstring = require("randomstring");

let signup = (req, res)=>{
    let { fullName, countryCode, phone, email, password, image } = req.body;
    let given = { fullName, countryCode, phone, email, password };
    common.checkKeyExist(given, fields.signup)
    .then(result=>{
        if(result.length)
            return common.response(res, code.KEY_MISSING, result[0]);
        else{
            let query = { $or:[ { email }, { phone } ] };
            User.findOne(query)
            .then(user=>{
                if(user){
                    if(user.email == email)
                        return common.response(res, code.ALREADY_EXIST, message.EMAIL_ALREADY_EXITS);
                    else
                        return common.response(res, code.ALREADY_EXIST, message.PHONE_ALREADY_EXITS);
                }
                else{
                    common.sendOTP(constant.OTP, countryCode, phone)
                    common.createHash(password, (err, hash)=>{
                        if(hash)
                            req.body.password = hash;
                        req.body.otp = constant.OTP;
                        common.imageUploadToCoudinary(image, (err, url)=>{
                            if(err)
                                return common.response(res, code.INTERNAL_SERVER_ERROR, message.IMAGE_UPLOAD_ERROR,err);
                            else{
                                req.body.image = url;
                                User.create(req.body, (err, success)=>{
                                    if(err)
                                        return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR);
                                    else{
                                        let { _id } = success;
                                        return common.response(res, code.NEW_RESOURCE_CREATED, message.SUCCESSFULLY_SIGNUP, { _id });
                                    }   
                                })
                            }    
                        })  
                    })
                }  
            }, err=>{
                return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)     
            });
        }
    })
    .catch(err=> { return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)})
}

let login = (req, res)=>{
    let { countryCode, phone, password } = req.body;
    let given = { countryCode, phone, password };
    common.checkKeyExist(given, fields.login)
    .then(result=>{
        if(result.length)
            return common.response(res, code.KEY_MISSING, result[0]);
        else{
            let query = { $and:[ { countryCode }, { phone } ] }
            User.findOne(query)
            .lean().then(user=>{
                if(!user)
                    return common.response(res, code.NOT_FOUND, message.PHONE_NOT_EXITS)
                else{
                    common.compareHash(password, user.password, (err, match)=>{
                        if(!match)
                            return common.response(res, code.BAD_REQUEST, message.PASSWORD_NOT_MATCH);
                        else{
                            delete user['password']; delete user['otp']; delete user['secureKey'];
                            if(user.status == "ACTIVE")
                                return common.response(res, code.EVERYTHING_IS_OK, message.SUCCESSFULLY_LOGIN, user);
                            else
                                return common.response(res, code.BAD_REQUEST, message.NOT_ACTIVE);        
                        }
                    })
                }
            }, err=>{
                return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR,err)     
            })
        }
    })
    .catch(err=> { return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)})
}


let verifyOTP = (req, res)=>{
    let { otp, userId } = req.body;
    let given  = { otp, userId };
    common.checkKeyExist(given, fields.verifyOTP)
    .then(result=>{
        if(result.length)
            return common.response(res, code.KEY_MISSING, result[0]);
        else{
            User.findById(userId)
            .lean().then(user=>{
                if(!user)
                    return common.response(res, code.NOT_FOUND, message.USER_NOT_EXITS);
                else{
                    if(user.status != "ACTIVE"){
                        if(user.otp == otp){
                            let secureKey = randomstring.generate();
                            let options = { status:"ACTIVE", otp:constant.OTP, secureKey}
                            User.findByIdAndUpdate(userId, options, { new:true })
                            .lean().then(user=>{
                                delete user['password']; delete user['otp']; delete user['secureKey'];
                                return common.response(res, code.EVERYTHING_IS_OK, message.OTP_SUCCESSFULLY_MATCH, user);  
                            }, err=>{
                                return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)     
                            })
                        }
                        else
                            return common.response(res, code.NOT_FOUND, message.OTP_NOT_MATCH);
                    }
                    else{
                        delete user['password']; delete user['otp']; delete user['secureKey'];
                        return common.response(res, code.ALREADY_EXIST, message.VERIFIED_USER, user);
                    }
                }
            }, err=>{
                return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)     
            })
        }
    })
    .catch(err=> { return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)})
}

// forgot password API or Resend API

let forgotPassword = (req, res)=>{
    let { countryCode, phone } = req.body;
    let given = { countryCode, phone }
    common.checkKeyExist(given, fields.forgotPassword)
    .then(result=>{
        if(result.length)
            return common.response(res, code.KEY_MISSING, result[0]);
        else{
            let otp = constant.OTP;
            let options = { otp:otp }
            let query = { $and:[{ countryCode }, { phone }] }
            User.findOneAndUpdate(query, options)
            .then(user=>{
                if(user){
                    let { countryCode, phone, _id } = user;
                    common.sendOTP(otp, countryCode, phone)
                    return common.response(res, code.NEW_RESOURCE_CREATED, message.OTP_SEND, {_id});
                }
                else
                    return common.response(res, code.NOT_FOUND, message.USER_NOT_EXITS);
            }, err=>{
                return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)     
            })        
        }
    })
    .catch(err=> { return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)})
}


let resendOTP = (req, res)=>{

    let { userId } = req.body;
    let given = { userId }
    common.checkKeyExist(given, fields.resendOTP)
    .then(result=>{
        if(result.length)
            return common.response(res, code.KEY_MISSING, result[0]);
        else{
            let otp = constant.OTP;
            let options = { otp:otp }
            User.findByIdAndUpdate(userId, query, options)
            .then(user=>{
                if(user){
                    let { countryCode, phone, _id } = user;
                    common.sendOTP(otp, countryCode, phone)
                    return common.response(res, code.NEW_RESOURCE_CREATED, message.OTP_SEND, {_id});
                }
                else
                    return common.response(res, code.NOT_FOUND, message.USER_NOT_EXITS);
            }, err=>{
                return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)     
            })        
        }
    })
    .catch(err=> { return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)})
}


let resetPassword = (req, res)=>{
    let { password, userId, secureKey } = req.body;
    let given = { password, userId, secureKey };
    common.checkKeyExist(given, fields.resetPassword)
    .then(result=>{
        if(result.length)
            return common.response(res, code.KEY_MISSING, result[0]);
        else{
            common.createHash(password, (err, hash)=>{
                if(hash){
                    User.findById(userId)
                    .then(user=>{
                        if(!user)
                            return common.response(res, code.NOT_FOUND, message.USER_NOT_EXITS);
                        else{
                            if(user.secureKey != secureKey)
                                return common.response(res, code.BAD_REQUEST, message.SECURE_KEY);
                            else{
                                let options = { password:hash, otp:constant.OTP, secureKey:randomstring.generate()}
                                User.findByIdAndUpdate(userId, options)
                                .then(user=>{
                                if(user)
                                    return common.response(res, code.NEW_RESOURCE_CREATED, message.PASSWORD_SUCCESSFULLY_CHANGE);
                                else
                                    return common.response(res, code.NOT_FOUND, message.USER_NOT_EXITS);
                                }, err=>{
                                    return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)     
                                })
                            }   
                        }

                    })
                }

            })
        }
    })
    .catch(err=> { return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)})
}


let getUserDetail = (req, res)=>{
    let { userId } = req.body;
    let given = { userId };
    common.checkKeyExist(given, fields.getUserDetail)
    .then(result=>{
        if(result.length)
            return common.response(res, code.KEY_MISSING, result[0]);
        else{
            User.findById(userId, { password:0, otp:0, secureKey:0 })
            .then(user=>{
                if(user)
                    return common.response(res, code.EVERYTHING_IS_OK, message.SUCCESS, user);
                else
                    return common.response(res, code.NOT_FOUND, message.USER_NOT_EXITS);
            })
        }
    }, err=>{
        return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)     
    })
    .catch(err=> { return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)})
}


module.exports = {
    
    signup,
    login,
    verifyOTP,
    forgotPassword,
    resendOTP,
    resetPassword,
    getUserDetail
}