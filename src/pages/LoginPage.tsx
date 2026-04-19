import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useGameStore } from "../store/useGameStore";
import { auth, hasFirebaseConfig } from "../lib/firebase";
import { useAppAuth } from "../lib/AuthContext";
import {
  createAppUserProfile,
  getAppUserProfile,
  resolveAvatarForRole,
  resolveHomeRouteForRole,
  type RegisterableRole,
} from "../lib/userProfiles";
import {
  AlertCircle,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  Lock,
  LogIn,
  Mail,
  User,
  UserPlus,
} from "lucide-react";

function resolveFirebaseError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const message = typeof error === "object" && error && "message" in error ? String(error.message) : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.";
    case "auth/invalid-email":
      return "Email không hợp lệ.";
    case "auth/weak-password":
      return "Mật khẩu quá yếu. Hãy dùng ít nhất 6 ký tự.";
    case "auth/user-not-found":
      return "Không tìm thấy tài khoản với email này.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email hoặc mật khẩu không chính xác.";
    case "auth/network-request-failed":
      return "Không thể kết nối đến Firebase. Hãy kiểm tra mạng và miền được phép.";
    default:
      return message || "Có lỗi xảy ra. Vui lòng thử lại.";
  }
}

const heroHighlights = [
  { label: "Tương tác", icon: <BrainCircuit className="h-4 w-4" /> },
  { label: "Giáo viên", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Học sinh", icon: <GraduationCap className="h-4 w-4" /> },
];

const MOCK_ACCOUNTS: Record<string, { pass: string; role: "admin" | "teacher" | "student"; name: string }> = {
  // Quản trị
  "admin@app.com": { pass: "admin123", role: "admin", name: "Quản trị hệ thống" },
  // Giáo viên
  "nvxo@gmail.com": { pass: "123456", role: "teacher", name: "NGUYỄN VĂN XÔ" },
  "ntmb@gmail.com": { pass: "123456", role: "teacher", name: "NGUYỄN THỊ MỸ BÌNH" },
  "giaovien@app.com": { pass: "123456", role: "teacher", name: "Giáo viên Demo" },
  // Học sinh
  "hs000001@gmail.com": { pass: "000001", role: "student", name: "Huỳnh Thái An" },
  "hs000002@gmail.com": { pass: "000002", role: "student", name: "Phạm Đình Bảo Anh" },
  "hs000003@gmail.com": { pass: "000003", role: "student", name: "Tống Ngọc Hải Âu" },
  "hs000004@gmail.com": { pass: "000004", role: "student", name: "Nguyễn Trọng Đạt" },
  "hs000005@gmail.com": { pass: "000005", role: "student", name: "Nguyễn Quang Đạt" },
  "hs000006@gmail.com": { pass: "000006", role: "student", name: "Nguyễn Anh Đức" },
  "hs000007@gmail.com": { pass: "000007", role: "student", name: "Nguyễn Trung Dũng" },
  "hs000008@gmail.com": { pass: "000008", role: "student", name: "Trần Minh Hoàng" },
  "hs000009@gmail.com": { pass: "000009", role: "student", name: "Nguyễn Văn Huy" },
  "hs000010@gmail.com": { pass: "000010", role: "student", name: "Nguyễn Dũng Kiên" },
  "hs000011@gmail.com": { pass: "000011", role: "student", name: "Vũ Tuấn Kiệt" },
  "hs000012@gmail.com": { pass: "000012", role: "student", name: "Hoàng Khánh Ly" },
  "hs000013@gmail.com": { pass: "000013", role: "student", name: "Trần Trà My" },
  "hs000014@gmail.com": { pass: "000014", role: "student", name: "Nguyễn Văn Hoàng Sâm" },
  "hs000015@gmail.com": { pass: "000015", role: "student", name: "Nguyễn Văn Sơn" },
  "hs000016@gmail.com": { pass: "000016", role: "student", name: "Lưu Đình Tài" },
  "hs000017@gmail.com": { pass: "000017", role: "student", name: "Nguyễn Hữu Tuấn" },
  "hs000018@gmail.com": { pass: "000018", role: "student", name: "Phan Bá Tùng" },
  "hs000019@gmail.com": { pass: "000019", role: "student", name: "Nguyễn Long Khánh" },
  "hs000020@gmail.com": { pass: "000020", role: "student", name: "Nguyễn Bá Trường" },
  "hs000021@gmail.com": { pass: "000021", role: "student", name: "Nguyễn Thị Quỳnh Chi" },
  "hs000022@gmail.com": { pass: "000022", role: "student", name: "Nguyễn Trần Đăng" },
  "hs000023@gmail.com": { pass: "000023", role: "student", name: "Trịnh Đức Duy" },
  "hs000024@gmail.com": { pass: "000024", role: "student", name: "Thái Văn Duy" },
  "hs000025@gmail.com": { pass: "000025", role: "student", name: "Lê Chu Tuấn Duy" },
  "hs000026@gmail.com": { pass: "000026", role: "student", name: "Lê Huy Hoàng" },
  "hs000027@gmail.com": { pass: "000027", role: "student", name: "Nguyễn Thị Thanh Huyền" },
  "hs000028@gmail.com": { pass: "000028", role: "student", name: "Chương Tấn Sang" },
  "hs000029@gmail.com": { pass: "000029", role: "student", name: "Nguyễn Thị Thảo Sương" },
  "hs000030@gmail.com": { pass: "000030", role: "student", name: "Nguyễn Thị Hà Thủy" },
  "hs000031@gmail.com": { pass: "000031", role: "student", name: "Nguyễn Thị Huyền Trang" },
  "hs000032@gmail.com": { pass: "000032", role: "student", name: "Nguyễn Thị Cẩm Tú" },
  "hs000033@gmail.com": { pass: "000033", role: "student", name: "Nguyễn Hoàng Tuấn" },
  "hs000034@gmail.com": { pass: "000034", role: "student", name: "Hà Thảo Uyên" },
  "hs000035@gmail.com": { pass: "000035", role: "student", name: "Lê Thị Bảo Hà" }
};

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useGameStore((s) => s.setUser);
  const { profile, loading: authLoading, isConfigured } = useAppAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<RegisterableRole>("student");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      navigate(resolveHomeRouteForRole(profile.role), { replace: true });
    }
  }, [navigate, profile]);

  const handleDemoSubmit = () => {
    const emailKey = email.trim().toLowerCase();
    
    // Đang ở chế độ trải nghiệm cục bộ
    if (isLogin) {
      if (MOCK_ACCOUNTS[emailKey]) {
        if (MOCK_ACCOUNTS[emailKey].pass !== password) {
          setError("Mật khẩu không chính xác.");
          setSubmitting(false);
          return;
        }
        // Đăng nhập thành công với tài khoản hardcode
        const acc = MOCK_ACCOUNTS[emailKey];
        const nextUser = {
          id: `demo-${Date.now()}`,
          name: acc.name,
          avatar: resolveAvatarForRole(acc.role),
          role: acc.role,
        };
        setUser(nextUser);
        navigate(resolveHomeRouteForRole(nextUser.role), { replace: true });
        return;
      } else {
        // Tài khoản không có thật
        setError("Tài khoản chưa được khởi tạo. Vui lòng kiểm tra lại email.");
        setSubmitting(false);
        return;
      }
    } else {
      // Logic đăng ký tạm thời (chỉ dùng cục bộ)
      let userRole: "admin" | "teacher" | "student" = role;
      let userName = name.trim() || email.split("@")[0] || "Người dùng";
  
      if (emailKey === "admin@app.com") { userRole = "admin"; userName = "Quản trị hệ thống"; }
      else if (emailKey === "giaovien@app.com") { userRole = "teacher"; userName = name.trim() || "Cô giáo Hóa"; }
  
      const nextUser = {
        id: `demo-${Date.now()}`,
        name: userName,
        avatar: resolveAvatarForRole(userRole),
        role: userRole,
      };
  
      setUser(nextUser);
      navigate(resolveHomeRouteForRole(nextUser.role), { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (!hasFirebaseConfig || !isConfigured) {
        handleDemoSubmit();
        return;
      }

      if (!auth) {
        throw new Error("Firebase Auth chưa khởi tạo xong. Hãy kiểm tra biến VITE_FIREBASE_*.");
      }

      if (isLogin) {
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const nextProfile = await getAppUserProfile(credential.user.uid, credential.user.email);

        if (!nextProfile) {
          await signOut(auth);
          throw new Error("Tài khoản đã đăng nhập nhưng chưa có hồ sơ phân quyền trong Firestore.");
        }

        setUser(nextProfile);
        navigate(resolveHomeRouteForRole(nextProfile.role), { replace: true });
        return;
      }

      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const nextProfile = await createAppUserProfile({
        uid: credential.user.uid,
        email: email.trim(),
        name,
        role,
      });

      setUser(nextProfile);
      navigate(resolveHomeRouteForRole(nextProfile.role), { replace: true });
    } catch (nextError) {
      setError(resolveFirebaseError(nextError));
    } finally {
      setSubmitting(false);
    }
  };

  const busy = authLoading || submitting;
  const modeLabel = isConfigured ? "Đồng bộ đăng nhập Firebase" : "Chế độ trải nghiệm";
  const modeChips = isConfigured ? ["Firebase", "Phân quyền", "Đồng bộ"] : [];

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-indigo-50/50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(217,70,239,0.12),_transparent_35%),linear-gradient(135deg,_#eff6ff_0%,_#e0e7ff_50%,_#f3e8ff_100%)]" />
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-violet-400/20 blur-[120px]" />
      <div className="absolute -right-32 bottom-10 h-[28rem] w-[28rem] rounded-full bg-fuchsia-400/20 blur-[130px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded-[2.5rem] border border-white bg-white/90 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.15)] backdrop-blur-2xl lg:min-h-[720px] lg:flex-row">
        <section className="relative hidden flex-1 overflow-hidden bg-slate-50/50 p-10 lg:flex lg:flex-col lg:gap-8">
          <div>
            <div className="mb-10 inline-flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-[0_8px_20px_rgba(79,70,229,0.06)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-[0_4px_20px_rgba(168,85,247,0.35)]">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">TRÒ CHƠI HÓA HỌC</h2>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex min-h-0 flex-1 flex-col gap-5"
          >
            <div className="relative flex-1 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.1),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(217,70,239,0.1),_transparent_30%)]" />
              <motion.img
                src="/education-login-hero.svg"
                alt="Khung cảnh lớp học hiện đại với giáo viên và học sinh"
                className="relative z-10 h-full w-full object-cover opacity-95"
                initial={{ scale: 1.06 }}
                animate={{ scale: [1.04, 1.08, 1.04], x: [0, -10, 0], y: [0, -8, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-white via-white/20 to-transparent" />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: [0, -6, 0] }}
                transition={{ opacity: { duration: 0.55, delay: 0.1 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
                className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-700 shadow-md backdrop-blur-xl"
              >
                Ảnh lớp học
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.15, ease: "easeOut" }}
                className="absolute inset-x-6 bottom-6 z-20 rounded-[1.75rem] border border-white bg-white/80 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl"
              >
                <h1 className="mt-3 max-w-xl text-2xl font-black leading-tight text-slate-800 xl:text-[2.2rem]">
                  Vào lớp Hóa số
                </h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Ảnh lớn</span>
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Dễ nhìn</span>
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Ưu tiên điện thoại</span>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs font-bold uppercase tracking-[0.1em] text-slate-600">
              {heroHighlights.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.22 + index * 0.08, ease: "easeOut" }}
                  className="rounded-2xl border border-white bg-white/80 px-3 py-3 shadow-[0_4px_15px_rgba(0,0,0,0.03)] backdrop-blur-md"
                >
                  <div className="flex items-center justify-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="safe-pt safe-pb flex w-full flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
          <div className="relative w-full max-w-[470px] overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.06)] sm:p-8">
            <div className="absolute inset-x-10 top-0 h-36 bg-gradient-to-b from-sky-300/15 via-violet-300/10 to-transparent blur-3xl" />

            <div className="relative z-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-[0_8px_25px_rgba(217,70,239,0.3)]">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-600/80">{modeLabel}</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">TRÒ CHƠI HÓA HỌC</h2>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {modeChips.map((chip) => (
                  <span key={chip} className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-7 rounded-2xl border border-slate-100 bg-slate-50 p-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${isLogin ? "background-white text-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.06)] bg-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${!isLogin ? "background-white text-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.06)] bg-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}
                >
                  Đăng ký
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="relative z-10 mt-6 space-y-4">
              {!isLogin && (
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Họ và tên</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm transition-all focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-400/10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Email</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="tenban@truonghoc.edu.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm transition-all focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-400/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Mật khẩu</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium tracking-[0.2em] text-slate-900 placeholder:text-slate-400 shadow-sm transition-all focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-400/10"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="rounded-2xl border border-slate-200 bg-white/60 p-3.5 shadow-sm">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Vai trò khi tạo tài khoản</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`rounded-2xl border p-3 text-left transition-all ${role === "student" ? "border-violet-400/60 bg-violet-50 text-violet-800 shadow-[0_2px_12px_rgba(139,92,246,0.15)]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800"}`}
                    >
                      <GraduationCap className={`mb-2 h-5 w-5 ${role === "student" ? "text-violet-600" : "text-slate-400"}`} />
                      <p className="text-sm font-bold">Học sinh</p>
                      <div className="mt-2 inline-flex rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Học · Chơi</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("teacher")}
                      className={`rounded-2xl border p-3 text-left transition-all ${role === "teacher" ? "border-fuchsia-400/60 bg-fuchsia-100/50 text-fuchsia-900 shadow-[0_2px_12px_rgba(217,70,239,0.15)]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800"}`}
                    >
                      <BookOpen className={`mb-2 h-5 w-5 ${role === "teacher" ? "text-fuchsia-600" : "text-slate-400"}`} />
                      <p className="text-sm font-bold">Giáo viên</p>
                      <div className="mt-2 inline-flex rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Tạo · Quản lý</div>
                    </button>
                  </div>
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-800">
                    Quản trị tạo riêng trong Firebase.
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-500" />
                  <p className="leading-6">{error}</p>
                </div>
              )}


              <button
                type="submit"
                disabled={busy}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 py-4 text-sm font-black text-white shadow-[0_12px_30px_rgba(217,70,239,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(217,70,239,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Đang xử lý...
                  </>
                ) : isLogin ? (
                  <>
                    <LogIn className="h-5 w-5" />
                    Đăng nhập vào hệ thống
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Tạo tài khoản mới
                  </>
                )}
              </button>
            </form>

            <div className="relative z-10 mt-7 text-center text-sm text-slate-500">
              <p>{isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}</p>
              <button
                type="button"
                onClick={() => {
                  setIsLogin((value) => !value);
                  setError("");
                }}
                className="mt-2 font-bold text-violet-600 transition-colors hover:text-violet-500"
              >
                {isLogin ? "Chuyển sang đăng ký" : "Quay lại đăng nhập"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
