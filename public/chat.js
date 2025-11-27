const SERVER_URL = 'https://silk-space-v2.onrender.com';

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');

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
  else alert('ثبت نام موفق شد');
};

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
    localStorage.setItem('user', JSON.stringify(data));
    alert('ورود موفق!');
    window.location.reload(); // یا نمایش صفحه محصولات
  }
};
