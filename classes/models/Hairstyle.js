class Hairstyle{
    id
    name
    imageLink
    textLink

    /**
     * Initializes with all the properties
     * @param {number} id 
     * @param {string} name 
     * @param {string} imageLink 
     * @param {string} textLink 
     */
    constructor(id, name, imageLink, textLink){
        this.id = id
        this.name = name
        this.imageLink = imageLink
        this.textLink = textLink
    }
}

module.exports = Hairstyle