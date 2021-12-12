const mysql2 = require("mysql2/promise")
const connection = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})
const Hairstyle = require("../models/Hairstyle")

class HairstyleRepository{

    /**
     * Retrieves all entries
     * @returns {Hairstyle[]} all the entries from the db
     */
    async getAll(){
        /**@type {Hairstyle[]} */
        const list = []
        const rows = await connection.query(
            "select * from hairstyle"
        )
        for (let index = 0; index < rows[0].length; index++) {
            list.push(
                new Hairstyle(
                    rows[0][index].id,
                    rows[0][index].name,
                    rows[0][index].image_link,
                    rows[0][index].text_link
                )
            )
        }
        return list
    }
}

module.exports = HairstyleRepository