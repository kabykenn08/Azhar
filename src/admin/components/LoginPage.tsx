import { useState } from "react";
import { supabase } from "../../cms/supabaseClient";
import { Link } from "react-router-dom";

const translations = {
  ru: {
    title: "Вход в систему",
    subtitle: "Введите ваши учетные данные",
    email: "Email",
    password: "Пароль",
    login: "Войти",
    loginProgress: "Вход...",
    backToSite: "Вернуться на сайт",
    forgotPassword: "Забыли пароль?",
    errorGeneric: "Произошла ошибка при входе",
  },
  kz: {
    title: "Жүйеге кіру",
    subtitle: "Есептік деректеріңізді енгізіңіз",
    email: "Email",
    password: "Құпия сөз",
    login: "Кіру",
    loginProgress: "Кіру...",
    backToSite: "Сайтқа оралу",
    forgotPassword: "Құпия сөзді ұмыттыңыз ба?",
    errorGeneric: "Кіру кезінде қате пайда болды",
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [systemLang, setSystemLang] = useState<"ru" | "kz">("ru");
  const t = translations[systemLang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // Успешный логин - перенаправляем
        window.location.href = "/azhar/admin/translations";
      }
    } catch (err) {
      setError(t.errorGeneric);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-lang-switcher">
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

      <div className="login-card">
        <div className="login-header">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">{t.email}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t.password}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Введите пароль"
            />
          </div>

          <div className="leave-btn-2">
            <a
              href="https://t.me/kabykenn08"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t.forgotPassword}</span>
            </a>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? t.loginProgress : t.login}
          </button>

          <div className="leave-btn-2">
            <Link to="/">
              <span>←</span>
              <span>{t.backToSite}</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
