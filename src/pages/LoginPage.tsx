import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import { ShieldAlert, BookOpen, GraduationCap, Lock, Mail, User } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useGameStore((s) => s.setUser);
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // MOCK V� D? PH�N QUY?N V� CHUA K?T N?I REAL FIREBASE
    let userRole: "admin" | "teacher" | "student" = "student";
    let userName = name || email.split("@")[0] || "Ngu?i d�ng";
    let avatar = "?????";

    if (email === "admin@app.com") {
      userRole = "admin";
      userName = "Admin H? Th?ng";
      avatar = "??";
    } else if (email === "giaovien@app.com") {
      userRole = "teacher";
      userName = userName || "C� gi�o H�a";
      avatar = "?????";
    }

    setUser({
      id: `usr-${Date.now()}`,
      name: userName,
      avatar,
      role: userRole,
    });

    if (userRole === "admin") navigate("/admin");
    else if (userRole === "teacher") navigate("/teacher");
    else navigate("/dashboard");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-600 via-fuchsia-600 to-sky-500 overflow-hidden py-10 px-4">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-[2.5rem] bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 shadow-lg">
          <BookOpen className="h-10 w-10 text-white" />
        </div>

        <h1 className="text-center text-3xl font-black text-slate-800 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
          HOA HOC QUEST
        </h1>
        <p className="mt-2 text-center text-sm font-medium text-slate-500">
          H? th?ng luy?n thi ph�n quy?n chu?n
        </p>

        <div className="mt-8 flex rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${isLogin ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            �ang Nh?p
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${!isLogin ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            �ang K�
          </button>
        </div>

        <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
          {!isLogin && (
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="H? v� t�n"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-transparent bg-slate-100 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                required={!isLogin}
              />
            </div>
          )}

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="Email c?a b?n"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-transparent bg-slate-100 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
              required
            />
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="M?t kh?u"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-transparent bg-slate-100 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
              required
            />
          </div>

          {!isLogin && (
            <div className="pt-2">
              <p className="mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">B?n l� ai?</p>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setRole("student")}
                  className={`cursor-pointer rounded-2xl border-2 p-3 text-center transition-all ${role === "student" ? "border-violet-500 bg-violet-50" : "border-slate-100 bg-white hover:border-slate-200"}`}
                >
                  <GraduationCap className={`mx-auto mb-2 h-6 w-6 ${role === "student" ? "text-violet-600" : "text-slate-400"}`} />
                  <p className={`text-sm font-bold ${role === "student" ? "text-violet-700" : "text-slate-600"}`}>H?c Sinh</p>
                </div>
                <div 
                  onClick={() => setRole("teacher")}
                  className={`cursor-pointer rounded-2xl border-2 p-3 text-center transition-all ${role === "teacher" ? "border-amber-500 bg-amber-50" : "border-slate-100 bg-white hover:border-slate-200"}`}
                >
                  <BookOpen className={`mx-auto mb-2 h-6 w-6 ${role === "teacher" ? "text-amber-600" : "text-slate-400"}`} />
                  <p className={`text-sm font-bold ${role === "teacher" ? "text-amber-700" : "text-slate-600"}`}>Gi�o Vi�n</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-4 text-sm font-black text-white shadow-lg shadow-violet-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/40"
          >
            {isLogin ? "�ang Nh?p V�o H? Th?ng" : "T?o T�i Kho?n"}
          </button>
        </form>

        {isLogin && (
          <div className="mt-8 rounded-2xl bg-blue-50 p-4 border border-blue-100 text-sm text-blue-800">
            <div className="flex items-center gap-2 font-bold mb-2">
              <ShieldAlert size={16} /> <p>M?u Ph�n Quy?n (Testing):</p>
            </div>
            <ul className="list-inside list-disc pl-2 space-y-1 text-xs">
              <li>Nh?p <code className="font-bold bg-blue-100 px-1 rounded">admin@app.com</code> &rarr; Admin Dashboard</li>
              <li>Nh?p <code className="font-bold bg-blue-100 px-1 rounded">giaovien@app.com</code> &rarr; Teacher Dashboard</li>
              <li>Nh?p <code className="font-bold bg-blue-100 px-1 rounded">b?t k?</code> &rarr; Student App</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
