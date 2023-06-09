var express = require("express");
const { response } = require("../app");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");
const { log } = require("handlebars/runtime");
const verifyLogin = (req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get("/",async function(req,res,next) {
  let user= req.session.user
  console.log(user);
  cartCount =null
  if(req.session.user){
   let cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllproducts().then((products) => {
    res.render("user/view-products", { products,user,cartCount });
  });
});

router.get("/login", (req, res) => {
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render("user/login",{"logErr":req.session.logErr});

  }
});
router.get("/sighnup", (req, res) => {
  res.render("user/sighnup");
});
router.post("/sighnup", (req, res) => {
  userHelpers.doSighnup(req.body).then((response) => {
    req.session.loggedIn = true
    req.session.user= response
   res.redirect('/')
  });
});

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    }else{
      req.session.logErr = true
      res.redirect('/login')
    }
  })
 
})
router.get("/logout",(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let products =await userHelpers.getCartProducts(req.session.user._id)
  let totalValue= await userHelpers.getTotalAmount(req.session.user._id)
 
  res.render('user/cart',{products,user:req.session.user,totalValue})
})

router.get('/add-to-cart/:id',(req,res)=>{
  console.log(req.session.user._id,'api call');
  userHelpers.addToCart(req.params.id,req.session.user._id).then((response)=>{
   res.json({status:true ,response})
  })
})

router.post('/change-product-quantity',(req,res,next)=>{
console.log(req.body);
userHelpers.changeProductQuantity (req.body)
.then(async(response)=>{
  response.total=await userHelpers.getTotalAmount(req.body.user)
 
  res.json(response)
})
})
router.post('/remove-product',(req,res)=>{
  console.log(req.body);
  userHelpers.removeProduct(req.body).then((response)=>{
  res.json(response)
    
  })
})

router.get("/place-order",verifyLogin,async (req,res)=>{
  let total =await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user})
})
router.post("/place-order",async(req,res)=>{
  let products =await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
    res.json({status:true})

  })
  console.log(req.body);
})
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})

router.get('/orders',async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',async(req,res)=>{
  let products =await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})

module.exports = router;


