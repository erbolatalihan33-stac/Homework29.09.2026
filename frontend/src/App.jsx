import { useEffect, useState } from 'react'
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Check, ChevronDown, CircleHelp, Command, Fingerprint, KeyRound, LayoutDashboard, LockKeyhole, LogOut, Menu, Search, Shield, ShieldCheck, Sparkles, UserRound, Users, X } from 'lucide-react'

const API = '/api'
const initialStats = [
  { name: 'Активные сессии', value: '01', change: 'Только вы', direction: 'up', icon: Users, tone: 'mint' },
  { name: 'Статус защиты', value: 'Защищён', change: 'JWT активен', direction: 'up', icon: ShieldCheck, tone: 'blue' },
  { name: 'Последний вход', value: 'Сейчас', change: 'Текущая сессия', direction: 'up', icon: Activity, tone: 'violet' },
]

function readStoredTokens() {
  try { return JSON.parse(localStorage.getItem('jwtTokens') || 'null') } catch { return null }
}

export default function App() {
  const [tokens, setTokens] = useState(readStoredTokens)
  const [user, setUser] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState('')

  function saveTokens(next) {
    setTokens(next)
    localStorage.setItem('jwtTokens', JSON.stringify(next))
  }

  async function requestProtected(path, currentTokens = tokens) {
    let response = await fetch(`${API}/${path}`, { headers: { Authorization: `Bearer ${currentTokens.access}` } })
    if (response.status === 401 && currentTokens.refresh) {
      const refreshResponse = await fetch(`${API}/auth/refresh/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh: currentTokens.refresh }),
      })
      if (!refreshResponse.ok) throw new Error('Сессия завершилась. Войдите снова.')
      const rotated = await refreshResponse.json()
      currentTokens.access = rotated.access
      currentTokens.refresh = rotated.refresh || currentTokens.refresh
      saveTokens({ ...currentTokens })
      response = await fetch(`${API}/${path}`, { headers: { Authorization: `Bearer ${currentTokens.access}` } })
    }
    if (!response.ok) throw new Error('Не удалось получить защищённые данные.')
    return response.json()
  }

  async function loadSession(currentTokens = tokens) {
    if (!currentTokens?.access) return
    try {
      // Keep protected calls sequential: refresh rotation invalidates the old
      // refresh token, so two simultaneous 401 responses could race each other.
      const profile = await requestProtected('auth/me/', currentTokens)
      const data = await requestProtected('dashboard/', currentTokens)
      setUser(profile)
      setDashboard(data)
    } catch (e) { logout(false); setError(e.message) }
  }

  useEffect(() => { if (tokens?.access) loadSession(tokens) }, [])

  async function login(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      const response = await fetch(`${API}/auth/token/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
      const result = await response.json()
      if (!response.ok) throw new Error('Неверный логин или пароль. Проверьте данные и попробуйте ещё раз.')
      const next = { access: result.access, refresh: result.refresh }
      saveTokens(next); setPassword(''); await loadSession(next); setToast('Вы вошли в защищённую панель')
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  function logout(showToast = true) {
    localStorage.removeItem('jwtTokens'); setTokens(null); setUser(null); setDashboard(null)
    if (showToast) { setToast('Вы вышли из аккаунта'); setError('') }
  }

  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3000); return () => clearTimeout(timer) }, [toast])

  if (!user) return <Login username={username} setUsername={setUsername} password={password} setPassword={setPassword} error={error} busy={busy} showPassword={showPassword} setShowPassword={setShowPassword} onSubmit={login} />

  return <Dashboard user={user} data={dashboard} onLogout={() => logout()} toast={toast} onDismissToast={() => setToast('')} />
}

