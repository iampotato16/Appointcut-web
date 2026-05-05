const acu = require("../../AppointCutUtils");
const express = require("express");
const router = express.Router();

//LOGIN
router
   .route("/")
   .get((req, res) => {
      var title = "Login in to AppointCut";
      res.render("login", { layout: "main", title });
   })
   .post(async (req, res) => {
      const { email, password } = req.body;
      acu.startConnection();

      try {
         // 1. Check admins table
         const admin = await acu.getOneFromWhere("tbladmin", `email = '${email}' AND password = '${password}'`);
         if (admin) {
            return res.redirect("/fileMaintenance");
         }

         // 2. Check owners table
         const owner = await acu.getOneFromWhere("tblowner", `email = '${email}' AND password = '${password}'`);
         if (owner) {
            return res.redirect("/ownerAccount/view" + owner.OwnerID);
         }

         // 3. Check employees table
         const employee = await acu.getOneFromWhere("tblemployee", `email = '${email}' AND password = '${password}'`);
         if (employee) {
            return res.redirect(`/deskAccount/${employee.EmployeeID}/${employee.shopID}`);
         }

         // 4. Check customers table
         const customer = await acu.getOneFromWhere("tblcustomers", `email = '${email}' AND password = '${password}'`);
         if (customer) {
            return res.redirect("/customerOnline");
         }

         // If no match found
         var title = "Login in to AppointCut";
         res.render("login", { 
            layout: "main", 
            title, 
            error: "Invalid email or password",
            email: email // optional: to keep the email field filled
         });

      } catch (error) {
         console.error("Login error:", error);
         res.render("login", { 
            layout: "main", 
            title: "Login in to AppointCut", 
            error: "An error occurred during login. Please try again." 
         });
      }
   });

module.exports = router;
