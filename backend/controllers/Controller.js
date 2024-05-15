// Importing Basic Node Modules
const express = require("express");
const router = express.Router();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY); // Ensure correct environment variable name

// Importing Database Models
const products = require("../models/products");
const users = require("../models/users");

let { isLoggedInFunc } = require("../middleware/authMiddleware")
router.use(express.json())

// Route Handlers
router.get("/", isLoggedInFunc, (req, res) => {
  const isLoggedIn = req.isAuthenticated();
  const user = req.user;
  
  res.render("home", { isLoggedIn, user });
});
router.get("/product/", isLoggedInFunc, async (req, res) => {
  if (req.body.isLoggedIn == true) {
    // User is logged in, proceed with rendering the product page
    let user = await users.find({ _id: req.session.passport.user });
  
    products.find({ productName: req.query.id }).then(data => {
      let inCart = false;
      user[0].cart.map(item => {
        if (item.productId == data[0]._id) {
          inCart = true
        } else {
          if (!inCart == true) {
            inCart = false
          }
        }
      })
      
      // Find similar products excluding the current product
      products.find({ group: data[0].group, _id: { $ne: data[0]._id } }).then(similarProducts => {
        if (inCart) {
          res.render("product",{
            product: data[0],
            inCart: true,
            similarProducts: similarProducts,
            isLoggedIn: req.body.isLoggedIn // Pass isLoggedIn to the template
          });
        } else {
          res.render("product",{
            product: data[0],
            inCart: false,
            similarProducts: similarProducts,
            isLoggedIn: req.body.isLoggedIn // Pass isLoggedIn to the template
          });
        }
      })
    })
  } else {
    // User is not logged in, redirect to login page
    res.redirect('/auth');
  }
});


router.get("/products", isLoggedInFunc, async (req, res) => {
    products.find({}).then(data => {
      res.render("products", { products: data });
    })
  
});

router.post("/product-search", (req, res) => {
  products.find({ productName: RegExp(req.body.query, "i") }).then(productList => {
    res.render("products", { products: productList });
  })
})

router.post("/addToCart", isLoggedInFunc, (req, res) => {
  if (req.body.isLoggedIn == true) {
    let response = {}
    users.find({ _id: req.session.passport.user }).then(data => {
      let userCart = data[0].cart;
      if (userCart.length == 0) {
        userCart = [req.body]
        users.updateMany({ _id: req.session.passport.user }, { cart: userCart }).then(data => {
        })
        response = {status: "success", message: "Product Added to the cart"}
      } else if (userCart.length > 0) {
        let noDupplication = true;
        userCart.map(item => {
          if (item.productId == req.body.productId) {
            noDupplication = false
          } else if (item.productId == req.body.productId) {
            noDupplication = true      
          }
        })
        if (noDupplication == true) {
          userCart.push(req.body)
          users.updateMany({ _id: req.session.passport.user }, { cart: userCart }).then(data => {})
          response = {status: "success", message: "Product Added to the cart"}
        } else {
          response = {status: "error", message: "Product Already Exists"}
        }
      }
      res.json(response)
  })
  } else if (req.body.isLoggedIn == false ){
    res.json({status: "error", message: "User Not Logged In"})
  }
})

router.post("/removeFromCart", isLoggedInFunc, async (req, res) => { 
  let response = {}
  if (req.body.isLoggedIn == true) {
    
    let productId = req.body.productId;
    let user = await users.find({ _id: req.session.passport.user });
    let userCart = user[0].cart;
    if (userCart.length == 0) {
      response = { status: 'error', message: "No Products at all" }
    } else if (userCart.length == 1) {
      if (userCart[0].productId = productId) {
        users.updateMany({ _id: req.session.passport.user }, { cart: [] }).then(data => {
             
        })
        response = { status: "success", message: "Product removed from the cart" }
      } else {
        response = {status: "error", message: "Product Not found"}
      }

    } else {
      let index = -1;
      for (let i = 0; i < userCart.length; i++) {
        if (userCart[i].productId == productId) {
          index = i
          users.updateMany({ _id: req.session.passport.user }, { cart: userCart }).then(data => {
             
          })
          response = {status: "success", message: "Product removed from the cart"}
        }
      }
      if (index >= 0) {
        userCart.splice(index, 1);
        users.updateMany({ _id: req.session.passport.user }, { cart: userCart }).then(data => {
             response = {status: "success", message: "Product removed from the cart"}
          })
      } else if (index == -1) {
        response = {status: "error", message: "Product Not found"}
      }
    }
    res.json(response)
  }
})

router.get("/about", (req, res) => {
    res.render("about",);
});

router.post("/create-checkout-session", async (req, res) => {
  const productsInfo = await products.find({});
  let userCart = await users.find({ _id: req.session.passport.user })
  userCart = userCart[0].cart
  try {
    const lineItems = await Promise.all(userCart.map(async (item) => {
      const product = await products.find({_id: item.productId});
      if (product.length == 0) {
        throw new Error("Invalid product ID");
      }
      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: product[0].productName,
            images: [
              product[0].imageUrl
            ],
          },
          unit_amount: product[0].price * 100,
        },
        quantity: item.quantity,


      };
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `http://localhost:2000/checkoutSuccess`,
      cancel_url: "http://localhost:2000/checkoutCancel",
  });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});
router.get('/cart',async(req,res)=>{
  try {
    const user = await users.findOne({ _id: req.session.passport.user });
    const userCart = user.cart;
    const productPromises = userCart.map(async (item) => {
        const product = await products.findOne({ _id: item.productId });
        return {
            name: product.productName,
            image: product.imageUrl,
            price: product.price,
            quantity: item.quantity
        };
    });
    const productsWithImages = await Promise.all(productPromises);
    res.render("cart", { products: productsWithImages });
} catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
}
})

router.get("/checkoutSuccess",(req,res)=>{
  res.render('successpage')
});

router.get("/checkout", async (req, res) => {
  try {
      const user = await users.findOne({ _id: req.session.passport.user });
      const userCart = user.cart;
      const productPromises = userCart.map(async (item) => {
          const product = await products.findOne({ _id: item.productId });
          return {
              name: product.productName,
              image: product.imageUrl,
              price: product.price,
              quantity: item.quantity
          };
      });
      const productsWithImages = await Promise.all(productPromises);
      res.render("checkout", { products: productsWithImages });
  } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
  }
});

router.get("/auth",(req,res)=>{
  res.render("auth");
})

router.get("/contact",(req,res)=>{
  res.render('contact')
})


module.exports = router