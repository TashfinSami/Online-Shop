const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const multer = require('multer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const db = require('./data/db');
const emailService = require('./emailService');
const { v4: uuidv4 } = require('uuid'); // Import UUID library for generating unique IDs

const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = 'onlin65f5c6f68ad33'
const store_passwd = 'onlin65f5c6f68ad33@ssl'
const is_live = false //true for live, false for sandbox
//test git
//test git 4

// Create a nodemailer transporter using SendGrid
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "8cb17e1e717f9a",
      pass: "86d2572be8ee1c"
    },
  });

/*// Create a transporter object using nodemailer
const transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587, // or 2525, or 25
  secure: false, // true for 465, false for other ports
  auth: {
      user: "api",
      pass: "f338f477ce7e6705469ccabcb54bd637"
  },
  requireTLS: true // StartTLS is required
});*/


// Generate a random verification code
function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploadedImage');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });


/* Start of session.................................................................................. */
const MySQLStore = require('express-mysql-session')(session);

const options = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'onlineshop'
};

const sessionStore = new MySQLStore(options);

app.use(session({
	key: 'session_cookie_name',
	secret: 'session_cookie_secret',
	store: sessionStore,
	resave: false,
	saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
}));

/* end of session............................................................................ */

/* all dependencys.................................................................................... */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(express.static("uploadedImage"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//const db = require("./data/db");


/* ........................................................................................................ */

/* All get req.......................................................................................... */
app.get("/", function (req, res) {
  
  if (!req.session.isAuthenticated || !req.session.user) {
    res.redirect("index");
  } else if(req.session.user.account_type=='customer') {
    res.redirect("index_log");
  }
  else if(req.session.user.account_type=='seller') {
    res.redirect("seller");
  }else{
    res.redirect('dev');
  }
});

app.get("/index_log", async function (req, res) {
  
  if (!req.session.isAuthenticated || req.session.user.account_type!='customer') {
    console.log(req.session.user)
    return res.send(`<h1> Sign Up </h1>`);
  }
  let name = "";
  try {
    name = name + req.session.user.name;
    const ID = req.session.user.id;
    const [allproducts1] = await db.query(`SELECT * FROM PRODUCTS`);
    res.render("index_log", {
      nameofcustomer: name,
      allproducts1: allproducts1,
    });
  } catch (error) {
    res.redirect("/index");
  }
});

app.get("/index", async function (req, res) {
  const [allproducts] = await db.query(`SELECT * FROM PRODUCTS`);

  res.render("index", { allproducts: allproducts });
});

app.get("/login", function (req, res) {
  const det = req.query.det;
  res.render("login", { det: det });
});
app.get("/402", function (req, res) {
  res.render("402");
});
app.get("/403", function (req, res) {
  res.render("403");
});
app.get("/404", function (req, res) {
  res.render("404");
});
app.get("/signup", function (req, res) {
  res.render("signUp");
});

app.get("/cart", async function (req, res) {
  if (!req.session.isAuthenticated || req.session.user.account_type!='customer') {
    return res.redirect(`404`);
  }

  const ID = req.session.user.id;
  const [allproducts] = await db.query(
    `SELECT * FROM cart WHERE customer_id=?`,
    [ID]
  );
  res.render("cart", { allproducts: allproducts });
});

app.get("/addProduct", async function (req, res) {
  if (!req.session.isAuthenticated || req.session.user.account_type!='seller') {
    return res.redirect(`404`);
  }
  res.render("addProduct");
});

app.get("/seller", async function (req, res) {
  
  if (!req.session.isAuthenticated || req.session.user.account_type!='seller') {
    console.log(req.session.isAuthenticated);
    return res.send(`<h1> Sign Up </h1>`);
  }
  let name = "";
  try {
    name = name + req.session.user.name;

    const ID = req.session.user.id;
    const [sellerProducts] = await db.query(
      "SELECT * FROM products WHERE seller_id = ?",
      [ID]
    );
    res.render("seller", {
      nameOfSeller: name,
      sellerProducts: sellerProducts,
    });
  } catch (error) {
    res.redirect("/login");
  }
  });

app.get("/dev", async function (req, res) {
  if (!req.session.isAuthenticated || req.session.user.account_type!='dev') {
    return res.send(`<h1> Sign Up </h1>`);
  }
  let name = "";
  try {
    name = name + req.session.user.name;

    const [dev_pending] = await db.query("SELECT * FROM dev_approve");
    res.render("dev", { nameofdev: name, dev_pending: dev_pending });
  } catch (error) {
    res.redirect("/login");
  }
});

app.get("/order", async function (req, res) {
  const nameOfCustomer = req.session.user.name;
  const customer_id = req.session.user.id;
  const query = `
  SELECT orders.*, products.*, customer.*
  FROM orders
  INNER JOIN products ON orders.product_id = products.product_id
  INNER JOIN customer ON orders.customer_id = customer.ID
  WHERE customer_id = ?
`;

  const [data] = await db.query(query, [customer_id]);

  res.render("order", { nameOfCustomer: nameOfCustomer });
});

app.get("/manageorder", async function (req, res) {
  const [data1] = await db.query(`SELECT *
  FROM orders
  INNER JOIN products ON orders.product_id = products.product_id
  INNER JOIN customer ON orders.customer_id = customer.id`);
  const [data2] = await db.query(`SELECT s.*
  FROM seller s
  INNER JOIN products p ON s.ID = p.seller_id
  INNER JOIN orders o ON p.product_id = o.product_id`);

  const data = [...data1, ...data2];

  res.render("manageOrder", { alldata: data });
});

app.get("/c_order", async function (req, res) {
  const c_id = req.session.user.id;

  const [data1] = await db.query(
    `SELECT *
FROM orders

INNER JOIN products ON orders.product_id = products.product_id
INNER JOIN customer ON orders.customer_id = customer.id
WHERE customer_id=?;
`,
    [c_id]
  );

  const [data2] = await db.query(
    `SELECT s.*
  FROM seller s 
  
  INNER JOIN products p ON s.ID = p.seller_id
  INNER JOIN orders o ON p.product_id = o.product_id
  WHERE customer_id=?;
  `,
    [c_id]
  );
  const data = [...data1, ...data2];

  res.render("c_order", { alldata: data });
});

app.get("/s_order", async function (req, res) {
  const s_id = req.session.user.id;

  const [data1] = await db.query(
    `SELECT *
FROM orders

INNER JOIN products ON orders.product_id = products.product_id
INNER JOIN seller ON products.seller_id = seller.ID
INNER JOIN customer ON orders.customer_id = customer.ID
WHERE seller_id=?;
`,
    [s_id]
  );
  console.log(data1);

  res.render("s_order", { alldata: data1 });
  //console.log(alldata);
});

app.get("/contacts", async function (req, res) {
  //const [allproducts] = await db.query(`SELECT * FROM PRODUCTS`);

  res.render("contacts");
});

app.get("/privacy_policy", async function (req, res) {
  //const [allproducts] = await db.query(`SELECT * FROM PRODUCTS`);

  res.render("privacy_policy");
});

app.get("/about", async function (req, res) {
  //const [allproducts] = await db.query(`SELECT * FROM PRODUCTS`);

  res.render("about");
});

/* end of all get req................................................................................................... */

/* all post req....................................................................................................................... */
app.post("/addproduct", upload.single("image"), async function (req, res) {
  const filepath = req.file.filename;
  const data = req.body;
  const id = req.session.user.id;

  await db.query(
    `INSERT INTO products (seller_id, p_name, price, Details, image_add)
    VALUES (?,?,?,?,?)`,
    [id, data.product_name, data.product_price, data.product_details, filepath]
  );

  res.redirect("/seller");
});

app.post("/logout", function (req, res) {
  req.session.user = null;

  res.redirect("/index");
});
app.post("/accept", async function (req, res) {
  const id = req.body.devId;
  const [copyData] = await db.query(
    `SELECT email,password,name,adress1,adress2,city,state,zipcode,isVerified,verificationCode FROM dev_approve WHERE ID=?`,
    [id]
  );
  const { email, password, name, adress1, adress2, city, state, zipcode, isVerified, verificationCode} =
    copyData[0];

  await db.query(
    `INSERT INTO dev(email, password, name, adress1, adress2, city, state, zipcode, isVerified, verificationCode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [email, password, name, adress1, adress2, city, state, zipcode, isVerified, verificationCode]
  );

  await db.query(`DELETE FROM dev_approve WHERE ID=?`, [id]);
  res.redirect("dev");
});

app.post("/reject", async function (req, res) {
  const id = req.body.devId1;

  await db.query(`DELETE FROM dev_approve WHERE ID=?`, [id]);
  res.redirect("dev");
});

app.post("/cart", async function (req, res) {
  const id = req.body.product_id;
  console.log(`id: ${id}`);
  const [cartData] = await db.query(
    `SELECT * FROM products WHERE product_id=?`,
    [id]
  );
  console.log(cartData);
  const ID = req.session.user.id;
  const { p_name, price, Details, image_add } = cartData[0];
  console.log(Details);
  await db.query(
    `INSERT INTO cart (name, price, Details, image_add, customer_id,product_id) VALUES (?, ?, ?, ?, ?, ?)`,
    [p_name, price, Details, image_add, ID, id]
  );
  res.json("done");
});

app.post("/search", async function (req, res) {
  const search = req.body.searchItem;
  const [searchitem] = await db.query(
    'SELECT * FROM products WHERE CONCAT_WS(" ", p_name) LIKE CONCAT("%", ?, "%")',
    [search]
  );

  res.render("searchitems", { searchitem: searchitem });
});

app.post("/search_log", async function (req, res) {
  if (!req.session.user) {
    return res.redirect("404");
  }

  const search = req.body.searchItem;
  const [searchitem] = await db.query(
    'SELECT * FROM products WHERE CONCAT_WS(" ", p_name) LIKE CONCAT("%", ?, "%")',
    [search]
  );

  res.render("searchitemlog", { searchitem: searchitem });
});

app.post("/placeOrder", async function (req, res) {
  const data0 = req.body;
  const customer_id = req.session.user.id;
  const [product] = await db.query(
    "SELECT p_name, price FROM products WHERE products.product_id=?",// AND cart.customer_id=?",
    [data0.product_id, customer_id]
  );
  // Generate a random transaction ID
  const tran_id = `${uuidv4()}_${Date.now()}`; // Combine UUID with timestamp
  //const price = 100
  const data = {
    total_amount: product[0].price * data0.kaka,
    currency: 'BDT',
    tran_id: tran_id, // use unique tran_id for each api call
    success_url: `http://localhost:3000/payment/success/${tran_id}`,
    fail_url: `http://localhost:3000/payment/fail/${tran_id}`,
    cancel_url: 'http://localhost:3000/cancel',
    ipn_url: 'http://localhost:3000/ipn',
    shipping_method: 'Courier',
    product_name: product[0].p_name,
    product_category: 'Electronic',
    product_profile: 'general',
    cus_name: 'Customer Name',
    cus_email: 'customer@example.com',
    cus_add1: 'Dhaka',
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01711111111',
    cus_fax: '01711111111',
    ship_name: 'Customer Name',
    ship_add1: 'Dhaka',
    ship_add2: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: 1000,
    ship_country: 'Bangladesh',
};
const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
sslcz.init(data).then(apiResponse => {
    // Redirect the user to payment gateway
    let GatewayPageURL = apiResponse.GatewayPageURL
    res.redirect(GatewayPageURL)
    //res.send({ url: GatewayPageURL });
    console.log('Redirecting to: ', GatewayPageURL)
});

app.post("/payment/success/:tranId", async (req, res) => {
  console.log('Transaction Successful\nTransaction ID:', req.params.tranId);

  await db.query(
    `INSERT INTO orders(product_id,quantity,customer_id) VALUES (?,?,?)`,
    [data0.product_id, data0.kaka, customer_id]
  );
  await db.query("DELETE FROM `cart` WHERE `cart`.`product_id` = ?", [
    data0.product_id,
  ]);

  res.redirect("/c_order");
});

app.post("/payment/fail/:tranId", async (req, res) => {
  console.log('Transaction Failed\nTransaction ID:', req.params.tranId);

  res.redirect("/cart");
});

  });

app.post("/removeFromCart", async function (req, res) {
  const data = req.body.product_id;
  await db.query("DELETE FROM `cart` WHERE `cart`.`product_id` = ?", [data]);
  res.json("done");
});

app.post("/track", async function (req, res) {
  const tracking_number = req.body.tracking_number;

  const [data1] = await db.query(
    `SELECT *
  FROM orders
  
  INNER JOIN products ON orders.product_id = products.product_id
  INNER JOIN customer ON orders.customer_id = customer.id
  WHERE tracking_number=?;
  `,
    [tracking_number]
  );
  const [data2] = await db.query(
    `SELECT s.*
  FROM seller s 
  
  INNER JOIN products p ON s.ID = p.seller_id
  INNER JOIN orders o ON p.product_id = o.product_id
  WHERE tracking_number=?;
  
  `,
    [tracking_number]
  );

  const data = [...data1, ...data2];

  res.render("track_search", { alldata: data });
});

app.post('/statusOfCustomerOrder', async function(req,res){

const data=req.body;

await db.query(`UPDATE orders
SET customer_status = ?
WHERE tracking_number = ?;
`,[data.status_customer,data.tracking_number]);

res.redirect('manageOrder');

})


  app.post('/statusOfSellerOrder', async function(req,res){

  const data=req.body;
  
  await db.query(`UPDATE orders
  SET seller_status = ?
  WHERE tracking_number = ?;
  `,[data.status_seller,data.tracking_number]);
  
  res.redirect('manageOrder');
  
  });

  app.post('/cancelorder', async function(req,res){
    console.log(req.body.tracking_number);

 await db.query(`DELETE FROM orders WHERE tracking_number=?`,[req.body.tracking_number]);

  res.json("Done");


  })


/* customer part ................................................................................................... */

app.post("/customer", async function (req, res) {
  const data = req.body;

  const [customer] = await db.query(
    "SELECT COUNT(*) FROM customer WHERE customer.email=?",
    [data.email]
  );
  const [seller] = await db.query(
    "SELECT COUNT(*) FROM seller WHERE seller.email=?",
    [data.email]
  );
  const [dev] = await db.query("SELECT COUNT(*) FROM dev WHERE dev.email=?", [
    data.email,
  ]);

  if (
    customer[0]["COUNT(*)"] > 0 ||
    seller[0]["COUNT(*)"] > 0 ||
    dev[0]["COUNT(*)"] > 0
  ) {
    res.redirect(`/403`);
  } else {
    // Generate verification code
    const verificationCode = generateVerificationCode();

    await db.query(
      "INSERT INTO `customer`(`email`, `password`,`name`, `adress1`, `adress2`, `city`, `state`, `zipcode`, `isVerified`, `verificationCode`) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [
        data.email,
        data.password,
        data.name,
        data.adress1,
        data.adress2,
        data.city,
        data.state,
        data.zip,
        false, // Set isVerified to false initially
        verificationCode,
      ]
    );
    // Send verification email
    const verificationLink = `http://localhost:3000/verify/customer/${verificationCode}`;
    const verificationCodeMessage = `Your verification code is: ${verificationCode}.`;
  
    // Define email options
    const mailOptions = {
      from: 'tashfinsami@gmail.com', // replace with your Gmail email
      to: data.email,
      subject: 'Email Verification',
      text: `Your verification code is: ${verificationCodeMessage}. Click the following link to verify your email: ${verificationLink}`,
    };
  
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
      res.redirect("/login");
    });
  }});

