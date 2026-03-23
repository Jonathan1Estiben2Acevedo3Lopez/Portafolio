const profile = {
  name: "JONATHAN ACEVEDO",
  email: "jonalopezacevedo@gmail.com",
  linkedin: "https://www.linkedin.com/in/jonathan-estiben-acevedo-l%C3%B3pez-066b3226a",
  github: "https://github.com/Jonathan1Estiben2Acevedo3Lopez",
  cvPath: "/CV_Ejemplo.pdf",
};

const content = {
  es: {
    meta: {
      title: "Portafolio",
    },
    nav: {
      home: "Inicio",
      projects: "Proyectos",
      insights: "Ideas",
      about: "Sobre mi",
      contact: "Contacto",
    },
    controls: {
      themeToDark: "Cambiar a modo oscuro",
      themeToLight: "Cambiar a modo claro",
    },
    hero: {
      title:
        '<span class="hero-word" style="--word-index: 0">Hola,</span> <span class="hero-word" style="--word-index: 1">soy</span> <span class="hero-word text-primary" style="--word-index: 2">Jonathan,</span><br /><span class="hero-word" style="--word-index: 3">ingeniero</span> <span class="hero-word" style="--word-index: 4">de</span> <span class="hero-word" style="--word-index: 5">sistemas.</span>',
      description:
        "Transformo ideas en experiencias digitales claras, expresivas y listas para produccion.",
      primaryButton: "Ver proyectos",
      secondaryButton: "Hablemos",
      downloadCv: "Descargar CV",
      viewCv: "Visualizar CV",
      linkedinButton: "LinkedIn",
      githubButton: "GitHub",
      focusLabel: "Enfoque",
      focus: '"Lo profesional empieza por lo humano."',
    },
    projects: {
      title: "Proyectos destacados",
      filters: {
        all: "Todos",
        web: "Web",
        branding: "Marca",
        automation: "Automatizacion",
      },
      items: [
        {
          title: "Control Hub",
          category: "web",
          year: "2026",
          tag: "Dashboard",
          description:
            "Panel para visualizar metricas, actividad y decisiones de producto en tiempo real.",
          accent: "Sistema interno",
          href: "#contact",
          visualClass: "visual-control",
        },
        {
          title: "Launch Canvas",
          category: "web",
          year: "2026",
          tag: "Landing Page",
          description:
            "Landing editorial para presentar una marca personal con ritmo visual y conversion clara.",
          accent: "Marketing",
          href: "#contact",
          visualClass: "visual-launch",
        },
        {
          title: "Pulse Identity",
          category: "branding",
          year: "2026",
          tag: "Brand System",
          description:
            "Sistema visual modular para alinear tono, piezas digitales y presencia de marca.",
          accent: "Branding",
          href: "#contact",
          visualClass: "visual-brand",
        },
        {
          title: "Notes Engine",
          category: "automation",
          year: "2026",
          tag: "Workflow",
          description:
            "Flujo para organizar ideas, publicar actualizaciones y mantener un archivo vivo del proceso.",
          accent: "Contenido",
          href: "#contact",
          visualClass: "visual-notes",
        },
        {
          title: "System Atlas",
          category: "branding",
          year: "2026",
          tag: "Design System",
          description:
            "Biblioteca visual y tecnica para construir interfaces consistentes sin perder personalidad.",
          accent: "Escalabilidad",
          href: "#contact",
          visualClass: "visual-system",
        },
        {
          title: "Agent Flow",
          category: "automation",
          year: "2026",
          tag: "AI Ops",
          description:
            "Asistentes y automatizaciones utiles para reducir tareas repetitivas y acelerar entregas.",
          accent: "Productividad",
          href: "#contact",
          visualClass: "visual-ai",
        },
      ],
    },
    insights: {
      title: "Notas recientes",
      cardLabel: "Seleccionado",
      cta: "Llevar esta idea a un proyecto",
    },
    articles: [
      {
        category: "Diseno de sistemas",
        date: "Marzo 2026",
        title: "Sistemas visuales que no se sienten rigidos",
        excerpt: "Como crear consistencia sin que la interfaz pierda sorpresa y caracter.",
        body:
          "Cuando un sistema de diseno esta bien construido, no limita. Al contrario: permite que cada pantalla tenga una voz propia sin romper la coherencia. La clave esta en decidir que reglas deben ser duras, cuales pueden ser flexibles y donde conviene dejar espacio para el gesto visual.",
        visualClass: "visual-system",
      },
      {
        category: "Proceso web",
        date: "Febrero 2026",
        title: "Menos efectos, mas direccion",
        excerpt: "Animacion con criterio: movimiento que explica, no que distrae.",
        body:
          "Las transiciones mas potentes no son necesariamente las mas complejas. Un portfolio funciona mejor cuando cada animacion refuerza jerarquia, contexto o continuidad. Si el movimiento no ayuda a entender, sobra.",
        visualClass: "visual-launch",
      },
      {
        category: "Automatizacion",
        date: "Enero 2026",
        title: "Automatizar sin perder el tono humano",
        excerpt: "La productividad importa, pero el resultado final sigue necesitando criterio.",
        body:
          "Automatizar no es delegar el gusto. Las mejores herramientas repiten procesos, no decisiones sensibles. Por eso conviene usar IA para acelerar documentacion, estructura y soporte, mientras el criterio final se mantiene cerca del producto y de la persona que lo usa.",
        visualClass: "visual-ai",
      },
    ],
    about: {
      title: "Mas alla de la interfaz",
      toolboxLabel: "Caja de herramientas",
      paragraphs: [
        "Esta version del portafolio esta pensada como base editable. Puedes convertirla en una presentacion personal cambiando textos, proyectos y enlaces desde un unico archivo.",
        "La direccion visual mezcla tecnologia, editorial y una atmosfera cinematica para que tu trabajo no se vea como una landing generica.",
        "Si quieres personalizarla mas, puedes reemplazar los casos de ejemplo por tus proyectos reales, agregar CV, testimonios o un formulario conectado.",
      ],
      toolbox: [
        "HTML",
        "Tailwind CDN",
        "JavaScript",
        "Responsive UI",
        "Motion",
        "Personal Branding",
      ],
    },
    artifacts: [
      {
        icon: "sports_esports",
        title: "Exploracion interactiva",
        description: "Narrativas, feedback y ritmo visual para productos que se sienten vivos.",
        tags: ["Narrativa", "Prototipos"],
        visualClass: "visual-gaming",
        accentClass: "text-secondary",
      },
      {
        icon: "movie_filter",
        title: "Mirada cinematica",
        description: "Composicion, contraste y encuadre aplicados a interfaces de alto impacto.",
        tags: ["Direccion", "Visual"],
        visualClass: "visual-cinema",
        accentClass: "text-primary",
      },
      {
        icon: "auto_awesome",
        title: "Laboratorio digital",
        description: "Pruebas con IA, automatizacion y sistemas para acelerar procesos utiles.",
        tags: ["IA", "Experimentacion"],
        visualClass: "visual-lab",
        accentClass: "text-tertiary",
      },
    ],
    footer: {
      title: 'Construyamos algo <span class="text-gradient-primary">diferente</span>.',
      description:
        "Disponible para proyectos web, redisenos, landing pages y productos digitales con criterio visual.",
      cta: "Iniciar conversacion",
      legal: "Portafolio personal. Edita el contenido en src/scripts/portfolio.js.",
    },
    contact: {
      email: "Email",
      linkedin: "LinkedIn",
      github: "GitHub",
    },
  },
  en: {
    meta: {
      title: "Portfolio",
    },
    nav: {
      home: "Home",
      projects: "Projects",
      insights: "Insights",
      about: "About",
      contact: "Contact",
    },
    controls: {
      themeToDark: "Switch to dark mode",
      themeToLight: "Switch to light mode",
    },
    hero: {
      title:
        '<span class="hero-word" style="--word-index: 0">Hi,</span> <span class="hero-word" style="--word-index: 1">I&apos;m</span> <span class="hero-word text-primary" style="--word-index: 2">Jonathan,</span><br /><span class="hero-word" style="--word-index: 3">a</span> <span class="hero-word" style="--word-index: 4">systems</span> <span class="hero-word" style="--word-index: 5">engineer.</span>',
      description:
        "I turn ideas into digital experiences that feel clear, expressive and ready for production.",
      primaryButton: "View projects",
      secondaryButton: "Let's talk",
      downloadCv: "Download CV",
      viewCv: "View CV",
      linkedinButton: "LinkedIn",
      githubButton: "GitHub",
      focusLabel: "Focus",
      focus: '"Professional work starts with the human side."',
    },
    projects: {
      title: "Featured work",
      filters: {
        all: "All",
        web: "Web",
        branding: "Branding",
        automation: "Automation",
      },
      items: [
        {
          title: "Control Hub",
          category: "web",
          year: "2026",
          tag: "Dashboard",
          description:
            "A control panel to surface metrics, activity and product decisions in real time.",
          accent: "Internal system",
          href: "#contact",
          visualClass: "visual-control",
        },
        {
          title: "Launch Canvas",
          category: "web",
          year: "2026",
          tag: "Landing Page",
          description:
            "An editorial landing page for a personal brand with visual rhythm and clear conversion.",
          accent: "Marketing",
          href: "#contact",
          visualClass: "visual-launch",
        },
        {
          title: "Pulse Identity",
          category: "branding",
          year: "2026",
          tag: "Brand System",
          description:
            "A modular visual system to align tone, digital pieces and brand presence.",
          accent: "Branding",
          href: "#contact",
          visualClass: "visual-brand",
        },
        {
          title: "Notes Engine",
          category: "automation",
          year: "2026",
          tag: "Workflow",
          description:
            "A lightweight workflow to organize ideas, publish updates and keep a living archive.",
          accent: "Content",
          href: "#contact",
          visualClass: "visual-notes",
        },
        {
          title: "System Atlas",
          category: "branding",
          year: "2026",
          tag: "Design System",
          description:
            "A visual and technical library to build consistent interfaces without losing character.",
          accent: "Scalability",
          href: "#contact",
          visualClass: "visual-system",
        },
        {
          title: "Agent Flow",
          category: "automation",
          year: "2026",
          tag: "AI Ops",
          description:
            "Useful assistants and automations that reduce repetitive work and speed up delivery.",
          accent: "Productivity",
          href: "#contact",
          visualClass: "visual-ai",
        },
      ],
    },
    insights: {
      title: "Recent notes",
      cardLabel: "Selected",
      cta: "Turn this idea into a project",
    },
    articles: [
      {
        category: "Design systems",
        date: "March 2026",
        title: "Visual systems that do not feel rigid",
        excerpt: "How to build consistency without losing surprise and character.",
        body:
          "A strong design system should not flatten the product. It should create enough structure for teams to move faster while leaving room for intentional moments that make the experience feel memorable. The real work is deciding what must stay fixed and what deserves freedom.",
        visualClass: "visual-system",
      },
      {
        category: "Web process",
        date: "February 2026",
        title: "Less effects, more direction",
        excerpt: "Animation with purpose: motion that explains instead of distracting.",
        body:
          "The best transitions are rarely the loudest ones. A portfolio becomes stronger when motion reinforces hierarchy, context and continuity. If movement does not help people understand the page, it is probably decoration instead of design.",
        visualClass: "visual-launch",
      },
      {
        category: "Automation",
        date: "January 2026",
        title: "Automate without losing the human tone",
        excerpt: "Productivity matters, but the final output still needs judgment.",
        body:
          "Automation should repeat process, not replace taste. The best workflows use AI to accelerate documentation, structure and support while keeping sensitive decisions close to the product and the person using it. That balance is what makes automation genuinely useful.",
        visualClass: "visual-ai",
      },
    ],
    about: {
      title: "Beyond the interface",
      toolboxLabel: "Toolbox",
      paragraphs: [
        "This portfolio is built as an editable base. You can turn it into a personal presentation by replacing the copy, projects and links from a single file.",
        "The visual direction mixes technology, editorial references and a cinematic atmosphere so the site avoids looking like a generic landing page.",
        "If you want to push it further, you can swap the placeholder cases for real work, add a resume, testimonials or connect a real contact form.",
      ],
      toolbox: [
        "HTML",
        "Tailwind CDN",
        "JavaScript",
        "Responsive UI",
        "Motion",
        "Personal Branding",
      ],
    },
    artifacts: [
      {
        icon: "sports_esports",
        title: "Interactive exploration",
        description: "Narrative, feedback and visual rhythm for products that feel alive.",
        tags: ["Narrative", "Prototypes"],
        visualClass: "visual-gaming",
        accentClass: "text-secondary",
      },
      {
        icon: "movie_filter",
        title: "Cinematic eye",
        description: "Composition, contrast and framing applied to high-impact interfaces.",
        tags: ["Direction", "Visual"],
        visualClass: "visual-cinema",
        accentClass: "text-primary",
      },
      {
        icon: "auto_awesome",
        title: "Digital lab",
        description: "Experiments with AI, automation and systems to speed up useful work.",
        tags: ["AI", "Experimentation"],
        visualClass: "visual-lab",
        accentClass: "text-tertiary",
      },
    ],
    footer: {
      title: 'Let\'s build something <span class="text-gradient-primary">different</span>.',
      description:
        "Available for web projects, redesigns, landing pages and digital products with strong visual criteria.",
      cta: "Start a conversation",
      legal: "Personal portfolio. Edit content in src/scripts/portfolio.js.",
    },
    contact: {
      email: "Email",
      linkedin: "LinkedIn",
      github: "GitHub",
    },
  },
};

