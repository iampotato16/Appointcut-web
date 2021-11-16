
const mysql2 = require('mysql2/promise')


class UserFetch {
    connection
    UserAuthStatus = {
        DESK: 'DESK',
        CUSTOMER: 'CUSTOMER',
        BARBER: 'BARBER',
        EMAIL: 'EMAIL',//invalid email
        PASSWORD: 'PASSWORD'//invalid password
    }

    constructor() {
        //Connection Pool
        this.connection = mysql2.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port: process.env.DB_PORT,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        })
    }

    /**temporary function for user authentication kasi tulog si migz*/
    async tempAuth(email, pw) {
        console.log(`D/UserFetch: temp auth with e=${email} p=${pw}`)
        return Promise.resolve(this.UserAuthStatus.VALID)
    }

    /**
     * Authenticates the user
     * @param {String} email 
     * @param {String} password 
     * @returns {UserAuthStatus} Status of the user
     */
    async authenticateUser(email, password) {

        let cust = await this.connection.query('SELECT * FROM tblcustomers WHERE Email = ?', [email])
        let barb = await this.connection.query('SELECT * FROM tblemployee WHERE Email = ?', [email])
        if (cust[0].length > 0) {//customer
            let pass = await this.connection.query('SELECT * FROM tblcustomers WHERE PasswordHash = ?', [password])
            if (pass[0].length > 0) {//valid user
                return this.UserAuthStatus.CUSTOMER
            }
            else {//invalid password
                return this.UserAuthStatus.PASSWORD
            }
        } else if (barb[0].length > 0) {//barber
            let pass = await this.connection.query('SELECT * FROM tblemployee WHERE password = ?', [password])
            if (pass[0].length > 0) {//valid user
                if (pass[0].pop().employeeTypeID == 2)
                    return UserAuthStatus.DESK
                return this.UserAuthStatus.BARBER
            }
            else {//invalid password
                return this.UserAuthStatus.PASSWORD
            }
        } else {//invalid email
            return this.UserAuthStatus.EMAIL
        }
    }

    

    /**
     * Adds an access token for a user
     * @param {string} email email of the user
     * @param {string} token access token to of the user
     */
    async addToken(id, type, token) {
        if (type == this.UserAuthStatus.DESK) return
        //date + 1 week
        let week = new Date()
        week.setDate(week.getDate() + 7)
        let formattedWeek = `${week.getFullYear()}-${week.getMonth()}-${week.getDate()}`
        let insert = "INSERT INTO tblaccesstoken (token, userID, expiry, userType) "
        let values = `VALUES ('${token}', '${id}', '${formattedWeek}', '${type}')`
        console.log(`D/UserFetch: QUery: ${insert + values}`)
        await this.connection.query((insert + values))
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
        let ems = await connection.query('SELECT * FROM tblemployee WHERE Email = ?', [email])
        let user = ems[0].pop()
        return {
            "firstName": user.firstName,
            "lastName": user.lastName,
            "id": user.EmployeeID
        }
    }

}

module.exports = UserFetch