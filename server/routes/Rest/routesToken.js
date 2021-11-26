const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2/promise')
//Connection Pool
const connection = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})
//fetch user
const UserFetch = require('../../../classes/UserFetch');
const uf = new UserFetch.UserFetch(connection)
const TokenManager = require('../../../classes/TokenManager')
const tm = new TokenManager(connection)
//TODO: implement refresh tokens



//Path: /rest/token
//request a token from server
router.route('/:email-:pw')
.get(async (req, res) => {
    const userEmail = req.params.email
    const userPw = req.params.pw

    //authenticat the user
    const userAuthenticity = await uf.authenticateUser(userEmail,userPw)
    var user = null
    var result
    
    //which user type
    switch (userAuthenticity){
        case UserFetch.UserAuthStatus.CUSTOMER:
            user = await uf.getCustomerDetails(`${userEmail}`)
            break;
        case UserFetch.UserAuthStatus.BARBER://valid user
        case UserFetch.UserAuthStatus.DESK:
            user = await uf.getEmployeeDetails(`${userEmail}`)
        break;
    }

    //user had invalid credentials
    if (user == null){
        result = {//status with null token
            "authStatus": userAuthenticity,
            "token":null,
            "firstName": null,
            "lastName": null,
            "type": null
        }
    }else{
        const token = await tm.addToken(user.id,userAuthenticity)
        result = {
            "authStatus": userAuthenticity,
            "token":token,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "id": user.id
        }
    }
    res.json(result)//give status and token
})

module.exports = router;
