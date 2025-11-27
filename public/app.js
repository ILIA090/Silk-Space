const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

const DB_FILE = 'database.json';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// آپلود عکس
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// DB
function loadDB() {
  if(!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({users:[], products:[], messages:[]}, null,2));
  return JSON.parse(fs.readFileSync(DB_FILE));
}
function saveDB(db) { fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2)); }

// ===== کاربران =====
app.post('/signup', (req,res)=>{
  const { username, password } = req.body;
  if(!username || !password) return res.json({error:'فیلدها ناقص هستند'});
  const db = loadDB();
  if(db.users.find(u=>u.username===username)) return res.json({error:'نام کاربری قبلا استفاده شده'});
  const newUser = {id:Date.now().toString(), username, password, avatar:null, description:''};
  db.users.push(newUser);
  saveDB(db);
  res.json(newUser);
});

app.post('/login', (req,res)=>{
  const { username, password } = req.body;
  const db = loadDB();
  const user = db.users.find(u=>u.username===username && u.password===password);
  if(!user) return res.json({error:'نام کاربری یا رمز اشتباه است'});
  res.json(user);
});

// ===== بروزرسانی پروفایل =====
app.post('/updateUser/:userId', upload.single('avatar'), (req,res)=>{
  const db = loadDB();
  const user = db.users.find(u=>u.id===req.params.userId);
  if(!user) return res.json({error:'کاربر پیدا نشد'});
  if(req.body.username) user.username = req.body.username;
  if(req.body.description) user.description = req.body.description;
  if(req.file) user.avatar = `/uploads/${req.file.filename}`;
  saveDB(db);
  res.json(user);
});

// ===== محصولات =====
app.post('/addProduct/:ownerId', upload.single('image'), (req,res)=>{
  const db = loadDB();
  const owner = db.users.find(u=>u.id===req.params.ownerId);
  if(!owner) return res.json({error:'کاربر وجود ندارد'});
  const newProduct = {
    id: Date.now().toString(),
    title: req.body.title,
    desc: req.body.desc,
    image: req.file ? `/uploads/${req.file.filename}` : null,
    owner: owner.id,
    created_at: new Date().toISOString()
  };
  db.products.push(newProduct);
  saveDB(db);
  res.json(newProduct);
});

app.get('/products', (req,res)=>{
  const db = loadDB();
  res.json(db.products);
});

// ===== حذف محصول =====
app.delete('/deleteProduct/:productId/:userId', (req,res)=>{
  const db = loadDB();
  const product = db.products.find(p=>p.id===req.params.productId);
  if(!product) return res.json({error:'محصول پیدا نشد'});
  if(product.owner !== req.params.userId) return res.json({error:'حق حذف ندارید'});
  db.products = db.products.filter(p=>p.id!==req.params.productId);
  saveDB(db);
  res.json({success:true});
});

// ===== چت =====
app.post('/sendMessage', (req,res)=>{
  const { from, to, text } = req.body;
  if(!from || !to || !text) return res.json({error:'فیلدها ناقص'});
  const db = loadDB();
  const newMsg = {id:Date.now().toString(), from, to, text, created_at: new Date().toISOString()};
  db.messages.push(newMsg);
  saveDB(db);
  res.json(newMsg);
});

app.get('/getMessages/:userId', (req,res)=>{
  const db = loadDB();
  const msgs = db.messages.filter(m=>m.from===req.params.userId || m.to===req.params.userId);
  res.json(msgs);
});

// ===== شروع سرور =====
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
