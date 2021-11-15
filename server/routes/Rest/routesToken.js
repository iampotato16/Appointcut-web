const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2/promise')

//token gen
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator()

//TODO: implement refresh tokens

//Connection Pool
let connection = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})

//routes/token
//request a token from server
router.route('/:email-:pw')
.get(async (req, res) => {
    const userEmail = req.params.email
    const userPw = req.params.pw

    //authenticat the user
    const userAuthenticity = await authenticateUser(userEmail,userPw)
    switch (userAuthenticity){
        case UserAuthStatus.BARBER://valid user
        case UserAuthStatus.CUSTOMER:
        case UserAuthStatus.DESK:
            const token = await uidgen.generate()
            const user = await getUserDetails(`${userEmail}`)
            result = {
                "authStatus": userAuthenticity,
                "token":token,
                "firstName": user.firstName,
                "lastName": user.lastName,
            }
                addToken(user.id, userAuthenticity, token)//add token to db
                res.json(result)//give status and token
        break;

        default://invalid credentials
            result = {
                "authStatus": userAuthenticity,
                "token":null,
                "firstName": null,
                "lastName": null,
                "type": null
            }
            res.json(result)//give status with null token
        break;
    }
})

/**temporary function for user authentication kasi tulog si migz*/
async function tempAuth(email,pw) {
    console.log(`D/routesToken: temp auth with e=${email} p=${pw}`)
    return Promise.resolve(UserAuthStatus.VALID)
}

/**
 * Authenticates the user
 * @param {String} email 
 * @param {String} password 
 * @returns {UserAuthStatus} Status of the user
 */
async function authenticateUser(email, password){

    let cust = await connection.query('SELECT * FROM tblcustomers WHERE Email = ?', [email])
    let barb = await connection.query('SELECT * FROM tblemployee WHERE Email = ?', [email])
    if (cust[0].length > 0) {//customer
       let pass = await connection.query('SELECT * FROM tblcustomers WHERE PasswordHash = ?', [password])
       if (pass[0].length > 0) {//valid user
          return UserAuthStatus.CUSTOMER
       }
       else {//invalid password
          return UserAuthStatus.PASSWORD
       }
    } else if (barb[0].length > 0) {//barber
        let pass = await connection.query('SELECT * FROM tblemployee WHERE password = ?', [password])
       if (pass[0].length > 0) {//valid user
            if (pass[0].pop().employeeTypeID == 2)
                return UserAuthStatus.DESK
          return UserAuthStatus.BARBER
       }
       else {//invalid password
          return UserAuthStatus.PASSWORD
       }
     }else {//invalid email
        return UserAuthStatus.EMAIL
     }
}

const UserAuthStatus = {
    DESK:'DESK',
    CUSTOMER: 'CUSTOMER',
    BARBER: 'BARBER',
    EMAIL: 'EMAIL',//invalid email
    PASSWORD: 'PASSWORD'//invalid password
}

/**
 * Adds an access token for a user
 * @param {string} email email of the user
 * @param {string} token access token to of the user
 */
async function addToken(id, type, token){
    //date + 1 week
    let week = new Date()
    week.setDate(week.getDate() +7)
    let formattedWeek = `${week.getFullYear()}-${week.getMonth()}-${week.getDate()}`
    let insert = "INSERT INTO tblaccesstoken (token, userID, expiry, userType) "
    let values = `VALUES ('${token}', '${id}', '${formattedWeek}', '${type}')`
    console.log(`D/routesToken: QUery: ${insert + values}`)
    await connection.query((insert + values))
}

/**
 * Retrieves user's name
 * @param {String} email email of the user
 * @returns name and id of the user as json
 */
async function getUserDetails(email){
    console.log(`D/routesToken: email: ${email}`)
    let ems = await connection.query('SELECT * FROM tblcustomers WHERE Email = ?', [email])
    let user = ems[0].pop()
    return {
        "firstName":user.firstName,
        "lastName":user.lastName,
        "id":user.CustomersID
    }
}

module.exports = router;