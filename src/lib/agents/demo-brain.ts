import type { LlmRequest } from "@/lib/llm/types";

function lastUser(req: LlmRequest): string {
  return [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";
}

function system(req: LlmRequest): string {
  return req.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
}

function pickName(text: string): string {
  const match = text.match(/(?:бренд|компани[яи]|brand|company)[:\s]+["«]?([A-Za-zА-Яа-я0-9 ._-]{2,40})/i);
  if (match) return match[1].trim();
  const quoted = text.match(/["«]([A-Za-zА-Яа-я0-9 ._-]{2,40})["»]/);
  return quoted?.[1] ?? "Aurora Labs";
}

export function demoComplete(req: LlmRequest): string {
  const sys = system(req).toLowerCase();
  const user = lastUser(req);
  const name = pickName(`${sys}\n${user}`);

  if (sys.includes("interviewer") || sys.includes("интервью")) {
    return interviewTurn(user, name);
  }
  if (sys.includes("architect") || sys.includes("sitemap")) {
    return sitemapJson(name);
  }
  if (sys.includes("visual") || sys.includes("brand") || sys.includes("tokens")) {
    return tokensJson();
  }
  if (sys.includes("copywriter") || sys.includes("article") || sys.includes("content agent")) {
    return contentJson(name);
  }
  if (sys.includes("block builder") || sys.includes("section json")) {
    return blockJson(user, name);
  }
  if (sys.includes("motion")) {
    return motionJson(user);
  }
  if (sys.includes("seo")) {
    return seoJson(name);
  }
  if (sys.includes("qa")) {
    return JSON.stringify({ ok: true, issues: [], warnings: ["Demo QA: confirm facts before production publish."] });
  }
  if (sys.includes("integrations")) {
    return JSON.stringify({
      recommended: ["local-leads", "webhook"],
      notes: "Connect a webhook URL to forward leads. CRM adapters require setup.",
    });
  }
  if (req.jsonSchema) {
    return JSON.stringify({ ok: true, note: "demo structured fallback" });
  }
  return `Понял задачу для ${name}. Продолжаем в демо-режиме без внешнего LLM.`;
}

function interviewTurn(user: string, name: string): string {
  const lower = user.toLowerCase();
  if (!lower.trim() || lower.includes("start") || lower.includes("начать")) {
    return JSON.stringify({
      assistantMessage:
        "Здравствуйте. Я интервьюер AI Website Studio. Как называется бренд или компания, для которой делаем сайт?",
      briefPatch: {},
      done: false,
    });
  }
  if (lower.includes("не знаю") || lower.includes("предложи") || lower.includes("skip")) {
    return JSON.stringify({
      assistantMessage:
        "Хорошо, отмечу это как открытый вопрос и предложу нейтральный черновик позже. Какая главная цель сайта: заявки, звонки, запись или продажи?",
      briefPatch: {
        openQuestions: [{ id: "q_unknown", question: "Уточнить данные, которые пользователь не знает", field: "unknown" }],
      },
      done: false,
    });
  }
  if (lower.includes("готово") || lower.includes("достаточно") || lower.includes("done") || lower.includes("approve")) {
    return JSON.stringify({
      assistantMessage: "Собрал черновик ТЗ. Проверьте факты и предположения перед генерацией.",
      briefPatch: {
        brandName: name,
        description: `${name} помогает клиентам решать прикладные задачи через понятный цифровой сервис.`,
        industry: "professional-services",
        primaryCta: "Оставить заявку",
        approvedByUser: false,
      },
      done: true,
    });
  }
  return JSON.stringify({
    assistantMessage: nextQuestion(lower, name),
    briefPatch: extractPatch(user, name),
    done: false,
  });
}

function nextQuestion(lower: string, name: string): string {
  if (lower.length < 40) {
    return `Принял. Чем занимается ${name} и кто основной клиент? Можно ответить коротко.`;
  }
  if (!lower.includes("аудитор") && !lower.includes("клиент")) {
    return "Кто целевая аудитория и в каком регионе вы работаете?";
  }
  if (!lower.includes("заяв") && !lower.includes("cta") && !lower.includes("звон")) {
    return "Какое главное действие должен совершить посетитель: заявка, звонок, запись или покупка?";
  }
  if (!lower.includes("страниц")) {
    return "Какие страницы точно нужны: главная, услуги, о компании, кейсы, блог, контакты?";
  }
  return "Есть брендбук, цвета или ограничения? Если нет — напишите «предложи сам». Когда данных достаточно, напишите «готово».";
}

function extractPatch(user: string, name: string): Record<string, unknown> {
  return {
    brandName: name,
    description: user.slice(0, 280),
    confirmedFacts: [
      {
        id: "fact_user_note",
        text: user.slice(0, 180),
        field: "interview",
        confirmed: true,
      },
    ],
  };
}

function sitemapJson(name: string): string {
  return JSON.stringify({
    pages: [
      {
        slug: "home",
        name: "Главная",
        purpose: `Представить ${name} и привести к заявке`,
        plannedSections: ["navbar", "hero", "logoCloud", "stats", "features", "services", "testimonials", "cta", "footer"],
      },
      {
        slug: "services",
        name: "Услуги",
        purpose: "Раскрыть предложения и снять возражения",
        plannedSections: ["navbar", "hero", "services", "pricing", "faq", "cta", "footer"],
      },
      {
        slug: "about",
        name: "О компании",
        purpose: "Объяснить подход без выдуманных наград",
        plannedSections: ["navbar", "hero", "splitContent", "team", "cta", "footer"],
      },
      {
        slug: "contact",
        name: "Контакты",
        purpose: "Собрать заявку",
        plannedSections: ["navbar", "hero", "contactForm", "map", "footer"],
      },
    ],
  });
}

function tokensJson(): string {
  return JSON.stringify({
    primary: "#7C3AED",
    secondary: "#6366F1",
    accent: "#0891B2",
    background: "#0B1220",
    surface: "#111827",
    foreground: "#F8FAFC",
    muted: "#94A3B8",
    headingFont: "Inter",
    bodyFont: "Inter",
    radius: "lg",
    density: "regular",
  });
}

function contentJson(name: string): string {
  return JSON.stringify({
    headline: `${name} делает сложные процессы понятными`,
    subhead: "Честный черновик текстов на основе интервью. Цифры и отзывы не выдуманы.",
    cta: "Оставить заявку",
    article: {
      title: `Как ${name} подходит к задаче клиента`,
      body: `${name} начинает с интервью, фиксирует подтверждённые факты отдельно от предположений и собирает сайт секциями. Это черновик статьи: его нужно подтвердить перед публикацией.`,
    },
  });
}

function motionJson(user: string): string {
  const type = /hero|navbar|footer|form/.test(user) ? "fade-in" : "slide-up";
  return JSON.stringify({
    preset: type,
    delayMs: 0,
    durationMs: 280,
    staggerMs: 40,
    intensity: "subtle",
    respectReducedMotion: true,
    disabled: false,
  });
}

function seoJson(name: string): string {
  return JSON.stringify({
    title: `${name} — профессиональный сайт`,
    description: `${name}: услуги, подход и контактная форма. Метаданные сформированы из подтверждённого брифа, без гарантий позиций.`,
    jsonLdType: "Organization",
    recommendations: [
      "Проверьте title длиной 50–60 символов",
      "Не публикуйте draft-отзывы",
      "Добавьте реальный адрес, если это локальный бизнес",
    ],
  });
}

function blockJson(user: string, name: string): string {
  const typeMatch = user.match(/blockType["']?\s*[:=]\s*["']?([a-zA-Z]+)/);
  const type = typeMatch?.[1] ?? inferType(user);
  return JSON.stringify({ type, variant: "default", props: propsFor(type, name) });
}

function inferType(user: string): string {
  const keys = [
    "navbar",
    "hero",
    "logoCloud",
    "stats",
    "features",
    "benefits",
    "splitContent",
    "services",
    "productGrid",
    "pricing",
    "testimonials",
    "caseStudies",
    "team",
    "gallery",
    "videoEmbed",
    "faq",
    "cta",
    "contactForm",
    "newsletterForm",
    "blogGrid",
    "map",
    "announcementBar",
    "footer",
  ];
  return keys.find((k) => user.toLowerCase().includes(k.toLowerCase())) ?? "features";
}

function propsFor(type: string, name: string): Record<string, unknown> {
  const cta = { label: "Оставить заявку", href: "/contact" };
  switch (type) {
    case "navbar":
      return {
        brand: name,
        links: [
          { label: "Услуги", href: "/services" },
          { label: "О нас", href: "/about" },
          { label: "Контакты", href: "/contact" },
        ],
        cta,
      };
    case "hero":
      return {
        eyebrow: name,
        title: `${name} помогает двигаться быстрее без пустых обещаний`,
        subtitle: "Сайт собирается по секциям: дизайн, тексты и анимации делают отдельные агенты.",
        primaryCta: cta,
        secondaryCta: { label: "Смотреть услуги", href: "/services" },
        imageAlt: `Абстрактная обложка ${name} (черновик, не фотография)`,
      };
    case "logoCloud":
      return {
        title: "Инструменты, с которыми можно интегрироваться",
        items: ["HubSpot", "GA4", "Webhooks", "OpenAI-compatible"].map((label) => ({ label })),
      };
    case "stats":
      return {
        title: "Показатели только из подтверждённых фактов",
        items: [
          { label: "Страницы в типовом сайте", value: "4", source: "assumption" },
          { label: "Секции на главной", value: "9", source: "assumption" },
          { label: "Выдуманных отзывов", value: "0", source: "user" },
        ],
      };
    case "features":
      return {
        title: "Как устроена студия",
        items: [
          { title: "Интервью", body: "Агент собирает факты и не маскирует догадки под ответы клиента." },
          { title: "Блоки", body: "Каждая секция проходит схему и только потом попадает в preview." },
          { title: "Свои модели", body: "Провайдеры и роли настраиваются отдельно с первого запуска." },
        ],
      };
    case "benefits":
      return {
        title: "Зачем разделять агентов",
        items: [
          { title: "Контроль", body: "Motion-агент не переписывает тексты и ссылки." },
          { title: "Ремонт", body: "Сломанный блок чинится отдельно, сайт не генерируется заново." },
          { title: "Честность", body: "Нет фейковых кнопок и пустых ready-секций." },
        ],
      };
    case "splitContent":
      return {
        title: "Подход без выдуманной экспертизы",
        body: `${name} фиксирует, что подтверждено пользователем, и отдельно помечает гипотезы AI.`,
        cta,
        imageAlt: "Схематичная иллюстрация процесса (черновик)",
      };
    case "services":
      return {
        title: "Услуги",
        items: [
          { title: "Стратегия сайта", body: "Карта страниц и цели конверсии.", href: "/services" },
          { title: "Дизайн-система", body: "Токены, типографика и варианты блоков.", href: "/services" },
          { title: "Запуск", body: "Формы, SEO-каркас и экспорт кода.", href: "/contact" },
        ],
      };
    case "productGrid":
      return {
        title: "Предложения",
        items: [
          { title: "Аудит", body: "Разбор текущего сайта и задач.", href: "/contact" },
          { title: "Сборка", body: "Многостраничный сайт по брифу.", href: "/contact" },
          { title: "Сопровождение", body: "Правки секций без полной перегенерации.", href: "/contact" },
        ],
      };
    case "pricing":
      return {
        title: "Ориентиры стоимости",
        note: "Цены не выдуманы. Если клиент их не назвал, это черновик для подтверждения.",
        plans: [
          { name: "Старт", price: "По запросу", features: ["Интервью", "Лендинг", "Форма заявок"], cta },
          { name: "Студия", price: "По запросу", features: ["Несколько страниц", "CMS-черновики", "SEO-каркас"], highlighted: true, cta },
          { name: "Агентство", price: "По запросу", features: ["Несколько сайтов", "Роли моделей", "Экспорт"], cta },
        ],
      };
    case "testimonials":
      return {
        title: "Отзывы",
        disclaimer: "Нет подтверждённых отзывов — показан помеченный черновик.",
        items: [
          {
            quote: "Черновик отзыва. Не публиковать как реальный.",
            author: "Имя не указано",
            role: "Draft",
            draft: true,
          },
        ],
      };
    case "caseStudies":
      return {
        title: "Кейсы",
        items: [
          {
            title: "Черновик кейса",
            summary: "Опишите реальный проект, прежде чем публиковать.",
            href: "/about",
            draft: true,
          },
        ],
      };
    case "team":
      return {
        title: "Команда",
        items: [
          { name: "Участник не указан", role: "Добавьте реальное имя", draft: true },
        ],
      };
    case "gallery":
      return {
        title: "Галерея",
        items: [
          { alt: "Черновая абстракция 1" },
          { alt: "Черновая абстракция 2" },
          { alt: "Черновая абстракция 3" },
        ],
      };
    case "videoEmbed":
      return {
        title: "Видео",
        caption: "Вставьте свой URL. Сейчас секция помечена как требующая источник.",
        url: "",
        requiresSource: true,
      };
    case "faq":
      return {
        title: "Вопросы",
        items: [
          { q: "Можно ли подключить свою модель?", a: "Да. Custom provider настраивается сразу в AI-настройках." },
          { q: "Сайт генерируется одним ответом?", a: "Нет. Оркестратор запускает отдельных агентов по секциям." },
          { q: "Что если нет отзывов?", a: "Секция остаётся draft и не выдаётся за реальные социальные доказательства." },
        ],
      };
    case "cta":
      return {
        title: `Обсудить задачу с ${name}`,
        body: "Оставьте заявку — она сохранится в студии и уйдёт на webhook, если он подключён.",
        primaryCta: cta,
      };
    case "contactForm":
      return {
        title: "Контакты",
        body: "Форма сохраняет заявку в студии. Success показывается только после записи.",
        submitLabel: "Отправить",
        fields: ["name", "email", "message"],
      };
    case "newsletterForm":
      return {
        title: "Новости проекта",
        body: "Черновик подписки. Нужен реальный email-провайдер для рассылки.",
        submitLabel: "Подписаться",
      };
    case "blogGrid":
      return {
        title: "Материалы",
        items: [
          { title: `Как ${name} собирает бриф`, excerpt: "Факты отдельно от гипотез.", href: "/blog" },
        ],
      };
    case "map":
      return {
        title: "Локация",
        address: "Адрес не указан",
        note: "Карта не показывается без реального адреса.",
      };
    case "announcementBar":
      return { text: "Черновик сайта: проверьте факты перед публикацией.", href: "/contact" };
    case "footer":
      return {
        brand: name,
        links: [
          { label: "Услуги", href: "/services" },
          { label: "Контакты", href: "/contact" },
        ],
        legal: "Не публикуйте выдуманные гарантии и отзывы.",
      };
    default:
      return { title: name, body: "Секция создана демо-агентом." };
  }
}
