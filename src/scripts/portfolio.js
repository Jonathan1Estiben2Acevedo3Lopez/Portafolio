import aboutContent from "../data/about.json";
import blogPosts from "../data/blog.json";
import certificateCards from "../data/certificates.json";
import interestCards from "../data/interests.json";
import projectCards from "../data/projects.generated.json";

const baseUrl = document.body?.dataset.baseUrl || "/";
const basePath = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

function withBase(path) {
  if (!path || /^(?:[a-z][a-z\d+\-.]*:|#)/i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!basePath || basePath === "/") {
    return normalizedPath;
  }

  if (normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`)) {
    return normalizedPath;
  }

  return `${basePath}${normalizedPath}`;
}

const getLocalizedItems = (items, language) =>
  items.map(({ copy, ...item }) => ({
    ...item,
    ...(copy?.[language] ?? copy?.es ?? {}),
  }));

const getLocalizedSection = ({ copy, ...section }, language) => ({
  ...section,
  ...(copy?.[language] ?? copy?.es ?? {}),
});

const profile = {
  name: "JONATHAN ACEVEDO",
  fullName: "Jonathan Estiben Acevedo López",
  initials: "JEAL",
  email: "jonalopezacevedo@gmail.com",
  linkedin: "https://www.linkedin.com/in/jonathan-estiben-acevedo-l%C3%B3pez-066b3226a",
  github: "https://github.com/Jonathan1Estiben2Acevedo3Lopez",
  gitlab: "https://gitlab.com/JonathanAcevedo",
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
      certificates: "Certificados",
      insights: "Blog",
      about: "Sobre mí",
      interests: "Intereses",
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
        "Me considero una persona curiosa, apasionada por los retos y por encontrar soluciones innovadoras. Disfruto relacionarme con las personas, enfrentar nuevos desafíos y trabajar en equipo para crecer, aportar y generar un impacto positivo.",
      primaryButton: "Ver proyectos",
      secondaryButton: "Hablemos",
      downloadCv: "Descargar CV",
      viewCv: "Visualizar CV",
      linkedinButton: "LinkedIn",
      githubButton: "GitHub",
      gitlabButton: "GitLab",
      focusLabel: "Enfoque",
      focus: '"Lo profesional empieza por lo humano."',
    },
    projects: {
      title: "Proyectos",
      liveDemoLabel: "Proyecto real",
      imageAlt: "Vista previa del proyecto",
      interactCta: "Interactuar",
      detailCta: "Ver ficha",
      openSiteCta: "Abrir sitio",
      modalLabel: "Demo interactiva",
      closePreview: "Cerrar",
      filters: {
        all: "Todos",
        more: "Mas",
        web: "Web",
        branding: "Marca",
        automation: "Automatizacion",
        "web-platform": "Plataforma web",
        "landing-page": "Landing page",
        portfolio: "Portafolio",
        "mobile-app": "App movil",
        simulation: "Simulacion",
        "backend-api": "Backend/API",
        game: "Juego",
        "ui-design": "UI Design",
        "research-project": "Investigacion",
      },
      items: getLocalizedItems(projectCards, "es"),
    },
    certificates: {
      title: "Certificados",
      subtitle: "Formacion continua, cursos y logros academicos reunidos en un visor dedicado.",
      privacyBadge: "Verificados",
      emptyTitle: "Certificados en preparacion",
      emptyDescription: "Pronto publicare aqui mis certificados y constancias mas relevantes.",
      viewCta: "Ver certificado",
      unavailableCta: "Por cargar",
      fileUnavailable: "Archivo pendiente",
      items: getLocalizedItems(certificateCards, "es"),
    },
    insights: {
      title: "Blog",
      cardLabel: "Seleccionado",
      cardAction: "Abrir",
      filters: {
        all: "Todos",
        design: "Diseno",
        web: "Web",
        automation: "Automatizacion",
        content: "Contenido",
      },
      cta: "Leer blog completo",
    },
    articles: getLocalizedItems(blogPosts, "es"),
    about: getLocalizedSection(aboutContent, "es"),
    interests: {
      title: "Intereses",
      subtitle: "Gustos personales, referencias e ideas que alimentan mi forma de crear.",
      cardLabel: "Seleccionado",
      cardAction: "Abrir",
      filters: {
        all: "Todo",
        movies: "Peliculas",
        series: "Series",
        anime: "Animes",
        books: "Libros",
        games: "Videojuegos",
      },
      mediaItems: getLocalizedItems(interestCards, "es"),
    },
    footer: {
      legalLine: "© 2026 Jonathan Estiben Acevedo López • Todos los derechos reservados",
    },
    contact: {
      title: "Contáctame",
      identityRole: "Ingeniero de sistemas y computación",
      email: "Email",
      emailSubject: "Contacto",
      emailBody: "Hola Jonathan,\n\nQuiero hablar contigo sobre:\n\n\nGracias.",
      linkedin: "LinkedIn",
      github: "GitHub",
      gitlab: "GitLab",
    },
  },
  en: {
    meta: {
      title: "Portfolio",
    },
    nav: {
      home: "Home",
      projects: "Projects",
      certificates: "Certificates",
      insights: "Blog",
      about: "About",
      interests: "Interests",
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
        "I consider myself a curious person, passionate about challenges and about finding innovative solutions. I enjoy connecting with people, facing new challenges and working as a team to grow, contribute and create a positive impact.",
      primaryButton: "View projects",
      secondaryButton: "Let's talk",
      downloadCv: "Download CV",
      viewCv: "View CV",
      linkedinButton: "LinkedIn",
      githubButton: "GitHub",
      gitlabButton: "GitLab",
      focusLabel: "Focus",
      focus: '"Professional work starts with the human side."',
    },
    projects: {
      title: "Projects",
      liveDemoLabel: "Real project",
      imageAlt: "Project preview",
      interactCta: "Interact",
      detailCta: "View case",
      openSiteCta: "Open site",
      modalLabel: "Interactive demo",
      closePreview: "Close",
      filters: {
        all: "All",
        more: "More",
        web: "Web",
        branding: "Branding",
        automation: "Automation",
        "web-platform": "Web platform",
        "landing-page": "Landing page",
        portfolio: "Portfolio",
        "mobile-app": "Mobile app",
        simulation: "Simulation",
        "backend-api": "Backend/API",
        game: "Game",
        "ui-design": "UI Design",
        "research-project": "Research project",
      },
      items: getLocalizedItems(projectCards, "en"),
    },
    certificates: {
      title: "Certificates",
      subtitle: "Continuous learning, courses and academic achievements gathered in a dedicated viewer.",
      privacyBadge: "Verified",
      emptyTitle: "Certificates in progress",
      emptyDescription: "I will publish my most relevant certificates and course records here soon.",
      viewCta: "View certificate",
      unavailableCta: "Pending file",
      fileUnavailable: "Pending file",
      items: getLocalizedItems(certificateCards, "en"),
    },
    insights: {
      title: "Blog",
      cardLabel: "Selected",
      cardAction: "Open",
      filters: {
        all: "All",
        design: "Design",
        web: "Web",
        automation: "Automation",
        content: "Content",
      },
      cta: "Read full post",
    },
    articles: getLocalizedItems(blogPosts, "en"),
    about: getLocalizedSection(aboutContent, "en"),
    interests: {
      title: "Interests",
      subtitle: "Personal tastes, references and ideas that shape how I create.",
      cardLabel: "Selected",
      cardAction: "Open",
      filters: {
        all: "All",
        movies: "Movies",
        series: "Series",
        anime: "Anime",
        books: "Books",
        games: "Games",
      },
      mediaItems: getLocalizedItems(interestCards, "en"),
    },
    footer: {
      legalLine: "© 2026 Jonathan Estiben Acevedo López • All rights reserved",
    },
    contact: {
      title: "Contact me",
      identityRole: "Systems and Computer Engineer",
      email: "Email",
      emailSubject: "Contact",
      emailBody: "Hi Jonathan,\n\nI would like to talk with you about:\n\n\nThank you.",
      linkedin: "LinkedIn",
      github: "GitHub",
      gitlab: "GitLab",
    },
  },
};

const state = {
  lang: window.localStorage.getItem("portfolio-lang") || "es",
  theme: document.documentElement.dataset.theme || "dark",
  filter: "all",
  articleFilter: "all",
  activeArticle: 0,
  interestFilter: "all",
  activeInterest: 0,
  menuOpen: false,
  projectPreviewOpen: false,
  projectFiltersOpen: false,
  activeProjectPreviewTitle: "Docqee",
  activeProjectPreviewUrl: "https://docqee.vercel.app/",
  articleMobileLayout: window.matchMedia("(max-width: 767px)").matches,
  headerOffset: 88,
  sectionMetrics: [],
  deferredSectionsReady: false,
};

const projectFilterPriority = [
  "web",
  "web-platform",
  "landing-page",
  "portfolio",
  "automation",
  "branding",
  "mobile-app",
  "backend-api",
  "ui-design",
  "game",
  "simulation",
  "research-project",
];
const projectPrimaryFilterLimit = 4;

const elements = {
  brandText: document.getElementById("brand-text"),
  heroTitle: document.getElementById("hero-title"),
  heroDescription: document.getElementById("hero-description"),
  heroFocus: document.getElementById("hero-focus"),
  heroEmail: document.getElementById("hero-email"),
  heroLinkGrid: document.getElementById("hero-link-grid"),
  heroPrimaryButton: document.getElementById("hero-primary-button"),
  heroSecondaryButton: document.getElementById("hero-secondary-button"),
  heroMascotField: document.getElementById("hero-mascot-field"),
  heroMascots: document.querySelectorAll("[data-hero-mascot]"),
  projectsGrid: document.getElementById("projects-grid"),
  projectFilters: document.getElementById("project-filters"),
  certificatesGrid: document.getElementById("certificates-grid"),
  articlesList: document.getElementById("articles-list"),
  articleFeature: document.getElementById("article-feature"),
  aboutProfileGrid: document.getElementById("about-profile-grid"),
  interestsMediaList: document.getElementById("interests-media-list"),
  interestsMediaFeature: document.getElementById("interests-media-feature"),
  contactGrid: document.getElementById("contact-grid"),
  projectPreviewModal: document.getElementById("project-preview-modal"),
  projectPreviewModalTitle: document.getElementById("project-preview-modal-title"),
  projectPreviewModalFrame: document.getElementById("project-preview-iframe"),
  projectPreviewOpenSite: document.getElementById("project-preview-open-site"),
  projectPreviewClose: document.getElementById("project-preview-close"),
  themeToggle: document.getElementById("theme-toggle"),
  themeToggleIcon: document.getElementById("theme-toggle-icon"),
  languageToggle: document.getElementById("language-toggle"),
  sectionLinks: document.querySelectorAll(".nav-link, .mobile-link"),
  articleFilterButtons: document.querySelectorAll("#insights-filters [data-article-filter]"),
  interestFilterButtons: document.querySelectorAll("#interests-media-filters [data-interest-filter]"),
  scrollButtons: document.querySelectorAll("[data-scroll-target]"),
  homeLinks: document.querySelectorAll('a[href="#home"]'),
  menuToggle: document.getElementById("menu-toggle"),
  mobileMenu: document.getElementById("mobile-menu"),
  mobileLinks: document.querySelectorAll(".mobile-link"),
  header: document.querySelector("header"),
};

const sectionIds = ["home", "about", "projects", "certificates", "insights", "interests", "contact"];

function getCopy(path) {
  return path.split(".").reduce((accumulator, segment) => accumulator?.[segment], content[state.lang]);
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function buildMailtoLink() {
  const subject = getCopy("contact.emailSubject") || "";
  const body = getCopy("contact.emailBody") || "";
  const query = [
    `subject=${encodeURIComponent(subject)}`,
    `body=${encodeURIComponent(body)}`,
  ].join("&");

  return `mailto:${profile.email}?${query}`;
}

function hasRealProfileLink(value) {
  return /^https?:\/\//.test(value) && !value.includes("tuusuario");
}

function renderIcon(icon, className = "") {
  const strokeIcon = (paths, viewBox = "0 0 24 24") => `
    <svg viewBox="${viewBox}" aria-hidden="true" class="icon-symbol ${className}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      ${paths}
    </svg>
  `;

  if (icon === "linkedin") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" class="icon-symbol ${className}">
        <path fill="currentColor" d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.48 1h.02C3.87 1 4.98 2.12 4.98 3.5ZM.5 8h4V23h-4V8Zm7 0h3.8v2h.1c.53-1 1.83-2.5 4.6-2.5 4.92 0 5.83 3.24 5.83 7.45V23h-4v-6.2c0-1.48-.03-3.39-2.06-3.39-2.06 0-2.38 1.61-2.38 3.28V23h-4V8Z"/>
      </svg>
    `;
  }

  if (icon === "github") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" class="icon-symbol ${className}">
        <path fill="currentColor" d="M12 .5A11.5 11.5 0 0 0 .5 12.24c0 5.13 3.29 9.47 7.86 11.01.58.11.79-.26.79-.57 0-.28-.01-1.03-.02-2.02-3.2.71-3.87-1.58-3.87-1.58-.52-1.36-1.28-1.72-1.28-1.72-1.04-.73.08-.72.08-.72 1.16.08 1.76 1.21 1.76 1.21 1.02 1.8 2.68 1.28 3.34.98.1-.76.4-1.28.73-1.57-2.56-.3-5.25-1.32-5.25-5.86 0-1.3.46-2.36 1.2-3.19-.12-.31-.52-1.54.12-3.22 0 0 .98-.32 3.21 1.22A10.9 10.9 0 0 1 12 6.18c.97 0 1.95.13 2.86.39 2.23-1.54 3.2-1.22 3.2-1.22.64 1.68.24 2.91.12 3.22.75.83 1.2 1.89 1.2 3.19 0 4.55-2.7 5.55-5.27 5.85.41.37.78 1.09.78 2.2 0 1.58-.02 2.86-.02 3.25 0 .31.21.69.8.57a11.76 11.76 0 0 0 7.84-11.01A11.5 11.5 0 0 0 12 .5Z"/>
      </svg>
    `;
  }

  if (icon === "gitlab") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" class="icon-symbol ${className}">
        <path fill="currentColor" d="M23.64 13.05 22.29 8.9l-2.68-8.24a.46.46 0 0 0-.87 0l-2.68 8.24H7.94L5.26.66a.46.46 0 0 0-.87 0L1.71 8.9.36 13.05a.92.92 0 0 0 .33 1.03L12 22.3l11.31-8.22a.92.92 0 0 0 .33-1.03Z"/>
      </svg>
    `;
  }

  if (icon === "mail") {
    return strokeIcon('<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4 7 8 6 8-6"></path>');
  }

  if (icon === "school") {
    return strokeIcon('<path d="m3 8.5 9-4 9 4-9 4-9-4Z"></path><path d="M7 10.3v4.2c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5v-4.2"></path><path d="M21 8.5v5"></path>');
  }

  if (icon === "work") {
    return strokeIcon('<rect x="4" y="7" width="16" height="12" rx="2"></rect><path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7"></path><path d="M4 12h16"></path><path d="M10 12v1.2h4V12"></path>');
  }

  if (icon === "download") {
    return strokeIcon('<path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path>');
  }

  if (icon === "lock") {
    return strokeIcon('<rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path>');
  }

  if (icon === "shield_check") {
    return strokeIcon('<path d="M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3Z"></path><path d="m9.5 12 1.8 1.8 3.7-4"></path>');
  }

  if (icon === "workspace_premium") {
    return strokeIcon('<path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"></path><path d="m9 14.2-1 6 4-2.2 4 2.2-1-6"></path>');
  }

  if (icon === "visibility") {
    return strokeIcon('<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="3"></circle>');
  }

  if (icon === "light_mode") {
    return strokeIcon('<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2.2"></path><path d="M12 19.8V22"></path><path d="m4.93 4.93 1.56 1.56"></path><path d="m17.51 17.51 1.56 1.56"></path><path d="M2 12h2.2"></path><path d="M19.8 12H22"></path><path d="m4.93 19.07 1.56-1.56"></path><path d="m17.51 6.49 1.56-1.56"></path>');
  }

  if (icon === "dark_mode") {
    return strokeIcon('<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"></path>');
  }

  if (icon === "menu") {
    return strokeIcon('<path d="M4 7h16"></path><path d="M4 12h16"></path><path d="M4 17h16"></path>');
  }

  if (icon === "close") {
    return strokeIcon('<path d="M6 6l12 12"></path><path d="M18 6 6 18"></path>');
  }

  if (icon === "arrow_forward") {
    return strokeIcon('<path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path>');
  }

  if (icon === "arrow_outward" || icon === "north_east") {
    return strokeIcon('<path d="M7 17 17 7"></path><path d="M9 7h8v8"></path>');
  }

  if (icon === "sports_esports") {
    return strokeIcon('<path d="M6.5 10h11a4.5 4.5 0 0 1 4.4 5.4l-.4 2a2.5 2.5 0 0 1-4.6.9l-1.2-2H8.3l-1.2 2a2.5 2.5 0 0 1-4.6-.9l-.4-2A4.5 4.5 0 0 1 6.5 10Z"></path><path d="M8 13h4"></path><path d="M10 11v4"></path><circle cx="16.5" cy="12.5" r=".9" fill="currentColor" stroke="none"></circle><circle cx="19" cy="14.5" r=".9" fill="currentColor" stroke="none"></circle>');
  }

  if (icon === "movie_filter") {
    return strokeIcon('<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M7 5v14"></path><path d="M17 5v14"></path><path d="M3 9h4"></path><path d="M17 9h4"></path><path d="M3 15h4"></path><path d="M17 15h4"></path>');
  }

  if (icon === "auto_awesome") {
    return strokeIcon('<path d="m12 3 2.2 5.3L19 11l-4.8 2.7L12 19l-2.2-5.3L5 11l4.8-2.7Z"></path>');
  }

  return "";
}

