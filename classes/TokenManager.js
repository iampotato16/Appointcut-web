//token gen
const UIDGenerator = require('uid-generator')
const UserFetch = require('./UserFetch')
const uidgen = new UIDGenerator()

/** 
 * Manager for token operations
*/
class TokenManager{
    /**
     * 
     * @param conn mysql2 connection to the database
     */
    constructor(conn){
        this.connection = conn
    }

    /**
     * Adds an access token for a user
     * @param {string} email email of the user
     * @param {string} token access token to of the user
     * @returns token generated and added
     */
    async addToken(id, type) {
        //no desk!
        if (type == UserFetch.UserAuthStatus.DESK) return

        //date + 1 week
        let week = new Date()
        week.setDate(week.getDate() + 7)
        let formattedWeek = `${week.getFullYear()}-${week.getMonth()}-${week.getDate()}`

        //token gen
        let token = await uidgen.generate()

        //sql query
        let insert = "INSERT INTO tblaccesstoken (token, userID, expiry, userType) "
        let values = `VALUES ('${token}', '${id}', '${formattedWeek}', '${type}')`
        console.log(`D/UserFetch: Query: ${insert + values}`)
        await this.connection.query((insert + values))
        console.log(`D/TokenManager: Added token to db: ${JSON.stringify(token)}`)
        return token
    }

    /**
     * Verifies the given token
     * @param {*} token Token to be verified
     * @returns the entry in the database
     */
    async verifyToken(token){
        let user = await this.connection.query('SELECT * FROM tblaccesstoken WHERE token = ?', [token])

        //invalid token
        if(user[0].length == 0) {return UserFetch.UserAuthStatus.TOKEN}
        user = user[0].pop()
        console.log("D/TokenManager: " + user.userType)
        return user
    }
}

module.exports = TokenManager