/* seller part................................................................................................................. */

app.post("/seller", async function (req, res) {
  const data = req.body;

  const [customer] = await db.query(
    "SELECT COUNT(*) FROM customer WHERE customer.email=?",
    [data.email1]
  );
  const [seller] = await db.query(
    "SELECT COUNT(*) FROM seller WHERE seller.email=?",
    [data.email1]
  );
  const [dev] = await db.query("SELECT COUNT(*) FROM dev WHERE dev.email=?", [
    data.email1,
  ]);

  if (
    customer[0]["COUNT(*)"] > 0 ||
    seller[0]["COUNT(*)"] > 0 ||
    dev[0]["COUNT(*)"] > 0
  ) {
    res.redirect(`/403`);
  } else {
    // Generate verification code
    const verificationCode = generateVerificationCode();

    await db.query(
      "INSERT INTO `seller`(`email`, `password`,`name`, `adress1`, `adress2`, `city`, `state`, `zipcode`, `isVerified`, `verificationCode`) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [
        data.email1,
        data.password1,
        data.name1,
        data.adress11,
        data.adress21,
        data.city1,
        data.state,
        data.zip1,
        false, // Set isVerified to false initially
        verificationCode,
      ]
    );
    // Send verification email
    const verificationLink = `http://localhost:3000/verify/seller/${verificationCode}`;
    const verificationCodeMessage = `Your verification code is: ${verificationCode}.`;
  
    // Define email options
    const mailOptions = {
      from: 'tashfinsami@gmail.com', // replace with your Gmail email
      to: data.email1,
      subject: 'Email Verification',
      text: `Your verification code is: ${verificationCodeMessage}. Click the following link to verify your email: ${verificationLink}`,
    };
  
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
      res.redirect("/login");
    });
  }
