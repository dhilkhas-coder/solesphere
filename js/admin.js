import {db,auth,storage,fs,au,st as st0} from "./firebase.js";
const st={ref:(s,p)=>({p}),uploadBytes:async(r,f)=>{r.f=f},getDownloadURL:r=>shrink(r.f)};
function shrink(f){return new Promise((ok,no)=>{const u=URL.createObjectURL(f),i=new Image();i.onerror=()=>no(new Error("Could not read photo"));i.onload=()=>{let m=700,d;do{const s=Math.min(1,m/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=Math.round(i.width*s);c.height=Math.round(i.height*s);const x=c.getContext("2d");x.drawImage(i,0,0,c.width,c.height);d=c.toDataURL("image/webp",.8);if(d.startsWith("data:image/png")){x.globalCompositeOperation="destination-over";x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);d=c.toDataURL("image/jpeg",.78)}m-=150}while(d.length>280000&&m>250);URL.revokeObjectURL(u);ok(d)};i.src=u})}
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const inr=n=>"₹"+Number(n).toLocaleString("en-IN"),toast=m=>{$("#toast").textContent=m;$("#toast").className="show";setTimeout(()=>$("#toast").className="",2500)};
const get=async n=>(await fs.getDocs(fs.collection(db,n))).docs.map(d=>({id:d.id,...d.data()}));
const STAT=["Pending","Confirmed","Processing","Shipped","Delivered","Cancelled"];
const TABS={dash:"Dashboard",products:"Products",orders:"Orders",qualities:"Qualities",categories:"Categories",settings:"Settings"};
let cur={images:[]},plist=[];
au.onAuthStateChanged(auth,async u=>{
 if(!u){$("#login").hidden=false;$("#app").hidden=true;return}
 const a=await fs.getDoc(fs.doc(db,"admins",u.uid)).catch(()=>null);
 if(a?.exists()){$("#login").hidden=true;$("#app").hidden=false;go("dash")}else{$("#err").textContent="This account is not an admin.";await au.signOut(auth)}
});
$("#lf").onsubmit=async e=>{e.preventDefault();$("#err").textContent="";try{await au.signInWithEmailAndPassword(auth,e.target.e.value,e.target.p.value)}catch{$("#err").textContent="Invalid email or password."}};
$("#out").onclick=()=>au.signOut(auth);
function go(t){$("#tabs").innerHTML=Object.entries(TABS).map(([k,v])=>`<button class="btn o s ${k==t?"on":""}" data-t="${k}">${v}</button>`).join("");$("#view").innerHTML="Loading…";V[t]().catch(e=>{console.error(e);$("#view").innerHTML='<p class="err">Error loading. Check Firestore rules.</p>'})}
$("#tabs").onclick=e=>e.target.dataset.t&&go(e.target.dataset.t);
const V={
async dash(){const [o,p]=await Promise.all([get("orders"),get("products")]);o.sort((a,b)=>b.created-a.created);const c=s=>o.filter(x=>x.status==s).length;
 $("#view").innerHTML=`<div class="stats"><div><b>${p.length}</b>Products</div><div><b>${o.length}</b>Orders</div><div><b>${c("Pending")}</b>Pending</div><div><b>${c("Delivered")}</b>Completed</div></div><h3>Recent orders</h3>`+(o.slice(0,5).map(orderCard).join("")||"<p>No orders yet.</p>")},
async products(){plist=await get("products");
 $("#view").innerHTML=`<button class="btn" data-a="new">+ Add product</button> <button class="btn o" data-a="seed">Load sample data</button><table class="tbl"><tr><th>Name</th><th>Cat</th><th>₹</th><th>Stock</th><th>Status</th><th></th></tr>${plist.map(p=>`<tr><td>${esc(p.name)}</td><td>${p.category}</td><td>${p.price}</td><td>${p.stock}</td><td><button class="btn o s" data-a="tog" data-id="${p.id}">${p.active?"Active":"Inactive"}</button></td><td><button class="btn s" data-a="edit" data-id="${p.id}">Edit</button> <button class="btn o s" data-a="del" data-id="${p.id}">Delete</button></td></tr>`).join("")}</table>`},
async orders(){const o=await get("orders");o.sort((a,b)=>b.created-a.created);$("#view").innerHTML=o.map(orderCard).join("")||"<p>No orders yet.</p>"},
async qualities(){list("qualities","Quality grade")},async categories(){list("categories","Category (e.g. Sneakers)")},
async settings(){const s=(await fs.getDoc(fs.doc(db,"settings","store"))).data()||{};const F=[["storeName","Store name"],["whatsapp","WhatsApp number with country code, digits only (e.g. 919876543210)"],["instagram","Instagram URL"],["phone","Contact phone"],["email","Contact email"],["address","Address"]];
 $("#view").innerHTML=`<form id="sf" class="fld">${F.map(([k,l])=>`<label>${l}<input name="${k}" value="${esc(s[k]||"")}"></label>`).join("")}<button class="btn">Save settings</button></form>`;
 $("#sf").onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.whatsapp=d.whatsapp.replace(/\D/g,"");await fs.setDoc(fs.doc(db,"settings","store"),d);toast("Saved")}}};
