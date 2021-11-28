class AppointmentManager{
    constructor(connection){
        this.connection = connection
    }

    /**
     * Sets an appointment with the given appointment
     * @param {*} appointment Appointment to be set in database
     * @returns true if it succeeded false otherwise
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

        const insert = "insert into tblappointment"
        const columns = "(CustomerID, ShopID, EmployeeID, ShopServicesID, TimeIn, " + 
            "TimeOut, Date, HaircutID, amountDue, appStatusID)"
        const values = `values (${customerId}, ${shopId}, ${employeeId}, ${shopServiceId}, \'${timeIn}\', `+
            `\'${timeOut}\', \'${date}\', ${haircutId}, ${amountDue}, ${appStatusId})`
        
        console.log(`D/AptMan: ${insert} ${columns} ${values}`)

        con.query(`${insert} ${columns} ${values}`)
        return true
    }
}

module.exports = AppointmentManager