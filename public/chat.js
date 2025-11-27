const SERVER_URL = 'https://silk-space-v2.onrender.com';

// المان‌ها
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const profileBtn = document.getElementById('profileBtn');
const chatsBtn = document.getElementById('chatsBtn');

const authSection = document.getElementById('auth');
const homeSection = document.getElementById('home');
const addProductForm = document.getElementById('addProductForm');
const profileForm = document.getElementById('profileForm');
const chatSection = document.getElementById('chatSection');

const productTitle = document.getElementById('productTitle');
const productDesc = document.getElementById('productDesc');
const productImage = document.getElementById('productImage');
const saveProductBtn = document.getElementById('saveProductBtn');
const cancelProductBtn = document.getElementById('cancelProductBtn');

const profileName = document.getElementById('profileName');
const profileDesc = document.getElementById('profileDesc');
const profileAvatar = document.getElementById('profileAvatar');
const saveProfileBtn = document.getElementById('saveProfileBtn');

const chatList = document.getElementById('chatList');
const chatMessage = document.getElementById('chatMessage');
const sendChatBtn = document.getElementById('sendChatBtn');

let currentUser = null;

// بررسی ورود قبلی
window.onload = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if(user){
    currentUser = user;
    showHome();
    loadProducts();
  }
};

function showHome(){
  authSection.style.display = 'none';
  homeSection.style.display = 'block';
  logoutBtn.style.display = 'inline';
  profileBtn.style.display = 'inline';
  chatsBtn.style.display = 'inline';
}

// ثبت نام
signupBtn.onclick = async () => {
  const username = usernameInput.value;
  const password = passwordInput.value;
  if(!username || !password){ alert('همه فیلدها لازم است'); return; }
  const res = await fetch(`${SERVER_URL}/signup`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({username,password})
  });
  const data = await res.json();
  if(data.error) alert(data.error);
  else {
    currentUser = data;
    localStorage.setItem('user', JSON.stringify(currentUser));
    showHome();
    loadProducts();
  }
};

// ورود
loginBtn.onclick = async () => {
  const username = usernameInput.value;
  const password = passwordInput.value;
  if(!username || !password){ alert('همه فیلدها لازم است'); return; }
  const res = await fetch(`${SERVER_URL}/login`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({username,password})
  });
  const data = await res.json();
  if(data.error) alert(data.error);
  else {
    currentUser = data;
    localStorage.setItem('user', JSON.stringify(currentUser));
    showHome();
    loadProducts();
  }
};

// خروج
logoutBtn.onclick = () => {
  localStorage.removeItem('user');
  location.reload();
};

// باز و بستن فرم‌ها
document.getElementById('addProductBtn').onclick = () => { addProductForm.style.display='block'; }
cancelProductBtn.onclick = () => addProductForm.style.display='none';
profileBtn.onclick = () => profileForm.style.display='block';
saveProfileBtn.onclick = saveProfile;
chatsBtn.onclick = () => { chatSection.style.display='block'; loadChats(); }

// ذخیره محصول
saveProductBtn.onclick = async () => {
  const title = productTitle.value;
  const desc = productDesc.value;
  const image = productImage.files[0];
  if(!title){ alert('عنوان لازم است'); return; }
  const formData = new FormData();
  formData.append('title', title);
  formData.append('desc', desc);
  if(image) formData.append('image', image);
  const res = await fetch(`${SERVER_URL}/addProduct/${currentUser.id}`, {
    method:'POST', body: formData
  });
  const data = await res.json();
  if(data.error) alert(data.error);
  else {
    addProductForm.style.display='none';
    productTitle.value=''; productDesc.value=''; productImage.value='';
    loadProducts();
  }
};

// بارگذاری محصولات
async function loadProducts(){
  const res = await fetch(`${SERVER_URL}/products`);
  const products = await res.json();
  const productsDiv = document.getElementById('products');
  productsDiv.innerHTML='';
  products.forEach(p=>{
    const div = document.createElement('div');
    div.innerHTML=`<strong>${p.title}</strong><br>${p.desc || ''}`;
    if(p.image) div.innerHTML+=`<br><img src="${SERVER_URL}${p.image}" width="100">`;
    productsDiv.appendChild(div);
  });
}

// ذخیره پروفایل
async function saveProfile(){
  const formData = new FormData();
  if(profileName.value) formData.append('username', profileName.value);
  if(profileDesc.value) formData.append('description', profileDesc.value);
  if(profileAvatar.files[0]) formData.append('avatar', profileAvatar.files[0]);
  const res = await fetch(`${SERVER_URL}/updateUser/${currentUser.id}`, {
    method:'POST', body: formData
  });
  const data = await res.json();
  if(data.error) alert(data.error);
  else {
    currentUser = data;
    localStorage.setItem('user', JSON.stringify(currentUser));
    profileForm.style.display='none';
    alert('پروفایل شما بروزرسانی شد');
  }
}

// چت
sendChatBtn.onclick = async () => {
  const text = chatMessage.value;
  if(!text){ alert('پیام نمی‌تواند خالی باشد'); return; }
  const toUserId = prompt('پیام برای کدام کاربر؟ وارد کنید:');
  const res = await fetch(`${SERVER_URL}/sendMessage`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({from: currentUser.id, to: toUserId, text})
  });
  const data = await res.json();
  chatMessage.value='';
  loadChats();
}

async function loadChats(){
  const res = await fetch(`${SERVER_URL}/getMessages/${currentUser.id}`);
  const messages = await res.json();
  chatList.innerHTML='';
  messages.forEach(m=>{
    const div = document.createElement('div');
    div.textContent = `${m.from===currentUser.id?'شما':'کاربر '+m.from}: ${m.text}`;
    chatList.appendChild(div);
  });
      }
