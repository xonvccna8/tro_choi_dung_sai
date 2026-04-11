import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="rounded-3xl bg-white/95 p-6 text-center shadow-xl">
        <h1 className="text-3xl font-black text-violet-700">404</h1>
        <p>Khong tim thay trang</p>
        <Link className="mt-3 inline-block rounded-xl bg-violet-600 px-4 py-2 text-white" to="/dashboard">
          Ve dashboard
        </Link>
      </div>
    </main>
  );
}
