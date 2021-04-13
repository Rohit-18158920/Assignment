var express = require('express');
var router = express.Router();
var cognitoService = require('../services/cognitoService');

router.post('/', async(req, res) =>{
    var {username,password} = req.body;
    try{
    var result = await cognitoService.login(username, password);
    if(result.status!==200){
        throw{
            status:result.status,
            message:"Failed to login"
        }
    }
    res.status(result.status).json({
        token:result.result,
        username:username
    });
}catch (err) {
    res.status(err.status ? err.status : 400).json({
        message: err.message
    });
}

});
module.exports = router;