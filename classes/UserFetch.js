const UserAuthStatus = {
    DESK: 'DESK',
    CUSTOMER: 'CUSTOMER',
    BARBER: 'BARBER',
    EMAIL: 'EMAIL',//invalid email
    PASSWORD: 'PASSWORD',//invalid password
    TOKEN: 'TOKEN' //invalid token
}
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
                return UserAuthStatus.CUSTOMER
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
    }

}

module.exports = {UserFetch,UserAuthStatus}
