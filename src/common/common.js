const bcrypt = require('bcrypt-nodejs');
var constant = require('./constant');
var config = require('../config/config');
var NodeGeocoder = require('node-geocoder');
const nodemailer = require('nodemailer')
let transporter;
const client = require('twilio')(config.twilio.sid, config.twilio.auth_token);
const _ = require('lodash');
var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: config.cloud.cloud_name,
    api_key: config.cloud.api_key,
    api_secret: config.cloud.api_secret
});

let response = (res, code, msg, result)=>{
    
    return res.json({
        responseCode:code,
        responseMessage:msg,
        result:result
    })
}

let checkKeyExist = (req, arr)=>{
    return new Promise((resolve, reject)=>{
        var array = [];
		_.map(arr, (item) => {
			if(req.hasOwnProperty(item)) {
				var value = req[item];
				if( value == '' || value == undefined ){ 
					array.push(item+" can not be empty");
				}
				resolve(array);
			} else {
				array.push(item+" key is missing");
				resolve(array);
			}
		});
    })
}


let createHash = (password, cb)=>{
    
    bcrypt.hash(password, null, null, (err, hash)=>{
        if(err)
            cb(err)
        else
            cb(null, hash)
    });
}

let compareHash = (password, hash, cb)=>{
    
    bcrypt.compare(password, hash, (err, res)=>{
        if(res)
            cb(null, res)
        else
            cb(err)
    });
}

let sendOTP = (verification_code, countryCode, sendTo)=>{

    client.messages.create({
        to:  countryCode+sendTo,
        from: config.twilio.number,
        body: 'Your one-time password is ' + verification_code,
    })
    .then((message) => {
        console.log("message sent successfully. ",message.sid)
    }, (err) => {
            console.log(err);
    });
}

let sendEmail = (email, subject, message, otp, cc, bcc, callback) => {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: config.nodemailer
    });
    let messageObj = {
        from: 'Noreply<'+config.nodemailer.user+'>',
        to: email,
        subject: subject,
        text: message,//"A sentence just to check the nodemailer",
        html: "Your One Time Passsword is   " +otp+"  please enter this otp to reset your password",//"Click on this link to <a href=" + link + ">reset Password</a>",
        cc:cc,
        bcc:bcc
    }
    transporter.sendMail(messageObj, (err, info) => {
        if (err) {
            console.log("Error occured", err)
            callback(null);
        } else {
            console.log("Mail sent")
            callback("Mail sent.")
        }
    })
}

let imageUploadToCoudinary = (base64, cb)=>{
    if(base64){
        cloudinary.uploader.upload(base64, (result)=>{ 
            if(result)
                cb(null, result.url);
            else
                cb('err'); 
        })
    }
    else
        cb(null, "");
}

let uploadMultipleImages = (imagesB64, callback) => {
    let a = [];
    async.eachSeries(imagesB64, (item, callbackNextIteratn) => {
        module.exports.imageUploadToCloudinary(item, (url) => {
            a[a.length] = url;
            callbackNextIteratn();
        })
    }, (err) => {
        callback(a);
        console.log("Done with async loop")
    })
}

let getLatLong = (place, callback) => {
    let fn,temp;
    var geocoder = NodeGeocoder(config.googleLetLong);
    geocoder.geocode(place, function(err, result) {
        if (result) {
            callback(result[0].latitude, result[0].longitude)
        }
    });
   
}

module.exports = {

    checkKeyExist,
    response,
    createHash,
    compareHash,
    sendOTP,
    sendEmail,
    imageUploadToCoudinary,
    uploadMultipleImages,
    getLatLong
    
}