// Redirect to the verification page with necessary data

});


/* dev part................................................................................................................................... */
app.post("/dev", async function (req, res) {
  const data = req.body;

  const [customer] = await db.query(
    "SELECT COUNT(*) FROM customer WHERE customer.email=?",
    [data.email2]
  );
  const [seller] = await db.query(
    "SELECT COUNT(*) FROM seller WHERE seller.email=?",
    [data.email2]
  );
  const [dev] = await db.query("SELECT COUNT(*) FROM dev WHERE dev.email=?", [
    data.email2,
  ]);

  if (
    customer[0]["COUNT(*)"] > 0 ||
    seller[0]["COUNT(*)"] > 0 ||
    dev[0]["COUNT(*)"] > 0
  ) {
    res.redirect(`/403`);
  } else {
    // Generate verification code
    const verificationCode = generateVerificationCode();

    await db.query(
      "INSERT INTO `dev_approve`(`email`, `password`,`name`, `adress1`, `adress2`, `city`, `state`, `zipcode`, `isVerified`, `verificationCode`) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [
        data.email2,
        data.password2,
        data.name2,
        data.adress12,
        data.adress22,
        data.city2,
        data.state,
        data.zip2,
        false, // Set isVerified to false initially
        verificationCode,
      ]
    );
    // Send verification email
    const verificationLink = `http://localhost:3000/verify/dev_approve/${verificationCode}`;
    const verificationCodeMessage = `Your verification code is: ${verificationCode}.`;
  
    // Define email options
    const mailOptions = {
      from: 'tashfinsami@gmail.com', // replace with your Gmail email
      to: data.email2,
      subject: 'Email Verification',
      text: `Your verification code is: ${verificationCodeMessage}. Click the following link to verify your email: ${verificationLink}`,
    };
  
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
      res.redirect("/login");
    });
  }});