const state = {
  lang: window.localStorage.getItem("portfolio-lang") || "es",
  theme: document.documentElement.dataset.theme || "dark",
  filter: "all",
  activeArticle: 0,
  menuOpen: false,
};

const elements = {
  brandText: document.getElementById("brand-text"),
  footerBrand: document.getElementById("footer-brand"),
  heroTitle: document.getElementById("hero-title"),
  heroDescription: document.getElementById("hero-description"),
  heroFocus: document.getElementById("hero-focus"),
  heroEmail: document.getElementById("hero-email"),
  heroLinkGrid: document.getElementById("hero-link-grid"),
  heroPrimaryButton: document.getElementById("hero-primary-button"),
  heroSecondaryButton: document.getElementById("hero-secondary-button"),
  projectsGrid: document.getElementById("projects-grid"),
  articlesList: document.getElementById("articles-list"),
  articleFeature: document.getElementById("article-feature"),
  aboutCopy: document.getElementById("about-copy"),
  toolboxList: document.getElementById("toolbox-list"),
  artifactsGrid: document.getElementById("artifacts-grid"),
  footerTitle: document.getElementById("footer-title"),
  footerDescription: document.getElementById("footer-description"),
  footerYear: document.getElementById("footer-year"),
  contactGrid: document.getElementById("contact-grid"),
  contactPrimaryButton: document.getElementById("contact-primary-button"),
  themeToggle: document.getElementById("theme-toggle"),
  themeToggleIcon: document.getElementById("theme-toggle-icon"),
  langButtons: document.querySelectorAll("[data-lang-button]"),
  filterButtons: document.querySelectorAll("[data-filter]"),
  scrollButtons: document.querySelectorAll("[data-scroll-target]"),
  homeLinks: document.querySelectorAll('a[href="#home"]'),
  menuToggle: document.getElementById("menu-toggle"),
  mobileMenu: document.getElementById("mobile-menu"),
  mobileLinks: document.querySelectorAll(".mobile-link"),
};

