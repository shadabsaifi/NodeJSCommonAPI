var StaticContent = require('../models/static_model');
var common = require('../common/common');
var code = require('../common/responseCode');
var message = require('../common/responseMessage');
var fileds = require('../common/required');


let getStaticContent = (req, res)=>{

    let { staticType } = req.body;
    let given = { staticType }
    let options = { createdAt:1, updatedAt:1 };
    options[staticType] = 1;
    common.checkKeyExist(given, fileds.getStaticContent)
    .then(result=>{
        if(result.length)
            return common.response(res, code.KEY_MISSING, result[0]);
        else{
            StaticContent.findOne({}, options)
            .then((result) => {
                return common.response(res, code.EVERYTHING_IS_OK, message.SUCCESS, result);
            }).catch((err) => {
                return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR);
            });
        }
    })
    .catch((err) => {
        return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR);
    })
}

let updateStaticContent = (req, res)=>{

    let { staticId, staticType, data } = req.body;
    let given = { staticId, staticType, data };
    let options = {  };
    options[staticType] = data;
    common.checkKeyExist(given, fileds.updateStaticContent)
    .then(result=>{
        if(result.length)
            return common.response(res, code.KEY_MISSING, result[0]);
        else{
            StaticContent.findByIdAndUpdate(staticId, options)
            .then(static=>{
                if(static)
                    return common.response(res, code.EVERYTHING_IS_OK, message.CONTENT_SUCCESSFULLY_UPDATED)
                else
                    return common.response(res, code.NOT_FOUND, message.CONTENT_NOT_FOUND);
            }, err=>{
                return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)
            })
        }
    })
    .catch((err)=>{ return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)})


}

let deleteStaticContent = (req, res)=>{

    let { staticId, staticType } = req.body;
    let given = { staticId, staticType };
    let options = {  };
    options[staticType] = "";
    common.checkKeyExist(given, fileds.deleteStaticContent)
    .then(result=>{
        if(result.length)
            return common.response(res, code.KEY_MISSING, result[0]);
        else{
            StaticContent.findByIdAndUpdate(staticId, options)
            .then(static=>{
                if(static)
                    return common.response(res, code.NEW_RESOURCE_CREATED, message.CONTENT_SUUCCESSFULLY_DELETED)
                else
                    return common.response(res, code.NOT_FOUND, message.CONTENT_NOT_FOUND);
            }, err=>{
                return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)
            })
        }
    })
    .catch((err)=>{ return common.response(res, code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR)})


}

module.exports = {

    getStaticContent,
    updateStaticContent,
    deleteStaticContent

}