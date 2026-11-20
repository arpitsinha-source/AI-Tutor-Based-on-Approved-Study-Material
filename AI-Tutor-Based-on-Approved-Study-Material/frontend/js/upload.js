import { auth, db, storage, functions } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { ref, uploadBytesResumable, deleteObject } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js";

const input=document.getElementById("pdf-input"),zone=document.getElementById("drop-zone"),status=document.getElementById("upload-status");
let currentUser=null;
onAuthStateChanged(auth,u=>{if(!u)location.replace("login.html");else currentUser=u;});
document.getElementById("choose-files")?.addEventListener("click",()=>input.click());
input?.addEventListener("change",()=>uploadFiles([...input.files]));
["dragenter","dragover"].forEach(ev=>zone?.addEventListener(ev,e=>{e.preventDefault();zone.classList.add("drag");}));
["dragleave","drop"].forEach(ev=>zone?.addEventListener(ev,e=>{e.preventDefault();zone.classList.remove("drag");}));
zone?.addEventListener("drop",e=>uploadFiles([...e.dataTransfer.files]));
async function uploadFiles(files){
 if(!currentUser)return;
 for(const file of files){
  if(file.type!=="application/pdf"&&!file.name.toLowerCase().endsWith(".pdf")){say(`${file.name}: PDF files only.`,true);continue;}
  if(file.size>15*1024*1024){say(`${file.name}: maximum file size is 15 MB.`,true);continue;}
  const id=crypto.randomUUID(),path=`user-uploads/${currentUser.uid}/${id}.pdf`,storageRef=ref(storage,path);
  say(`Uploading ${file.name}…`);
  try{
   const task=uploadBytesResumable(storageRef,file,{contentType:"application/pdf"});
   await new Promise((resolve,reject)=>task.on("state_changed",s=>say(`Uploading ${file.name}: ${Math.round(s.bytesTransferred/s.totalBytes*100)}%`),reject,resolve));
   await setDoc(doc(db,"documents",id),{uid:currentUser.uid,fileName:file.name,storagePath:path,fileSize:file.size,subject:"General",uploadedAt:serverTimestamp(),processingStatus:"queued"});
   // Callable function securely processes the stored file; it verifies ownership itself.
   await httpsCallable(functions,"processUploadedPDF")({documentId:id}).catch(err=>{console.error(err);});
   say(`${file.name} uploaded. PDF processing has been queued.`);
  }catch(err){say(`Could not upload ${file.name}: ${err.message}`,true);}
 }
 input.value="";
}
function say(t,error=false){status.textContent=t;status.classList.toggle("error",error);}
document.getElementById("documents")?.addEventListener("click",async e=>{
 const btn=e.target.closest(".delete-doc");if(!btn||!currentUser)return;
 if(!confirm("Delete this document and its stored file?"))return;
 try{
  await httpsCallable(functions,"deleteDocument")({documentId:btn.dataset.id});
  say("Document and its indexed chunks deleted.");
 }catch(err){say(`Delete failed: ${err.message}`,true);}
});
