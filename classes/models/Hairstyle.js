class Hairstyle{
    id
    name
    image_link
    text_link

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
        this.image_link = imageLink
        this.text_link = textLink
    }
}

module.exports = Hairstyle