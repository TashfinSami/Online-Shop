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

	try{
		
  
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
	}catch{ res.redirect("index")}
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

	try{
const [allproducts] = await db.query(`SELECT * FROM PRODUCTS`);

  res.render("index", { allproducts: allproducts });
	}catch{
		const allproducts{
                 image_add:'data:image/jpeg;base64,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',
	         p_name:'Shoe',
	         price:'750'
		}
  res.render("index", { allproducts: allproducts });
	}
  
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
