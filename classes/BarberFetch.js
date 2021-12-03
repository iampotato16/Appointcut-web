/**
 * Fetches Barber Information from database
 */
class BarberFetch{
    /**
     * 
     * @param {*} conn MySQL2 connection to the database
     */
    constructor(conn){
        this.connection = conn
    }

    /**
     * Fetches all barbers from specified shop
     * @param {int} shopId Shop ID of Barbers to be fetched
     * @returns JSON list of barbers
     */
    async getBarbersFromShop(shopId){
        const query = `SELECT * FROM employee where ShopID = ${shopId} AND EmployeeType = "Barber"`
        var shops = await this.connection.query(query)
        return shops[0]
    }

    /**
     * Fetches barber details with specified ID
     * @param {Int} barberId 
     */
    async getBarber(barberId){
        const query = `SELECT * FROM employee where EmployeeID = ${barberId} AND EmployeeType = "Barber"`
        var barber = await this.connection.query(query)
        return barber[0].pop()
    }

    /**
     * 
     * @param {*} shopId 
     * @param {*} specializationId 
     */
    async getBarbersWithSpecialization(shopSpecializationId){
        const select = `SELECT * FROM tblEmployeeSpecialization` 
        const condition = `where shopServicesID = ${shopSpecializationId} and Status = 1`
        var shops = await this.connection.query(`${select} ${condition}`)
        return shops[0]
    }

    /**
     * Fetches the schedule of a Barber on a specified date
     * @param {Int} barberId ID of barber whose schedule is to be retrieved
     * @param {Date} date specific date to retrieve from
     * @returns A JSON list of dates
     */
    async getBarberAppointmentForMonthYear(barberId, month, year){
        const select = `select Date, \`TimeIn\`, \`TimeOut\` from tblappointment`
        const where = `where MONTH(Date) = ${month} and YEAR(Date) = ${year} and EmployeeID = ${barberId};`
        const appointments = await this.connection.query(`${select} ${where};`)
        
        return appointments[0]
    }

    /**
     * Fetches the full details of appointments for given date
     * @param {*} barberId 
     * @param {*} month 
     * @param {*} year 
     */
    async getBarberAppointmentView(barberName,day, month, year){
        const select = `select * from appointment`
        const where = `where DAY(Date) = ${day} and MONTH(Date) = ${month} and YEAR(Date) = ${year} and EmployeeName = ${barberName}`
        console.log(`${select} ${where};`)
        const appointments = await this.connection.query(`${select} ${where};`)
        
        return appointments
    }

    /**
     * Retrieves the barber's shift schedule
     * @param {Int} barberId 
     * @returns List of the barber's schedule for different days of the week
     */
    async getBarberSched(barberId){
        const select = `select Date, TimeIn, TimeOut from tblschedule`
        const where = `where EmployeeID = ${barberId}`

        const schedule = await this.connection.query(`${select} ${where};`)
        return schedule[0]
    }
}

module.exports = BarberFetch
