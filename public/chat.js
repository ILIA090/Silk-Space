let chatWithUser = null;

function openChat(userId){
    chatWithUser = userId;
    document.getElementById('chatModal').style.display='flex';
    document.getElementById('chatWith').innerText='چت با کاربر';
    loadMessages();
}

document.getElementById('closeChatBtn').onclick=()=>{document.getElementById('chatModal').style.display='none';};

document.getElementById('sendMsgBtn').onclick=async ()=>{
    const msg = document.getElementById('chatInput').value;
    if(!msg) return;
    await fetch('/message',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({from_id:currentUser.id,to_id:chatWithUser,message:msg})});
    document.getElementById('chatInput').value='';
    loadMessages();
};

async function loadMessages(){
    if(!chatWithUser) return;
    const res = await fetch(`/messages/${currentUser.id}/${chatWithUser}`);
    const msgs = await res.json();
    const container = document.getElementById('chatMessages');
    container.innerHTML='';
    msgs.forEach(m=>{
        const div = document.createElement('div');
        div.style.textAlign = m.from_id===currentUser.id?'right':'left';
        div.style.padding='5px';
        div.style.margin='2px';
        div.style.background = m.from_id===currentUser.id?'#ff6f00':'#00f0ff';
        div.style.borderRadius='5px';
        div.innerText=m.message;
        container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
}