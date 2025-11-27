let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// بررسی ورود خودکار
if(currentUser){
    document.getElementById('auth').style.display = 'none';
    document.getElementById('home').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'inline';
    document.getElementById('chatsBtn').style.display = 'inline';
    loadProducts();
}

// ثبت نام
document.getElementById('signupBtn').onclick = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if(!username || !password){ alert('همه فیلدها لازم است'); return; }
    const res = await fetch('/signup',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username,password})
    });
    const data = await res.json();
    if(data.error) alert(data.error);
    else{
        alert('ثبت نام موفق! لطفاً وارد شوید.');
    }
};

// ورود
document.getElementById('loginBtn').onclick = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if(!username || !password){ alert('همه فیلدها لازم است'); return; }
    const res = await fetch('/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username,password})
    });
    const data = await res.json();
    if(data.error) alert(data.error);
    else{
        currentUser = data;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('auth').style.display = 'none';
        document.getElementById('home').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'inline';
        document.getElementById('chatsBtn').style.display = 'inline';
        loadProducts();
    }
};

// خروج
document.getElementById('logoutBtn').onclick = ()=>{
    currentUser = null;
    localStorage.removeItem('currentUser');
    location.reload();
};

// افزودن محصول
document.getElementById('addProductBtn').onclick = ()=>{
    document.getElementById('addProductForm').style.display='flex';
};
document.getElementById('cancelProductBtn').onclick = ()=>{
    document.getElementById('addProductForm').style.display='none';
};

// ذخیره محصول
document.getElementById('saveProductBtn').onclick = async ()=>{
    const title = document.getElementById('productTitle').value;
    const desc = document.getElementById('productDesc').value;
    const file = document.getElementById('productImageFile').files[0];
    if(!title){ alert('عنوان محصول لازم است'); return; }

    const formData = new FormData();
    formData.append('title',title);
    formData.append('desc',desc);
    if(file) formData.append('image', file);

    await fetch('/addProduct/'+currentUser.id,{
        method:'POST',
        body: formData
    });
    document.getElementById('addProductForm').style.display='none';
    loadProducts();
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
        let html = `<strong>${p.title}</strong><br>${p.desc || ''}<br>`;
        if(p.image) html+=`<img src="${p.image}" width="100%"><br>`;
        html+=`<button class="neon-btn" onclick="openChat('${p.owner}')">چت با فروشنده</button>`;
        if(p.owner===currentUser.id) html+=`<button class="neon-btn" onclick="deleteProduct('${p.id}')">حذف محصول</button>`;
        div.innerHTML = html;
        container.appendChild(div);
    });
}

// حذف محصول
async function deleteProduct(id){
    await fetch('/deleteProduct/'+id+'/'+currentUser.id,{method:'DELETE'});
    loadProducts();
}

// جستجو
document.getElementById('search').oninput = async (e)=>{
    const query = e.target.value.toLowerCase();
    const res = await fetch('/products');
    const products = await res.json();
    const container = document.getElementById('products');
    container.innerHTML='';
    products.filter(p=>p.title.toLowerCase().includes(query))
    .forEach(p=>{
        const div = document.createElement('div');
        div.className='product-card';
        let html = `<strong>${p.title}</strong><br>${p.desc || ''}<br>`;
        if(p.image) html+=`<img src="${p.image}" width="100%"><br>`;
        html+=`<button class="neon-btn" onclick="openChat('${p.owner}')">چت با فروشنده</button>`;
        if(p.owner===currentUser.id) html+=`<button class="neon-btn" onclick="deleteProduct('${p.id}')">حذف محصول</button>`;
        div.innerHTML = html;
        container.appendChild(div);
    });
};

// باز کردن چت با کاربر
async function openChat(userId){
    document.getElementById('chatModal').style.display='flex';
    const otherUser = await fetchUser(userId);
    document.getElementById('chatWith').innerText = otherUser.username;
    loadMessages(userId);
    document.getElementById('sendChatBtn').onclick = async ()=>{
        const msg = document.getElementById('chatInput').value;
        if(!msg) return;
        await fetch('/sendMessage',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({from_id:currentUser.id,to_id:userId,msg})
        });
        document.getElementById('chatInput').value='';
        loadMessages(userId);
    };
}
document.getElementById('closeChatBtn').onclick = ()=>{
    document.getElementById('chatModal').style.display='none';
};

// بارگذاری پیام‌ها
async function loadMessages(userId){
    const res = await fetch(`/getMessages/${currentUser.id}/${userId}`);
    const msgs = await res.json();
    const container = document.getElementById('chatMessages');
    container.innerHTML='';
    msgs.forEach(m=>{
        const div = document.createElement('div');
        div.innerHTML = `<strong>${m.from_id===currentUser.id?'من': 'او'}</strong>: ${m.msg}`;
        container.appendChild(div);
    });
}

// لیست چت‌ها
document.getElementById('chatsBtn').onclick = async ()=>{
    document.getElementById('chatsModal').style.display='flex';
    const res = await fetch(`/myChats/${currentUser.id}`);
    const users = await res.json();
    const container = document.getElementById('chatsList');
    container.innerHTML='';
    users.forEach(u=>{
        const div = document.createElement('div');
        div.innerHTML = `<button class="neon-btn" onclick="openChat('${u.id}')">${u.username}</button>`;
        container.appendChild(div);
    });
};
document.getElementById('closeChatsBtn').onclick = ()=>{
    document.getElementById('chatsModal').style.display='none';
};

// دریافت کاربر
async function fetchUser(id){
    const db = await fetch('/myChats/'+currentUser.id);
    const users = await db.json();
    return users.find(u=>u.id===id) || {username:'کاربر ناشناس'};
}
