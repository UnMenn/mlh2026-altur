import { Link } from 'react-router-dom'
export function Header() {
  return (
    <header className="header">
      <div className="brand">
        altur<span>.</span>
      </div>

      <div className="header__actions">
        <Link
          to="/"
          className="back-to-analyzer"
        >
          Analizador
        </Link>

        <div className="demo-pill">
          Demo omnicanal
        </div>
      </div>
    </header>
  )
}