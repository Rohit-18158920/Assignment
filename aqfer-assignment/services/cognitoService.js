const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const AWS = require('aws-sdk');
require('dotenv').config();
const poolData = {
    UserPoolId: process.env.userPoolId, // Your user pool id here
    ClientId: process.env.ClientId // Your client id here
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
AWS.config.update({region:process.env.pool_region});
var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

async function login(username, password) {
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: username,
        Password: password,
    });
    var userData = {
        Username: username,
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return await new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                var obj = {
                    status: 200,
                    result: result.getAccessToken().getJwtToken(),
                    message: "Success"
                };
                resolve(obj);
            },
            onFailure: function (err) {
                console.log(err);
                var obj = {
                    status: 400,
                    message: err.message
                };
                resolve(obj);
            },

        });
    });
}
async function registerUser(objectList, username, password) {
    var attributeList = [];
    for (var i = 0; i < objectList.length; i++) {
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute(objectList[i]));
    }
    let userAdded = await new Promise((resolve, reject) => {
        userPool.signUp(username, password, attributeList, null, function (err, result) {
            if (err) {
                console.log(err);
                var obj = {
                    status: 400,
                    message: err.message
                }
                resolve(obj);
            }
            else {
                cognitoUser = result.user;
                var obj = {
                    status: 200,
                    cognitoUser: cognitoUser,
                    message: "Success"
                }
                resolve(obj)
            }
        });
    });
    if (userAdded.status !== 200) {
        return userAdded;
    }
    var params = {
        UserPoolId: process.env.userPoolId,
        Username: username
    }
    return await new Promise((resolve, reject) => {

        cognitoidentityserviceprovider.adminConfirmSignUp(params, function (err, result) {
            if (err) {
                var obj = {
                    status: 400,
                    message: err.message
                }
                resolve(obj);
            }
            else {
                var obj = {
                    status: 200,
                    result: result,
                    message: "Success"
                }
                resolve(obj)
            }
        });
    });
}
async function listUsers(attributeList) {
    
    var params = {
        UserPoolId: process.env.userPoolId,
        AttributesToGet:attributeList,
      };
    return await new Promise((resolve, reject)=>{
        cognitoidentityserviceprovider.listUsers(params, function(err, result) {
            if (err) {
                var obj = {
                    status:400,
                    message:err.message
                }
                resolve(obj);
            }
            else{
                var obj ={
                    status:200,
                    result:result,
                    message:"Success"
                }
                resolve(obj)
            }
        });
    });
    
}
module.exports = {
    "login": login,
    "registerUser": registerUser,
    "listUsers":listUsers
};