function orderCard(o){return`<div class="oc"><b>${o.orderId}</b> · ${new Date(o.created).toLocaleString()} <select data-os="${o.id}">${STAT.map(s=>`<option ${s==o.status?"selected":""}>${s}</option>`).join("")}</select><br>${esc(o.customer.name)} · ${esc(o.customer.phone)}<br><small>${esc(o.customer.address)}</small><ul>${o.items.map(i=>`<li>${esc(i.name)} · Size ${esc(i.size)} · ${esc(i.quality)}${i.color?" · "+esc(i.color):""} · ×${i.qty} · ${inr(i.price*i.qty)}</li>`).join("")}</ul><b>Total ${inr(o.total)}</b> <small>(payment not confirmed automatically)</small></div>`}
async function list(c,ph){const l=await get(c);$("#view").innerHTML=`<form id="lf2" style="display:flex;gap:6px"><input name="n" placeholder="${ph}" required><button class="btn">Add</button></form>`+l.map(x=>`<div class="ci"><div>${esc(x.name)}</div><button class="btn o s" data-ren="${x.id}" data-c="${c}" data-n="${esc(x.name)}">Edit</button><button class="btn o s" data-dl="${x.id}" data-c="${c}">Delete</button></div>`).join("");
 $("#lf2").onsubmit=async e=>{e.preventDefault();await fs.addDoc(fs.collection(db,c),{name:e.target.n.value.trim()});go(c)}}
$("#view").onchange=async e=>{if(e.target.dataset.os){await fs.updateDoc(fs.doc(db,"orders",e.target.dataset.os),{status:e.target.value});toast("Status updated")}};
$("#view").onclick=async e=>{const d=e.target.dataset;
 if(d.dl){if(confirm("Delete?")){await fs.deleteDoc(fs.doc(db,d.c,d.dl));go(d.c)}}
 if(d.ren){const n=prompt("New name",d.n);if(n){await fs.updateDoc(fs.doc(db,d.c,d.ren),{name:n.trim()});go(d.c)}}
 if(d.a=="new")form();if(d.a=="edit")form(plist.find(p=>p.id==d.id));
 if(d.a=="tog"){const p=plist.find(p=>p.id==d.id);await fs.updateDoc(fs.doc(db,"products",d.id),{active:!p.active});go("products")}
 if(d.a=="del"&&confirm("Delete this product?")){await fs.deleteDoc(fs.doc(db,"products",d.id));go("products")}
 if(d.a=="seed")seed()};