function getCopy(path) {
  return path.split(".").reduce((accumulator, segment) => accumulator?.[segment], content[state.lang]);
}

function hasRealProfileLink(value) {
  return /^https?:\/\//.test(value) && !value.includes("tuusuario");
}

function renderIcon(icon, className = "") {
  if (icon === "linkedin") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" class="${className}">
        <path fill="currentColor" d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.48 1h.02C3.87 1 4.98 2.12 4.98 3.5ZM.5 8h4V23h-4V8Zm7 0h3.8v2h.1c.53-1 1.83-2.5 4.6-2.5 4.92 0 5.83 3.24 5.83 7.45V23h-4v-6.2c0-1.48-.03-3.39-2.06-3.39-2.06 0-2.38 1.61-2.38 3.28V23h-4V8Z"/>
      </svg>
    `;
  }

  if (icon === "github") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" class="${className}">
        <path fill="currentColor" d="M12 .5A11.5 11.5 0 0 0 .5 12.24c0 5.13 3.29 9.47 7.86 11.01.58.11.79-.26.79-.57 0-.28-.01-1.03-.02-2.02-3.2.71-3.87-1.58-3.87-1.58-.52-1.36-1.28-1.72-1.28-1.72-1.04-.73.08-.72.08-.72 1.16.08 1.76 1.21 1.76 1.21 1.02 1.8 2.68 1.28 3.34.98.1-.76.4-1.28.73-1.57-2.56-.3-5.25-1.32-5.25-5.86 0-1.3.46-2.36 1.2-3.19-.12-.31-.52-1.54.12-3.22 0 0 .98-.32 3.21 1.22A10.9 10.9 0 0 1 12 6.18c.97 0 1.95.13 2.86.39 2.23-1.54 3.2-1.22 3.2-1.22.64 1.68.24 2.91.12 3.22.75.83 1.2 1.89 1.2 3.19 0 4.55-2.7 5.55-5.27 5.85.41.37.78 1.09.78 2.2 0 1.58-.02 2.86-.02 3.25 0 .31.21.69.8.57a11.76 11.76 0 0 0 7.84-11.01A11.5 11.5 0 0 0 12 .5Z"/>
      </svg>
    `;
  }

  return `<span class="material-symbols-outlined ${className}">${icon}</span>`;
}

