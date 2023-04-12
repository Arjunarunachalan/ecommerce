var express = require("express");
const { response } = require("../app");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");

/* GET users listing. */
router.get("/", function (req, res) {
  productHelpers.getAllproducts().then((products) => {
    console.log(products);
    res.render("admin/view-products", { admin: true, products });
  });
});

router.get('/login',(req,res)=>{
  res.render('admin/login')
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
