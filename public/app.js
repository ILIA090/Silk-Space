let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

function setUser(user){
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    if(user){
        document.getElementById('auth').style.display='none';
        document.getElementById('home').style.display='block';
        document.getElementById('logoutBtn').style.display='inline';
        loadProducts();
    } else {
        document.getElementById('auth').style.display='flex';
        document.getElementById('home').style.display='none';
        document.getElementById('logoutBtn').style.display='none';
    }
}
setUser(currentUser);

// ثبت‌نام
document.getElementById('signupBtn').onclick = async ()=>{
    const login = document.getElementById('loginInput').value;
    const password = document.getElementById('password').value;
    if(!login||!password) return alert('وارد کردن همه فیلدها لازم است');
    const res = await fetch('/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:login,email:login,password})});
    const data = await res.json();
    if(res.ok) setUser(data.user);
    else alert(data.error);
};

// ورود
document.getElementById('loginBtn').onclick = async ()=>{
    const login = document.getElementById('loginInput').value;
    const password = document.getElementById('password').value;
    if(!login||!password) return alert('وارد کردن همه فیلدها لازم است');
    const res = await fetch('/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({login,password})});
    const data = await res.json();
    if(res.ok) setUser(data.user);
    else alert(data.error);
};

// خروج
document.getElementById('logoutBtn').onclick = ()=>{
    setUser(null);
};

// افزودن محصول
document.getElementById('addProductBtn').onclick = ()=>{document.getElementById('addProductForm').style.display='flex';};
document.getElementById('cancelProductBtn').onclick = ()=>{document.getElementById('addProductForm').style.display='none';};

document.getElementById('saveProductBtn').onclick = async ()=>{
    const title = document.getElementById('productTitle').value;
    if(!title) return alert('عنوان لازم است');
    const desc = document.getElementById('productDesc').value;
    const imgFile = document.getElementById('productImage').files[0];
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('owner_id', currentUser.id);
    if(imgFile) formData.append('image', imgFile);

    const res = await fetch('/product',{method:'POST',body:formData});
    const data = await res.json();
    if(res.ok){ document.getElementById('addProductForm').style.display='none'; loadProducts(); }
    else alert(data.error);
};

// بارگذاری محصولات
async function loadProducts(){
    const res = await fetch('/products');
    const products = await res.json();
    const container = document.getElementById('products');
    container.innerHTML='';
    products.forEach(p=>{
        const div = document.createElement('div');
        div.className='product-card';
        div.innerHTML=`<strong>${p.title}</strong><br>${p.description||''}<br>
        ${p.image?`<img src="${p.image}" style="max-width:100%;border-radius:10px;">`:""}<br>
        ${p.owner_id===currentUser.id?'<button class="neon-btn delete-btn">حذف</button>':`<button class="neon-btn chat-btn">پیوی فروشنده</button>`}`;
        container.appendChild(div);

        if(p.owner_id===currentUser.id){
            div.querySelector('.delete-btn').onclick=async ()=>{
                await fetch('/deleteProduct',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:p.id,userId:currentUser.id})});
                loadProducts();
            };
        } else {
            div.querySelector('.chat-btn').onclick=()=>{ openChat(p.owner_id); };
        }
    });
}

// جستجو
document.getElementById('search').oninput = async e=>{
    const query = e.target.value.toLowerCase();
    const res = await fetch('/products');
    const products = await res.json();
    const container = document.getElementById('products');
    container.innerHTML='';
    products.filter(p=>p.title.toLowerCase().includes(query)).forEach(p=>{
        const div = document.createElement('div');
        div.className='product-card';
        div.innerHTML=`<strong>${p.title}</strong><br>${p.description||''}<br>
        ${p.image?`<img src="${p.image}" style="max-width:100%;border-radius:10px;">`:""}<br>
        ${p.owner_id===currentUser.id?'<button class="neon-btn delete-btn">حذف</button>':`<button class="neon-btn chat-btn">پیوی فروشنده</button>`}`;
        container.appendChild(div);
        if(p.owner_id===currentUser.id){
            div.querySelector('.delete-btn').onclick=async ()=>{
                await fetch('/deleteProduct',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:p.id,userId:currentUser.id})});
                loadProducts();
            };
        } else {
            div.querySelector('.chat-btn').onclick=()=>{ openChat(p.owner_id); };
        }
    });
};