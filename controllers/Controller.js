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
router.get(
  "/",
  isLoggedInFunc,
  (req, res) => {
    res.render("home", { isLoggedIn: req.body.isLoggedIn });
  }
);
router.get("/product/", isLoggedInFunc, async (req, res) => {
  if (req.body.isLoggedIn == true) {
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
    if (inCart) {
      res.render("product",{
          product: data[0],
          inCart: true
        });
    } else {
      res.render("product",{
          product: data[0],
          inCart: false
        });
    }
  })
  } else {
    products.find({ productName: req.query.id }).then(data => {
      res.render("product", {
        product: data[0],
        inCart: false
      });
    })
  }
});

router.get("/products", isLoggedInFunc, async (req, res) => {
  if (req.body.isLoggedIn == true) {

    products.find({}).then(data => {
      res.render("products", { products: data });
    })
  }
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
      console.log()
      const product = await products.find({_id: item.productId});
      console.log(product[0].imageUrl)
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
      success_url: "http://localhost:3000/checkoutSuccess",
      cancel_url: "http://localhost:3000/checkoutCancel",

    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});


router.get("/checkout", (req, res) => {
  res.render("checkout")
})


module.exports = router