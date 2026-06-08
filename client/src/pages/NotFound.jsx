import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-night bg-stadium-mesh px-4 text-center">
      <div className="animate-fade-up">
        <div className="num text-7xl font-black text-gold">404</div>
        <h1 className="mt-4 text-2xl font-black text-white">הדף לא נמצא</h1>
        <p className="mt-2 text-slate-400">נראה שהכדור יצא מהמגרש…</p>
        <Link to="/" className="btn-gold mt-6">
          חזרה לעמוד הבית
        </Link>
      </div>
    </div>
  )
}
