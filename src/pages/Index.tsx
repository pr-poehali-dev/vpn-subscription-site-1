import { useState } from "react";
import Icon from "@/components/ui/icon";

const CREATE_PAYMENT_URL = "https://functions.poehali.dev/df5e5de2-1fdf-4d1a-b0ea-b887a54a3157";

const plans = [
  {
    id: "month",
    name: "Месяц",
    price: "299",
    period: "/мес",
    description: "Для знакомства с сервисом",
    features: ["1 устройство", "50+ серверов", "Скорость до 100 Мбит/с", "Техподдержка 24/7"],
    popular: false,
  },
  {
    id: "half",
    name: "6 месяцев",
    price: "199",
    period: "/мес",
    description: "Самый популярный выбор",
    features: ["3 устройства", "70+ серверов", "Без ограничений скорости", "Техподдержка 24/7", "Автоактивация"],
    popular: true,
    badge: "−33%",
  },
  {
    id: "year",
    name: "Год",
    price: "149",
    period: "/мес",
    description: "Максимальная экономия",
    features: ["5 устройств", "100+ серверов", "Без ограничений скорости", "Техподдержка 24/7", "Автоактивация", "Управление лицензиями"],
    popular: false,
    badge: "−50%",
  },
];

const features = [
  { icon: "Shield", title: "Шифрование AES-256", desc: "Военный стандарт защиты данных" },
  { icon: "Zap", title: "Быстрое подключение", desc: "Менее 2 секунд до активации" },
  { icon: "Globe", title: "100+ серверов", desc: "В 40 странах мира" },
  { icon: "Lock", title: "Zero-logs политика", desc: "Мы не храним ваши данные" },
  { icon: "RefreshCw", title: "Автоактивация", desc: "Подписка активируется мгновенно" },
  { icon: "Key", title: "Управление лицензиями", desc: "Контролируйте все устройства" },
];

