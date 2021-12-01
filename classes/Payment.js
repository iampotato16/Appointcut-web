class Payment{
    appointmentId
    shopId
    /**@Type Date*/date
    amount

    /**
     * 
     * @param {int} appointmentId 
     * @param {int} shopId 
     * @param {int} amount 
     */
    constructor(appointmentId, shopId, amount){
        this.appointmentId = appointmentId
        this.shopId = shopId
        this.amount = amount
        date = Date.now
    }
}

module.exports = Payment