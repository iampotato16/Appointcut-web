/**
 * Fetches shops from the database
 */
class ShopFetch{
    /**
     * @param conn mysql2 connection to the database
     */
    constructor(conn){
        this.connection = conn
    }

    /**
     * @returns all the active shops with all the columns from the database
     */
    async getShops(){
        var shops = await this.connection.query('SELECT * FROM shop where Status = 1 and appStatus = 1')
        shops = shops[0]
        return shops
    }

    /**
     * Fetches the supported services of the shop identified by id
     * @param id ID of the shop whose services is to be retrieved
     * @returns a json array of the supported services of the shop
     */
    async getShopServices(id){
        var shopServices = await this.connection.query(`SELECT * FROM shopservices where shopID = ${id} and Status = 1`)
        return shopServices
    }
}

module.exports = ShopFetch