class Payment{
    appointmentId
    customerId
    shopId
    /**@Type Date*/
    date
    amount

    /**
     * 
     * @param {int} appointmentId 
     * @param {int} shopId 
     * @param {int} amount 
     */
    constructor(appointmentId, shopId, customerId, amount){
        this.appointmentId = appointmentId
        this.shopId = shopId
        this.amount = amount
        this.customerId = customerId
        this.date = new Date(Date())
    }
}

module.exports = Payment