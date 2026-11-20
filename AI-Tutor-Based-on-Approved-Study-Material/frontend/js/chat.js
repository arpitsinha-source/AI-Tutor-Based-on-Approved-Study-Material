import { auth, functions } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js";
const form=document.getElementById("chat-form"),field=document.getElementById("question"),messages=document.getElementById("messages"),status=document.getElementById("chat-status"),send=document.getElementById("send");
let user=null,conversationId=crypto.randomUUID();
onAuthStateChanged(auth,u=>{if(!u)return location.replace("login.html");user=u;});
document.getElementById("logout")?.addEventListener("click",async()=>{await signOut(auth);location.href="index.html";});
form.addEventListener("submit",async e=>{
 e.preventDefault();const question=field.value.trim();if(!question||!user)return;
 append("user",question);field.value="";send.disabled=true;status.textContent="Searching your study material…";
 const loading=append("assistant","Searching relevant pages and preparing an answer…");
 try{
  const ask=httpsCallable(functions,"askAITutor");
  const result=await ask({question,conversationId});
  loading.querySelector(".bubble").textContent=result.data.answer||"No answer was returned.";
  if(result.data.sources?.length){
   const box=document.createElement("div");box.className="sources";box.textContent="Sources";
   result.data.sources.forEach(s=>{const item=document.createElement("div");item.className="source-item";item.textContent=`${s.fileName||"Study document"} · Page ${s.pageNumber}`;box.append(item);});
   loading.querySelector(".bubble").append(box);
  }
  status.textContent="";
 }catch(err){loading.querySelector(".bubble").textContent=err.message||"The tutor could not answer this question. Try again.";status.textContent="";}
 finally{send.disabled=false;field.focus();}
});
function append(role,text){const row=document.createElement("div");row.className=`message ${role}`;const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=text;row.append(bubble);messages.append(row);messages.scrollTop=messages.scrollHeight;return row;}
