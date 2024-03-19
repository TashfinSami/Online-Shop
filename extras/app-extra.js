const express = require("express");
const path = require("path");
const session = require('express-session');
const app = express();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploadedImage");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
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
    maxAge: 30 * 24 * 60 * 60 * 1000
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
const db = require("../data/db");

/* ........................................................................................................ */

/* All get req.......................................................................................... */
app.get("/", function (req, res) {
  if (!req.session.isAuthenticated) {
    res.redirect("index");
  } else {
    res.redirect("index_log");
  }
});

app.get("/index_log", async function (req, res) {
  
  if (!req.session.isAuthenticated || req.session.user.account_type!='customer') {
    console.log(req.session.user)
    return res.send(`<h1> Sing Up </h1>`);
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
    return res.send(`<h1> Sing Up </h1>`);
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
    return res.send(`<h1> Sing Up </h1>`);
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
  INNER JOIN customer ON orders.customer_id = customer.id;
  `);
  const [data2] = await db.query(`SELECT s.*
  FROM seller s
  INNER JOIN products p ON s.ID = p.seller_id
  INNER JOIN orders o ON p.product_id = o.product_id;
  
  
  `);

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
    `SELECT s.*
  FROM seller s 
  
  INNER JOIN products p ON s.ID = p.seller_id
  INNER JOIN orders o ON p.product_id = o.product_id
  WHERE customer_id=?;
  `,
    [s_id]
  );

  res.render("s_order", { alldata: data1 });
});

/* end of all get req................................................................................................... */

/* all post req....................................................................................................................... */
app.post("/addproduct", upload.single("image"), async function (req, res) {
  const filepath = req.file.filename;
  const data = req.body;
  const id = req.session.user.id;

  await db.query(
    `INSERT INTO products (seller_id, name, price, Details, image_add)
    VALUES (?,?,?,?,?)`,
    [id, data.product_name, data.product_price, data.product_details, filepath]
  );

  res.redirect("/seller");
});

app.post("/logout", function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated= null;

  res.redirect("/index");
});
app.post("/accept", async function (req, res) {
  const id = req.body.devId;
  const [copyData] = await db.query(
    `SELECT email,password,name,adress1,adress2,city,state,zipcode FROM dev_approve WHERE ID=?`,
    [id]
  );
  const { email, password, name, adress1, adress2, city, state, zipcode } =
    copyData[0];

  await db.query(
    `INSERT INTO dev(email, password, name, adress1, adress2, city, state, zipcode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [email, password, name, adress1, adress2, city, state, zipcode]
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
  const { name, price, Details, image_add } = cartData[0];
  console.log(Details);
  await db.query(
    `INSERT INTO cart (name, price, Details, image_add, customer_id,product_id) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, price, Details, image_add, ID, id]
  );
  res.json("done");
});

app.post("/search", async function (req, res) {
  const search = req.body.searchItem;
  const [searchitem] = await db.query(
    'SELECT * FROM products WHERE CONCAT_WS(" ", name) LIKE CONCAT("%", ?, "%")',
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
    'SELECT * FROM products WHERE CONCAT_WS(" ", name) LIKE CONCAT("%", ?, "%")',
    [search]
  );

  res.render("searchitemlog", { searchitem: searchitem });
});

app.post("/placeOrder", async function (req, res) {
  const data = req.body;
  const customer_id = req.session.user.id;
  await db.query(
    `INSERT INTO orders(product_id,quantity,customer_id) VALUES (?,?,?)`,
    [data.product_id, data.kaka, customer_id]
  );
  await db.query("DELETE FROM `cart` WHERE `cart`.`product_id` = ?", [
    data.product_id,
  ]);

  res.redirect("cart");
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
    await db.query(
      "INSERT INTO `customer`(`email`, `password`,`name`, `adress1`, `adress2`, `city`, `state`, `zipcode`) VALUES (?,?,?,?,?,?,?,?)",
      [
        data.email,
        data.password,
        data.name,
        data.adress1,
        data.adress2,
        data.city,
        data.state,
        data.zip,
      ]
    );
    res.redirect("/login");
  }
});
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
    await db.query(
      "INSERT INTO `seller`(`email`, `password`,`name`, `adress1`, `adress2`, `city`, `state`, `zipcode`) VALUES (?,?,?,?,?,?,?,?)",
      [
        data.email1,
        data.password1,
        data.name1,
        data.adress11,
        data.adress21,
        data.city1,
        data.state1,
        data.zip1,
      ]
    );

    res.redirect("/login");
  }
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
    await db.query(
      "INSERT INTO `dev_approve`(`email`, `password`,`name`, `adress1`, `adress2`, `city`, `state`, `zipcode`) VALUES (?,?,?,?,?,?,?,?)",
      [
        data.email2,
        data.password2,
        data.name2,
        data.adress12,
        data.adress22,
        data.city2,
        data.state2,
        data.zip2,
      ]
    );
    res.redirect("/login");
  }
});

/* login handel part....................................................................................................................... */

app.post("/login", async function (req, res) {
  const data = req.body;

  const [customer] = await db.query(
    "SELECT COUNT(*) FROM customer WHERE customer.email=? AND customer.password=?",
    [data.enteredemail, data.enteredpassword]
  );
  const [seller] = await db.query(
    "SELECT COUNT(*) FROM seller WHERE seller.email=? AND seller.password=?",
    [data.enteredemail, data.enteredpassword]
  );
  const [dev] = await db.query(
    "SELECT COUNT(*) FROM dev WHERE dev.email=? AND dev.password=?",
    [data.enteredemail, data.enteredpassword]
  );
  let det = false;
  if (customer[0]["COUNT(*)"] > 0) {
    const [existingcustomer] = await db.query(
      `SELECT ID,name FROM customer WHERE customer.email=? AND customer.password=?`,
      [data.enteredemail, data.enteredpassword]
    );
    req.session.user = {
      id: existingcustomer[0].ID,
      name: existingcustomer[0].name,
      account_type: 'customer'
    };
    req.session.isAuthenticated = true;
    req.session.save(function () {
      res.redirect("/index_log");
    });
  } else if (seller[0]["COUNT(*)"] > 0) {
    const [existingseller] = await db.query(
      `SELECT ID,name FROM seller WHERE seller.email=? AND seller.password=?`,
      [data.enteredemail, data.enteredpassword]
    );
    req.session.user = {
      id: existingseller[0].ID,
      name: existingseller[0].name,
      account_type: 'seller'
    };
    const ses = req.session.user;

    req.session.isAuthenticated = true;
    req.session.save(function () {
      console.log(req.session.isAuthenticated);
      res.redirect(`/seller`);
    });
  } else if (dev[0]["COUNT(*)"] > 0) {
    const [existingDev] = await db.query(
      `SELECT ID,name FROM dev WHERE dev.email=? AND dev.password=?`,
      [data.enteredemail, data.enteredpassword]
    );

    req.session.user = {
      id: existingDev[0].ID,
      name: existingDev[0].name,
      account_type: 'dev'
    };
    const ses = req.session.user;

    req.session.isAuthenticated = true;
    req.session.save(function () {
      res.redirect(`/dev`);
    });
  } else {
    det = true;
    res.redirect("/login?det=" + det);
  }
});

app.post("/delp", async function (req, res) {
  const id = req.body.product_id;

  await db.query(`DELETE FROM products WHERE product_id=?`, [id]);
  res.redirect("/seller");
});


app.listen(3000);
