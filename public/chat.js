const SERVER_URL = 'https://silk-space-v2.onrender.com/'; // URL سایت روی Render

let currentUser = null;
let currentChatUser = null;

// بررسی ورود ذخیره شده
async function checkLogin() {
  const saved = localStorage.getItem('user');
  if(saved){
    currentUser = JSON.parse(saved);
    showHome();
    loadProducts();
  }
}

checkLogin();

// نمایش صفحه اصلی
function showHome(){
  document.getElementById('auth').style.display='none';
  document.getElementById('home').style.display='block';
  document.getElementById('logoutBtn').style.display='inline';
  document.getElementById('chatsBtn').style.display='inline';
}

// ثبت نام
document.getElementById('signupBtn').onclick = async ()=>{
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if(!username || !password){ alert('همه فیلدها لازم است'); return; }

  const res = await fetch(`${SERVER_URL}/signup`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({username,password})
  });
  const data = await res.json();
  if(data.ok) alert('ثبت نام موفق! حالا وارد شوید');
  else alert(data.error);
}

// ورود
document.getElementById('loginBtn').onclick = async ()=>{
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if(!username || !password){ alert('همه فیلدها لازم است'); return; }

  const res = await fetch(`${SERVER_URL}/login`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({username,password})
  });
  const data = await res.json();
  if(data.error){ alert(data.error); return; }
  currentUser = data;
  localStorage.setItem('user', JSON.stringify(currentUser));
  showHome();
  loadProducts();
}

// خروج
document.getElementById('logoutBtn').onclick = ()=>{
  localStorage.removeItem('user');
  location.reload();
}

// نمایش مدال افزودن محصول
document.getElementById('addProductBtn').onclick = ()=>{
  document.getElementById('addProductForm').style.display='flex';
}
document.getElementById('cancelProductBtn').onclick = ()=>{
  document.getElementById('addProductForm').style.display='none';
}

// افزودن محصول
document.getElementById('saveProductBtn').onclick = async ()=>{
  const title = document.getElementById('productTitle').value;
  const desc = document.getElementById('productDesc').value;
  const fileInput = document.getElementById('productImageFile');
  if(!title){ alert('عنوان لازم است'); return; }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('desc', desc);
  if(fileInput.files[0]) formData.append('image', fileInput.files[0]);

  const res = await fetch(`${SERVER_URL}/addProduct/${currentUser.id}`,{
    method:'POST',
    body: formData
  });
  const data = await res.json();
  if(data.ok){
    document.getElementById('addProductForm').style.display='none';
    loadProducts();
  } else alert(data.error || 'مشکل در افزودن محصول');
}

// بارگذاری محصولات
async function loadProducts(){
  const res = await fetch(`${SERVER_URL}/products`);
  const products = await res.json();
  const container = document.getElementById('products');
  container.innerHTML='';
  products.forEach(p=>{
    const div = document.createElement('div');
    div.className='product-card';
    div.innerHTML = `
      <strong>${p.title}</strong><br>${p.desc || ''}<br>
      ${p.image?`<img src="${SERVER_URL}${p.image}" style="width:100%;height:100px;object-fit:cover">`:''}
      <button onclick="chatWith('${p.owner}','${p.title}')" class="neon-btn">چت با فروشنده</button>
      ${p.owner===currentUser.id?`<button onclick="deleteProduct('${p.id}')" class="neon-btn">حذف</button>`:''}
    `;
    container.appendChild(div);
  });
}

// حذف محصول
async function deleteProduct(pid){
  await fetch(`${SERVER_URL}/deleteProduct/${pid}/${currentUser.id}`,{method:'DELETE'});
  loadProducts();
}

// چت با فروشنده
async function chatWith(uid,title){
  currentChatUser = uid;
  const user = await fetch(`${SERVER_URL}/login`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({id:uid})
  }).then(r=>r.json());
  document.getElementById('chatWith').innerText = title;
  document.getElementById('chatModal').style.display='flex';
  loadChatMessages();
}

// بارگذاری پیام‌ها
async function loadChatMessages(){
  if(!currentChatUser) return;
  const res = await fetch(`${SERVER_URL}/getMessages/${currentUser.id}/${currentChatUser}`);
  const msgs = await res.json();
  const container = document.getElementById('chatMessages');
  container.innerHTML='';
  msgs.forEach(m=>{
    const div = document.createElement('div');
    div.style.margin='5px';
    div.innerHTML = `<strong>${m.from_id===currentUser.id?'شما':m.from_id}</strong>: ${m.msg}`;
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

// ارسال پیام
document.getElementById('sendChatBtn').onclick = async ()=>{
  const msg = document.getElementById('chatInput').value;
  if(!msg) return;
  await fetch(`${SERVER_URL}/sendMessage`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({from_id:currentUser.id,to_id:currentChatUser,msg})
  });
  document.getElementById('chatInput').value='';
  loadChatMessages();
}

// بستن چت
document.getElementById('closeChatBtn').onclick = ()=>{
  document.getElementById('chatModal').style.display='none';
  currentChatUser = null;
}

// نمایش لیست چت‌ها
document.getElementById('chatsBtn').onclick = async ()=>{
  document.getElementById('chatsModal').style.display='flex';
  const res = await fetch(`${SERVER_URL}/myChats/${currentUser.id}`);
  const users = await res.json();
  const container = document.getElementById('chatsList');
  container.innerHTML='';
  users.forEach(u=>{
    const div = document.createElement('div');
    div.style.margin='5px';
    div.innerHTML = `<button class="neon-btn" onclick="chatWith('${u.id}','${u.username}')">${u.username}</button>`;
    container.appendChild(div);
  });
}

// بستن لیست چت‌ها
document.getElementById('closeChatsBtn').onclick = ()=>{
  document.getElementById('chatsModal').style.display='none';
                   }