function applyTheme(theme, persist = true) {
  state.theme = theme;

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.dataset.theme = theme;

  if (persist) {
    window.localStorage.setItem("portfolio-theme", theme);
  }

  syncThemeButton();
}

function applyStaticCopy() {
  document.documentElement.lang = state.lang;
  document.title = `${getCopy("meta.title")} | ${profile.name}`;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = getCopy(node.dataset.i18n);

    if (typeof value === "string") {
      node.textContent = value;
    }
  });

  elements.brandText.textContent = profile.name;
  elements.footerBrand.textContent = profile.name;
  elements.heroTitle.innerHTML = getCopy("hero.title");
  elements.heroDescription.textContent = getCopy("hero.description");
  elements.heroFocus.textContent = getCopy("hero.focus");
  elements.heroEmail.href = `mailto:${profile.email}`;
  elements.heroEmail.lastElementChild.textContent = profile.email;
  elements.heroPrimaryButton.textContent = getCopy("hero.primaryButton");
  elements.heroSecondaryButton.textContent = getCopy("hero.secondaryButton");
  elements.footerTitle.innerHTML = getCopy("footer.title");
  elements.footerDescription.textContent = getCopy("footer.description");
  elements.contactPrimaryButton.textContent = getCopy("footer.cta");

  elements.footerYear.textContent = `(c) ${new Date().getFullYear()} `;

  renderHeroLinks();
  renderFilters();
  renderProjects();
  renderArticles();
  renderAbout();
  renderArtifacts();
  renderToolbox();
  renderContacts();
  syncLanguageButtons();
  syncThemeButton();
}

