/**
 * Class for fetching specific Service from database
 */
class ShopServiceFetch{
    /**
     * @param {*} conn MySQL2 connection to database
     */
    constructor(conn){
        this.connection = conn
    }

    /**
     * Get a specific service from database
     * @param {Int} id ID of service to be get
     */
    async getService(id){
        console.log(`ShopServiceFetch: Get service with id: ${id}`)
        return this.connection.query(`select * from shopservices where ID = ${id}`)
    }

    async getAppointmentShopServiceID(id){
        console.log(`ShopServiceFetch: Get service of Appointment with id: ${id}`)
        return this.connection.query(`select ShopServicesID from tblappointment where AppointmentID = ${id}`)
    }
}

module.exports = ShopServiceFetch