import { auth, db, firebaseConfigured } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, updateProfile, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const status = document.getElementById("status");
function message(text, error=false){ if(status){status.textContent=text;status.classList.toggle("error",error);} }
if (!firebaseConfigured) message("Add your Firebase web configuration in js/firebase-config.js before using authentication.", true);
await setPersistence(auth, browserLocalPersistence).catch(()=>{});

const signup = document.getElementById("signup-form");
signup?.addEventListener("submit", async e => {
  e.preventDefault();
  const name=document.getElementById("fullName").value.trim();
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value;
  const confirm=document.getElementById("confirmPassword").value;
  if(name.length<2) return message("Please enter your full name.",true);
  if(password.length<8) return message("Use a password with at least 8 characters.",true);
  if(password!==confirm) return message("Passwords do not match.",true);
  const button=signup.querySelector("button[type=submit]");button.disabled=true;message("Creating your account…");
  try{
    const credential=await createUserWithEmailAndPassword(auth,email,password);
    await updateProfile(credential.user,{displayName:name});
    await setDoc(doc(db,"users",credential.user.uid),{uid:credential.user.uid,fullName:name,email,role:"student",createdAt:serverTimestamp()});
    await sendEmailVerification(credential.user);
    message("Account created. Verification email sent. Opening your dashboard…");
    location.href="dashboard.html";
  }catch(err){message(authError(err.code),true);}finally{button.disabled=false;}
});

const login=document.getElementById("login-form");
login?.addEventListener("submit",async e=>{
  e.preventDefault();const email=document.getElementById("email").value.trim(),password=document.getElementById("password").value;
  const button=login.querySelector("button[type=submit]");button.disabled=true;message("Signing in…");
  try{await signInWithEmailAndPassword(auth,email,password);location.href="dashboard.html";}
  catch(err){message(authError(err.code),true);}finally{button.disabled=false;}
});
document.getElementById("forgot")?.addEventListener("click",async()=>{
  const email=document.getElementById("email").value.trim();
  if(!email)return message("Enter your email address first.",true);
  try{await sendPasswordResetEmail(auth,email);message("If an account exists for this address, a password reset email has been sent.");}
  catch(err){message(authError(err.code),true);}
});
function authError(code){
 const errors={"auth/email-already-in-use":"This email is already registered.","auth/invalid-email":"Enter a valid email address.","auth/weak-password":"Choose a stronger password.","auth/invalid-credential":"Email or password is incorrect.","auth/user-not-found":"No account was found for this email.","auth/too-many-requests":"Too many attempts. Try again later.","auth/network-request-failed":"Network error. Check your connection."};
 return errors[code]||"Something went wrong. Please try again.";
}
