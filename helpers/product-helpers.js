var db = require("../Config/Connection");
var collection = require("../Config/collection");
const { response } = require("../app");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addProduct: (products, callback) => {
    console.log(products);
    db.get()
      .collection("products")
      .insertOne(products)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  getAllproducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },
  deleteProduct: (proid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .removeOne({ _id: objectId(proid) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  getProductDetails: (proid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(proid) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  updateProduct:(proid,productDetails)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proid)},{
        $set:{
          name:productDetails.name,
          description:productDetails.description,
          price:productDetails.price,
          category:productDetails.category
        }
      }).then((response)=>{
        resolve()
    })
    })
  }
};
