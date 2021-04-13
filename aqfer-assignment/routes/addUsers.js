var express = require('express');
var router = express.Router();
var cognitoService = require('../services/cognitoService');

router.post('/', async (req, res) => {
    try {
        var { name, gender, email, nickname, phone_number, password } = req.body;
        if (name === null || name === undefined ||
            gender === null || gender === undefined ||
            email === null || email === undefined ||
            nickname === null || nickname === undefined ||
            phone_number === null || phone_number === undefined ||
            password === null || password === undefined) {
            throw {
                status: 400,
                message: "Invalid parameters"
            }
        }
        var attributeList = [];
        attributeList.push({ Name: "name", Value: name });
        attributeList.push({ Name: "nickname", Value: nickname });
        attributeList.push({ Name: "gender", Value: gender });
        attributeList.push({ Name: "email", Value: email });
        attributeList.push({ Name: "phone_number", Value: phone_number });
        var result = await cognitoService.registerUser(attributeList, email, password);
        if (result.status !== 200) {
            throw {
                status: 400,
                message: result.message
            }
        }
        var attributeList = [
            'name',
            'gender',
            'nickname',
            'email',
            'phone_number'
        ];
        var result1 = await cognitoService.listUsers(attributeList);
        if (result1.status !== 200) {
            throw {
                status: 400,
                message: result.message
            }
        }
        var users = result1.result.Users;
        var returnObj = [];
        for (var i = 0; i < users.length; i++) {
            var obj = {};
            var attrObjList = users[i].Attributes;
            for (var j = 0; j < attrObjList.length; j++) {
                obj[attrObjList[j]['Name']] = attrObjList[j]['Value'];
            }
            if (attrObjList.length > 0) {
                returnObj.push(obj);
            }
        }
        res.status(result.status).json({
            result: returnObj
        });
    } catch (err) {
        res.status(err.status ? err.status : 400).json({
            message: err.message
        });
    }
});
module.exports = router;