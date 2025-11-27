let currentUser = null;

// بررسی لاگین محلی
function setUser(user){
    currentUser = user;
    if(user){
        document.getElementById('auth').style.display = 'none';
        document.getElementById('home').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'inline';
        loadProducts();
    } else {
        document.getElementById('auth').style.display = 'block';
        document.getElementById('home').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
    }
}
setUser(null);

// ثبت‌نام
document.getElementById('signupBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if(!email || !password) return alert('ایمیل و رمز لازم است');

    try{
        const res = await fetch('/signup', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({email,password})
        });
        const data = await res.json();
        if(res.ok){
            alert(data.message);
            setUser(data.user);
        } else {
            alert(data.error);
        }
    }catch(err){ console.log(err); }
};

// ورود
document.getElementById('loginBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if(!email || !password) return alert('ایمیل و رمز لازم است');

    try{
        const res = await fetch('/login', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({email,password})
        });
        const data = await res.json();
        if(res.ok){
            alert(data.message);
            setUser(data.user);
        } else {
            alert(data.error);
        }
    }catch(err){ console.log(err); }
};

// خروج
document.getElementById('logoutBtn').onclick = () => {
    setUser(null);
    document.getElementById('email').value='';
    document.getElementById('password').value='';
};

// افزودن محصول
document.getElementById('addProductBtn').onclick = () => {
    document.getElementById('addProductForm').style.display = 'flex';
};
document.getElementById('cancelProductBtn').onclick = () => {
    document.getElementById('addProductForm').style.display = 'none';
};

// ذخیره محصول
document.getElementById('saveProductBtn').onclick = async () => {
    const title = document.getElementById('productTitle').value;
    if(!title){ alert('عنوان محصول لازم است'); return; }
    const desc = document.getElementById('productDesc').value;
    const img = document.getElementById('productImage').value;
    if(!currentUser) { alert('ابتدا وارد شوید'); return; }

    try{
        const res = await fetch('/product', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({title, description: desc, image: img, owner_id: currentUser.id})
        });
        const data = await res.json();
        if(res.ok){
            document.getElementById('addProductForm').style.display = 'none';
            loadProducts();
        } else {
            alert(data.error);
        }
    }catch(err){ console.log(err); }
};

// بارگذاری محصولات
async function loadProducts(){
    try{
        const res = await fetch('/products');
        const products = await res.json();
        const container = document.getElementById('products');
        container.innerHTML = '';
        products.forEach(doc=>{
            const div = document.createElement('div');
            div.className = 'product-card';
            div.innerHTML = `<strong>${doc.title}</strong><br>${doc.description || ''}<br>
            <button onclick="goToSeller('${doc.owner_id}')" class="neon-btn">پیوی فروشنده</button>`;
            container.appendChild(div);
        });
    }catch(err){ console.log(err); }
}

// رفتن به پیوی فروشنده
function goToSeller(ownerId){
    alert('برای خرید با این فروشنده باید در شبکه اجتماعی خودش هماهنگ کنید: '+ownerId);
}

// جستجو محصولات
document.getElementById('search').oninput = async (e)=>{
    const query = e.target.value.toLowerCase();
    try{
        const res = await fetch('/products');
        const products = await res.json();
        const container = document.getElementById('products');
        container.innerHTML='';
        products.filter(doc=>doc.title.toLowerCase().includes(query))
        .forEach(doc=>{
            const div = document.createElement('div');
            div.className='product-card';
            div.innerHTML=`<strong>${doc.title}</strong><br>${doc.description || ''}<br>
            <button onclick="goToSeller('${doc.owner_id}')" class="neon-btn">پیوی فروشنده</button>`;
            container.appendChild(div);
        });
    }catch(err){ console.log(err); }
};