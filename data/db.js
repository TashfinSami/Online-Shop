const mysql=require('mysql2/promise');
const pool=mysql.createPool({
    host:'localhost',
    database:'onlineshop',
    user:'root',
    password:''
});
module.exports=pool;