function renderHeroLinks() {
  const cvAvailable = document.body.dataset.cvAvailable === "true";
  const links = [
    {
      label: getCopy("hero.downloadCv"),
      icon: "download",
      href: profile.cvPath,
      downloadable: true,
      active: cvAvailable,
    },
    {
      label: getCopy("hero.viewCv"),
      icon: "visibility",
      href: profile.cvPath,
      active: cvAvailable,
      newTab: true,
    },
    {
      label: getCopy("hero.linkedinButton"),
      icon: "linkedin",
      href: profile.linkedin,
      active: hasRealProfileLink(profile.linkedin),
    },
    {
      label: getCopy("hero.githubButton"),
      icon: "github",
      href: profile.github,
      active: hasRealProfileLink(profile.github),
    },
  ];

  elements.heroLinkGrid.innerHTML = links
    .map((item) => {
      if (item.active) {
        const isExternal = item.href.startsWith("http") || item.newTab;

        return `
          <a
            class="hero-action-link"
            href="${item.href}"
            ${isExternal ? 'target="_blank" rel="noreferrer"' : ""}
            ${item.downloadable ? "download" : ""}
          >
            ${renderIcon(item.icon, "hero-action-icon")}
            <span>${item.label}</span>
          </a>
        `;
      }

      return `
        <span class="hero-action-disabled" aria-disabled="true">
          ${renderIcon(item.icon, "hero-action-icon")}
          <span>${item.label}</span>
        </span>
      `;
    })
    .join("");
}

