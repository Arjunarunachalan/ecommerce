var express = require("express");
const { response } = require("../app");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var adminHelpers = require('../helpers/admin-helpers')

const verifyAdminLogin = (req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('admin/adminlogin')
  }
}

/* GET users listing. */
router.get("/",verifyAdminLogin,function (req, res) {
  let admin= req.session.admin
  console.log(admin);
 if(admin){
    productHelpers.getAllproducts().then((products) => {
      console.log(products);
      res.render("admin/view-products", { admin: true, products });
    });
  }else{
    res.render("/admin/login")
  }
 
});

router.get("/adminlogin", (req, res) => {
  if(req.session.loggedIn){
  
    res.redirect("/admin")
  }else{
    res.render("admin/login",{"logErr":req.session.logErr});

}
}),

router.post('/adminLogin',(req,res)=>{
  const { email, password } = req.body
  let admin = {
   email:"admin@gmail.com",
    password:"123"
  }
  if(email == admin.email){
    if(password == admin.password){
   if(response.status){
      req.session.loggedIn = true
      req.session.admin = response.admin
    res.redirect("/admin")
    }
  }else{
      req.session.logErr = true
    res.redirect("/admin/adminlogin")
    }
  }else{
      req.session.logErr = true
    res.redirect("/admin/adminlogin")
}
 
})

router.get('/adminlogout',(req,res)=>{
  req.session.destroy()
  res.redirect("/admin/adminlogin")
})

router.get("/add-product", function (req, res) {
  res.render("admin/add-product");
});
router.post("/add-product", function (req, res) {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image;
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.render("admin/add-product");
      }
    });
  });
});
router.get('/delete-product/:id',(req,res)=>{
  let proid =req.params.id
  productHelpers.deleteProduct(proid).then((response)=>{
    res.redirect('/admin')
  })
})
router.get('/edit-product/:id', async (req,res)=>{
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render("admin/edit-product",{product})
})
router.post('/edit-product/:id',(req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    let id = req.params.id;
    res.redirect('/admin')
    if(req.files.image){
      let image  = req.files.image
      image.mv("./public/product-images/" + id + ".jpg")
    }
  })
})

module.exports = router;