/* login handel part....................................................................................................................... */

app.post("/login", async function (req, res) {
  const data = req.body;

  const [customer] = await db.query(
    "SELECT ID, name, isVerified FROM customer WHERE customer.email=? AND customer.password=?",
    [data.enteredemail, data.enteredpassword]
  );

  const [seller] = await db.query(
    "SELECT ID, name, isVerified FROM seller WHERE seller.email=? AND seller.password=?",
    [data.enteredemail, data.enteredpassword]
  );

  const [dev] = await db.query(
    "SELECT ID, name, isVerified FROM dev WHERE dev.email=? AND dev.password=?",
    [data.enteredemail, data.enteredpassword]
  );

  let det = false;

  if (customer.length > 0 && customer[0].isVerified) {
    req.session.user = {
      id: customer[0].ID,
      name: customer[0].name,
      account_type: 'customer',
    };
    req.session.isAuthenticated = true;
    req.session.save(function () {
      res.redirect("/index_log");
    });
  } else if (seller.length > 0 && seller[0].isVerified) {
    req.session.user = {
      id: seller[0].ID,
      name: seller[0].name,
      account_type: 'seller',
    };
    req.session.isAuthenticated = true;
    req.session.save(function () {
      res.redirect("/seller");
    });
  } else if (dev.length > 0 && dev[0].isVerified) {
    req.session.user = {
      id: dev[0].ID,
      name: dev[0].name,
      account_type: 'dev',
    };
    req.session.isAuthenticated = true;
    req.session.save(function () {
      res.redirect("/dev");
    });
  } else {
    det = false;
    res.redirect("/login?det=" + det);
  }
});


