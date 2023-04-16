var db = require("../Config/Connection");
var collection = require("../Config/collection");
const bcrypt = require("bcrypt");
const { response } = require("../app");
const { logger } = require("handlebars");
var objectId = require("mongodb").ObjectId;

module.exports={
    
        doLogin: (adminData) => {
            return new Promise(async (resolve, reject) => {
              let loginStatus = false;
              let response = {};
              let admin = await db
                .get()
                .collection(collection.ADMIN_COLLECTION)
                .findOne({ Email: adminData.Email });
        
              if (admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                  if (status) {
                    console.log("login succesfull");
                    response.admin = admin;
                    response.status = true;
                    resolve(response);
                  } else {
                    console.log("login failed");
                    resolve({ status: false });
                  }
                });
              } else {
                console.log("admin not found");
                resolve({ status: false });
              }
            });
          }
    }
