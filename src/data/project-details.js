export const projectDetails = [
  {
    slug: "docqee",
    title: "Docqee",
    accent: "Proyecto de grado",
    tag: "Plataforma web",
    year: "2026",
    category: "Web",
    visualClass: "visual-control",
    summary:
      "Plataforma web para conectar pacientes con estudiantes de odontologia supervisados por docentes, dentro de un entorno universitario confiable.",
    overview:
      "Docqee fue desarrollado como mi proyecto de grado con la idea de digitalizar y ordenar la relacion entre pacientes, estudiantes de odontologia y docentes dentro de un entorno universitario. La plataforma busca que el acceso a la atencion odontologica universitaria se sienta claro, cercano y bien acompanado desde el primer contacto.",
    challenge:
      "El reto principal estaba en coordinar necesidades distintas dentro de una misma experiencia: pacientes que buscan atencion, estudiantes que necesitan gestionar sus procesos academicos y docentes que requieren supervision clara. La plataforma debia sentirse confiable, facil de entender y lista para usarse en multiples dispositivos.",
    solution:
      "La solucion se construyo como una plataforma web con flujos diferenciados por rol, una experiencia responsive y una estructura visual que ayuda a entender el proceso universitario sin friccion. Se priorizo claridad en el recorrido, organizacion de la informacion y una interfaz que transmitiera acompanamiento y supervison profesional.",
    results: [
      "Presentacion clara de la propuesta de atencion odontologica universitaria.",
      "Experiencia pensada para conectar pacientes, estudiantes y docentes en un mismo sistema.",
      "Base digital lista para seguir escalando nuevos modulos y procesos academicos.",
    ],
    stack: ["React", "Vite", "Responsive UI", "Arquitectura por roles", "Vercel"],
    deliverables: ["Landing principal", "Flujos por rol", "Vista institucional", "Demo funcional online"],
    liveUrl: "https://docqee.vercel.app/",
  },
  {
    slug: "launch-canvas",
    title: "Launch Canvas",
    accent: "Marketing",
    tag: "Landing Page",
    year: "2026",
    category: "Web",
    visualClass: "visual-launch",
    summary:
      "Landing editorial para presentar una marca personal con ritmo visual, mensaje claro y una narrativa orientada a conversion.",
    overview:
      "Launch Canvas nace como una pagina de lanzamiento que combina una lectura directa con una puesta en escena mas expresiva. La meta era comunicar valor rapido, pero sin caer en una landing generica o sin personalidad.",
    challenge:
      "El desafio fue equilibrar identidad y conversion. La pagina debia sentirse visualmente fuerte, pero tambien permitir que la propuesta, los servicios y los llamados a la accion fueran faciles de entender en pocos segundos.",
    solution:
      "Se estructuro la experiencia en bloques narrativos cortos, con contrastes tipograficos, imagenes de apoyo y una secuencia de contenido que acompana al usuario desde la primera impresion hasta el CTA principal.",
    results: [
      "Mensaje mas claro desde el primer scroll.",
      "Mejor equilibrio entre tono editorial y conversion.",
      "Seccionado flexible para adaptar futuras campanas o servicios.",
    ],
    stack: ["Astro", "Tailwind CDN", "Storytelling UI", "Responsive Layout", "Motion"],
    deliverables: ["Hero de lanzamiento", "Bloques de propuesta", "CTA principal", "Secciones modulares"],
  },
  {
    slug: "pulse-identity",
    title: "Pulse Identity",
    accent: "Branding",
    tag: "Brand System",
    year: "2026",
    category: "Marca",
    visualClass: "visual-brand",
    summary:
      "Sistema de identidad para unificar tono, piezas digitales y presencia visual en diferentes canales.",
    overview:
      "Pulse Identity se planteo como un sistema base para marcas que necesitan coherencia sin perder flexibilidad. El foco estuvo en crear un lenguaje adaptable para web, redes, presentaciones y activos de producto.",
    challenge:
      "La marca tenia piezas con estilos muy diferentes entre si, lo que hacia dificil construir reconocimiento. El reto era proponer reglas suficientes para ordenar la identidad, sin volverla rigida o repetitiva.",
    solution:
      "Se definieron principios de color, ritmo tipografico, usos de composicion y patrones de aplicacion que permiten mantener una voz clara. El sistema se penso para convivir con distintos formatos sin sentirse partido.",
    results: [
      "Direccion visual consistente en piezas digitales y de comunicacion.",
      "Reglas claras para escalar la marca sin improvisacion.",
      "Base lista para evolucionar a un sistema de marca mas amplio.",
    ],
    stack: ["Brand Strategy", "Visual System", "Typography", "UI Direction", "Documentation"],
    deliverables: ["Paleta y contraste", "Jerarquia tipografica", "Composiciones base", "Guia de uso"],
  },
  {
    slug: "notes-engine",
    title: "Notes Engine",
    accent: "Contenido",
    tag: "Workflow",
    year: "2026",
    category: "Automatizacion",
    visualClass: "visual-notes",
    summary:
      "Flujo para organizar ideas, convertirlas en piezas utilizables y mantener un archivo vivo del proceso.",
    overview:
      "Notes Engine organiza el paso entre idea, borrador y salida publicada. El objetivo fue simplificar un proceso que normalmente se dispersa entre notas, tareas sueltas y herramientas que no conversan bien entre si.",
    challenge:
      "El problema principal era la perdida de continuidad. Muchas ideas quedaban a mitad de camino o se repetian porque no habia un sistema claro para capturarlas, clasificarlas y convertirlas en contenido accionable.",
    solution:
      "Se penso un flujo ligero con estados claros, plantillas reutilizables y puntos de automatizacion utiles. En vez de agregar complejidad, el sistema busca que las decisiones se tomen mas rapido y con mejor visibilidad.",
    results: [
      "Proceso mas claro desde captura hasta publicacion.",
      "Menos repeticion y menos perdida de ideas valiosas.",
      "Archivo consultable para alimentar nuevas piezas o proyectos.",
    ],
    stack: ["Automation Design", "JavaScript", "Content Systems", "Templates", "Process Mapping"],
    deliverables: ["Mapa del flujo", "Estados y etiquetas", "Plantillas de nota", "Criterios de publicacion"],
  },
  {
    slug: "system-atlas",
    title: "System Atlas",
    accent: "Escalabilidad",
    tag: "Design System",
    year: "2026",
    category: "Marca",
    visualClass: "visual-system",
    summary:
      "Biblioteca visual y tecnica para construir interfaces consistentes sin perder personalidad.",
    overview:
      "System Atlas funciona como una base compartida para acelerar construccion y mantener coherencia. Mas que una coleccion de componentes, el proyecto se enfoco en documentar criterio: cuando usar algo, por que existe y como debe evolucionar.",
    challenge:
      "El equipo necesitaba velocidad, pero cada nueva pantalla tendia a resolver patrones desde cero. Eso afectaba calidad, tiempos y consistencia visual. El reto fue ordenar sin apagar la expresividad del producto.",
    solution:
      "Se construyo una biblioteca con piezas reutilizables, variables visuales y lineamientos de composicion. Tambien se documentaron estados, espaciados y principios de adaptacion para que el sistema sirviera de verdad en producto.",
    results: [
      "Menos tiempo de construccion para nuevas vistas.",
      "Consistencia visual mas fuerte entre flujos y equipos.",
      "Base clara para escalar decisiones de interfaz.",
    ],
    stack: ["Design System", "Tokens", "UI Documentation", "Component Strategy", "Front-end Thinking"],
    deliverables: ["Componentes base", "Variables y tokens", "Lineamientos de layout", "Documentacion de uso"],
  },
  {
    slug: "agent-flow",
    title: "Agent Flow",
    accent: "Productividad",
    tag: "AI Ops",
    year: "2026",
    category: "Automatizacion",
    visualClass: "visual-ai",
    summary:
      "Sistema de asistentes y automatizaciones utiles para reducir tareas repetitivas y acelerar entregas.",
    overview:
      "Agent Flow explora como usar automatizacion e IA de forma pragmatica en procesos reales. La meta no fue reemplazar criterio humano, sino recortar trabajo operativo para dejar mas tiempo a las decisiones de valor.",
    challenge:
      "Muchas tareas pequenas consumian demasiado tiempo: organizacion, seguimiento, preparacion de entregables y documentacion. El reto era automatizar sin romper el tono del trabajo ni generar dependencia de flujos fragiles.",
    solution:
      "Se definieron tareas repetibles, reglas simples y puntos de revision humana. El sistema combina automatizacion liviana con asistentes que ayudan a estructurar, resumir y mantener visibilidad del avance.",
    results: [
      "Menos tiempo invertido en tareas operativas repetitivas.",
      "Procesos mas consistentes y faciles de seguir.",
      "Automatizaciones pensadas para ayudar, no para estorbar.",
    ],
    stack: ["AI Workflows", "Automation", "Process Design", "Prompting", "Operational Systems"],
    deliverables: ["Mapa de tareas", "Automatizaciones base", "Asistentes de apoyo", "Reglas de revision"],
  },
];

export function getProjectDetailBySlug(slug) {
  return projectDetails.find((project) => project.slug === slug);
}
