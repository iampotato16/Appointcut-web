const mysql2 = require('mysql2/promise');

// Connection Pool
let connection

function startConnection() {
   if (!connection) {
      connection = mysql2.createPool({
         host: process.env.DB_HOST,
         user: process.env.DB_USER,
         port: process.env.DB_PORT,
         password: process.env.DB_PASS,
         database: process.env.DB_NAME
      });
   }
}

async function getAllFrom(table) {
   let query = 'SELECT * FROM ' + table
   var rows = await connection.query(query)
   return rows[0]
}

async function getAllFromWhere(table, where) {
   let query = 'SELECT * FROM ' + table + ' WHERE ' + where
   var rows = await connection.query(query)
   return rows[0]
}

async function getOneFromWhere(table, where) {
   let query = 'SELECT * FROM ' + table + ' WHERE ' + where
   var rows = await connection.query(query)
   return rows[0][0]
}

async function getAllFromServices() {
   var query = 'SELECT tblservices.ServicesID, tblservices.Name, tblcategory.Name as Category FROM tblservices INNER JOIN tblCategory ON tblservices.CategoryID = tblCategory.CategoryID'
   var rows = await connection.query(query)
   return rows[0]
}

async function getAllFromBarangay() {
   var query = 'SELECT tblbarangay.BarangayID, tblbarangay.Name, tblcity.Name as City FROM tblcity INNER JOIN tblbarangay ON tblbarangay.CityID = tblCity.CityID'
   var rows = await connection.query(query)
   return rows[0]
}

async function insertInto(table, values){
   let query = 'INSERT INTO ' + table + ' VALUES ' + values; 
   var id = await connection.query(query).then(async mess => {
      return await mess[0]})
   return await id
}

async function updateSet(table, values, where){
   let query = 'UPDATE ' + table + ' SET ' + values + ' WHERE ' + where; 
   var rows = await connection.query(query)
}

class ModalConstructor {
   tableName;
   constructor(tableName) {
      this.tableName = tableName
   }
   /**Textbox input type */
   static TYPE_TEXT = "text";
   /**Checkbox input type */
   static TYPE_CHECKBOX = "checkbox";
   /**Checkbox input type */
   static TYPE_PASSWORD = "password";
   /**Checkbox input type */
   static TYPE_EMAIL = "email";

   /**Field is visible in edit mode */
   static VISIBILITY_EDIT = "edit-visibility";
   /**Field is visible in add mode */
   static VISIBILITY_ADD = "add-visibility";

   #fields = new Map();
   #addAction;
   #editAction;

   /**
    * Adds a field to the modal
    * @param {string} name Name of the field
    * @param {string} type type of input
    * @param {*} value default value to be displayed
    * @param {string} visibility which mode the field should be visible in
    * leave empty to make visible in all modes
    * @param {string} addOn html input addons e.g. checked readonly
    */
   addField(name, type, value = "", visibility = "", addOn = "") {
      let field = {
         "name": name,
         "type": type,
         "value": value,
         "visibility": visibility,
         "addOn": addOn
      }
      this.#fields.set(name, field);
   }

   /**
    * change the default value of a field
    * @param {*} name field to be changed
    * @param {*} value the default value
    */
   setFieldValue(name, value) {
      this.#fields.get(name).value = value
   }

   /**
    * Sets the action when in edit mode
    * @param {*} action link to direct POST request
    */
   setAddAction(action) {
      this.#addAction = action;
   }
   /**
    * Sets the action when in add mode
    * @param {*} action link to direct POST request
    */
   setEditAction(action) {
      this.#editAction = action;
   }

   /**
    * Constructs the modal for use with modal Partial
    * @returns array that the modal partial will use
    */
   construct() {

      let fieldsArray = []
      this.#fields.forEach((value, key) => {
         fieldsArray.push(value);
      })
      let modal = {
         "tableName": this.tableName,
         "addAction": this.#addAction,
         "editAction": this.#editAction,
         "fieldsArray": fieldsArray
      }
      return modal;
   }

}

 
module.exports = { getAllFrom, getAllFromWhere, getOneFromWhere, getAllFromServices, getAllFromBarangay, insertInto, updateSet, startConnection, ModalConstructor }