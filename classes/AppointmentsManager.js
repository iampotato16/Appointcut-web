const Payment = require("./Payment")

class AppointmentManager{
    constructor(connection){
        this.connection = connection
    }

    /**
     * Sets an appointment with the given appointment
     * @param {*} appointment Appointment to be set in database
     * @returns the id of the apppointment, -1 if it failed for any reason
     */
    async setAppointment(appointment){
        const con = this.connection
        const customerId = appointment.CustomerID
        const customerName = appointment.CustomerName
        const shopId = appointment.ShopID
        const employeeId = appointment.EmployeeID
        const shopServiceId = appointment.ShopServicesID
        const timeIn = appointment.TimeIn
        const timeOut = appointment.TimeOut
        const date = appointment.date
        var haircutId = appointment.HaircutID
        const amountDue = appointment.amountDue
        const appStatusId = appointment.appStatusID

        if(haircutId == 0){
            haircutId = null
        }

        //insert into db
        const insert = "insert into tblappointment"
        const columns = "(CustomerID, ShopID, EmployeeID, ShopServicesID, TimeIn, " + 
            "TimeOut, Date, HaircutID, amountDue, appStatusID)"
        const values = `values (${customerId}, ${shopId}, ${employeeId}, ${shopServiceId}, \'${timeIn}\', `+
            `\'${timeOut}\', \'${date}\', ${haircutId}, ${amountDue}, ${appStatusId})`

        console.log(`D/AptMan: ${insert} ${columns} ${values}`)
        await con.query(`${insert} ${columns} ${values}`)

        //get the id of what was inserted
        var id =-1
        id = await con.query(`select AppointmentID from tblappointment where CustomerID = ${customerId} and Date = "${date}" and TimeIn = "${timeIn}"`)
            console.log(`D/AptMan: Appointment ID: ${JSON.stringify(id[0][0].AppointmentID)}`)
        
        
        return id[0][0].AppointmentID
    }

    /**
     * Records payment to the database
     * @param {Payment} payment 
     */
    async payAppointment(/**@type {Payment}*/payment){
        const date = `${payment.date.getFullYear()}-${payment.date.getMonth()+1}-${payment.date.getDate()}`
        const time = `${payment.date.getHours()}:${payment.date.getMinutes()}`

        const insert = `insert into tbltransactions`
        const columns = "(AppointmentID, shopID, Amount, Date, Time)"
        const values = `values (${payment.appointmentId}, ${payment.shopId}, ${payment.amount},`+
            ` '${date}', '${time}')`

        await con.query(`${insert} ${columns} ${values}`)
        console.log(`D/AptMan: ${insert} ${columns} ${values}`)
    }
}

module.exports = AppointmentManager