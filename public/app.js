const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// فایل DB
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

// خواندن و نوشتن DB
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
  if(db.users.find(u=>u.username===username)) return res.json({error:'کاربر قبلاً وجود دارد'});
  const newUser = {id:Date.now().toString(), username, password, avatar:null, description:''};
  db.users.push(newUser);
  saveDB(db);
  res.json({ok:true, user:newUser});
});

app.post('/login', (req,res)=>{
  const { username, password, id } = req.body;
  const db = loadDB();
  let user = null;
  if(id) user = db.users.find(u=>u.id===id);
  else user = db.users.find(u=>u.username===username && u.password===password);
  if(!user) return res.json({error:'کاربر یا رمز اشتباه است'});
  res.json(user);
});

// ویرایش پروفایل
app.post('/editProfile/:id', upload.single('avatar'), (req,res)=>{
  const db = loadDB();
  const user = db.users.find(u=>u.id===req.params.id);
  if(!user) return res.json({error:'کاربر پیدا نشد'});
  if(req.body.username) user.username = req.body.username;
  if(req.body.description) user.description = req.body.description;
  if(req.file) user.avatar = `/uploads/${req.file.filename}`;
  saveDB(db);
  res.json({ok:true});
});

app.get('/getUser/:id', (req,res)=>{
  const db = loadDB();
  const user = db.users.find(u=>u.id===req.params.id);
  if(!user) return res.json({error:'کاربر پیدا نشد'});
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
  res.json({ok:true});
});

app.get('/products', (req,res)=>{
  const db = loadDB();
  res.json(db.products);
});

app.delete('/deleteProduct/:id/:userId', (req,res)=>{
  const db = loadDB();
  const index = db.products.findIndex(p=>p.id===req.params.id && p.owner===req.params.userId);
  if(index===-1) return res.json({error:'محصول پیدا نشد یا اجازه حذف ندارید'});
  db.products.splice(index,1);
  saveDB(db);
  res.json({ok:true});
});

// ===== چت =====
app.post('/sendMessage', (req,res)=>{
  const { from_id, to_id, msg } = req.body;
  if(!from_id || !to_id || !msg) return res.json({error:'فیلدها ناقص هستند'});
  const db = loadDB();
  db.messages.push({from_id,to_id,msg,created_at:new Date().toISOString()});
  saveDB(db);
  res.json({ok:true});
});

app.get('/getMessages/:user1/:user2', (req,res)=>{
  const db = loadDB();
  const msgs = db.messages.filter(m=>
    (m.from_id===req.params.user1 && m.to_id===req.params.user2) ||
    (m.from_id===req.params.user2 && m.to_id===req.params.user1)
  );
  res.json(msgs);
});

app.get('/myChats/:id', (req,res)=>{
  const db = loadDB();
  const users = db.messages
    .filter(m=>m.from_id===req.params.id || m.to_id===req.params.id)
    .map(m=>m.from_id===req.params.id? m.to_id : m.from_id)
    .filter((v,i,a)=>a.indexOf(v)===i)
    .map(uid=>db.users.find(u=>u.id===uid));
  res.json(users);
});

// ===== شروع سرور =====
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