function Login({ username, setUsername, password, setPassword, error, busy, showPassword, setShowPassword, onSubmit }) {
  return <main className="login-page">
    <div className="login-top"><a className="brand" href="#home"><span className="brand-mark"><Shield size={19} strokeWidth={2.5} /></span><span>secure<span className="brand-dot">.</span></span></a><a className="top-help" href="mailto:support@example.com"><CircleHelp size={16} /> Помощь</a></div>
    <section className="login-layout">
      <div className="login-visual">
        <div className="visual-glow" />
        <div className="visual-copy"><div className="eyebrow light"><span className="eyebrow-dot" /> БЕЗОПАСНОСТЬ В КАЖДОМ ЗАПРОСЕ</div><h1>Всё важное<br />под <span>защитой.</span></h1><p>Войдите, чтобы управлять своей рабочей средой и быть уверенными в каждом действии.</p></div>
        <div className="security-card"><div className="security-icon"><Fingerprint size={23} /></div><div><strong>Сквозная защита</strong><span>Токен подтверждён сервером</span></div><span className="security-check"><Check size={15} /></span></div>
        <div className="visual-footer"><span><span className="online-dot" /> Все системы работают</span><span>JWT · AES-256</span></div>
      </div>
      <div className="login-panel"><div className="form-wrap"><div className="form-icon"><LockKeyhole size={21} /></div><div className="form-heading"><div className="eyebrow">С ВОЗВРАЩЕНИЕМ</div><h2>Войти в аккаунт</h2><p>Введите данные, чтобы продолжить работу.</p></div>
        <form onSubmit={onSubmit} className="auth-form">
          <label htmlFor="username">Логин</label><div className="input-wrap"><UserRound size={17} /><input id="username" autoComplete="username" placeholder="Ваш логин" value={username} onChange={e => setUsername(e.target.value)} required /></div>
          <div className="label-row"><label htmlFor="password">Пароль</label><a href="mailto:support@example.com">Забыли пароль?</a></div><div className="input-wrap"><KeyRound size={17} /><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Введите пароль" value={password} onChange={e => setPassword(e.target.value)} required /><button className="show-password" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>{showPassword ? 'Скрыть' : 'Показать'}</button></div>
          {error && <div className="error-message" role="alert">{error}</div>}
          <button className="submit-button" type="submit" disabled={busy}>{busy ? <><span className="spinner" /> Проверяем данные…</> : <>Войти в систему <ArrowRight size={17} /></>}</button>
        </form>
        <div className="secure-note"><ShieldCheck size={15} /><span>Ваши данные передаются по защищённому соединению</span></div><div className="form-bottom"><span>Нет доступа к аккаунту?</span><a href="mailto:support@example.com">Свяжитесь с администратором <ArrowUpRight size={13} /></a></div>
      </div></div>
    </section>
    <footer className="login-footer"><span>© 2025 Secure Workspace</span><div><a href="#privacy">Конфиденциальность</a><a href="#terms">Условия использования</a><span className="version">v1.0.0</span></div></footer>
  </main>
}

