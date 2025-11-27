const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use('/images', express.static(path.join(__dirname, '/images')));

// مدیریت فایل‌ها برای آپلود
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'images/'),
    filename: (req, file, cb) => cb(null, Date.now()+'-'+file.originalname)
});
const upload = multer({storage});

// خواندن و نوشتن دیتابیس
const dbFile = path.join(__dirname, 'database.json');
function readDB(){ return JSON.parse(fs.readFileSync(dbFile)); }
function writeDB(data){ fs.writeFileSync(dbFile, JSON.stringify(data,null,2)); }

// مسیر ثبت‌نام / ورود
app.post('/signup', (req,res)=>{
    const {username,password} = req.body;
    const db = readDB();
    if(db.users.find(u=>u.username===username)) return res.status(400).json({error:'نام کاربری وجود دارد'});
    const id = Date.now().toString();
    const user = {id,username,password,desc:'',avatar:''};
    db.users.push(user);
    writeDB(db);
    res.json(user);
});

app.post('/login', (req,res)=>{
    const {username,password} = req.body;
    const db = readDB();
    const user = db.users.find(u=>u.username===username && u.password===password);
    if(!user) return res.status(400).json({error:'نام کاربری یا رمز اشتباه است'});
    res.json(user);
});

// پروفایل
app.post('/updateProfile/:id', upload.single('avatar'), (req,res)=>{
    const id = req.params.id;
    const {username,desc} = req.body;
    const db = readDB();
    const user = db.users.find(u=>u.id===id);
    if(!user) return res.status(400).json({error:'کاربر یافت نشد'});
    if(username) user.username = username;
    if(desc) user.desc = desc;
    if(req.file) user.avatar = '/images/'+req.file.filename;
    writeDB(db);
    res.json(user);
});

// محصولات
app.post('/addProduct/:userId', upload.single('image'), (req,res)=>{
    const {title,desc} = req.body;
    const userId = req.params.userId;
    const db = readDB();
    const id = Date.now().toString();
    const imgPath = req.file ? '/images/'+req.file.filename : '';
    db.products.push({id,title,desc,image:imgPath,owner:userId});
    writeDB(db);
    res.json({status:'ok'});
});

app.get('/products', (req,res)=>{
    const db = readDB();
    res.json(db.products);
});

app.delete('/deleteProduct/:id/:userId', (req,res)=>{
    const {id,userId} = req.params;
    const db = readDB();
    const product = db.products.find(p=>p.id===id);
    if(!product) return res.status(400).json({error:'محصول یافت نشد'});
    if(product.owner!==userId) return res.status(403).json({error:'دسترسی ندارید'});
    db.products = db.products.filter(p=>p.id!==id);
    writeDB(db);
    res.json({status:'ok'});
});

// چت
app.post('/sendMessage', (req,res)=>{
    const {from_id,to_id,msg} = req.body;
    const db = readDB();
    db.messages.push({from_id,to_id,msg,time:Date.now()});
    writeDB(db);
    res.json({status:'ok'});
});

app.get('/myChats/:userId',(req,res)=>{
    const userId = req.params.userId;
    const db = readDB();
    const msgs = db.messages;
    const chatUsers = [];
    msgs.forEach(m=>{
        if(m.from_id===userId && !chatUsers.find(u=>u.id===m.to_id)){
            const u = db.users.find(u=>u.id===m.to_id);
            if(u) chatUsers.push(u);
        }
        if(m.to_id===userId && !chatUsers.find(u=>u.id===m.from_id)){
            const u = db.users.find(u=>u.id===m.from_id);
            if(u) chatUsers.push(u);
        }
    });
    res.json(chatUsers);
});

app.get('/getMessages/:user1/:user2',(req,res)=>{
    const {user1,user2} = req.params;
    const db = readDB();
    const msgs = db.messages.filter(m=> 
        (m.from_id===user1 && m.to_id===user2) || 
        (m.from_id===user2 && m.to_id===user1)
    );
    res.json(msgs);
});

app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
