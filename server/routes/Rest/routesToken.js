const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2/promise')

//token gen
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator()


//request a token from server
router.route('/')
.get((req, res) => {
    const userEmail = req.params.email
    const userPw = req.params.pw

    //authenticat the user
    tempAuth().then(val => {
        console.log(val)
        switch (val){
            case userAuthStatus.VALID://valid user
                uidgen.generate()
                .then(uid => {
                    result = {
                        "status": val,
                        "token":uid
                    }
                    addToken(userEmail, uid)
                    res.json(result)//give status and token
                })
            break;
            default://invalid credentials
                result = {
                    "status": val,
                    "token":null
                }
                res.json(result)//give status with null token
        }
    })
    

 
})

/**temporary function for user authentication kasi tulog si migz*/
async function tempAuth() {
    return Promise.resolve(userAuthStatus.VALID)
}

/**
 * Authenticates the user
 * @param {String} email 
 * @param {String} password 
 * @returns userValidity
 */
async function authenticateUser(email, password){
    //Connection Pool
    let connection = mysql2.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: process.env.DB_PORT,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    })

    let ems = await connection.query('SELECT * FROM tblowner WHERE Email = ?', [email])
    if (ems[0].length > 0) {
       let pass = await connection.query('SELECT * FROM tblowner WHERE password = ?', [password])
       if (pass[0].length > 0) {//valid user
          return userAuthStatus.VALID
       }
       else {//invalid password
          return userAuthStatus.PASSWORD
       }
    } else {//invalid email
       return userAuthStatus.EMAIL
    }
}

/**
 * Adds an access token for a user
 * @param {string} email email of the user
 * @param {string} token access token to of the user
 */
async function addToken(email, token){
    //TODO get miggy to make the tokens and refresh table then implement this
}

const userAuthStatus = {
    VALID: 'valid',//user is authentic
    EMAIL: 'email',//invalid email
    PASSWORD: 'password'//invalid password
}

module.exports = router;