const UserAuthStatus = {
    DESK: 'DESK',
    CUSTOMER: 'CUSTOMER',
    BARBER: 'BARBER',
    EMAIL: 'EMAIL',//invalid email
    PASSWORD: 'PASSWORD',//invalid password
    TOKEN: 'TOKEN', //invalid token
    VERIFY: 'VERIFY' //unverified user
}
const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator()
const nodemailer = require('nodemailer')

/**
 * For fetching  user details from the database
 */
class UserFetch {
    /**
     * 
     * @param conn mysql2 connection to the database
     */
    constructor(conn) {
        this.connection = conn
    }

    /**temporary function for user authentication kasi tulog si migz*/
    async tempAuth(email, pw) {
        console.log(`D/UserFetch: temp auth with e=${email} p=${pw}`)
        return Promise.resolve(UserAuthStatus.VALID)
    }

    /**
     * Authenticates the user
     * @param {String} email 
     * @param {String} password 
     * @returns {UserAuthStatus} Status of the user
     */
    async authenticateUser(email, password, userType) {

        var cust = new Array([])
        var barb = new Array([])
        if(userType =="Customer"){
            cust = await this.connection.query('SELECT * FROM tblcustomers WHERE Email = ?', [email])}
        if(userType =="Employee"){
            barb = await this.connection.query('SELECT * FROM tblemployee WHERE Email = ?', [email])}

        if (cust[0].length > 0) {//customer
            let pass = await this.connection.query(`SELECT * FROM tblcustomers WHERE Email = "${email}" and PasswordHash = SHA2('${password}',256)`)
            if (pass[0].length > 0) {//valid user
                if(pass[0][0].IsVerified == 0){//unverified
                    return UserAuthStatus.VERIFY
                }
                return UserAuthStatus.CUSTOMER//verified
            }
            else {//invalid password
                return UserAuthStatus.PASSWORD
            }
        } else if (barb[0].length > 0) {//barber
            let pass = await this.connection.query(`SELECT * FROM tblemployee WHERE Email = "${email}" and password = "${password}"`)
            if (pass[0].length > 0) {//valid user
                if (pass[0].pop().employeeTypeID == 2)
                    return UserAuthStatus.DESK
                return UserAuthStatus.BARBER
            }
            else {//invalid password
                return UserAuthStatus.PASSWORD
            }
        } else {//invalid email
            return UserAuthStatus.EMAIL
        }
    }

    /**
     * Retrieves user's name
     * @param {String} email email of the user
     * @returns name and id of the user as json
     */
    async getCustomerDetails(email) {
        console.log(`D/UserFetch: email: ${email}`)
        let ems = await this.connection.query('SELECT * FROM tblcustomers WHERE Email = ?', [email])
        let user = ems[0].pop()
        return {
            "firstName": user.firstName,
            "lastName": user.lastName,
            "id": user.CustomersID
        }
    }

    /**
     * Retrieves user's name
     * @param {String} email email of the user
     * @returns name and id of the user as json
     */
    async getEmployeeDetails(email) {
        console.log(`D/UserFetch: email: ${email}`)
        let ems = await this.connection.query('SELECT * FROM tblemployee WHERE Email = ?', [email])
        let user = ems[0].pop()
        return {
            "firstName": user.firstName,
            "lastName": user.lastName,
            "id": user.EmployeeID
        }
    }

    /**
     * Retrieves user's name
     * @param {String} email email of the user
     * @returns name and id of the user as json
     */
    async getEmployeeDetailsFromId(id) {
        console.log(`D/UserFetch: id: ${id}`)
        let ems = await this.connection.query('SELECT * FROM tblemployee WHERE EmployeeID = ?', [id])
        let user = ems[0].pop()
        return {
            "firstName": user.firstName,
            "lastName": user.lastName
        }
    }

    /**
     * Registers the user to the database
     * @param {*} first First name
     * @param {*} last Last name
     * @param {*} email E-mail address
     * @param {*} pass Password
     * @param {*} cont Contact
     */
    async registerUser(first, last, email, pass, cont){
        const insert = "insert into tblcustomers"
        const columns = "(firstName, lastName, Email, PasswordHash, Contact)"
        const values = `values ('${first}', '${last}', '${email}', SHA2('${pass}',256), '${cont}')`
        await this.connection.query(`${insert} ${columns} ${values};`)
        this.requireVerification(email)
    }

    /**
     * Sends a verification email to the user
     * @param {*} email Email of user requiring verification
     * @returns the status of the operation
     * 0 = success
     * 1 = user does not exits
     * 2 = user is already verified
     * 3 = unkown error
     */
    async requireVerification(email){
        //check the existence of the user
        //get the user from the database
        const user = await this.connection.query(
            `select CustomersID, IsVerified from tblcustomers where Email = "${email}"`
        )
        //check if db returned anything
        //if nothing returned, return 1
        if(user[0].length == 0){
            return 1
        }

        //check that the user is not yet verified
        //if user is verified, return 2
        if(user[0][0].IsVerified == 1){
            return 2
        }

        //get a token
        const token = await uidgen.generate()
        //create entry into the verifications table
        await this.connection.query(
            `insert into tblverificationtoken`+
            `(CustomerID, Token)`+
            `values(${user[0][0].CustomersID}, "${token}")`
        )
        //send the email
        const transporter = nodemailer.createTransport({
            port: 25,
            host: 'localhost',
            tls: {
                rejectUnauthorized: false
            },
        })
    
        var message = {
            from: 'Registrations@appointcut.online',
            to : `${email}`,
            subject: 'Email Verification',
            text: 'Please Believe me',
            html: `<p>`+
            `Click <a href="appointcut.online/rest/register/token/${token}">HERE</a> to verify your email`+
            `</p>`
        }
    
        transporter.sendMail(message, (error, info) => {
            if (error){
                return console.log(`Mail errror: ${error}`)
            }
            console.log('Message sent: %s', info.messageId)
        })
    }

    /**
     * Sets the user's verification to verified
     * @param {String} token 
     * @returns 0 = success, 1 = token not found
     */
    async verifyEmail(token){
        //get the user with the token
        const id = await this.connection.query(
            `select CustomerID from tblverificationtoken where Token = "${token}"`
        )
        //token not found
        if (id[0].length == 0){return 1}
        //delete the entry
        await this.connection.query(
            `delete from tblverificationtoken where Token = "${token}"`
        )
        //set verification status of user to verified
        await this.connection.query(
            `update tblcustomers set  IsVerified = 1 where CustomersID = ${id[0][0].CustomerID}`
        )
        return 0
    }

}

module.exports = {UserFetch,UserAuthStatus}
