import { useNavigate, useParams } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { getBook } from '../data/db'
import { Icon } from '../components/ui'

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')

function pdfUrl(pdfPath: string): string {
  const safePath = pdfPath.split('/').map(encodeURIComponent).join('/')
  return `${apiBaseUrl}/pdfs/${safePath}`
}

export default function Reader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, lang } = useT()
  const { user, canRead, isSubscribed } = useApp()
  const book = getBook(id ?? '')
  const so = lang === 'so'

  if (!book) return <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-soft">404</div>

  if (!canRead(book.id)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-status-warning bg-[#F6EAD3] text-[#85561A]"><Icon.Lock className="h-6 w-6" /></span>
        <h1 className="display-title mt-2">{so ? 'Gelitaan la xaday' : 'Access restricted'}</h1>
        <p className="lede max-w-sm">{so ? 'Waxaad u baahan tahay rukun firfiran ama iibsasho si aad u akhrido buuggan.' : 'You need an active subscription or a purchase to read this book.'}</p>
        <div className="mt-4 flex gap-2"><button type="button" onClick={() => navigate(-1)} className="btn-outline">{t('common.back')}</button><button type="button" onClick={() => navigate('/plans')} className="btn-primary">{so ? 'Dooro qorshe' : 'Choose a plan'}</button></div>
        {!isSubscribed && <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-ink-faint">SML · {user?.email ?? 'guest'}</p>}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF7EF]">
      <header className="border-b border-divider bg-[#FBF7EF]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <button type="button" onClick={() => navigate(`/book/${book.id}`)} aria-label={t('common.back')} className="flex h-9 w-9 items-center justify-center rounded-btn text-ink-soft transition-colors hover:bg-inset hover:text-ink"><Icon.ArrowLeft className="h-4 w-4" /></button>
          <div className="min-w-0 flex-1"><h1 className="truncate font-display text-sm font-semibold tracking-tight text-ink">{book.title}</h1><p className="truncate text-[10px] uppercase tracking-[0.12em] text-ink-faint">{book.author}</p></div>
        </div>
      </header>
      <main className="flex-1 p-3 sm:p-5">
        {book.pdfPath ? <iframe src={pdfUrl(book.pdfPath)} title={book.title} className="h-[calc(100vh-6.5rem)] w-full rounded-card border border-divider bg-surface" /> : <div className="flex h-[calc(100vh-6.5rem)] items-center justify-center rounded-card border border-divider bg-surface px-6 text-center text-sm text-ink-soft">{so ? 'Buuggan weli PDF looma dejin.' : 'No PDF has been configured for this book yet.'}</div>}
      </main>
    </div>
  )
}
