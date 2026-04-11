import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// LƯU Ý BẢO MẬT TỪ CHUYÊN GIA AI:
// Thông tin bạn gửi (project_id, private_key...) là của Service Account (dùng cho Backend Node.js / Server).
// Để dùng trên frontend (React/Vite), bạn cần vào bảng điều khiển Firebase (Project Settings -> General -> Your apps -> Web app)
// để lấy đoạn mã CẤU HÌNH CLIENT (Client SDK config) như bên dưới:

const firebaseConfig = {
  apiKey: "ĐIỀN_API_KEY_CỦA_BẠN_Ở_ĐÂY",
  authDomain: "xonvccna8.firebaseapp.com",
  projectId: "xonvccna8",
  storageBucket: "xonvccna8.appspot.com",
  messagingSenderId: "ĐIỀN_MESSAGING_SENDER_ID",
  appId: "ĐIỀN_APP_ID"
};

// Khởi tạo Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
