import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyADQqMUiT-P2OjThy5o_nNpfpEnddVOSN4",
  authDomain: "zero-2pro.firebaseapp.com",
  projectId: "zero-2pro",
  storageBucket: "zero-2pro.firebasestorage.app",
  messagingSenderId: "953176814570",
  appId: "1:953176814570:web:94ad63ec91b1a9cf03b893",
  measurementId: "G-TPYZH0PD9H",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- Global Functions ---
window.toggleModal = () => {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.toggle("hidden");
};

window.loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    localStorage.setItem("isRegistered", "true");
    localStorage.setItem("student_name", user.displayName);
    await setDoc(
      doc(db, "students", user.uid),
      {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        xp: parseInt(localStorage.getItem("user_xp")) || 0,
      },
      { merge: true },
    );
    window.toggleModal();
  } catch (error) {
    console.error("Login Error:", error);
  }
};

window.handleRegister = (event) => {
  event.preventDefault();
  const name = document.getElementById("stdName").value;
  const email = document.getElementById("stdEmail").value;
  if (name && email) {
    localStorage.setItem("student_name", name);
    localStorage.setItem("isRegistered", "true");
    document.getElementById("regForm").classList.add("hidden");
    document.getElementById("regSuccess").classList.remove("hidden");
    document.getElementById("welcomeUser").innerText =
      `မင်္ဂလာပါ ${name}၊ အခုပဲ သင်ယူမှု စတင်လိုက်ပါ။`;
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
};

window.logout = () => {
  if (confirm("Logout လုပ်မှာ သေချာပါသလား?")) {
    signOut(auth).then(() => {
      localStorage.clear();
      window.location.href = "/index.html";
    });
  }
};

window.handleStartClick = () => {
  const isReg = localStorage.getItem("isRegistered") === "true";
  if (isReg || auth.currentUser) {
    const roadmap = document.getElementById("roadmap-container");
    if (roadmap) roadmap.scrollIntoView({ behavior: "smooth" });
  } else {
    window.toggleModal();
  }
};

window.resetEverything = () => {
  if (confirm("မှတ်တမ်းများအားလုံး ဖျက်ပစ်မှာ သေချာပါသလား?")) {
    localStorage.clear();
    window.location.href = "/index.html";
  }
};

// --- UI SYNC LOGIC (အရေးကြီးဆုံးအပိုင်း) ---
function syncUI(user) {
  const isReg = localStorage.getItem("isRegistered") === "true";
  const roadmapContent = document.getElementById("roadmap-content");
  const lockMsg = document.getElementById("lock-msg");
  const navAuthBtn = document.getElementById("navAuthBtn");
  const heroBtn = document.getElementById("heroBtn");
  const xpCount = document.getElementById("xp-count");

  // XP Update
  if (xpCount) xpCount.innerText = localStorage.getItem("user_xp") || 0;

  if (user || isReg) {
    // Unlock Logic
    if (roadmapContent)
      roadmapContent.classList.remove("content-locked", "opacity-50");
    if (lockMsg) lockMsg.style.display = "none";
    if (heroBtn) heroBtn.innerText = "သင်ခန်းစာများသို့ သွားမည်";

    // Profile/Logout Logic
    if (navAuthBtn) {
      const displayName = user
        ? user.displayName
        : localStorage.getItem("student_name") || "Student";
      navAuthBtn.innerHTML = `
                <div class="flex items-center gap-2 cursor-pointer" onclick="logout()">
                    <span class="text-sm font-bold text-indigo-400">${displayName.split(" ")[0]}</span>
                    <i class="fas fa-sign-out-alt text-gray-500"></i>
                </div>`;
    }

    // ✨ Launch Project ခလုတ်ကို Dynamic လုပ်ခြင်း (ID နဲ့ ရှာတာ ပိုစိတ်ချရပါတယ်)
    // const launchBtn = document.getElementById("launch-btn");
    // if (launchBtn) {
    //     const isGraduated = localStorage.getItem('course_status') === 'graduated';
    //     if (isGraduated) {
    //         launchBtn.innerText = "View Final Project ✨";
    //         launchBtn.href = "/modules/module6/lesson3.html"; // Graduation Page
    //         launchBtn.classList.replace('bg-orange-600', 'bg-emerald-600');
    //     } else {
    //         // ဒီနေရာမှာ lesson1 မဟုတ်ဘဲ lesson3 (သို့မဟုတ်) module 6 ရဲ့ အစကို ပို့ပေးပါ
    //         launchBtn.innerText = "Start Final Module 🚀";
    //         launchBtn.href = "/modules/module6/lesson1.html";
    //     }
    // }
  } else {
    // Locked Logic
    if (roadmapContent) roadmapContent.classList.add("content-locked");
    if (lockMsg) lockMsg.style.display = "block";
  }
}

// ၁။ သင်ရိုးညွှန်းတမ်း မြေပုံ (Module 7 အထိ တိုးထားပေးပါသည်)
const curriculumMap = {
  1: 4, 
  2: 4, 
  3: 4,
  4: 4,
  5: 4,
  6: 4,
  7: 4,
};

window.setupDynamicNav = () => {
  const path = window.location.pathname;
  const navContainer = document.getElementById("dynamic-nav");

  if (!navContainer) return;

  let nextPath = "";
  let nextText = "";

  // ၂။ ✨ Pre-work Folder အတွက် Logic အသစ် (Regex မတိုင်ခင် စစ်မည်)
  if (path.includes("prework")) {
    if (path.includes("git-github.html")) {
      nextPath = "/modules/prework/git-setup.html";
      nextText = "နောက်သင်ခန်းစာ (Git Setup) သို့";
    } else if (path.includes("git-setup.html")) {
      nextPath = "/modules/module1/lesson1.html";
      nextText = "Module 1 ကို စတင်မည်";
    }

    // Pre-work အတွက် UI ထုတ်ပေးပြီး function ကို ဒီမှာတင် ရပ်လိုက်မည်
    if (nextPath) {
      renderNav(navContainer, nextPath, nextText);
    }
    return; 
  }

  // ၃။ လက်ရှိ Standard Modules များအတွက် Regex Logic (နဂိုအတိုင်း)
  const match = path.match(/module(\d+)\/lesson(\d+)(_detail)?/);
  if (!match) return;

  let m = parseInt(match[1]); 
  let l = parseInt(match[2]); 
  let isDetail = !!match[3]; 

  if (!isDetail) {
    nextPath = `/modules/module${m}/lesson${l}_detail.html`;
    nextText = `နက်နဲသောအချက်များ (Deep Dive ${m}.${l})`;
  } else {
    let nextL = l + 1;
    let nextM = m;

    if (nextL > curriculumMap[m]) {
      nextM = m + 1;
      nextL = 1;
    }

    // သင်ရိုးပြီးဆုံးမှု စစ်ဆေးခြင်း (Module 7 ထိ ပြင်ထားပါသည်)
    if (nextM > 7) {
      navContainer.innerHTML = `
                <a href="/index.html" class="text-gray-400 hover:text-white transition text-sm italic underline">Dashboard သို့ ပြန်သွားရန်</a>
                <div class="bg-emerald-600/20 border border-emerald-500 text-emerald-400 px-8 py-4 rounded-2xl font-bold">သင်ရိုးအားလုံး ပြီးဆုံးပါပြီ 🎓</div>`;
      return;
    }

    nextPath = `/modules/module${nextM}/lesson${nextL}.html`;
    nextText = `နောက်သင်ခန်းစာ (${nextM}.${nextL}) သို့သွားမည်`;
  }

  // standard render ကို ခေါ်ယူခြင်း
  renderNav(navContainer, nextPath, nextText);
};

// ၄။ UI ထုတ်ပေးသည့် Function (ကုဒ်များ ထပ်မနေစေရန် သီးသန့်ခွဲထုတ်ထားပါသည်)
function renderNav(container, path, text) {
  container.innerHTML = `
        <a href="/index.html" class="text-gray-400 hover:text-white transition text-sm italic underline">
            <i class="fas fa-arrow-left mr-2"></i> Dashboard
        </a>
        <a href="${path}" 
           class="group bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center gap-3 transition-all transform hover:scale-105 text-center">
            ${text} 
            <i class="fas fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
        </a>
    `;
}

// Auth Listener
onAuthStateChanged(auth, async (user) => {
  // ၁။ Dashboard UI ကို အရင် Sync လုပ်မယ် (ဒါက Page တိုင်းအတွက် အလုပ်လုပ်တယ်)
  syncUI(user);

  const isReg = localStorage.getItem("isRegistered") === "true";
  const isLessonPage = window.location.pathname.includes("lesson"); // လက်ရှိ page က lesson ဟုတ်မဟုတ်စစ်ခြင်း

  if (user || isReg) {
    // ၂။ Lesson Page ဖြစ်မှသာ ဒီ ID တွေကို ရှာပြီး style ပြင်မယ်
    const loader = document.getElementById("lesson-loader");
    const content = document.getElementById("lesson-content");
    const noteBox = document.getElementById("lessonNote");

    if (loader) loader.style.display = "none";
    if (content) content.style.display = "block";

    // ၃။ Navigation ခလုတ်ကို လှမ်းခေါ်မယ်
    window.setupDynamicNav();

    // ၄။ LESSON_ID ရှိမှ (Lesson page ဖြစ်မှ) မှတ်စုကို ဆွဲထုတ်မယ်
    if (typeof LESSON_ID !== "undefined" && noteBox) {
      const savedNote = localStorage.getItem("note_" + LESSON_ID);
      if (savedNote) noteBox.value = savedNote;
    }
  } else {
    // ၅။ Login မဝင်ထားဘဲ Lesson Page ကို လာကြည့်ရင် Dashboard ကို ပြန်ပို့မယ်
    if (isLessonPage) {
      window.location.href = "/index.html";
    }
  }
});

// Announcements & Leaderboard (Firestore)
const announceBox = document.getElementById("announcement-list");
if (announceBox) {
  onSnapshot(
    collection(db, "announcements"),
    (snapshot) => {
      announceBox.innerHTML = "";
      snapshot.forEach((doc) => {
        announceBox.innerHTML += `<div class="bg-blue-900/20 p-3 mb-2 rounded-xl text-xs text-blue-200 border-l-4 border-blue-500">${doc.data().text}</div>`;
      });
    },
    (err) => {
      console.log("Announcement access denied or empty");
    },
  );
}

// သင်တန်းဆင်းခြင်း Logic
window.graduate = async () => {
  const user = auth.currentUser;
  let xp = parseInt(localStorage.getItem("user_xp")) || 0;
  xp += 500;

  localStorage.setItem("user_xp", xp);
  localStorage.setItem("course_status", "graduated");

  if (user) {
    await setDoc(
      doc(db, "students", user.uid),
      { xp: xp, status: "graduated" },
      { merge: true },
    );
  }

  alert(
    "ဂုဏ်ယူပါတယ်! သင်ဟာ Professional React Developer တစ်ယောက် ဖြစ်သွားပါပြီ။ 🎓✨",
  );
  window.location.href = "/index.html";
};
