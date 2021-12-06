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
        const query = `SELECT * FROM employee where EmployeeID = ${barberId} AND EmployeeType = "Barber" and Status = 1`
        console.log(`SELECT * FROM employee where EmployeeID = ${barberId} AND EmployeeType = "Barber" and Status = 1`)
        var barber = await this.connection.query(query)
        var fetched = barber[0].pop()
        console.log(JSON.stringify(fetched))
        if (fetched == null){
            console.log("null on barfecth ")
            return []
        }
        return [fetched]
    }

    /**
     * 
     * @param {*} shopId 
     * @param {*} specializationId 
     */
    async getBarbersWithSpecialization(shopSpecializationId){
        const select = `SELECT * FROM tblemployeespecialization` 
        const condition = `where shopServicesID = ${shopSpecializationId} and Status = 1`
        var shops = await this.connection.query(`${select} ${condition}`)
        console.log(JSON.stringify(shops[0]))
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
        const where = `where MONTH(Date) = ${month} and YEAR(Date) = ${year} and EmployeeID = ${barberId} and appStatusID = 1;`
        const appointments = await this.connection.query(`${select} ${where};`)
        
        return appointments[0]
    }

    /**
     * Fetches the full details of appointments for given date
     * @param {*} barberName
     * @param {*} day
     * @param {*} month 
     * @param {*} year 
     */
    async getBarberAppointmentView(barberName,day, month, year){
        const select = `select * from appointment`
        const where = `where DAY(Date) = ${day} and MONTH(Date) = ${month} and YEAR(Date) = ${year} and EmployeeName = ${barberName}`
        const order = "ORDER BY TimeIn"
        console.log(`${select} ${where};`)
        const appointments = await this.connection.query(`${select} ${where} ${order};`)
        
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

    async getWage(employeeId, year, month){
        const employee = await this.connection.query(`select * from tblemployee where EmployeeId = ${employeeId}`)
        console.log(`Salary Type: ${JSON.stringify(employee[0][0])}`)
        console.log(`Date ${year} - ${month}`)

        if(employee[0][0].salaryTypeID == 2){//monthly
            console.log(`Salary Type: 2`)
            return employee[0][0].salaryTypeValue
        }else if (employee[0][0].salaryTypeID == 1){//commission
            console.log(`Salary Type: 1`)
            return await this.computeCommission(employee[0][0], year, month)
        }else if(employee[0][0].salaryTypeID == 3){//Hourly
            console.log(`Salary Type: 3`)
            return await this.computeHourly(employee[0][0], year, month)
        }
    }

    async computeCommission(employee, year, month){
        const sched = await this.getBarberSched(employee.EmployeeID)
        const calendar = new Date(year, month)
        var wage = 0.0
        var multiplier = employee.salaryTypeValue/100

        const select = "select Amount from appointment"
        const where = `where MONTH(Date) = ${parseInt(month)+1} and YEAR(Date) = ${year} and EmployeeID = ${employee.EmployeeID} and AppointmentStatus = "Completed"`
        console.log(`${select} ${where};`)
        const appointments = await this.connection.query(`${select} ${where};`)
        console.log(`amount ${JSON.stringify(appointments[0])}`)

        for(var i = 0; i < appointments[0].length; i++){
            console.log(`Amount: ${appointments[0][i].Amount}`)
            wage += appointments[0][i].Amount * multiplier
            console.log(`Amount: ${wage}`)
        }
        return wage
    }

    async computeHourly(employee, year, month){
        const sched = await this.getBarberSched(employee.EmployeeID)
        const calendar = new Date(year, month)
        var wage = 0.0
        var multiplier = employee.salaryTypeValue

        while(calendar.getMonth() == month){
            var hours = 0
            var currentSched
            switch(calendar.getDay()){
                case 0:
                    currentSched = sched[6]
                    break;
                case 1:
                    currentSched = sched[0]
                    break;
                case 2:
                    currentSched = sched[1]
                    break;
                case 3:
                    currentSched = sched[2]
                    break;
                case 4:
                    currentSched = sched[3]
                    break;
                case 5:
                    currentSched = sched[4]
                    break;
                case 6:
                    currentSched = sched[5]
                    break;
            }
            console.log(`TimeIn: ${currentSched.TimeIn}`)
            console.log(`TimeOut: ${currentSched.TimeOut}`)
            //if null, skip
            if(currentSched.TimeIn == null){
                calendar.setDate(calendar.getDate()+1)
                continue
            }

            const hourOut = currentSched.TimeOut.split(":")[0]
            const hourIn = currentSched.TimeIn.split(":")[0]
            const minuteOut = currentSched.TimeOut.split(":")[1]
            const minuteIn = currentSched.TimeIn.split(":")[1]

            var hoursComputed = parseInt(hourOut) - parseInt(hourIn)
            const minuteComputed = (60 - parseInt(minuteIn) + parseInt(minuteOut))/60
            //correction for time in
            if(parseInt(minuteIn) > 0){hoursComputed--}
            console.log(`Hours: ${hoursComputed}, Minutes: ${minuteComputed}`)
            wage += (hoursComputed + minuteComputed) * multiplier
            console.log(`Wage: ${wage}`)

            calendar.setDate(calendar.getDate()+1)
        }
        return wage
    }
}

module.exports = BarberFetch
