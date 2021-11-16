const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2/promise')
//fetch user
const UserFetch = require('../../../classes/UserFetch');
const uf = new UserFetch()
//token gen
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator()
//TODO: implement refresh tokens



//routes/token
//request a token from server
router.route('/:email-:pw')
.get(async (req, res) => {
    const userEmail = req.params.email
    const userPw = req.params.pw

    //authenticat the user
    const userAuthenticity = await uf.authenticateUser(userEmail,userPw)
    var user = null
    var result
    switch (userAuthenticity){
        case uf.UserAuthStatus.CUSTOMER:
            user = await uf.getCustomerDetails(`${userEmail}`)
            break;
        case UserAuthStatus.BARBER://valid user
        case UserAuthStatus.DESK:
            user = await uf.getEmployeeDetails(`${userEmail}`)
        break;
    }
    if (user == null){
        result = {//status with nyll token
            "authStatus": userAuthenticity,
            "token":null,
            "firstName": null,
            "lastName": null,
            "type": null
        }
    }else{
        const token = await uidgen.generate()
        result = {
            "authStatus": userAuthenticity,
            "token":token,
            "firstName": user.firstName,
            "lastName": user.lastName,
        }
            uf.addToken(user.id, userAuthenticity, token)//add token to db
    }
    res.json(result)//give status and token
})

module.exports = router;