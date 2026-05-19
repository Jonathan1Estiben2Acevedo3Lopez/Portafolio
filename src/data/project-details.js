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
    slug: "portafolio-web",
    title: "Portafolio Web",
    accent: "Personal Web",
    tag: "Marca personal",
    year: "2026",
    category: "Web",
    previewImage: "/portafolio-web.png",
    visualClass: "visual-brand",
    summary:
      "Sitio web personal para presentar perfil profesional, proyectos, experiencia, formacion, certificados y contenido tecnico en una experiencia clara y moderna.",
    overview:
      "Portafolio Web organiza mi presencia profesional en un sitio rapido y responsive. La estructura permite recorrer mi perfil, proyectos, certificados, intereses y contenido tecnico desde una experiencia visual consistente.",
    challenge:
      "El reto era reunir varias facetas profesionales sin que la navegacion se sintiera pesada. El sitio debia mostrar informacion suficiente, mantener claridad en dispositivos pequenos y conservar una identidad personal reconocible.",
    solution:
      "Se construyo una experiencia en Astro con datos separados por seccion, tarjetas reutilizables, soporte responsive y una ficha individual para profundizar en cada proyecto. La imagen de vista previa se sirve desde public para mantener una carga simple.",
    results: [
      "Presentacion profesional centralizada en una sola experiencia web.",
      "Secciones organizadas para proyectos, certificados, perfil e intereses.",
      "Base lista para seguir agregando contenido tecnico y nuevos casos de estudio.",
    ],
    stack: ["Astro", "JavaScript", "Tailwind CSS", "Responsive UI", "Netlify"],
    deliverables: ["Home del portafolio", "Ficha de proyecto", "Secciones de contenido", "Deploy en Netlify"],
    liveUrl: "https://jonathanacevedo.netlify.app/",
  }
];

export function getProjectDetailBySlug(slug) {
  return projectDetails.find((project) => project.slug === slug);
}
