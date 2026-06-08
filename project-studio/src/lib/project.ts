import { BookOpenText, Boxes, FileBadge2, Rocket, Sparkles, UserRound } from "lucide-react";
import type { StudioSection } from "../types";

export const studioSections: StudioSection[] = [
  {
    id: "about",
    title: "Sobre mi",
    eyebrow: "Perfil",
    description: "Edita formacion academica y experiencia laboral desde el archivo Sobre mi.",
    metric: "0 entradas",
    detail: "Contenido base en src/data/about.json",
    accent: "mint",
    icon: UserRound,
    actions: ["Agregar formacion", "Agregar experiencia", "Editar entradas"],
  },
  {
    id: "development",
    title: "En desarrollo",
    eyebrow: "Trabajo activo",
    description: "Portadas para trabajos que aun no estan terminados.",
    metric: "0 en progreso",
    detail: "Contenido base en src/data/development.json",
    accent: "cyan",
    icon: Rocket,
    actions: ["Agregar elemento"],
  },
  {
    id: "projects",
    title: "Proyectos",
    eyebrow: "Casos y demos",
    description: "Edita fichas, enlaces, tecnologias, capturas y detalles del proceso.",
    metric: "0 activos",
    detail: "Sincronizable con src/data/projects.generated.json",
    accent: "cyan",
    icon: Boxes,
    actions: ["Nuevo proyecto", "Editar proyecto", "Ordenar destacados", "Revisar enlaces"],
  },
  {
    id: "certificates",
    title: "Certificados",
    eyebrow: "Formacion",
    description: "Administra PDFs, imagenes, emisores, fechas, etiquetas y vista protegida.",
    metric: "4 archivos",
    detail: "PDF e imagen local en src/certificados",
    accent: "violet",
    icon: FileBadge2,
    actions: ["Subir certificado", "Editar metadatos", "Validar archivo"],
  },
  {
    id: "blog",
    title: "Blog",
    eyebrow: "Notas",
    description: "Prepara articulos, categorias, extractos, fechas y lectura destacada.",
    metric: "9 notas",
    detail: "Contenido base en src/data/blog.json",
    accent: "rose",
    icon: BookOpenText,
    actions: ["Nueva nota", "Editar borrador", "Filtrar categorias"],
  },
  {
    id: "interests",
    title: "Intereses",
    eyebrow: "Referencias",
    description: "Organiza peliculas, series, animes, libros, videojuegos y etiquetas.",
    metric: "10 items",
    detail: "Referencias vivas en src/data/interests.json",
    accent: "mint",
    icon: Sparkles,
    actions: ["Agregar item", "Agrupar por tipo", "Ajustar etiquetas"],
  },
];

export const getSectionById = (id: StudioSection["id"]) =>
  studioSections.find((section) => section.id === id) ?? studioSections[0];
