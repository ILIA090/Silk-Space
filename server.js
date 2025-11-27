const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// دیتابیس ساده فایل JSON
const dbPath = './database.json';
if(!fs.existsSync(dbPath)){
    fs.writeFileSync(dbPath, JSON.stringify({users:[], products:[]}, null, 2));
}

// ثبت‌نام
app.post('/signup', (req,res)=>{
    const {email,password} = req.body;
    const db = JSON.parse(fs.readFileSync(dbPath));
    if(db.users.find(u=>u.email===email)) return res.status(400).json({error:'ایمیل قبلا ثبت شده'});
    const user = {id: Date.now().toString(), email, password};
    db.users.push(user);
    fs.writeFileSync(dbPath, JSON.stringify(db,null,2));
    res.json({message:'ثبت نام موفق', user});
});

// ورود
app.post('/login', (req,res)=>{
    const {email,password} = req.body;
    const db = JSON.parse(fs.readFileSync(dbPath));
    const user = db.users.find(u=>u.email===email && u.password===password);
    if(!user) return res.status(400).json({error:'ایمیل یا رمز اشتباه'});
    res.json({message:'ورود موفق', user});
});

// افزودن محصول
app.post('/product', (req,res)=>{
    const {title, description, image, owner_id} = req.body;
    const db = JSON.parse(fs.readFileSync(dbPath));
    const product = {id: Date.now().toString(), title, description, image, owner_id, created_at: new Date()};
    db.products.push(product);
    fs.writeFileSync(dbPath, JSON.stringify(db,null,2));
    res.json({message:'محصول ذخیره شد', product});
});

// دریافت محصولات
app.get('/products', (req,res)=>{
    const db = JSON.parse(fs.readFileSync(dbPath));
    res.json(db.products);
});

app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));