export default function Index() {
  const [activeNav, setActiveNav] = useState("home");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({});
  const [showEmailFor, setShowEmailFor] = useState<string | null>(null);

  const handleBuyPlan = async (plan: typeof plans[0]) => {
    if (showEmailFor !== plan.id) {
      setShowEmailFor(plan.id);
      return;
    }
    const email = emailInputs[plan.id] || "";
    setPayingPlanId(plan.id);
    setPayError(null);
    try {
      const res = await fetch(CREATE_PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: plan.id,
          plan_name: plan.name,
          amount: parseInt(plan.price),
          email,
        }),
      });
      const data = await res.json();
      if (data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        setPayError("Ошибка создания платежа. Попробуйте снова.");
      }
    } catch {
      setPayError("Ошибка соединения. Попробуйте снова.");
    } finally {
      setPayingPlanId(null);
    }
  };

  const scrollTo = (id: string) => {
    setActiveNav(id);
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-golos">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="Shield" size={16} className="text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">NordShield</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[["home", "Главная"], ["pricing", "Тарифы"], ["contacts", "Контакты"]].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`text-sm font-medium transition-colors ${activeNav === id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Войти
            </button>
            <button
              onClick={() => scrollTo("pricing")}
              className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Начать
            </button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-4">
            {[["home", "Главная"], ["pricing", "Тарифы"], ["contacts", "Контакты"]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-left text-sm font-medium text-muted-foreground hover:text-foreground">
                {label}
              </button>
            ))}
            <button
              onClick={() => scrollTo("pricing")}
              className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Начать бесплатно
            </button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="py-24 pt-32 grid-bg relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-8 animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Серверы онлайн · 99.9% uptime
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6 animate-fade-up delay-100">
              Интернет без<br />
              <span className="text-gradient">ограничений</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 animate-fade-up delay-200">
              Надёжная защита соединения, автоматическая активация подписки<br className="hidden md:block" />
              и управление всеми вашими лицензиями в одном месте.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
              <button
                onClick={() => scrollTo("pricing")}
                className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-all hover:scale-[1.02] glow"
              >
                Выбрать тариф
              </button>
              <button className="w-full sm:w-auto text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                <Icon name="Play" size={14} />
                Как это работает
              </button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6 border-t border-border/50 pt-10 animate-fade-up delay-400">
              {[["100+", "серверов"], ["40+", "стран"], ["50k+", "пользователей"]].map(([num, label]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-foreground">{num}</div>
                  <div className="text-sm text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
              Всё что нужно для защиты
            </h2>
            <p className="text-muted-foreground text-lg">Технологии корпоративного уровня — для каждого</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon name={f.icon as "Shield"} size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
              Прозрачные тарифы
            </h2>
            <p className="text-muted-foreground text-lg">Выберите план, который подходит именно вам</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? "border-primary bg-primary/5 glow scale-[1.02]"
                    : "border-border/60 bg-card hover:border-primary/30"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    Популярный
                  </div>
                )}
                {plan.badge && !plan.popular && (
                  <div className="absolute -top-3.5 right-4 bg-secondary border border-primary/30 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">{plan.name}</div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-black text-foreground">{plan.price}₽</span>
                    <span className="text-muted-foreground mb-1.5">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="flex flex-col gap-3 mb-6 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm">
                      <Icon name="Check" size={15} className="text-primary flex-shrink-0" />
                      <span className="text-foreground/80">{feat}</span>
                    </li>
                  ))}
                </ul>

                {showEmailFor === plan.id && (
                  <div className="mb-3">
                    <input
                      type="email"
                      placeholder="Ваш email для чека"
                      value={emailInputs[plan.id] || ""}
                      onChange={e => setEmailInputs(prev => ({ ...prev, [plan.id]: e.target.value }))}
                      className="w-full bg-secondary border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                )}

                <button
                  onClick={() => handleBuyPlan(plan)}
                  disabled={payingPlanId === plan.id}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.02]"
                      : "border border-border hover:border-primary/50 text-foreground hover:bg-primary/5"
                  }`}
                >
                  {payingPlanId === plan.id ? (
                    <><Icon name="Loader" size={15} className="animate-spin" />Создание платежа...</>
                  ) : showEmailFor === plan.id ? (
                    <><Icon name="CreditCard" size={15} />Оплатить {plan.price}₽</>
                  ) : (
                    "Выбрать план"
                  )}
                </button>
              </div>
            ))}
          </div>
          {payError && (
            <p className="text-center text-sm text-destructive mt-4">{payError}</p>
          )}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Все тарифы включают 7-дневный бесплатный период · Отмена в любое время
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
              Как это работает
            </h2>
            <p className="text-muted-foreground text-lg">Три шага до защищённого соединения</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", icon: "CreditCard", title: "Выберите тариф", desc: "Подберите план под ваши потребности и оплатите удобным способом" },
              { step: "02", icon: "Zap", title: "Автоактивация", desc: "Лицензия активируется автоматически — сразу после оплаты" },
              { step: "03", icon: "ShieldCheck", title: "Вы защищены", desc: "Подключайте устройства и управляйте всеми лицензиями в личном кабинете" },
            ].map((item, i) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-px border-t border-dashed border-border/60 translate-x-4" />
                  )}
                  <div className="w-16 h-16 rounded-2xl bg-secondary border border-border/60 flex items-center justify-center">
                    <Icon name={item.icon as "Zap"} size={24} className="text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{item.step}</span>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                Свяжитесь с нами
              </h2>
              <p className="text-muted-foreground text-lg">Ответим в течение нескольких часов</p>
            </div>

            {sent ? (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={28} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Сообщение отправлено</h3>
                <p className="text-muted-foreground">Мы свяжемся с вами в ближайшее время</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-border/60 bg-card p-8 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Имя</label>
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-secondary border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-secondary border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Сообщение</label>
                  <textarea
                    rows={5}
                    placeholder="Опишите ваш вопрос..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-secondary border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <Icon name="Send" size={16} />
                  Отправить сообщение
                </button>
              </form>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { icon: "Mail", label: "Email", value: "support@nordshield.vpn" },
                { icon: "MessageCircle", label: "Telegram", value: "@nordshield_support" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name={c.icon as "Mail"} size={16} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{c.label}</div>
                    <div className="text-sm font-medium text-foreground">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="Shield" size={13} className="text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">NordShield VPN</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 NordShield · Все права защищены</p>
          <div className="flex gap-5">
            {["Политика", "Условия", "Cookies"].map((l) => (
              <button key={l} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}