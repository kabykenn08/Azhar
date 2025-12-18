const translations = {
  ru: {
    adminPanel: "Панель управления",
    systemLang: "Язык системы",
    contentLang: "Язык контента",
    logout: "Выход",
    totalKeys: "Всего ключей",
    preview: "Предпросмотр",
  },
  kz: {
    adminPanel: "Басқару панелі",
    systemLang: "Жүйе тілі",
    contentLang: "Мазмұн тілі",
    logout: "Шығу",
    totalKeys: "Барлығы кілттер",
    preview: "Алдын ала қарау",
  },
};

interface HeaderProps {
  systemLang: "ru" | "kz";
  setSystemLang: (lang: "ru" | "kz") => void;
  contentLang: "ru" | "kz";
  setContentLang: (lang: "ru" | "kz") => void;
  onLogout: () => void;
  totalKeys: number;
  onPreviewClick: () => void;
}

export default function Header({ 
  systemLang, 
  setSystemLang, 
  contentLang, 
  setContentLang,
  onLogout,
  totalKeys,
  onPreviewClick
}: HeaderProps) {
  const t = translations[systemLang];

  return (
    <header className="admin-header">
      <div className="header-container">
        <div className="header-top">
          <div className="header-title-section">
            <div className="header-stat-badge">
              <span className="stat-icon">📄</span>
              <div className="stat-info">
                <span className="stat-label-small">{t.totalKeys}</span>
                <span className="stat-value-small">{totalKeys}</span>
              </div>
            </div>
          </div>
          
          <div className="header-controls">
            <div className="lang-switcher-container">
              <span className="lang-label">{t.systemLang}</span>
              <div className="lang-switcher-admin">
                <button
                  className={systemLang === "ru" ? "lang-btn active" : "lang-btn"}
                  onClick={() => setSystemLang("ru")}
                >
                  RUS
                </button>
                <button
                  className={systemLang === "kz" ? "lang-btn active" : "lang-btn"}
                  onClick={() => setSystemLang("kz")}
                >
                  QAZ
                </button>
              </div>
            </div>
            
            <div className="content-lang-switcher-container">
              <span className="lang-label">{t.contentLang}</span>
              <div className="content-lang-switcher">
                <button
                  className={contentLang === "ru" ? "content-lang-btn active" : "content-lang-btn"}
                  onClick={() => setContentLang("ru")}
                >
                  RUS
                </button>
                <button
                  className={contentLang === "kz" ? "content-lang-btn active" : "content-lang-btn"}
                  onClick={() => setContentLang("kz")}
                >
                  QAZ
                </button>
              </div>
            </div>
            <button className="preview-btn-header" onClick={onPreviewClick} title={t.preview}>
              {t.preview}
            </button>
            <button className="logout-btn" onClick={onLogout}>{t.logout}</button>
          </div>
        </div>
      </div>
    </header>
  );
}