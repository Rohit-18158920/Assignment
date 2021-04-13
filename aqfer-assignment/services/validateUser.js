const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
global.fetch = require('node-fetch');
require('dotenv').config();

async function validateToken(token) {
    return await new Promise((resolve, reject)=>{
        request({
            url: `https://cognito-idp.${process.env.pool_region}.amazonaws.com/${process.env.userPoolId}/.well-known/jwks.json`,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                pems = {};
                var keys = body['keys'];
                for(var i = 0; i < keys.length; i++) {
                    //Convert each key to PEM
                    var key_id = keys[i].kid;
                    var modulus = keys[i].n;
                    var exponent = keys[i].e;
                    var key_type = keys[i].kty;
                    var jwk = { kty: key_type, n: modulus, e: exponent};
                    var pem = jwkToPem(jwk);
                    pems[key_id] = pem;
                }
                //validate the token
                var decodedJwt = jwt.decode(token, {complete: true});
                if (!decodedJwt) {
                    console.log("Not a valid JWT token");
                    var obj ={
                        status:401,
                        message:"Not a valid JWT token"
                    }
                    resolve(obj)
                    return;
                }
    
                var kid = decodedJwt.header.kid;
                var pem = pems[kid];
                if (!pem) {
                    console.log('Invalid token');
                    var obj ={
                        status:401,
                        message:"Not a valid JWT token"
                    }
                    resolve(obj)
                    return;
                }
    
                jwt.verify(token, pem, function(err, payload) {
                    if(err) {
                        console.log("Invalid Token.");
                        var obj ={
                            status:401,
                            message:"Not a valid JWT token"
                        }
                        resolve(obj)
                    } else {
                        console.log("Valid Token.");
                        var obj ={
                            status:200,
                            message:"Success"
                        }
                        resolve(obj)
                    }
                });
            } else {
                console.log("Error! Unable to download JWKs");
                var obj ={
                    status:401,
                    message:"Not a valid JWT token"
                }
            }
        });
        
    });
}
module.exports = {
    "validateToken": validateToken
};