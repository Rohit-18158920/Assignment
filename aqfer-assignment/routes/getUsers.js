var express = require('express');
var router = express.Router();
var cognitoService = require('../services/cognitoService');

router.get('/', async(req, res) =>{
    try{
        var attributeList = [
            'name',
            'gender',
            'nickname',
            'email',
            'phone_number'
          ];
    var result = await cognitoService.listUsers(attributeList);
    if(result.status!==200){
        throw{
            status:400,
            message:result.message
        }
    }
    var users = result.result.Users;
    var returnObj = [];
    for(var i=0;i<users.length;i++){
        var obj = {};
        var attrObjList=users[i].Attributes;
        for(var j=0;j<attrObjList.length;j++){
            obj[attrObjList[j]['Name']] = attrObjList[j]['Value'];
        }
        if(attrObjList.length>0){
            returnObj.push(obj);
        }
    }
    res.status(200).json({
        result:returnObj
    });
}catch (err) {
    res.status(err.status ? err.status : 400).json({
        message: err.message
    });
}

});
module.exports = router;