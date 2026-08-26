const state={items:[],category:"semua",query:""};
const cards=document.getElementById("cards");
const emptyState=document.getElementById("emptyState");
const resultText=document.getElementById("resultText");
const searchInput=document.getElementById("searchInput");

async function loadContent(){
  try{
    const res=await fetch("data/content.json",{cache:"no-store"});
    if(!res.ok) throw new Error("Gagal memuat data");
    state.items=await res.json();
    localStorage.setItem("rimbabelajar-content",JSON.stringify(state.items));
  }catch(e){
    const cached=localStorage.getItem("rimbabelajar-content");
    state.items=cached?JSON.parse(cached):[];
  }
  updateStats();
  render();
}
function updateStats(){
  document.getElementById("totalCount").textContent=state.items.length;
  document.getElementById("plantCount").textContent=state.items.filter(x=>x.category==="tanaman").length;
  document.getElementById("animalCount").textContent=state.items.filter(x=>x.category==="hewan").length;
  document.getElementById("sceneCount").textContent=state.items.filter(x=>x.category==="pemandangan").length;
}
function label(c){return c==="tanaman"?"Tanaman":c==="hewan"?"Hewan":"Pemandangan"}
function render(){
  const q=state.query.trim().toLowerCase();
  const filtered=state.items.filter(x=>{
    const categoryOk=state.category==="semua"||x.category===state.category;
    const text=(x.title+" "+x.description+" "+x.fact).toLowerCase();
    return categoryOk&&(!q||text.includes(q));
  });
  resultText.textContent=`Menampilkan ${filtered.length} dari ${state.items.length} materi`;
  cards.innerHTML=filtered.map(x=>`
    <article class="card">
      <div class="card-top">${x.emoji||"🌿"}</div>
      <div class="card-body">
        <span class="badge">${label(x.category)}</span>
        <h3>${escapeHtml(x.title)}</h3>
        <p>${escapeHtml(x.description)}</p>
        <button class="learn-btn" data-id="${escapeHtml(x.id)}">Pelajari →</button>
      </div>
    </article>`).join("");
  emptyState.hidden=filtered.length!==0;
  cards.hidden=filtered.length===0;
  cards.querySelectorAll(".learn-btn").forEach(b=>b.addEventListener("click",()=>openDetail(b.dataset.id)));
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function openDetail(id){
  const x=state.items.find(i=>i.id===id); if(!x)return;
  document.getElementById("dialogContent").innerHTML=`
    <div class="detail">
      <div class="detail-emoji">${x.emoji||"🌿"}</div>
      <div class="detail-category">${label(x.category)}</div>
      <h2>${escapeHtml(x.title)}</h2>
      <p>${escapeHtml(x.description)}</p>
      <div class="fact"><strong>💡 Fakta menarik</strong><br>${escapeHtml(x.fact)}</div>
      <div class="question">❓ Pertanyaan belajar</div>
      <p>${escapeHtml(x.question)}</p>
    </div>`;
  document.getElementById("detailDialog").showModal();
}
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active"); state.category=btn.dataset.category; render();
}));
searchInput.addEventListener("input",e=>{state.query=e.target.value;render()});
document.getElementById("closeDialog").addEventListener("click",()=>document.getElementById("detailDialog").close());
document.getElementById("detailDialog").addEventListener("click",e=>{if(e.target.id==="detailDialog")e.target.close()});

let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault(); deferredPrompt=e; document.getElementById("installBtn").hidden=false;
});
document.getElementById("installBtn").addEventListener("click",async()=>{
  if(!deferredPrompt)return;
  deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null;
  document.getElementById("installBtn").hidden=true;
});
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
loadContent();
