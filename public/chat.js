const SERVER_URL = 'https://silk-space-v2.onrender.com';

let currentUser = null;

// نمایش/پنهان کردن فرم‌ها
function show(id){ document.getElementById(id).style.display='flex'; }
function hide(id){ document.getElementById(id).style.display='none'; }

// ثبت نام
document.getElementById('signupBtn').onclick = async ()=>{
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const res = await fetch(`${SERVER_URL}/signup`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({username,password,email})
    });
    const data = await res.json();
    if(data.error) return alert(data.error);
    alert('ثبت نام موفق!');
    currentUser = data;
    initHome();
};

// ورود
document.getElementById('loginBtn').onclick = async ()=>{
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const res = await fetch(`${SERVER_URL}/login`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({username,password,email})
    });
    const data = await res.json();
    if(data.error) return alert(data.error);
    currentUser = data;
    initHome();
};

// شروع صفحه اصلی
function initHome(){
    hide('auth');
    show('home');
    document.getElementById('logoutBtn').style.display='inline';
    document.getElementById('chatBtn').style.display='inline';
    document.getElementById('profileBtn').style.display='inline';
    loadProducts();
}

// خروج
document.getElementById('logoutBtn').onclick = ()=>{
    location.reload();
};

// اضافه کردن محصول
document.getElementById('addProductBtn').onclick = ()=>{ show('addProductForm'); };
document.getElementById('cancelProductBtn').onclick = ()=>{ hide('addProductForm'); };

// ذخیره محصول
document.getElementById('saveProductBtn').onclick = async ()=>{
    const title = document.getElementById('productTitle').value;
    const desc = document.getElementById('productDesc').value;
    const image = document.getElementById('productImage').files[0];

    if(!title) return alert('عنوان لازم است');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('desc', desc);
    if(image) formData.append('image', image);

    const res = await fetch(`${SERVER_URL}/addProduct/${currentUser.id}`, { method:'POST', body:formData });
    const data = await res.json();
    if(data.error) return alert('خطا در ارسال محصول: '+data.error);

    hide('addProductForm');
    loadProducts();
};

// بارگذاری محصولات
async function loadProducts(){
    const res = await fetch(`${SERVER_URL}/products`);
    const products = await res.json();
    const container = document.getElementById('products');
    container.innerHTML = '';
    products.forEach(p=>{
        const div = document.createElement('div');
        div.className='product-card';
        div.innerHTML = `<strong>${p.title}</strong><br>${p.desc || ''}<br>
        ${p.image ? `<img src="${SERVER_URL}${p.image}" width="100">` : ''}
        <button onclick="startChat('${p.ownerId}')" class="neon-btn">پیوی فروشنده</button>`;
        if(p.ownerId===currentUser.id) div.innerHTML+=`<button onclick="deleteProduct('${p.id}')" class="neon-btn cancel-btn">حذف محصول</button>`;
        container.appendChild(div);
    });
}

// حذف محصول
async function deleteProduct(id){
    const res = await fetch(`${SERVER_URL}/deleteProduct/${id}/${currentUser.id}`, { method:'DELETE' });
    const data = await res.json();
    if(data.error) return alert(data.error);
    loadProducts();
}

// پروفایل
document.getElementById('profileBtn').onclick = ()=>{
    show('profileForm');
    document.getElementById('profileUsername').value = currentUser.username;
    document.getElementById('profileDesc').value = currentUser.description || '';
};
document.getElementById('cancelProfileBtn').onclick = ()=>{ hide('profileForm'); };

document.getElementById('saveProfileBtn').onclick = async ()=>{
    const username = document.getElementById('profileUsername').value;
    const description = document.getElementById('profileDesc').value;
    const avatar = document.getElementById('profileAvatar').files[0];

    const formData = new FormData();
    formData.append('username', username);
    formData.append('description', description);
    if(avatar) formData.append('avatar', avatar);

    const res = await fetch(`${SERVER_URL}/updateUser/${currentUser.id}`, { method:'POST', body:formData });
    const data = await res.json();
    if(data.error) return alert(data.error);
    currentUser = data;
    hide('profileForm');
    alert('تغییرات ذخیره شد!');
};

// چت‌ها
document.getElementById('chatBtn').onclick = async ()=>{
    show('chatForm');
    const res = await fetch(`${SERVER_URL}/getMessages/${currentUser.id}`);
    const messages = await res.json();
    const container = document.getElementById('chatList');
    container.innerHTML='';
    if(messages.length===0){ container.innerHTML='هیچ پیامی برای شما ارسال نشده'; return; }
    messages.forEach(m=>{
        const div = document.createElement('div');
        div.className='product-card';
        div.innerHTML=`<strong>از: ${m.from}</strong><br>${m.text}`;
        container.appendChild(div);
    });
};
document.getElementById('closeChatBtn').onclick = ()=>{ hide('chatForm'); };

// شروع
window.onload = ()=>{
    if(currentUser) initHome();
};
