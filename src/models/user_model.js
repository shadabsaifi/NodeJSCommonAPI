var mongoose = require('../config/connection');
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    
    fullName:{ type:String, trim:true },
    countryCode:{ type:String, default:"+91" },
    phone:{ type:String },
    email:{ type:String },
    image:{ type:String },
    password:{ type:String },
    status:{ type:String, enum:['ACTIVE', 'INACTIVE'], default:"INACTIVE" },
    otp:{ type:Number },
    secureKey:{ type:String }
})

UserSchema.plugin(mongoosePaginate);

var User = mongoose.model('user', UserSchema, 'user');

module.exports = User;