async function form(p={}){cur=p;cur.images=[...(p.images||[])];const [q,c]=await Promise.all([get("qualities"),get("categories")]);
 $("#pf").innerHTML=`<h3>${p.id?"Edit":"Add"} product</h3><input name="pname" placeholder="Name" value="${esc(p.name)}" required><textarea name="desc" placeholder="Description">${esc(p.description)}</textarea><select name="cat"><option ${p.category=="Men"?"selected":""}>Men</option><option ${p.category=="Women"?"selected":""}>Women</option></select><select name="type"><option value="">Type (optional)</option>${c.map(x=>`<option ${p.type==x.name?"selected":""}>${esc(x.name)}</option>`).join("")}</select>
 <input name="price" type="number" min="1" placeholder="Price ₹" value="${p.price||""}" required><input name="orig" type="number" placeholder="Original price ₹" value="${p.originalPrice||""}"><input name="sizes" placeholder="Sizes, comma separated: 6,7,8,9" value="${esc((p.sizes||[]).join(","))}" required><input name="colors" placeholder="Colours (optional): Black, White, Red" value="${esc((p.colors||[]).join(","))}"><input name="stock" type="number" min="0" placeholder="Stock" value="${p.stock??""}" required>
 <b>Qualities</b><div class="chips">${q.map(x=>`<label><input type="checkbox" name="q" value="${esc(x.name)}" ${(p.qualities||[]).includes(x.name)?"checked":""}><span>${esc(x.name)}</span></label>`).join("")||"<small>Add qualities first (Qualities tab)</small>"}</div>
 <label>Images <input name="files" type="file" accept="image/*" multiple></label><div class="thumbs" id="th">${cur.images.map((s,i)=>`<img src="${esc(s)}" data-x="${i}" title="Tap to remove">`).join("")}</div>
 <label><input type="checkbox" name="active" ${p.active!==false?"checked":""}> Active</label><label><input type="checkbox" name="best" ${p.bestSeller?"checked":""}> Best seller</label><div class="err" id="pe"></div><button class="btn">Save</button><button type="button" class="btn o" onclick="pd.close()">Cancel</button>`;
 $("#th").onclick=e=>{if(e.target.dataset.x){cur.images.splice(e.target.dataset.x,1);e.target.remove()}};$("#pd").showModal()}
$("#pf").onsubmit=async e=>{e.preventDefault();const f=e.target,g=n=>f.elements[n],b=f.querySelector(".btn:not(.o)");b.disabled=true;
 try{const imgs=[...cur.images];for(const file of g("files").files){const r=st.ref(storage,`products/${Date.now()}_${file.name.replace(/\W/g,"_")}`);await st.uploadBytes(r,file);imgs.push(await st.getDownloadURL(r))}
 const d={name:g("pname").value.trim(),description:g("desc").value.trim(),category:g("cat").value,type:g("type").value,price:+g("price").value,originalPrice:+g("orig").value||+g("price").value,sizes:g("sizes").value.split(",").map(s=>s.trim()).filter(Boolean),colors:g("colors").value.split(",").map(s=>s.trim()).filter(Boolean),qualities:[...f.querySelectorAll("[name=q]:checked")].map(x=>x.value),stock:+g("stock").value,active:g("active").checked,bestSeller:g("best").checked,images:imgs};
 if(cur.id)await fs.updateDoc(fs.doc(db,"products",cur.id),d);else await fs.addDoc(fs.collection(db,"products"),{...d,created:Date.now()});
 $("#pd").close();toast("Saved");go("products")}catch(err){console.error(err);$("#pe").textContent="Save failed: "+err.message}b.disabled=false};
async function seed(){const add=(c,d)=>fs.addDoc(fs.collection(db,c),d);for(const n of["10A","UA","Premium"])await add("qualities",{name:n});for(const n of["Sneakers","Running","Formal","Sandals"])await add("categories",{name:n});
 const S=[["AirRun Pro Running Shoes","Men",1499,2299,"Running"],["Urban Street Sneakers","Men",1799,2499,"Sneakers"],["Classic Leather Formals","Men",2199,2999,"Formal"],["Comfy Walk Sneakers","Women",1599,2199,"Sneakers"],["Elegance Flat Sandals","Women",999,1499,"Sandals"],["FlexFit Women's Trainers","Women",1699,2399,"Running"]];
 for(const [n,c,p,o,t] of S)await add("products",{name:n,description:"Lightweight, durable and comfortable. Upload real photos from the admin panel.",category:c,type:t,price:p,originalPrice:o,sizes:["6","7","8","9","10"],qualities:["10A","UA"],colors:["Black","White","Brown"],stock:20,active:true,bestSeller:p<1700,images:[],created:Date.now()});
 await fs.setDoc(fs.doc(db,"settings","store"),{storeName:"SOLESPHERE",whatsapp:"917510266903",instagram:"https://instagram.com/solesphere.iin",phone:"7510266903",email:"",address:"Malappuram Dt, Kerala, India"});toast("Sample data loaded");go("products")}