function renderFilters() {
  const labels = getCopy("projects.filters");

  elements.filterButtons.forEach((button) => {
    button.textContent = labels[button.dataset.filter];
    button.classList.toggle("is-active", button.dataset.filter === state.filter);
  });
}

function renderProjects() {
  const projects = getCopy("projects.items").filter((item) => {
    return state.filter === "all" ? true : item.category === state.filter;
  });

  elements.projectsGrid.innerHTML = projects
    .map((item) => {
      const isExternal = item.href.startsWith("http");

      return `
        <a
          class="project-card group flex h-full flex-col overflow-hidden rounded-[2rem] border border-outline-variant/18 bg-surface-container-highest/90 p-4"
          href="${item.href}"
          ${isExternal ? 'target="_blank" rel="noreferrer"' : ""}
        >
          <div class="project-visual ${item.visualClass} aspect-[4/3] rounded-[1.5rem]"></div>
          <div class="flex h-full flex-col px-2 pb-2 pt-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[0.65rem] font-black uppercase tracking-[0.2em] text-secondary">${item.accent}</p>
                <h3 class="mt-3 font-headline text-2xl font-bold tracking-tight text-on-surface">${item.title}</h3>
              </div>
              <span class="material-symbols-outlined text-primary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">north_east</span>
            </div>
            <p class="mt-4 flex-1 text-sm leading-7 text-on-surface-variant">${item.description}</p>
            <div class="mt-6 flex items-center gap-4 text-[0.7rem] font-black uppercase tracking-[0.2em] text-on-surface-variant">
              <span>${item.tag}</span>
              <span class="h-1 w-1 rounded-full bg-outline"></span>
              <span>${item.year}</span>
            </div>
          </div>
        </a>
      `;
    })
    .join("");
}