function Dashboard({ user, data, onLogout, toast, onDismissToast }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="dashboard-shell">
    <aside className="sidebar"><a className="brand side-brand" href="#home"><span className="brand-mark"><Shield size={19} strokeWidth={2.5} /></span><span>secure<span className="brand-dot">.</span></span></a><div className="workspace-switch"><div className="workspace-logo">S</div><div><strong>Secure Space</strong><span>Личный кабинет</span></div><ChevronDown size={15} /></div><div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div><nav className="side-nav"><a className="active" href="#overview"><LayoutDashboard size={17} />Обзор<span className="nav-indicator" /></a><a href="#security"><ShieldCheck size={17} />Безопасность</a><a href="#activity"><Activity size={17} />Активность</a><a href="#team"><Users size={17} />Пользователи</a></nav><div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Sparkles size={16} /></div><strong>Нужна помощь?</strong><span>Мы всегда готовы подсказать.</span><a href="mailto:support@example.com">Центр поддержки <ArrowUpRight size={13} /></a></div><button className="side-user" onClick={() => setMenuOpen(!menuOpen)}><span className="avatar">{user.username?.[0]?.toUpperCase() || 'U'}</span><span className="side-user-info"><strong>{user.username}</strong><small>Аккаунт активен</small></span><ChevronDown size={15} /></button>{menuOpen && <div className="user-menu"><button onClick={onLogout}><LogOut size={15} />Выйти из аккаунта</button></div>}</div></aside>
    <main className="dashboard-main"><header className="dashboard-header"><button className="mobile-brand"><Menu size={19} /> secure<span className="brand-dot">.</span></button><div className="breadcrumbs"><span>Рабочее пространство</span><span>/</span><strong>Обзор</strong></div><div className="header-actions"><button className="search-button"><Search size={16} /><span>Поиск</span><kbd><Command size={11} /> K</kbd></button><button className="bell-button" aria-label="Уведомления"><Bell size={18} /><i /></button><span className="header-divider" /><button className="header-avatar" onClick={onLogout} title="Выйти">{user.username?.[0]?.toUpperCase() || 'U'}</button></div></header>
      <div className="dashboard-content"><div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> ВАША СРЕДА ЗАЩИЩЕНА</div><h1>Добро пожаловать, {user.username}<span className="wave">✳</span></h1><p>Здесь всё в порядке. Вот что происходит с вашим аккаунтом.</p></div><button className="date-button"><span className="date-dot" /> Сессия активна <ChevronDown size={15} /></button></div>
        <section className="stats-grid">{initialStats.map(({ name, value, change, direction, icon: Icon, tone }) => <article className="stat-card" key={name}><div className="stat-top"><span>{name}</span><span className={`stat-icon ${tone}`}><Icon size={17} /></span></div><div className="stat-value">{value}</div><div className="stat-change"><span className="change-icon"><ArrowUpRight size={13} /></span>{change}</div></article>)}</section>
        <section className="content-grid"><article className="panel activity-panel"><div className="panel-header"><div><h2>Обзор безопасности</h2><p>Состояние защиты вашего аккаунта</p></div><button className="more-button">···</button></div><div className="security-status"><div className="status-art"><div className="status-orbit orbit-one"/><div className="status-orbit orbit-two"/><div className="status-shield"><ShieldCheck size={27} /></div></div><div className="status-copy"><span className="status-pill"><i /> Всё защищено</span><strong>Ваш аккаунт под контролем</strong><span>Авторизация подтверждена JWT-токеном. Доступ к данным открыт.</span></div></div><div className="panel-divider"/><div className="activity-feed"><div className="feed-heading"><strong>Текущая сессия</strong><span>ТОЛЬКО ЧТО</span></div><div className="feed-item"><span className="feed-icon"><Fingerprint size={16} /></span><span className="feed-copy"><strong>Успешный вход в систему</strong><small>Проверка access-токена прошла успешно</small></span><span className="feed-time">Сейчас</span></div><div className="feed-item"><span className="feed-icon soft"><KeyRound size={16} /></span><span className="feed-copy"><strong>Refresh-токен готов к обновлению</strong><small>Сессия продлевается автоматически</small></span><span className="feed-time">Активен</span></div></div></article>
          <article className="panel account-panel"><div className="panel-header"><div><h2>Данные аккаунта</h2><p>Информация о текущем профиле</p></div><span className="account-menu">···</span></div><div className="profile-block"><div className="profile-avatar">{user.username?.[0]?.toUpperCase() || 'U'}<span /></div><div><strong>{user.username}</strong><span>Пользователь</span></div></div><div className="account-fields"><div><span>Логин</span><strong>{user.username}</strong></div><div><span>Email</span><strong>{user.email || 'Не указан'}</strong></div><div><span>Статус</span><strong className="active-account"><i /> Активен</strong></div></div><div className="account-foot"><Shield size={15} /><span>Сессия защищена токеном</span><span className="lock-mini"><LockKeyhole size={13} /></span></div></article></section>
        <section className="bottom-banner"><div className="banner-icon"><Sparkles size={18} /></div><div><strong>{data?.title || 'Защищённая рабочая среда'}</strong><span>{data?.items?.[0]?.value || 'Все защищённые ресурсы доступны.'} — ваш токен проверен сервером Django.</span></div><span className="banner-check"><Check size={15} /></span></section>
        <footer className="dashboard-footer"><span>© 2025 Secure Workspace</span><div><span><span className="online-dot" /> API работает</span><span>Обновлено только что <ArrowDownRight size={12} /></span></div></footer>
      </div></main>{toast && <div className="toast"><span><Check size={14} /></span>{toast}<button onClick={onDismissToast}><X size={14} /></button></div>}
  </div>
}
