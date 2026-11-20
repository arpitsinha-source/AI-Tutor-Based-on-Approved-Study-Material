import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

document.getElementById("logout")?.addEventListener("click", async () => {
  await signOut(auth);
  location.href = "index.html";
});

const profileName = document.getElementById("profile-name");
if (profileName) {
  onAuthStateChanged(auth, async user => {
    if (!user) return location.replace("login.html");
    const snap = await getDoc(doc(db, "users", user.uid));
    profileName.textContent = snap.exists() ? snap.data().fullName : user.displayName || "Student";
    document.getElementById("profile-email").textContent = user.email || "";
  });
}