function renderArticles() {
  const articles = getCopy("articles");
  const active = articles[state.activeArticle] || articles[0];

  elements.articlesList.innerHTML = articles
    .map((article, index) => {
      const activeClass = index === state.activeArticle ? "is-active" : "";

      return `
        <button
          type="button"
          class="article-list-card ${activeClass} rounded-[1.4rem] border border-l-4 border-outline-variant/15 bg-surface-container-high/80 p-6 text-left"
          data-article-index="${index}"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[0.62rem] font-black uppercase tracking-[0.2em] text-secondary">${article.category}</p>
              <h3 class="mt-3 font-headline text-xl font-bold tracking-tight text-on-surface">${article.title}</h3>
            </div>
            <span class="text-[0.65rem] font-black uppercase tracking-[0.18em] text-on-surface-variant">${article.date}</span>
          </div>
          <p class="mt-4 text-sm leading-7 text-on-surface-variant">${article.excerpt}</p>
        </button>
      `;
    })
    .join("");

  elements.articleFeature.innerHTML = `
    <div class="article-feature-card overflow-hidden rounded-[2rem] border border-outline-variant/18 bg-surface-container-highest/90">
      <div class="article-visual ${active.visualClass} min-h-[320px]"></div>
      <div class="glass-panel border-t border-outline-variant/15 p-8 lg:p-10">
        <div class="flex flex-wrap items-center gap-4 text-[0.68rem] font-black uppercase tracking-[0.22em] text-on-surface-variant">
          <span class="text-primary">${getCopy("insights.cardLabel")}</span>
          <span>${active.category}</span>
          <span>${active.date}</span>
        </div>
        <h3 class="mt-5 max-w-3xl font-headline text-3xl font-bold leading-tight tracking-tight text-on-surface lg:text-5xl">
          ${active.title}
        </h3>
        <p class="mt-5 max-w-3xl text-lg leading-8 text-on-surface-variant">${active.body}</p>
        <button
          type="button"
          class="mt-8 inline-flex items-center gap-3 text-sm font-bold tracking-tight text-primary transition hover:gap-4"
          data-scroll-target="#contact"
        >
          <span>${getCopy("insights.cta")}</span>
          <span class="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  `;

  elements.articlesList.querySelectorAll("[data-article-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeArticle = Number(button.dataset.articleIndex);
      renderArticles();
      wireScrollButtons();
    });
  });
}

function renderAbout() {
  const paragraphs = getCopy("about.paragraphs");

  elements.aboutCopy.innerHTML = paragraphs
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
}

