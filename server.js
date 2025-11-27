const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// فایل دیتابیس
const dbPath = './database.json';
if(!fs.existsSync(dbPath)){
    fs.writeFileSync(dbPath, JSON.stringify({users:[], products:[], messages:[]}, null, 2));
}

// تنظیم multer برای آپلود عکس
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

// ثبت‌نام
app.post('/signup', (req,res)=>{
    const {username,email,password} = req.body;
    const db = JSON.parse(fs.readFileSync(dbPath));
    if(db.users.find(u=>u.email===email || u.username===username))
        return res.status(400).json({error:'ایمیل یا نام کاربری قبلا استفاده شده'});
    const user = {id: Date.now().toString(), username, email, password, profilePic:'', description:''};
    db.users.push(user);
    fs.writeFileSync(dbPath, JSON.stringify(db,null,2));
    res.json({message:'ثبت نام موفق', user});
});

// ورود
app.post('/login', (req,res)=>{
    const {login,password} = req.body; // login می‌تواند ایمیل یا نام کاربری باشد
    const db = JSON.parse(fs.readFileSync(dbPath));
    const user = db.users.find(u=>(u.email===login || u.username===login) && u.password===password);
    if(!user) return res.status(400).json({error:'نام کاربری یا رمز اشتباه'});
    res.json({message:'ورود موفق', user});
});

// آپلود عکس پروفایل
app.post('/uploadProfile', upload.single('profilePic'), (req,res)=>{
    const {userId} = req.body;
    const db = JSON.parse(fs.readFileSync(dbPath));
    const user = db.users.find(u=>u.id===userId);
    if(!user) return res.status(400).json({error:'کاربر پیدا نشد'});
    user.profilePic = req.file ? '/uploads/' + req.file.filename : '';
    fs.writeFileSync(dbPath, JSON.stringify(db,null,2));
    res.json({message:'عکس پروفایل آپدیت شد', profilePic:user.profilePic});
});

// آپلود محصول
app.post('/product', upload.single('image'), (req,res)=>{
    const {title, description, owner_id} = req.body;
    const db = JSON.parse(fs.readFileSync(dbPath));
    const product = {
        id: Date.now().toString(),
        title,
        description,
        image: req.file ? '/uploads/' + req.file.filename : '',
        owner_id,
        created_at: new Date()
    };
    db.products.push(product);
    fs.writeFileSync(dbPath, JSON.stringify(db,null,2));
    res.json({message:'محصول ذخیره شد', product});
});

// حذف محصول
app.post('/deleteProduct', (req,res)=>{
    const {productId, userId} = req.body;
    const db = JSON.parse(fs.readFileSync(dbPath));
    const product = db.products.find(p=>p.id===productId);
    if(!product) return res.status(400).json({error:'محصول پیدا نشد'});
    if(product.owner_id !== userId) return res.status(403).json({error:'شما مالک این محصول نیستید'});
    db.products = db.products.filter(p=>p.id!==productId);
    fs.writeFileSync(dbPath, JSON.stringify(db,null,2));
    res.json({message:'محصول حذف شد'});
});

// دریافت محصولات
app.get('/products', (req,res)=>{
    const db = JSON.parse(fs.readFileSync(dbPath));
    res.json(db.products);
});

// ذخیره پیام‌ها (چت)
app.post('/message', (req,res)=>{
    const {from_id, to_id, message} = req.body;
    const db = JSON.parse(fs.readFileSync(dbPath));
    db.messages.push({from_id, to_id, message, timestamp: new Date()});
    fs.writeFileSync(dbPath, JSON.stringify(db,null,2));
    res.json({message:'پیام ذخیره شد'});
});

// دریافت پیام‌ها بین دو کاربر
app.get('/messages/:user1/:user2', (req,res)=>{
    const {user1,user2} = req.params;
    const db = JSON.parse(fs.readFileSync(dbPath));
    const msgs = db.messages.filter(m=> 
        (m.from_id===user1 && m.to_id===user2) || (m.from_id===user2 && m.to_id===user1)
    );
    res.json(msgs);
});

app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));