// Email verification route
app.get("/verify/customer/:verificationCode", async function (req, res) {
  const verificationCode = req.params.verificationCode;

  try {
    await db.query('UPDATE customer SET isVerified = true WHERE verificationCode = ?', [verificationCode]);
    res.send('Email verified. You can now log in.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.get("/verify/seller/:verificationCode", async function (req, res) {
  const verificationCode = req.params.verificationCode;

  try {
    await db.query('UPDATE seller SET isVerified = true WHERE verificationCode = ?', [verificationCode]);
    res.send('Email verified. You can now log in.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.get("/verify/dev_approve/:verificationCode", async function (req, res) {
  const verificationCode = req.params.verificationCode;

  try {
    await db.query('UPDATE dev_approve SET isVerified = true WHERE verificationCode = ?', [verificationCode]);
    res.send('Email verified. You can now log in.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.post("/delp", async function (req, res) {
  const id = req.body.product_id;

  await db.query(`DELETE FROM products WHERE product_id=?`, [id]);
  res.redirect("/seller");
});


// Handle Verification Page Submission
app.post("/verify/:accountType", async function (req, res) {
  const { email, verificationCode, code } = req.body;
  const accountType = req.params.accountType;

  // Define the appropriate table name based on account type
  let tableName;
  switch (accountType) {
    case 'customer':
      tableName = 'customer';
      break;
    case 'seller':
      tableName = 'seller';
      break;
    case 'dev':
      tableName = 'dev';
      break;
    default:
      return res.status(400).send('Invalid account type');
  }

  // Verify the code
  if (code === verificationCode) {
    // Update the isVerified flag in the database
    await db.query(`UPDATE ${tableName} SET isVerified = true WHERE email = ?`, [email]);

    // Redirect to login or any other page
    res.redirect("/login");
  } else {
    // Code doesn't match, handle accordingly (e.g., show an error)
    res.render("verification_page", { accountType, email, verificationCode, error: "Invalid verification code" });
  }
});



const port = 3000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});