function renderArtifacts() {
  const artifacts = getCopy("artifacts");

  elements.artifactsGrid.innerHTML = artifacts
    .map(
      (item) => `
        <div class="artifact-card overflow-hidden rounded-[1.8rem] border border-outline-variant/18 bg-surface-container-highest/90">
          <div class="artifact-visual ${item.visualClass} aspect-[4/5]">
            <div class="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent"></div>
            <div class="absolute inset-x-6 bottom-6">
              <div class="glass-panel rounded-[1.3rem] border border-outline-variant/18 p-5">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-2xl ${item.accentClass}">${item.icon}</span>
                  <h3 class="font-headline text-xl font-bold tracking-tight text-on-surface">${item.title}</h3>
                </div>
                <p class="mt-4 text-sm leading-7 text-on-surface-variant">${item.description}</p>
                <div class="mt-4 flex flex-wrap gap-2">
                  ${item.tags
                    .map(
                      (tag) => `
                        <span class="rounded-full border border-outline-variant/20 bg-background/55 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-on-surface-variant">
                          ${tag}
                        </span>
                      `
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderToolbox() {
  const toolbox = getCopy("about.toolbox");

  elements.toolboxList.innerHTML = toolbox
    .map(
      (item) => `
        <span class="rounded-full border border-outline-variant/18 bg-surface-container-highest px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
          ${item}
        </span>
      `
    )
    .join("");
}

function renderContacts() {
  const labels = getCopy("contact");
  const contacts = [
    {
      label: labels.email,
      icon: "mail",
      hint: profile.email,
      href: `mailto:${profile.email}`,
      active: true,
    },
    {
      label: labels.linkedin,
      icon: "linkedin",
      hint: profile.linkedin.replace("https://", ""),
      href: profile.linkedin,
      active: hasRealProfileLink(profile.linkedin),
    },
    {
      label: labels.github,
      icon: "github",
      hint: profile.github.replace("https://", ""),
      href: profile.github,
      active: hasRealProfileLink(profile.github),
    },
  ];

  elements.contactGrid.innerHTML = contacts
    .map((item) => {
      const isExternal = item.href.startsWith("http");

      if (!item.active) {
        return `
          <div class="contact-card flex min-h-[190px] flex-col justify-between rounded-[1.7rem] border border-outline-variant/18 bg-surface-container-highest/55 p-6 opacity-55">
            ${renderIcon(item.icon, "contact-card-icon text-on-surface-variant")}
            <div>
              <p class="text-sm font-headline font-bold tracking-tight text-on-surface">${item.label}</p>
              <p class="mt-2 text-xs leading-6 text-on-surface-variant">${item.hint}</p>
            </div>
          </div>
        `;
      }

      return `
        <a
          class="contact-card group flex min-h-[190px] flex-col justify-between rounded-[1.7rem] border border-outline-variant/18 bg-surface-container-highest/55 p-6"
          href="${item.href}"
          ${isExternal ? 'target="_blank" rel="noreferrer"' : ""}
        >
          ${renderIcon(item.icon, "contact-card-icon text-on-surface-variant transition duration-300 group-hover:-translate-y-1 group-hover:text-secondary")}
          <div>
            <p class="text-sm font-headline font-bold tracking-tight text-on-surface">${item.label}</p>
            <p class="mt-2 text-xs leading-6 text-on-surface-variant">${item.hint}</p>
          </div>
        </a>
      `;
    })
    .join("");
}

function syncLanguageButtons() {
  elements.langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.langButton === state.lang);
  });
}

function syncThemeButton() {
  const nextTheme = state.theme === "dark" ? "light" : "dark";
  const nextThemeLabel = nextTheme === "dark" ? getCopy("controls.themeToDark") : getCopy("controls.themeToLight");

  elements.themeToggleIcon.textContent = state.theme === "dark" ? "light_mode" : "dark_mode";
  elements.themeToggle.setAttribute("aria-label", nextThemeLabel);
  elements.themeToggle.setAttribute("title", nextThemeLabel);
  elements.themeToggle.dataset.theme = state.theme;
}

function wireScrollButtons() {
  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.onclick = () => {
      const target = document.querySelector(button.dataset.scrollTarget);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
  });
}

function wireEvents() {
  elements.brandText.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  elements.homeLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  elements.langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.lang = button.dataset.langButton;
      window.localStorage.setItem("portfolio-lang", state.lang);
      applyStaticCopy();
      wireScrollButtons();
    });
  });

  elements.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      renderFilters();
      renderProjects();
    });
  });

  elements.themeToggle.addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
  });

  elements.menuToggle.addEventListener("click", () => {
    state.menuOpen = !state.menuOpen;
    elements.mobileMenu.classList.toggle("is-open", state.menuOpen);
    elements.menuToggle.setAttribute("aria-expanded", String(state.menuOpen));
    elements.menuToggle.innerHTML = `<span class="material-symbols-outlined">${
      state.menuOpen ? "close" : "menu"
    }</span>`;
  });

  elements.mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      state.menuOpen = false;
      elements.mobileMenu.classList.remove("is-open");
      elements.menuToggle.setAttribute("aria-expanded", "false");
      elements.menuToggle.innerHTML = '<span class="material-symbols-outlined">menu</span>';
    });
  });

  elements.contactPrimaryButton.addEventListener("click", () => {
    window.location.href = `mailto:${profile.email}`;
  });

  wireScrollButtons();
}

applyTheme(state.theme, false);
applyStaticCopy();
wireEvents();
