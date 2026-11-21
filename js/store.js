import {db,fs} from "./firebase.js";
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const inr=n=>"₹"+Number(n).toLocaleString("en-IN"),toast=m=>{$("#toast").textContent=m;$("#toast").className="show";setTimeout(()=>$("#toast").className="",2500)};
const setT=t=>{document.documentElement.dataset.theme=t;$("#tg").textContent=t=="dark"?"☀":"☾";try{localStorage.setItem("theme",t)}catch{}};
setT(document.documentElement.dataset.theme||"light");$("#tg").onclick=()=>setT(document.documentElement.dataset.theme=="dark"?"light":"dark");
let S={storeName:"SOLESPHERE",whatsapp:"917510266903",instagram:"https://instagram.com/solesphere.iin",phone:"7510266903",email:"",address:"Malappuram Dt, Kerala, India"},P=[],tag="";
let cart=[];try{cart=JSON.parse(localStorage.getItem("cart")||"[]")}catch{}
const saveCart=()=>{try{localStorage.setItem("cart",JSON.stringify(cart))}catch{}drawCart()};
async function load(){
 try{const [s,p,q]=await Promise.all([fs.getDoc(fs.doc(db,"settings","store")),fs.getDocs(fs.collection(db,"products")),fs.getDocs(fs.collection(db,"qualities"))]);
  if(s.exists())S={...S,...s.data()};
  P=p.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.active!==false);
  $("#fu").innerHTML='<option value="">Quality</option>'+q.docs.map(d=>`<option>${esc(d.data().name)}</option>`).join("");
 }catch(e){console.error(e);$("#grid").innerHTML='<div class="empty">Could not load products. Check your Firebase config and rules.</div>'}
 $("#fs").innerHTML='<option value="">Size</option>'+[5,6,7,8,9,10,11,12].map(n=>`<option>${n}</option>`).join("");
 document.title=S.storeName;document.querySelectorAll("[data-s=storeName]").forEach(e=>e.textContent=S.storeName);
 $("#fa").textContent=S.address;$("#fct").textContent=[S.phone,S.email].filter(Boolean).join(" · ");
 const w="https://wa.me/"+S.whatsapp;$("#fw").href=w;$("#wa").href=w+"?text="+encodeURIComponent("Hi "+S.storeName+", I have a question about your shoes.");$("#fi").href=S.instagram;draw();drawCart();const hp=P.find(p=>p.images?.[0]);if(hp)$("#heroimg").innerHTML=`<span class="chip c1">COMFORT</span><img src="${esc(hp.images[0])}" alt=""><span class="chip c2">STYLE</span>`;
}
function draw(){
 const q=$("#fq").value.toLowerCase(),c=$("#fc").value,u=$("#fu").value,z=$("#fs").value,m=+$("#fp").value;
 let l=P.filter(p=>(!q||p.name.toLowerCase().includes(q))&&(!c||p.category==c)&&(!u||(p.qualities||[]).includes(u))&&(!z||(p.sizes||[]).includes(z))&&(!m||p.price<=m)&&(tag!="best"||p.bestSeller));
 if(tag=="new")l=[...l].sort((a,b)=>(b.created||0)-(a.created||0)).slice(0,8);
 $("#grid").innerHTML=l.length?l.map(p=>`<div class="card"><div class="tile">${p.images?.[0]?`<img loading="lazy" src="${esc(p.images[0])}" alt="">`:"👟"}</div><div class="meta"><div><b>${esc(p.name)}</b><small>${p.category}'s shoes</small></div><div style="text-align:right"><span class="price">${inr(p.price)}</span>${p.originalPrice>p.price?`<span class="old">${inr(p.originalPrice)}</span>`:""}</div></div><small>${esc((p.qualities||[]).join(" / "))} · Sizes ${esc((p.sizes||[]).join(", "))}${(p.colors||[]).length?" · "+esc(p.colors.join(", ")):""}</small><div class="row"><button class="btn o s" data-v="${p.id}">Details</button><button class="btn s" data-v="${p.id}">Add to cart</button></div></div>`).join(""):'<div class="empty">No shoes match your filters.</div>';
}
function view(id){
 const p=P.find(x=>x.id==id);if(!p)return;const im=p.images||[];
 const chips=(n,a)=>`<div class="chips">${(a||[]).map((v,i)=>`<label><input type="radio" name="${n}" value="${esc(v)}" ${i?"":""}><span>${esc(v)}</span></label>`).join("")}</div>`;
 $("#dlg").innerHTML=`<form method="dialog" style="display:block"><button class="btn o s" style="float:right">✕</button></form>${im[0]?`<img class="main" id="mi" src="${esc(im[0])}"><div class="thumbs">${im.map(s=>`<img src="${esc(s)}" data-i="${esc(s)}">`).join("")}</div>`:'<div class="ph">👟</div>'}
 <h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><b>${inr(p.price)}</b> ${p.originalPrice>p.price?`<span class="old">${inr(p.originalPrice)}</span>`:""}<small> · ${p.stock>0?p.stock+" in stock":"Out of stock"}</small>
 <div class="fld" id="opt"><b>Quality</b>${chips("ql",p.qualities)}${(p.colors||[]).length?`<b>Colour</b>${chips("cl",p.colors)}`:""}<b>Size</b>${chips("sz",p.sizes)}<b>Quantity</b><input id="qt" type="number" min="1" max="${p.stock||99}" value="1"><div class="err" id="oe"></div><button class="btn" id="add" ${p.stock>0?"":"disabled"}>Add to Cart</button></div>`;
 $("#dlg").showModal();
 $("#dlg").onclick=e=>{if(e.target.dataset.i)$("#mi").src=e.target.dataset.i};
 $("#add").onclick=()=>{const ql=$("#opt [name=ql]:checked")?.value,sz=$("#opt [name=sz]:checked")?.value,qty=Math.max(1,parseInt($("#qt").value)||1);
  const cl=$("#opt [name=cl]:checked")?.value||"";if(!ql||!sz||((p.colors||[]).length&&!cl))return $("#oe").textContent="Please select quality, "+((p.colors||[]).length?"colour and ":"")+"size.";
  const k=[p.id,sz,ql,cl].join("|"),it=cart.find(x=>x.k==k);it?it.qty+=qty:cart.push({k,id:p.id,name:p.name,category:p.category,price:p.price,size:sz,quality:ql,color:cl,qty,img:p.images?.[0]||""});
  saveCart();$("#dlg").close();toast("Added to cart");};
}
function drawCart(){
 $("#cc").textContent=cart.reduce((a,b)=>a+b.qty,0);const t=cart.reduce((a,b)=>a+b.price*b.qty,0);
 $("#items").innerHTML=cart.length?cart.map((c,i)=>`<div class="ci"><div><b>${esc(c.name)}</b><br><small>Size ${esc(c.size)} · ${esc(c.quality)}${c.color?" · "+esc(c.color):""} · ${inr(c.price)}</small></div><button class="btn o s" data-m="${i}">−</button>${c.qty}<button class="btn o s" data-p="${i}">+</button><button class="btn o s" data-r="${i}">🗑</button></div>`).join(""):'<div class="empty">Your cart is empty.</div>';
 $("#tot").textContent="Total: "+inr(t);$("#co").disabled=!cart.length;
}
$("#cart").onclick=e=>{const d=e.target.dataset;if(d.m!=null){cart[d.m].qty--;if(cart[d.m].qty<1)cart.splice(d.m,1)}else if(d.p!=null)cart[d.p].qty++;else if(d.r!=null)cart.splice(d.r,1);else return;saveCart()};
$("#cartBtn").onclick=()=>$("#cart").classList.add("open");$("#cx").onclick=()=>$("#cart").classList.remove("open");
$("#co").onclick=()=>$("#cod").showModal();
$("#grid").onclick=e=>{if(e.target.dataset.v)view(e.target.dataset.v)};
["fq","fc","fu","fs","fp"].forEach(i=>$("#"+i).oninput=draw);$("#clr").onclick=()=>{["fq","fc","fu","fs","fp"].forEach(i=>$("#"+i).value="");tag="";draw()};
document.querySelectorAll("[data-f]").forEach(a=>a.onclick=()=>{const f=a.dataset.f;tag=["new","best"].includes(f)?f:"";$("#fc").value=tag?"":f;draw()});
$("#cf").onsubmit=async e=>{e.preventDefault();const f=e.target.elements,n=f.n.value.trim(),p=f.p.value.trim(),a=f.a.value.trim();
 if(n.length<2)return $("#ce").textContent="Enter your name.";if(!/^[+\d][\d\s-]{9,14}$/.test(p))return $("#ce").textContent="Enter a valid mobile number.";if(a.length<10)return $("#ce").textContent="Enter your full delivery address.";
 const total=cart.reduce((x,c)=>x+c.price*c.qty,0),id="SH"+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase();
 const msg=`Hello, I want to place an order.\nOrder ID: ${id}\n\n`+cart.map(c=>`Product: ${c.name}\nCategory: ${c.category}'s\nSize: ${c.size}\nQuality: ${c.quality}\n${c.color?`Colour: ${c.color}\n`:""}Quantity: ${c.qty}\nPrice: ${inr(c.price*c.qty)}\n`).join("\n")+`\nCustomer Name: ${n}\nPhone: ${p}\nDelivery Address: ${a}\n\nTotal: ${inr(total)}\n\nPlease confirm my order.`;
 try{await fs.setDoc(fs.doc(db,"orders",id),{orderId:id,customer:{name:n,phone:p,address:a},items:cart.map(({name,category,size,quality,color,qty,price})=>({name,category,size,quality,color:color||"",qty,price})),total,status:"Pending",paid:false,created:Date.now()})}catch(err){console.error(err);toast("Order saved only on WhatsApp (database error)")}
 cart=[];saveCart();$("#cod").close();$("#cart").classList.remove("open");location.href=`https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;};
function fit(){const g=document.querySelector(".giant"),f=g.parentElement,cs=getComputedStyle(f);g.style.fontSize="100px";const av=f.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);g.style.fontSize=Math.min(300,100*av/g.offsetWidth)+"px"}
addEventListener("shop-ready",()=>{for(const[id,f,ch]of[["heroimg","hero.png",0],["aboutimg","about.png",0]]){const im=new Image();im.onload=()=>{const e=document.getElementById(id);if(e)e.innerHTML=(ch?'<span class="chip c1">COMFORT</span>':"")+`<img src="${f}" alt="">`+(ch?'<span class="chip c2">STYLE</span>':"")};im.src=f}});
load().then(fit).finally(()=>dispatchEvent(new Event("shop-ready")));

addEventListener("shop-ready",()=>{document.getElementById("fs").innerHTML='<option value="">Size (EU)</option>'+[36,37,38,39,40,41,42,43,44,45,46].map(n=>`<option value="${n}">EU ${n}</option>`).join("")});
const ord=(a,b)=>{const x=a.rank,y=b.rank;return x==null&&y==null?(b.created||0)-(a.created||0):x==null?-1:y==null?1:x-y};
let shown=15;const vm=document.createElement("div");vm.style.cssText="text-align:center;margin-top:22px";vm.innerHTML='<button class="btn" id="vmb"></button>';document.getElementById("grid").after(vm);
function pg(){const c=[...document.querySelectorAll("#grid .card")];c.forEach((e,i)=>e.style.display=i<shown?"":"none");const r=c.length-shown;vm.style.display=r>0?"":"none";document.getElementById("vmb").textContent="View more shoes ("+r+" more)"}
new MutationObserver(()=>{shown=15;pg()}).observe(document.getElementById("grid"),{childList:true});
document.getElementById("vmb").onclick=()=>{shown+=15;pg()};
addEventListener("shop-ready",()=>{P.sort(ord);draw()});
