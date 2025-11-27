const SERVER_URL = 'https://silk-space-v2.onrender.com';

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

const authSection = document.getElementById('auth');
const homeSection = document.getElementById('home');
const productsDiv = document.getElementById('products');

const addProductBtn = document.getElementById('addProductBtn');
const addProductForm = document.getElementById('addProductForm');
const saveProductBtn = document.getElementById('saveProductBtn');
const cancelProductBtn = document.getElementById('cancelProductBtn');
const productTitle = document.getElementById('productTitle');
const productDesc = document.getElementById('productDesc');
const productImage = document.getElementById('productImage');

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

// افزودن محصول
addProductBtn.onclick = () => addProductForm.style.display = 'block';
cancelProductBtn.onclick = () => addProductForm.style.display = 'none';

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
    method:'POST',
    body: formData
  });
  const data = await res.json();
  if(data.error) alert(data.error);
  else {
    addProductForm.style.display = 'none';
    productTitle.value = '';
    productDesc.value = '';
    productImage.value = '';
    loadProducts();
  }
};

// بارگذاری محصولات
async function loadProducts(){
  const res = await fetch(`${SERVER_URL}/products`);
  const products = await res.json();
  productsDiv.innerHTML = '';
  products.forEach(p=>{
    const div = document.createElement('div');
    div.innerHTML = `<strong>${p.title}</strong><br>${p.desc || ''}`;
    if(p.image) div.innerHTML += `<br><img src="${SERVER_URL}${p.image}" width="100">`;
    productsDiv.appendChild(div);
  });
}
