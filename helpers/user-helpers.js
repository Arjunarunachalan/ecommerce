var db = require("../Config/Connection");
var collection = require("../Config/collection");
const bcrypt = require("bcrypt");
const { response } = require("../app");
const { logger } = require("handlebars");
var objectId = require("mongodb").ObjectId;

module.exports = {
  doSighnup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((response) => {
          console.log(response);
        });
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });

      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("login succesfull");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("user not found");
        resolve({ status: false });
      }
    });
  },
  addToCart: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let productExist = userCart.products.findIndex(
          (product) => product.item == proId
        );
        console.log(productExist);
        if (productExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();

      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )

          .then((response) => {
            resolve({status:true});
          });
      }
    });
  },

  // removeProduct: ({ proId, cartId }) => {
  //   return new Promise(async (resolve, reject) => {
  //     let userCart = await db
  //       .get()
  //       .collection(collection.CART_COLLECTION)
  //       .updateOne(
  //         { _id: objectId(cartId) },
  //         {
  //           $pull: { products: { item: objectId(proId) } },
  //         }
  //       );
  //     console.log(userCart);
  //     if (userCart) {
  //     }
  //   });
  // },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $project: {
              item: 1,

              quantity: 1,
              products: { $arrayElemAt: ["$products", 0] }
            }
          },
          {
           $group:{
            _id:null,
             total:{$sum:{$multiply:[
              {
                $toDouble:'$quantity'
              },
              {
                $toDouble:'$products.price'
              }
            ]}}
           
           }
          },
        ])
        .toArray();
        if(total[0]){
          resolve(total[0].total)
        }else{
          resolve(0)
        }

      });
  },
  placeOrder:(order,products,total)=>{
    return new Promise((resolve, reject) => {
      console.log(order,products,total);
      let status = order['payment-method']==='COD'?'Placed':'Pending'
      let orderObj={
        delivaryDetails:{
          mobile:order.mobile,
          address:order.address,
           pincode:order.pincode 
        },
        userId:objectId(order.userId),
        paymentMethod:order['payment-method'],
        products:products,
        totalAmount:total,
        status:status,
        date:new Date()
      }
      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
        db.get().collection(collection.CART_COLLECTION).removeOne({user:objectId(order.userId)})
        resolve()
      })
      
    })

  },
  getCartProductList:(userId)=>{
    return new Promise(async(resolve, reject) => {
      let cart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
      console.log(cart);
      resolve(cart.products)
    })
  },
  getUserOrders:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
      resolve(orders)
    })
  },
  getOrderProducts:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
      let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match:{_id:objectId(orderId)}
        },
        {
          $unwind:'$products'
        },
        {
          $project:{
            item:'$products.item',
            quantity:'$products.quantity'
          }
        },
        {
          $lookup:{
            from:collection.PRODUCT_COLLECTION,
            localField:'item',
            foreignField: "_id",
            as:'product'

          }
        },
        {
          $project:{
            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
          }
        }
      ]).toArray()
      console.log(orderItems);
      resolve(orderItems)
    })
  }
};
