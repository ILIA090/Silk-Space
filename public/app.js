const express = require('express');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

// پوشه آپلود عکس
if(!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// تنظیم ذخیره‌سازی multer
const storage = multer.diskStorage({
  destination: (req,file,cb)=> cb(null,'uploads/'),
  filename: (req,file,cb)=> cb(null,Date.now()+'-'+file.originalname)
});
const upload = multer({storage});

// خواندن دیتابیس
function readDB(){
  if(!fs.existsSync('database.json')){
    fs.writeFileSync('database.json',JSON.stringify({users:[],products:[],messages:[]},null,2));
  }
  return JSON.parse(fs.readFileSync('database.json'));
}

// نوشتن دیتابیس
function writeDB(db){
  fs.writeFileSync('database.json',JSON.stringify(db,null,2));
}

// ثبت نام
app.post('/signup',(req,res)=>{
  const {username,password} = req.body;
  const db = readDB();
  if(!username || !password) return res.json({error:'همه فیلدها لازم است'});
  if(db.users.find(u=>u.username===username)) return res.json({error:'کاربر موجود است'});
  const newUser = {id:Date.now().toString(), username, password, desc:'', image:''};
  db.users.push(newUser);
  writeDB(db);
  res.json({ok:true});
});

// ورود
app.post('/login',(req,res)=>{
  const {username,password} = req.body;
  const db = readDB();
  const user = db.users.find(u=>u.username===username && u.password===password);
  if(!user) return res.json({error:'نام کاربری یا رمز عبور اشتباه است'});
  res.json(user);
});

// ویرایش پروفایل
app.post('/editProfile/:id', upload.single('image'), (req,res)=>{
  const db = readDB();
  const user = db.users.find(u=>u.id===req.params.id);
  if(!user) return res.json({error:'کاربر پیدا نشد'});
  if(req.body.username) user.username = req.body.username;
  if(req.body.desc) user.desc = req.body.desc;
  if(req.file) user.image = '/uploads/'+req.file.filename;
  writeDB(db);
  res.json(user);
});

// افزودن محصول
app.post('/addProduct/:id', upload.single('image'), (req,res)=>{
  const db = readDB();
  const user = db.users.find(u=>u.id===req.params.id);
  if(!user) return res.json({error:'کاربر پیدا نشد'});
  const {title,desc} = req.body;
  const newProduct = {id:Date.now().toString(), title, desc, image:req.file?'/uploads/'+req.file.filename:'', owner:user.id};
  db.products.push(newProduct);
  writeDB(db);
  res.json({ok:true});
});

// حذف محصول
app.delete('/deleteProduct/:pid/:uid',(req,res)=>{
  const db = readDB();
  const index = db.products.findIndex(p=>p.id===req.params.pid && p.owner===req.params.uid);
  if(index===-1) return res.json({error:'محصول پیدا نشد یا اجازه ندارید'});
  db.products.splice(index,1);
  writeDB(db);
  res.json({ok:true});
});

// گرفتن محصولات
app.get('/products',(req,res)=>{
  const db = readDB();
  res.json(db.products);
});

// ارسال پیام
app.post('/sendMessage',(req,res)=>{
  const {from_id,to_id,msg} = req.body;
  const db = readDB();
  db.messages.push({id:Date.now().toString(),from_id,to_id,msg});
  writeDB(db);
  res.json({ok:true});
});

// دریافت پیام‌ها بین دو کاربر
app.get('/getMessages/:uid/:otherId',(req,res)=>{
  const db = readDB();
  const msgs = db.messages.filter(m=>
    (m.from_id===req.params.uid && m.to_id===req.params.otherId) ||
    (m.from_id===req.params.otherId && m.to_id===req.params.uid)
  );
  res.json(msgs);
});

// دریافت لیست کاربران که چت کردید
app.get('/myChats/:uid',(req,res)=>{
  const db = readDB();
  const chats = db.messages.filter(m=>m.from_id===req.params.uid || m.to_id===req.params.uid)
    .map(m=>m.from_id===req.params.uid?m.to_id:m.from_id);
  const uniqueUsers = [...new Set(chats)].map(id=>db.users.find(u=>u.id===id));
  res.json(uniqueUsers);
});

app.listen(PORT,()=> console.log('Server running on port',PORT));
