import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { collection, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
const welcome=document.getElementById("welcome"),label=document.getElementById("user-label"),list=document.getElementById("documents");
onAuthStateChanged(auth,user=>{
 if(!user)return location.replace("login.html");
 welcome.textContent=`Welcome back, ${user.displayName||"Student"}`;
 label.textContent=user.email||"";
 const q=query(collection(db,"documents"),where("uid","==",user.uid),orderBy("uploadedAt","desc"));
 onSnapshot(q,snap=>{
   list.innerHTML="";
   if(snap.empty){list.innerHTML='<p class="muted">No PDFs uploaded yet. Add your first study document above.</p>';return;}
   snap.forEach(d=>{
    const x=d.data(),row=document.createElement("div");row.className="document-item";
    const meta=document.createElement("div");meta.className="document-meta";
    const title=document.createElement("b");title.textContent=x.fileName||"Study document";
    const sub=document.createElement("small");sub.textContent=`${x.subject||"Uncategorised"} · ${x.processingStatus||"uploaded"}`;
    meta.append(title,sub);
    const status=document.createElement("span");status.className="document-status";status.textContent=x.processingStatus==="ready"?"Ready":x.processingStatus==="error"?"Processing error":"Processing";
    const del=document.createElement("button");del.className="delete-doc";del.textContent="Delete";del.dataset.id=d.id;
    row.append(meta,status,del);list.append(row);
   });
 });
});