function renderLanguageFlag(lang) {
  if (lang === "es") {
    return `
      <svg class="lang-flag" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#FCD116" />
        <path d="M2 12a10 10 0 0 0 20 0Z" fill="#003893" />
        <path d="M3.34 16.99a10 10 0 0 0 17.32 0Z" fill="#CE1126" />
      </svg>
    `;
  }

  return `
    <svg class="lang-flag" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <clipPath id="usa-flag-circle">
          <circle cx="12" cy="12" r="10" />
        </clipPath>
      </defs>
      <g clip-path="url(#usa-flag-circle)">
        <rect x="2" y="2" width="20" height="20" fill="#fff" />
        <rect x="2" y="2" width="20" height="1.54" fill="#B22234" />
        <rect x="2" y="5.08" width="20" height="1.54" fill="#B22234" />
        <rect x="2" y="8.15" width="20" height="1.54" fill="#B22234" />
        <rect x="2" y="11.23" width="20" height="1.54" fill="#B22234" />
        <rect x="2" y="14.31" width="20" height="1.54" fill="#B22234" />
        <rect x="2" y="17.38" width="20" height="1.54" fill="#B22234" />
        <rect x="2" y="20.46" width="20" height="1.54" fill="#B22234" />
        <rect x="2" y="2" width="9" height="8.62" fill="#3C3B6E" />
        <g fill="#fff">
          <circle cx="4" cy="4" r="0.55" />
          <circle cx="6.1" cy="4" r="0.55" />
          <circle cx="8.2" cy="4" r="0.55" />
          <circle cx="5.05" cy="5.8" r="0.55" />
          <circle cx="7.15" cy="5.8" r="0.55" />
          <circle cx="4" cy="7.6" r="0.55" />
          <circle cx="6.1" cy="7.6" r="0.55" />
          <circle cx="8.2" cy="7.6" r="0.55" />
        </g>
      </g>
    </svg>
  `;
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
  elements.heroTitle.innerHTML = getCopy("hero.title");
  elements.heroDescription.textContent = getCopy("hero.description");
  elements.heroFocus.textContent = getCopy("hero.focus");
  elements.heroEmail.href = buildMailtoLink();
  elements.heroEmail.lastElementChild.textContent = profile.email;
  elements.heroPrimaryButton.textContent = getCopy("hero.primaryButton");
  elements.heroSecondaryButton.textContent = getCopy("hero.secondaryButton");
  renderHeroLinks();
  renderFilters();
  renderAboutProfile();
  renderCertificates();
  renderArticleFilters();
  renderInterestFilters();

  if (state.deferredSectionsReady) {
    renderProjects();
    renderCertificates();
    renderArticles();
    renderInterestMedia();
    renderContacts();
  } else {
    scheduleDeferredSections();
  }

  syncLanguageButtons();
  syncThemeButton();
  syncProjectPreviewModalCopy();
  queueSectionMetricsRefresh();
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
    {
      label: getCopy("hero.gitlabButton"),
      icon: "gitlab",
      href: profile.gitlab,
      active: hasRealProfileLink(profile.gitlab),
    },
  ];

  elements.heroLinkGrid.innerHTML = links
    .map((item) => {
      if (item.active) {
        const isExternal = item.href.startsWith("http") || item.newTab;
        const href = withBase(item.href);

        return `
          <a
            class="hero-action-link"
            href="${href}"
            ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ""}
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

function getProjectFilterLabel(labels, filter) {
  return labels[filter] || String(filter).replace(/-/g, " ");
}

function getProjectFilterOptions() {
  const labels = getCopy("projects.filters");
  const counts = getCopy("projects.items").reduce((accumulator, item) => {
    if (item.showInHome === false || !item.category) {
      return accumulator;
    }

    accumulator.set(item.category, (accumulator.get(item.category) || 0) + 1);
    return accumulator;
  }, new Map());

  return [...counts.entries()]
    .map(([filter, count]) => ({
      filter,
      count,
      label: getProjectFilterLabel(labels, filter),
    }))
    .sort((filterA, filterB) => {
      const priorityA = projectFilterPriority.includes(filterA.filter)
        ? projectFilterPriority.indexOf(filterA.filter)
        : Number.MAX_SAFE_INTEGER;
      const priorityB = projectFilterPriority.includes(filterB.filter)
        ? projectFilterPriority.indexOf(filterB.filter)
        : Number.MAX_SAFE_INTEGER;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      if (filterA.count !== filterB.count) {
        return filterB.count - filterA.count;
      }

      return filterA.label.localeCompare(filterB.label);
    });
}

function createProjectFilterButton(filter, label, className = "filter-chip") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.dataset.filter = filter;
  button.textContent = label;
  button.classList.toggle("is-active", filter === state.filter);

  return button;
}

function renderFilters() {
  if (!elements.projectFilters) {
    return;
  }

  const labels = getCopy("projects.filters");
  const filters = getProjectFilterOptions();
  const availableFilters = new Set(filters.map((item) => item.filter));

  if (state.filter !== "all" && !availableFilters.has(state.filter)) {
    state.filter = "all";
  }

  const primaryFilters = filters.slice(0, projectPrimaryFilterLimit);
  const secondaryFilters = filters.slice(projectPrimaryFilterLimit);
  const activeSecondaryFilter = secondaryFilters.find((item) => item.filter === state.filter);

  elements.projectFilters.innerHTML = "";
  elements.projectFilters.append(createProjectFilterButton("all", labels.all));

  primaryFilters.forEach((item) => {
    elements.projectFilters.append(createProjectFilterButton(item.filter, item.label));
  });

  if (secondaryFilters.length > 0) {
    const moreGroup = document.createElement("div");
    moreGroup.className = "project-filter-more";
    moreGroup.classList.toggle("is-open", state.projectFiltersOpen);

    const moreButton = document.createElement("button");
    moreButton.type = "button";
    moreButton.className = "filter-chip filter-chip-more";
    moreButton.dataset.projectFilterToggle = "true";
    moreButton.textContent = activeSecondaryFilter?.label || labels.more;
    moreButton.classList.toggle("is-active", Boolean(activeSecondaryFilter));
    moreButton.setAttribute("aria-haspopup", "true");
    moreButton.setAttribute("aria-expanded", String(state.projectFiltersOpen));

    const menu = document.createElement("div");
    menu.className = "project-filter-menu";
    menu.setAttribute("role", "menu");

    secondaryFilters.forEach((item) => {
      menu.append(createProjectFilterButton(item.filter, item.label, "project-filter-menu-item"));
    });

    moreGroup.append(moreButton, menu);
    elements.projectFilters.append(moreGroup);
  }
}

function renderArticleFilters() {
  const labels = getCopy("insights.filters");

  elements.articleFilterButtons.forEach((button) => {
    button.textContent = labels[button.dataset.articleFilter];
    button.classList.toggle("is-active", button.dataset.articleFilter === state.articleFilter);
  });
}

function syncProjectPreviewModalCopy() {
  const projectCopy = getCopy("projects");

  if (!elements.projectPreviewModal || !elements.projectPreviewModalTitle || !elements.projectPreviewOpenSite || !elements.projectPreviewClose) {
    return;
  }

  const modalLabel = elements.projectPreviewModal.querySelector(".project-preview-window-label");

  if (modalLabel) {
    modalLabel.textContent = projectCopy.modalLabel;
  }

  elements.projectPreviewModalTitle.textContent = state.activeProjectPreviewTitle;
  elements.projectPreviewOpenSite.textContent = projectCopy.openSiteCta;
  elements.projectPreviewOpenSite.href = state.activeProjectPreviewUrl;
  elements.projectPreviewClose.textContent = projectCopy.closePreview;
  elements.projectPreviewClose.setAttribute("aria-label", projectCopy.closePreview);
}

function openProjectPreview(url, title) {
  state.projectPreviewOpen = true;
  state.activeProjectPreviewTitle = title;
  state.activeProjectPreviewUrl = url;

  syncProjectPreviewModalCopy();

  elements.projectPreviewModalFrame.src = url;
  elements.projectPreviewModal.classList.add("is-open");
  elements.projectPreviewModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("project-preview-open");
}

function closeProjectPreview() {
  if (!state.projectPreviewOpen) {
    return;
  }

  state.projectPreviewOpen = false;
  elements.projectPreviewModal.classList.remove("is-open");
  elements.projectPreviewModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("project-preview-open");
  elements.projectPreviewModalFrame.src = "about:blank";
}

function getCertificateSourceId(item) {
  return item.id || "";
}

function getCertificateViewerId(item) {
  return getCertificateSourceId(item);
}

function buildCertificateViewerUrl(item) {
  const params = new URLSearchParams({
    certificate: getCertificateViewerId(item),
    title: item.title,
  });

  return withBase(`/certificados/ver/?${params.toString()}`);
}

function renderCertificatePreview(item) {
  const preview = item.thumbnail || "";

  if (preview) {
    return `
      <img
        src="${withBase(preview)}"
        alt="${item.title}"
        loading="lazy"
        draggable="false"
        class="certificate-card-preview"
      />
    `;
  }

  return `
    <div class="certificate-card-placeholder" aria-hidden="true">
      <div class="certificate-card-ribbon"></div>
      <div class="certificate-card-lines">
        <span></span>
        <span></span>
        <span></span>
      </div>
      ${renderIcon("workspace_premium", "certificate-card-award")}
    </div>
  `;
}

function renderCertificates() {
  if (!elements.certificatesGrid) {
    return;
  }

  const labels = getCopy("certificates");
  const certificates = labels.items || [];

  if (!certificates.length) {
    elements.certificatesGrid.innerHTML = `
      <div class="certificate-empty-state sm:col-span-2 xl:col-span-3">
        <div class="certificate-empty-icon">
          ${renderIcon("shield_check", "text-xl")}
        </div>
        <h3>${labels.emptyTitle}</h3>
        <p>${labels.emptyDescription}</p>
      </div>
    `;
    return;
  }

  elements.certificatesGrid.innerHTML = certificates
    .map((item, index) => {
      const hasFile = Boolean(getCertificateSourceId(item));
      const viewerUrl = hasFile ? buildCertificateViewerUrl(item) : "";
      const tags = item.tags || [];

      return `
        <article class="certificate-card overflow-hidden rounded-[1.75rem] border border-outline-variant/18 bg-surface-container-highest/90 p-3.5">
          <div class="certificate-card-visual rounded-[1.3rem]">
            ${renderCertificatePreview(item)}
            <div class="certificate-card-privacy-layer">
              ${renderIcon("lock", "certificate-card-lock")}
            </div>
          </div>
          <div class="certificate-card-body px-1.5 pb-1 pt-4">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[0.65rem] font-black uppercase tracking-[0.2em] text-secondary">${item.issuer || labels.fileUnavailable}</p>
                <h3 class="mt-2 font-headline text-[1.32rem] font-bold leading-tight tracking-tight text-on-surface">${item.title}</h3>
              </div>
              <span class="certificate-card-status">
                ${renderIcon("shield_check", "text-base")}
              </span>
            </div>
            <div class="certificate-card-meta mt-3 flex flex-wrap items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-on-surface-variant">
              ${item.issued ? `<span>${item.issued}</span>` : ""}
              ${tags
                .map(
                  (tag) => `
                    <span class="rounded-full border border-outline-variant/18 bg-background/55 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-on-surface-variant">
                      ${tag}
                    </span>
                  `
                )
                .join("")}
            </div>
            ${
              hasFile
                ? `
                  <a class="certificate-card-action" href="${viewerUrl}" data-certificate-link>
                    ${renderIcon("visibility", "text-base")}
                    <span>${labels.viewCta}</span>
                  </a>
                `
                : `
                  <span class="certificate-card-action is-disabled" aria-disabled="true">
                    ${renderIcon("lock", "text-base")}
                    <span>${labels.unavailableCta}</span>
                  </span>
                `
            }
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProjectVisual(item, altText) {
  if (item.previewImage) {
    return `
      <div class="project-visual project-live-visual relative overflow-hidden rounded-[1.3rem] border border-outline-variant/15 bg-white">
        <img
          src="${withBase(item.previewImage)}"
          alt="${altText}"
          loading="lazy"
          class="project-preview-image"
        />
      </div>
    `;
  }

  return `<div class="project-visual ${item.visualClass} aspect-[16/10] rounded-[1.3rem]"></div>`;
}

function getProjectFeaturedRank(project) {
  if (project.featuredLevel === "main") {
    return 0;
  }

  if (project.featuredLevel === "featured") {
    return 1;
  }

  return 2;
}

function sortProjectsForHome(projects) {
  return [...projects].sort((projectA, projectB) => {
    const pinnedA = projectA.pinned ? 0 : 1;
    const pinnedB = projectB.pinned ? 0 : 1;

    if (pinnedA !== pinnedB) {
      return pinnedA - pinnedB;
    }

    const priorityA = Number.isFinite(projectA.priority) ? projectA.priority : Number.MAX_SAFE_INTEGER;
    const priorityB = Number.isFinite(projectB.priority) ? projectB.priority : Number.MAX_SAFE_INTEGER;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    const featuredA = getProjectFeaturedRank(projectA);
    const featuredB = getProjectFeaturedRank(projectB);

    if (featuredA !== featuredB) {
      return featuredA - featuredB;
    }

    const yearA = Number.parseInt(projectA.year, 10) || 0;
    const yearB = Number.parseInt(projectB.year, 10) || 0;

    if (yearA !== yearB) {
      return yearB - yearA;
    }

    const orderA = Number.isFinite(projectA.order) ? projectA.order : Number.MAX_SAFE_INTEGER;
    const orderB = Number.isFinite(projectB.order) ? projectB.order : Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return String(projectA.slug).localeCompare(String(projectB.slug));
  });
}

function renderProjects() {
  const projects = sortProjectsForHome(getCopy("projects.items")).filter((item) => {
    if (item.showInHome === false) {
      return false;
    }

    return state.filter === "all" ? true : item.category === state.filter;
  });
  const projectCopy = getCopy("projects");

  elements.projectsGrid.innerHTML = projects
    .map((item) => {
      const detailHref = withBase(item.href || `/proyectos/${item.slug}`);
      const imageAlt = `${projectCopy.imageAlt}: ${item.title}`;

      if (item.liveUrl) {
        return `
          <article class="project-card project-live-card flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-outline-variant/18 bg-surface-container-highest/90 p-3.5">
            ${renderProjectVisual(item, imageAlt)}
            <div class="flex flex-col px-1.5 pb-1 pt-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-[0.65rem] font-black uppercase tracking-[0.2em] text-secondary">${item.accent}</p>
                  <h3 class="mt-2 font-headline text-[1.45rem] font-bold tracking-tight text-on-surface">${item.title}</h3>
                </div>
                ${renderIcon("north_east", "text-primary")}
              </div>
              <p class="mt-3 text-sm leading-6 text-on-surface-variant">${item.description}</p>
              <div class="mt-4 flex items-center gap-4 text-[0.68rem] font-black uppercase tracking-[0.19em] text-on-surface-variant">
                <span>${item.tag}</span>
                <span class="h-1 w-1 rounded-full bg-outline"></span>
                <span>${item.year}</span>
              </div>
              <div class="project-card-actions mt-3">
                <button
                  type="button"
                  class="project-card-action bg-primary text-on-primary transition hover:-translate-y-0.5"
                  data-project-modal-open="${item.liveUrl}"
                  data-project-title="${item.title}"
                >
                  ${projectCopy.interactCta}
                </button>
                <a
                  class="project-card-action border border-secondary/25 text-secondary transition hover:border-secondary hover:bg-secondary/5"
                  href="${item.liveUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ${projectCopy.openSiteCta}
                </a>
                <a
                  class="project-card-action border border-outline-variant/22 text-on-surface transition hover:border-primary/45 hover:text-primary"
                  href="${detailHref}"
                >
                  ${projectCopy.detailCta}
                </a>
              </div>
            </div>
          </article>
        `;
      }

      return `
        <article
          class="project-card group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-outline-variant/18 bg-surface-container-highest/90 p-3.5"
        >
          ${renderProjectVisual(item, imageAlt)}
          <div class="flex flex-1 flex-col px-1.5 pb-1 pt-4">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[0.65rem] font-black uppercase tracking-[0.2em] text-secondary">${item.accent}</p>
                <h3 class="mt-2 font-headline text-[1.45rem] font-bold tracking-tight text-on-surface">${item.title}</h3>
              </div>
              ${renderIcon("north_east", "text-primary transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5")}
            </div>
            <p class="mt-3 text-sm leading-6 text-on-surface-variant">${item.description}</p>
            <div class="mt-4 flex items-center gap-4 text-[0.68rem] font-black uppercase tracking-[0.19em] text-on-surface-variant">
              <span>${item.tag}</span>
              <span class="h-1 w-1 rounded-full bg-outline"></span>
              <span>${item.year}</span>
            </div>
            <div class="project-card-actions project-card-actions--single mt-auto pt-4">
              <a
                class="project-card-action border border-outline-variant/22 text-on-surface transition hover:border-primary/45 hover:text-primary"
                href="${detailHref}"
              >
                ${projectCopy.detailCta}
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderArticles(preserveScroll = false) {
  const articles = getCopy("articles")
    .map((article, index) => ({ ...article, index }))
    .filter((article) => (state.articleFilter === "all" ? true : article.filter === state.articleFilter));
  const active = articles.find((article) => article.index === state.activeArticle) || articles[0];
  const mobileLayout = isMobileViewport();
  const listScrollOffset = preserveScroll
    ? mobileLayout
      ? elements.articlesList.scrollLeft
      : elements.articlesList.scrollTop
    : 0;

  if (active) {
    state.activeArticle = active.index;
  }

  if (mobileLayout) {
    elements.articlesList.innerHTML = articles
      .map((article) => {
        const detailHref = withBase(`/blog/${article.slug}`);

        return `
          <a
            class="project-card article-mobile-card group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-outline-variant/18 bg-surface-container-highest/90 p-3.5"
            href="${detailHref}"
          >
            <div class="project-visual ${article.visualClass} aspect-[16/10] rounded-[1.3rem]"></div>
            <div class="flex h-full flex-col px-1.5 pb-1 pt-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-[0.65rem] font-black uppercase tracking-[0.2em] text-secondary">${article.category}</p>
                  <h3 class="mt-2 font-headline text-[1.18rem] font-bold leading-6 tracking-tight text-on-surface">${article.title}</h3>
                </div>
                ${renderIcon("north_east", "text-primary transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5")}
              </div>
              <p class="mt-3 flex-1 text-sm leading-6 text-on-surface-variant">${article.excerpt}</p>
              <div class="mt-4 flex items-center gap-4 text-[0.68rem] font-black uppercase tracking-[0.19em] text-on-surface-variant">
                <span>${article.date}</span>
              </div>
            </div>
          </a>
        `;
      })
      .join("");

    elements.articleFeature.innerHTML = "";
    elements.articleFeature.classList.add("article-feature-mobile-hidden");

    if (preserveScroll) {
      elements.articlesList.scrollLeft = listScrollOffset;
    }

    return;
  }

  elements.articleFeature.classList.remove("article-feature-mobile-hidden");

  elements.articlesList.innerHTML = articles
    .map((article) => {
      const activeClass = article.index === state.activeArticle ? "is-active" : "";

      return `
        <button
          type="button"
          class="article-list-card ${activeClass} flex min-h-[9.75rem] flex-col justify-between rounded-[1.45rem] border border-outline-variant/15 bg-surface-container-high/78 p-4 text-left lg:min-h-[10.35rem]"
          data-article-index="${article.index}"
          aria-pressed="${article.index === state.activeArticle}"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[0.62rem] font-black uppercase tracking-[0.2em] text-secondary">${article.category}</p>
              <h3 class="mt-2.5 font-headline text-[1rem] font-bold leading-6 tracking-tight text-on-surface sm:text-[1.08rem]">${article.title}</h3>
            </div>
            <span class="text-[0.65rem] font-black uppercase tracking-[0.18em] text-on-surface-variant">${article.date}</span>
          </div>
          <p class="mt-3 text-sm leading-6 text-on-surface-variant">${article.excerpt}</p>
          <div class="mt-4 inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.18em] ${article.index === state.activeArticle ? "text-primary" : "text-on-surface-variant"}">
            <span>${article.index === state.activeArticle ? getCopy("insights.cardLabel") : getCopy("insights.cardAction")}</span>
            ${renderIcon("arrow_outward", "text-sm")}
          </div>
        </button>
      `;
    })
    .join("");

  if (preserveScroll) {
    elements.articlesList.scrollTop = listScrollOffset;
  }

  const detailHref = withBase(`/blog/${active.slug}`);

  elements.articleFeature.innerHTML = `
    <a
      href="${detailHref}"
      class="article-feature-card group block overflow-hidden rounded-[2rem] border border-outline-variant/18 bg-surface-container-highest/90 lg:grid lg:min-h-[27.5rem] lg:grid-cols-[minmax(13rem,0.7fr)_minmax(0,1.2fr)]"
    >
      <div class="article-visual ${active.visualClass} min-h-[160px] lg:min-h-full"></div>
      <div class="glass-panel border-t border-outline-variant/15 p-5 lg:border-l lg:border-t-0 lg:px-6 lg:py-5">
        <div class="flex flex-wrap items-center gap-4 text-[0.68rem] font-black uppercase tracking-[0.22em] text-on-surface-variant">
          <span class="text-primary">${getCopy("insights.cardLabel")}</span>
          <span>${active.category}</span>
          <span>${active.date}</span>
        </div>
        <h3 class="mt-4 max-w-3xl font-headline text-[1.7rem] font-bold leading-tight tracking-tight text-on-surface lg:text-[2.35rem]">
          ${active.title}
        </h3>
        <p class="mt-4 max-w-3xl text-[0.98rem] leading-7 text-on-surface-variant lg:text-[1.02rem] lg:leading-7">${active.body}</p>
        <div class="mt-5 inline-flex items-center gap-3 text-sm font-bold tracking-tight text-primary transition group-hover:gap-4">
          <span>${getCopy("insights.cta")}</span>
          ${renderIcon("arrow_forward", "text-base")}
        </div>
      </div>
    </a>
  `;

  elements.articlesList.querySelectorAll("[data-article-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeArticle = Number(button.dataset.articleIndex);
      renderArticles(true);
      wireScrollButtons();

      if (window.innerWidth < 1024) {
        window.requestAnimationFrame(() => {
          const top = elements.articleFeature.getBoundingClientRect().top + window.scrollY - 116;
          window.scrollTo({ top, behavior: "smooth" });
        });
      }
    });
  });
}

function renderAboutTagPills(tags = []) {
  return tags
    .map(
      (tag) => `
        <span class="rounded-full border border-outline-variant/18 bg-background/55 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-on-surface-variant">
          ${tag}
        </span>
      `
    )
    .join("");
}

function renderAboutStandardGroup(group) {
  return `
    <article class="about-profile-card rounded-[1.75rem] border border-outline-variant/18 bg-surface-container-highest/78 p-5 sm:p-6">
      <div class="flex items-center gap-3">
        <span class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-secondary/20 bg-secondary/10 text-secondary">
          ${renderIcon(group.icon, "text-[1.15rem]")}
        </span>
        <h3 class="font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl">${group.title}</h3>
      </div>

      <div class="mt-5 divide-y divide-outline-variant/14">
        ${group.items
          .map(
            (item) => `
              <div class="py-5 first:pt-0 last:pb-0">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <h4 class="font-headline text-[1.05rem] font-bold leading-6 tracking-tight text-on-surface">${item.title}</h4>
                    <p class="mt-1 text-sm font-bold text-secondary">${item.institution}</p>
                  </div>
                  <span class="text-[0.66rem] font-black uppercase tracking-[0.16em] text-on-surface-variant">${item.period}</span>
                </div>
                <p class="mt-3 text-sm leading-6 text-on-surface-variant">${item.description}</p>
                <div class="mt-4 flex flex-wrap gap-2">
                  ${renderAboutTagPills(item.tags || [])}
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderAboutAcademicTimeline(group) {
  return `
    <article class="about-git-card lg:col-span-2">
      <div class="about-git-heading">
        <span class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-secondary/20 bg-secondary/10 text-secondary">
          ${renderIcon(group.icon, "text-[1.15rem]")}
        </span>
        <h3 class="font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl">${group.title}</h3>
      </div>

      <div class="about-git-timeline mt-6" aria-label="${group.title}">
        ${group.items
          .map((item) => {
            const hasDetail = Boolean(item.detail || item.description || item.skills?.length);
            const title = item.title || item.institution;

            return `
              <div
                class="about-git-node ${hasDetail ? "about-git-node--expandable" : ""}"
                ${hasDetail ? 'role="button" tabindex="0" aria-expanded="false" data-academic-toggle' : ""}
              >
                <div class="about-git-lane" aria-hidden="true">
                  <span class="about-git-dot"></span>
                </div>

                <div class="about-git-info">
                  <p class="about-git-date">${item.period}</p>
                  <p class="about-git-place">${title}</p>
                </div>

                ${
                  hasDetail
                    ? `
                      <div class="about-git-detail ${item.detail && !item.description && !item.skills?.length ? "about-git-detail--compact" : ""}">
                        ${item.category ? `<p class="about-git-category">${item.category}</p>` : ""}
                        ${item.detail ? `<p class="about-git-detail-description">${item.detail}</p>` : ""}
                        ${item.description ? `<p class="about-git-detail-description">${item.description}</p>` : ""}
                        ${
                          item.skills?.length
                            ? `
                              <div class="about-git-skill-line">
                                <p>Habilidades</p>
                                <span>${item.skills.join(" · ")}</span>
                              </div>
                            `
                            : ""
                        }
                      </div>
                    `
                    : ""
                }
              </div>
            `;
          })
          .join("")}
      </div>
    </article>
  `;
}

function renderAboutWorkList(title, items = []) {
  if (!items.length) {
    return "";
  }

  return `
    <div class="about-work-detail-group">
      <p class="about-work-detail-label">${title}</p>
      <p class="about-work-inline-list">${items.join(" · ")}</p>
    </div>
  `;
}

function renderAboutWorkStack(stack = []) {
  if (!stack.length) {
    return "";
  }

  return `
    <div class="about-work-detail-group">
      <p class="about-work-detail-label">Stack</p>
      <div class="about-work-tech-list">
        ${stack.map((technology) => `<span>${technology}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderAboutWorkTimeline(group) {
  return `
    <article class="about-work-card about-profile-card lg:col-span-2">
      <div class="about-work-heading">
        <span class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-secondary/20 bg-secondary/10 text-secondary">
          ${renderIcon(group.icon, "text-[1.15rem]")}
        </span>
        <h3 class="font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl">${group.title}</h3>
      </div>

      <div class="about-work-timeline" aria-label="${group.title}">
        ${group.items
          .map(
            (item, index) => `
              <article
                class="about-work-item ${index % 2 === 0 ? "about-work-item--top" : "about-work-item--bottom"} ${
                  item.detailPlacement === "right" ? "about-work-item--detail-right" : ""
                }"
              >
                <span class="about-work-node" aria-hidden="true"></span>
                <span class="about-work-branch" aria-hidden="true"></span>

                <div class="about-work-summary">
                  <p class="about-work-date">${item.period}</p>
                  <h4>${item.title}</h4>
                  <p class="about-work-category">${item.category}</p>
                </div>

                <div class="about-work-detail">
                  <p class="about-work-description">${item.description}</p>
                  ${renderAboutWorkStack(item.stack)}
                  ${renderAboutWorkList("Enfoque", item.focus)}
                  ${renderAboutWorkList("Habilidades", item.skills)}
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderAboutProfile() {
  const about = getCopy("about");

  if (!elements.aboutProfileGrid || !about?.groups) {
    return;
  }

  const groupCards = about.groups
    .map((group) => {
      if (group.icon === "school") {
        return renderAboutAcademicTimeline(group);
      }

      if (group.icon === "work") {
        return renderAboutWorkTimeline(group);
      }

      return renderAboutStandardGroup(group);
    })
    .join("");

  elements.aboutProfileGrid.innerHTML = groupCards;
}

function setAboutAcademicItemOpen(item, open) {
  item.classList.toggle("is-open", open);
  item.setAttribute("aria-expanded", String(open));
}

function toggleAboutAcademicItem(item) {
  const shouldOpen = !item.classList.contains("is-open");

  elements.aboutProfileGrid?.querySelectorAll("[data-academic-toggle].is-open").forEach((openItem) => {
    if (openItem !== item) {
      setAboutAcademicItemOpen(openItem, false);
    }
  });

  setAboutAcademicItemOpen(item, shouldOpen);
}

function renderInterestFilters() {
  const labels = getCopy("interests.filters");

  elements.interestFilterButtons.forEach((button) => {
    button.textContent = labels[button.dataset.interestFilter];
    button.classList.toggle("is-active", button.dataset.interestFilter === state.interestFilter);
  });
}

function renderInterestMedia(preserveScroll = false) {
  const mediaItems = getCopy("interests.mediaItems")
    .map((item, index) => ({ ...item, index }))
    .filter((item) => (state.interestFilter === "all" ? true : item.filter === state.interestFilter));
  const active = mediaItems.find((item) => item.index === state.activeInterest) || mediaItems[0];
  const mobileLayout = isMobileViewport();
  const listScrollOffset = preserveScroll
    ? mobileLayout
      ? elements.interestsMediaList.scrollLeft
      : elements.interestsMediaList.scrollTop
    : 0;

  if (active) {
    state.activeInterest = active.index;
  }

  if (mobileLayout) {
    elements.interestsMediaList.innerHTML = mediaItems
      .map(
        (item) => `
          <article class="project-card about-mobile-card flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-outline-variant/18 bg-surface-container-highest/90 p-3.5">
            <div class="project-visual ${item.visualClass} aspect-[16/10] rounded-[1.3rem]"></div>
            <div class="flex h-full flex-col px-1.5 pb-1 pt-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-[0.65rem] font-black uppercase tracking-[0.2em] text-secondary">${item.category}</p>
                  <h3 class="mt-2 font-headline text-[1.18rem] font-bold leading-6 tracking-tight text-on-surface">${item.title}</h3>
                </div>
                <span class="text-[0.65rem] font-black uppercase tracking-[0.18em] text-on-surface-variant">${item.meta}</span>
              </div>
              <p class="mt-3 text-sm leading-6 text-on-surface-variant">${item.description}</p>
              <div class="mt-4 flex flex-wrap gap-2">
                ${item.tags
                  .map(
                    (tag) => `
                      <span class="rounded-full border border-outline-variant/18 bg-background/55 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-on-surface-variant">
                        ${tag}
                      </span>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </article>
        `
      )
      .join("");

    elements.interestsMediaFeature.innerHTML = "";
    elements.interestsMediaFeature.classList.add("interests-feature-mobile-hidden");

    if (preserveScroll) {
      elements.interestsMediaList.scrollLeft = listScrollOffset;
    }

    return;
  }

  elements.interestsMediaFeature.classList.remove("interests-feature-mobile-hidden");

  elements.interestsMediaList.innerHTML = mediaItems
    .map((item) => {
      const activeClass = item.index === state.activeInterest ? "is-active" : "";

      return `
        <button
          type="button"
          class="article-list-card ${activeClass} flex min-h-[9.75rem] flex-col justify-between rounded-[1.45rem] border border-outline-variant/15 bg-surface-container-high/78 p-4 text-left lg:min-h-[10.35rem]"
          data-interest-index="${item.index}"
          aria-pressed="${item.index === state.activeInterest}"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[0.62rem] font-black uppercase tracking-[0.2em] text-secondary">${item.category}</p>
              <h3 class="mt-2.5 font-headline text-[1rem] font-bold leading-6 tracking-tight text-on-surface sm:text-[1.08rem]">${item.title}</h3>
            </div>
            <span class="text-[0.65rem] font-black uppercase tracking-[0.18em] text-on-surface-variant">${item.meta}</span>
          </div>
          <p class="mt-3 text-sm leading-6 text-on-surface-variant">${item.description}</p>
          <div class="mt-4 inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.18em] ${item.index === state.activeInterest ? "text-primary" : "text-on-surface-variant"}">
            <span>${item.index === state.activeInterest ? getCopy("interests.cardLabel") : getCopy("interests.cardAction")}</span>
            ${renderIcon("arrow_outward", "text-sm")}
          </div>
        </button>
      `;
    })
    .join("");

  if (preserveScroll) {
    elements.interestsMediaList.scrollTop = listScrollOffset;
  }

  elements.interestsMediaFeature.innerHTML = `
    <div class="article-feature-card overflow-hidden rounded-[2rem] border border-outline-variant/18 bg-surface-container-highest/90 lg:grid lg:min-h-[23.75rem] lg:grid-cols-[minmax(13rem,0.7fr)_minmax(0,1.2fr)]">
      <div class="article-visual ${active.visualClass} min-h-[145px] lg:min-h-full"></div>
      <div class="glass-panel border-t border-outline-variant/15 p-5 lg:border-l lg:border-t-0 lg:px-6 lg:py-4.5">
        <div class="flex flex-wrap items-center gap-4 text-[0.68rem] font-black uppercase tracking-[0.22em] text-on-surface-variant">
          <span class="text-primary">${active.category}</span>
          <span>${active.meta}</span>
        </div>
        <h3 class="mt-4 max-w-3xl font-headline text-[1.7rem] font-bold leading-tight tracking-tight text-on-surface lg:text-[2.35rem]">
          ${active.title}
        </h3>
        <p class="mt-4 max-w-3xl text-[0.98rem] leading-7 text-on-surface-variant lg:text-[1.02rem] lg:leading-7">${active.description}</p>
        <p class="mt-4 max-w-3xl text-[0.96rem] leading-7 text-on-surface-variant lg:text-[1rem] lg:leading-7">${active.body}</p>
        <div class="mt-5 flex flex-wrap gap-2">
          ${active.tags
            .map(
              (tag) => `
                <span class="rounded-full border border-outline-variant/18 bg-background/55 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-on-surface-variant">
                  ${tag}
                </span>
              `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  elements.interestsMediaList.querySelectorAll("[data-interest-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeInterest = Number(button.dataset.interestIndex);
      renderInterestMedia(true);

      if (window.innerWidth < 1024) {
        window.requestAnimationFrame(() => {
          const top = elements.interestsMediaFeature.getBoundingClientRect().top + window.scrollY - 116;
          window.scrollTo({ top, behavior: "smooth" });
        });
      }
    });
  });
}

function renderContacts() {
  const labels = getCopy("contact");
  const contacts = [
    {
      label: labels.email,
      icon: "mail",
      hint: profile.email,
      href: buildMailtoLink(),
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
    {
      label: labels.gitlab,
      icon: "gitlab",
      hint: profile.gitlab.replace("https://", ""),
      href: profile.gitlab,
      active: hasRealProfileLink(profile.gitlab),
    },
  ];

  const identityCard = `
    <div class="contact-card contact-identity-card flex min-w-0 flex-col justify-center rounded-[1.55rem] border border-outline-variant/18 bg-surface-container-highest/62 px-4 py-3.5 sm:col-span-2 lg:col-span-1 lg:min-h-[6.15rem]">
      <div class="min-w-0">
        <h3 class="font-headline text-[1.05rem] font-bold leading-tight tracking-tight text-on-surface sm:text-[1.18rem] lg:text-[1.05rem]">
          ${profile.fullName}
        </h3>
        <p class="mt-1.5 text-xs leading-5 text-on-surface-variant lg:text-[0.72rem] lg:leading-4">
          ${labels.identityRole}
        </p>
      </div>
    </div>
  `;

  elements.contactGrid.innerHTML =
    identityCard +
    contacts
    .map((item) => {
      const isExternal = item.href.startsWith("http");

      if (!item.active) {
        return `
          <div class="contact-card flex min-h-[5.75rem] min-w-0 items-center justify-center gap-3.5 rounded-[1.55rem] border border-outline-variant/18 bg-surface-container-highest/55 px-4 py-3.5 text-center opacity-55 lg:min-h-[6.15rem]">
            ${renderIcon(item.icon, "contact-card-icon text-on-surface-variant")}
            <div class="min-w-0">
              <p class="text-sm font-headline font-bold tracking-tight text-on-surface">${item.label}</p>
            </div>
          </div>
        `;
      }

      return `
        <a
          class="contact-card group flex min-h-[5.75rem] min-w-0 items-center justify-center gap-3.5 rounded-[1.55rem] border border-outline-variant/18 bg-surface-container-highest/55 px-4 py-3.5 text-center lg:min-h-[6.15rem]"
          href="${item.href}"
          ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ""}
        >
          ${renderIcon(item.icon, "contact-card-icon text-on-surface-variant transition duration-300 group-hover:-translate-y-0.5 group-hover:text-secondary")}
          <div class="min-w-0">
            <p class="text-sm font-headline font-bold tracking-tight text-on-surface">${item.label}</p>
          </div>
        </a>
      `;
    })
    .join("");
}

function syncLanguageButtons() {
  const nextLanguageLabel = state.lang === "es" ? "Switch to English" : "Cambiar a espanol";

  elements.languageToggle.innerHTML = renderLanguageFlag(state.lang);
  elements.languageToggle.setAttribute("aria-label", nextLanguageLabel);
  elements.languageToggle.setAttribute("title", nextLanguageLabel);
}

function syncThemeButton() {
  const nextTheme = state.theme === "dark" ? "light" : "dark";
  const nextThemeLabel = nextTheme === "dark" ? getCopy("controls.themeToDark") : getCopy("controls.themeToLight");

  elements.themeToggleIcon.innerHTML = renderIcon(
    state.theme === "dark" ? "light_mode" : "dark_mode",
    "theme-toggle-glyph"
  );
  elements.themeToggle.setAttribute("aria-label", nextThemeLabel);
  elements.themeToggle.setAttribute("title", nextThemeLabel);
  elements.themeToggle.dataset.theme = state.theme;
}

function refreshSectionMetrics() {
  state.headerOffset = elements.header ? elements.header.offsetHeight + 10 : 88;
  state.sectionMetrics = sectionIds
    .map((id) => {
      const section = document.getElementById(id);
      const target = section?.querySelector("[data-section-anchor]") || section?.firstElementChild || section;

      if (!target) {
        return null;
      }

      return {
        id,
        top: target.getBoundingClientRect().top + window.scrollY,
      };
    })
    .filter(Boolean);
}

function syncActiveSectionLink() {
  const scrollReference = window.scrollY + state.headerOffset + 42;
  let activeId = "home";

  state.sectionMetrics.forEach((section) => {
    if (section.top <= scrollReference) {
      activeId = section.id;
    }
  });

  elements.sectionLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeId}`;

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

let activeSectionFrame = null;
let sectionMetricsFrame = null;
let deferredSectionsFrame = null;

function renderDeferredSections() {
  renderProjects();
  renderCertificates();
  renderArticles();
  renderInterestMedia();
  renderContacts();
  state.deferredSectionsReady = true;
  queueSectionMetricsRefresh();
}

function scheduleDeferredSections() {
  if (state.deferredSectionsReady || deferredSectionsFrame !== null) {
    return;
  }

  const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 180));

  deferredSectionsFrame = schedule(
    () => {
      deferredSectionsFrame = null;
      window.requestAnimationFrame(() => {
        renderDeferredSections();
      });
    },
    { timeout: 420 }
  );
}

function queueActiveSectionSync() {
  if (activeSectionFrame !== null) {
    return;
  }

  activeSectionFrame = window.requestAnimationFrame(() => {
    syncActiveSectionLink();
    activeSectionFrame = null;
  });
}

function queueSectionMetricsRefresh() {
  if (sectionMetricsFrame !== null) {
    return;
  }

  sectionMetricsFrame = window.requestAnimationFrame(() => {
    refreshSectionMetrics();
    syncActiveSectionLink();
    sectionMetricsFrame = null;
  });
}

function scrollToSection(selector) {
  const sectionId = selector.replace("#", "");
  const metric = state.sectionMetrics.find((item) => item.id === sectionId);

  if (metric) {
    const top = Math.max(metric.top - state.headerOffset, 0);
    window.scrollTo({ top, behavior: "smooth" });
    return;
  }

  const section = document.querySelector(selector);
  const target = section?.querySelector("[data-section-anchor]") || section?.firstElementChild || section;

  if (!target) {
    return;
  }

  const top = Math.max(target.getBoundingClientRect().top + window.scrollY - state.headerOffset, 0);

  window.scrollTo({ top, behavior: "smooth" });
}

function wireScrollButtons() {
  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.onclick = () => {
      if (button.dataset.scrollTarget) {
        scrollToSection(button.dataset.scrollTarget);
      }
    };
  });
}

function initHeroMascots() {
  const home = document.getElementById("home");

  if (!home || !elements.heroMascotField || !elements.heroMascots.length) {
    return;
  }

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let latestPointerEvent = null;
  let pointerFrame = null;

  const resetMascots = () => {
    elements.heroMascots.forEach((mascot) => {
      mascot.style.setProperty("--mascot-dx", "0px");
      mascot.style.setProperty("--mascot-dy", "0px");
      mascot.style.setProperty("--mascot-rotate", "0deg");
    });
  };

  const syncMascotSprites = (type) => {
    elements.heroMascots.forEach((mascot) => {
      const sprite = mascot.querySelector(".hero-mascot-sprite");
      const nextSource = type ? mascot.dataset[`${type}Src`] : mascot.dataset.walkSrc || mascot.dataset.idleSrc;

      if (sprite && nextSource && !sprite.src.endsWith(nextSource)) {
        sprite.src = nextSource;
      }
    });
  };

  const syncMascotNameVisibility = (event) => {
    elements.heroMascots.forEach((mascot) => {
      const bounds = mascot.getBoundingClientRect();
      const isInside =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      mascot.classList.toggle("is-name-visible", isInside);
    });
  };

  const syncMascotsToPointer = () => {
    pointerFrame = null;

    if (!latestPointerEvent || motionQuery.matches) {
      return;
    }

    const rect = home.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    const relativeX = Math.min(Math.max((latestPointerEvent.clientX - rect.left) / rect.width - 0.5, -0.5), 0.5);
    const relativeY = Math.min(Math.max((latestPointerEvent.clientY - rect.top) / rect.height - 0.5, -0.5), 0.5);

    elements.heroMascots.forEach((mascot, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      const x = relativeX * 28 * direction;
      const y = relativeY * 20;
      const rotate = relativeX * 8 * direction;

      mascot.style.setProperty("--mascot-dx", `${x.toFixed(2)}px`);
      mascot.style.setProperty("--mascot-dy", `${y.toFixed(2)}px`);
      mascot.style.setProperty("--mascot-rotate", `${rotate.toFixed(2)}deg`);
    });

    syncMascotNameVisibility(latestPointerEvent);
  };

  const queueMascotSync = (event) => {
    latestPointerEvent = event;

    if (pointerFrame !== null) {
      return;
    }

    pointerFrame = window.requestAnimationFrame(syncMascotsToPointer);
  };

  home.addEventListener("pointermove", queueMascotSync, { passive: true });

  home.addEventListener("pointerleave", () => {
    latestPointerEvent = null;
    setHeroMascotReaction("");
    elements.heroMascots.forEach((mascot) => {
      mascot.classList.remove("is-name-visible");
    });
    resetMascots();
  });

  const getHeroInteractionType = (target) => {
    if (!(target instanceof Element)) {
      return "";
    }

    if (target.closest("#hero-title .hero-word, #hero-title")) {
      return "title";
    }

    if (target.closest("#hero-primary-button, #hero-secondary-button, .hero-action-link, #hero-email, .hero-focus-card")) {
      return "card";
    }

    return "";
  };

  const setHeroMascotReaction = (type) => {
    elements.heroMascotField.classList.toggle("is-reacting", Boolean(type));
    elements.heroMascotField.classList.toggle("is-title-reacting", type === "title");
    elements.heroMascotField.classList.toggle("is-card-reacting", type === "card");
    syncMascotSprites(type);
  };

  home.addEventListener("pointerover", (event) => {
    setHeroMascotReaction(getHeroInteractionType(event.target));
  });

  home.addEventListener("pointerout", (event) => {
    if (getHeroInteractionType(event.target) && !getHeroInteractionType(event.relatedTarget)) {
      setHeroMascotReaction("");
    }
  });

  syncMascotSprites("");
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

  elements.sectionLinks.forEach((link) => {
    const hash = link.getAttribute("href");

    if (!hash || !hash.startsWith("#") || hash === "#home") {
      return;
    }

    link.addEventListener("click", (event) => {
      event.preventDefault();

      if (link.classList.contains("mobile-link")) {
        state.menuOpen = false;
        elements.mobileMenu.classList.remove("is-open");
        elements.menuToggle.setAttribute("aria-expanded", "false");
        elements.menuToggle.innerHTML = renderIcon("menu", "menu-toggle-icon");
        queueSectionMetricsRefresh();

        window.requestAnimationFrame(() => {
          scrollToSection(hash);
        });

        return;
      }

      scrollToSection(hash);
    });
  });

  elements.languageToggle.addEventListener("click", () => {
    state.lang = state.lang === "es" ? "en" : "es";
    window.localStorage.setItem("portfolio-lang", state.lang);
    applyStaticCopy();
    wireScrollButtons();
  });

  elements.projectFilters?.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const toggle = target?.closest("[data-project-filter-toggle]");

    if (toggle && elements.projectFilters.contains(toggle)) {
      state.projectFiltersOpen = !state.projectFiltersOpen;
      renderFilters();
      return;
    }

    const button = target?.closest("[data-filter]");

    if (!button || !elements.projectFilters.contains(button)) {
      return;
    }

    state.filter = button.dataset.filter;
    state.projectFiltersOpen = false;
    renderFilters();
    renderProjects();
    queueSectionMetricsRefresh();
  });

  elements.articleFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.articleFilter = button.dataset.articleFilter;
      renderArticleFilters();
      renderArticles();
      wireScrollButtons();
      queueSectionMetricsRefresh();
    });
  });

  elements.interestFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.interestFilter = button.dataset.interestFilter;
      renderInterestFilters();
      renderInterestMedia();
      queueSectionMetricsRefresh();
    });
  });

  elements.projectsGrid?.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-project-modal-open]");

    if (!trigger) {
      return;
    }

    event.preventDefault();
    openProjectPreview(trigger.dataset.projectModalOpen, trigger.dataset.projectTitle || "Docqee");
  });

  elements.aboutProfileGrid?.addEventListener("click", (event) => {
    const academicItem = event.target.closest("[data-academic-toggle]");

    if (academicItem) {
      toggleAboutAcademicItem(academicItem);
    }
  });

  elements.aboutProfileGrid?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const academicItem = event.target.closest("[data-academic-toggle]");

    if (academicItem) {
      event.preventDefault();
      toggleAboutAcademicItem(academicItem);
    }
  });

  elements.themeToggle.addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
  });

  elements.menuToggle.addEventListener("click", () => {
    state.menuOpen = !state.menuOpen;
    elements.mobileMenu.classList.toggle("is-open", state.menuOpen);
    elements.menuToggle.setAttribute("aria-expanded", String(state.menuOpen));
    elements.menuToggle.innerHTML = renderIcon(state.menuOpen ? "close" : "menu", "menu-toggle-icon");
    queueSectionMetricsRefresh();
  });

  elements.mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      state.menuOpen = false;
      elements.mobileMenu.classList.remove("is-open");
      elements.menuToggle.setAttribute("aria-expanded", "false");
      elements.menuToggle.innerHTML = renderIcon("menu", "menu-toggle-icon");
      queueSectionMetricsRefresh();
    });
  });

  elements.projectPreviewModal?.addEventListener("click", (event) => {
    if (event.target.closest("[data-project-modal-close]")) {
      closeProjectPreview();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProjectPreview();

      if (state.projectFiltersOpen) {
        state.projectFiltersOpen = false;
        renderFilters();
      }
    }
  });

  document.addEventListener("click", (event) => {
    if (!state.projectFiltersOpen || elements.projectFilters?.contains(event.target)) {
      return;
    }

    state.projectFiltersOpen = false;
    renderFilters();
  });

  window.addEventListener("scroll", queueActiveSectionSync, { passive: true });
  window.addEventListener("resize", () => {
    const nextMobileLayout = isMobileViewport();

    if (nextMobileLayout !== state.articleMobileLayout) {
      state.articleMobileLayout = nextMobileLayout;
      renderArticles(true);
      renderInterestMedia(true);
    }

    queueSectionMetricsRefresh();
  });

  window.addEventListener("load", queueSectionMetricsRefresh, { once: true });
  document.fonts?.ready?.then(() => {
    queueSectionMetricsRefresh();
  });

  queueSectionMetricsRefresh();
  wireScrollButtons();
  initHeroMascots();
}

applyTheme(state.theme, false);
applyStaticCopy();
wireEvents();
