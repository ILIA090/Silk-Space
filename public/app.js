const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer برای آپلود فایل
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage });

// فایل دیتابیس
const DB_FILE = 'database.json';
if(!fs.existsSync(DB_FILE)){
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], products: [], messages: [] }, null, 2));
}

// کمک‌کننده برای خواندن/نوشتن DB
function readDB(){ return JSON.parse(fs.readFileSync(DB_FILE)); }
function writeDB(db){ fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

// ثبت نام
app.post('/signup', (req,res)=>{
  const { username, password, email } = req.body;
  const db = readDB();
  if(db.users.find(u=>u.username===username || u.email===email)) return res.json({ error:'این نام یا ایمیل قبلا ثبت شده' });
  const newUser = { id: Date.now().toString(), username, email: email||null, password, description:'', avatar:null };
  db.users.push(newUser);
  writeDB(db);
  res.json(newUser);
});

// ورود
app.post('/login', (req,res)=>{
  const { username, password, email } = req.body;
  const db = readDB();
  const user = db.users.find(u=> (u.username===username || u.email===email) && u.password===password );
  if(!user) return res.json({ error:'نام کاربری یا رمز عبور اشتباه است' });
  res.json(user);
});

// آپلود محصول
app.post('/addProduct/:userId', upload.single('image'), (req,res)=>{
  const db = readDB();
  const user = db.users.find(u=>u.id===req.params.userId);
  if(!user) return res.json({ error:'کاربر پیدا نشد' });

  const { title, desc } = req.body;
  if(!title) return res.json({ error:'عنوان لازم است' });

  const image = req.file ? '/uploads/'+req.file.filename : null;
  db.products.push({ id: Date.now().toString(), ownerId:user.id, title, desc, image });
  writeDB(db);
  res.json({ success:true });
});

// لیست محصولات
app.get('/products', (req,res)=>{
  const db = readDB();
  res.json(db.products);
});

// حذف محصول
app.delete('/deleteProduct/:productId/:userId', (req,res)=>{
  const db = readDB();
  const idx = db.products.findIndex(p=>p.id===req.params.productId && p.ownerId===req.params.userId);
  if(idx===-1) return res.json({ error:'محصول پیدا نشد یا دسترسی ندارید' });
  db.products.splice(idx,1);
  writeDB(db);
  res.json({ success:true });
});

// آپدیت پروفایل
app.post('/updateUser/:userId', upload.single('avatar'), (req,res)=>{
  const db = readDB();
  const user = db.users.find(u=>u.id===req.params.userId);
  if(!user) return res.json({ error:'کاربر پیدا نشد' });

  const { username, description } = req.body;
  if(username) user.username = username;
  if(description) user.description = description;
  if(req.file) user.avatar = '/uploads/'+req.file.filename;

  writeDB(db);
  res.json(user);
});

// ارسال پیام
app.post('/sendMessage', (req,res)=>{
  const { from, to, text } = req.body;
  if(!from || !to || !text) return res.json({ error:'اطلاعات ناقص است' });
  const db = readDB();
  db.messages.push({ id: Date.now().toString(), from, to, text });
  writeDB(db);
  res.json({ success:true });
});

// گرفتن پیام‌ها برای کاربر
app.get('/getMessages/:userId', (req,res)=>{
  const db = readDB();
  const messages = db.messages.filter(m=>m.from===req.params.userId || m.to===req.params.userId);
  res.json(messages);
});

// گرفتن پروفایل هر کاربر
app.get('/getUser/:userId', (req,res)=>{
  const db = readDB();
  const user = db.users.find(u=>u.id===req.params.userId);
  if(!user) return res.json({ error:'کاربر پیدا نشد' });
  res.json(user);
});

// شروع سرور
app.listen(PORT, ()=>{
  console.log('Server running on port', PORT);
});
