import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  ChevronUp,
  CircleDot,
  Clock3,
  ExternalLink,
  FolderOpen,
  FolderCog,
  HelpCircle,
  ImagePlus,
  Moon,
  Plus,
  Save,
  ShieldCheck,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { getSectionById, studioSections } from "./lib/project";
import type {
  CreatedProject,
  ProjectPreviewResult,
  ProjectExtraLink,
  ProjectFlowStep,
  ProjectFormState,
  ProjectImage,
  ProjectMetric,
  ProjectModule,
  ProjectPreviewSection,
  ProjectVideo,
  StudioSectionId,
} from "./types";

const currentYear = String(new Date().getFullYear());

const defaultProjectForm = (): ProjectFormState => ({
  title: "",
  slug: "",
  category: "web",
  year: currentYear,
  tag: "Web",
  accent: "Producto digital",
  description: "",
  titleEn: "",
  tagEn: "",
  accentEn: "",
  descriptionEn: "",
  detailCategory: "Producto digital",
  detailCategoryEn: "Digital product",
  summary: "",
  summaryEn: "",
  overview: "",
  overviewEn: "",
  challenge: "",
  challengeEn: "",
  solution: "",
  solutionEn: "",
  process: [],
  processEn: [],
  results: "",
  resultsEn: "",
  stack: "",
  deliverables: "",
  deliverablesEn: "",
  learnings: "",
  learningsEn: "",
  liveUrl: "",
  repoUrl: "",
  previewImage: "",
  visualClass: "visual-brand",
  showInHome: true,
  status: "completed",
  featuredLevel: "",
  extraLinks: [],
  metrics: [],
  modules: [],
  flow: [],
  images: [],
  videos: [],
  sectionOrder: ["images", "videos", "modules"],
});

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const fieldHints = {
  title: "Nombre publico del proyecto. Es el titulo que vera la persona en la tarjeta y en la ficha.",
  slug: "Identificador de la URL. Usa minusculas, numeros y guiones. Ejemplo: docqee-panel-medico.",
  year: "Año que aparecera asociado al proyecto. Normalmente el año de publicacion o cierre.",
  category: "Grupo usado para filtrar proyectos en el portafolio.",
  tag: "Etiqueta corta que aparece arriba del titulo de la tarjeta. Ejemplo: Web, Producto digital, IA.",
  accent: "Frase breve que define el enfoque visual o conceptual del proyecto. Ejemplo: Producto digital, Dashboard, Automatizacion.",
  visualClass: "Estilo visual de respaldo para la tarjeta cuando no hay imagen preview.",
  description: "Texto corto que aparece bajo el titulo del proyecto y en la tarjeta. Debe explicar el valor en una o dos frases.",
  detailCategory: "Categoria visible dentro de la pagina individual del proyecto.",
  stack: "Selecciona tecnologias de la lista o agrega una nueva si no aparece.",
  summary: "Resumen que aparece dentro del bloque Resumen de la ficha del proyecto.",
  overview: "Descripcion amplia del proyecto: contexto, objetivo y que construiste. Aparece en su propio bloque.",
  challenge: "Problema principal o reto que resolviste.",
  solution: "Como resolviste el reto: decisiones, flujo, interfaz o arquitectura.",
  process: "Agrega cada paso del proceso por separado. En el preview se vera como una linea de tiempo numerada.",
  results: "Resultados o mejoras obtenidas separados por coma.",
  liveUrl: "Enlace a la demo o sitio publicado. Debe empezar por https:// si es externo.",
  repoUrl: "Enlace al repositorio del proyecto, si lo quieres mostrar.",
  previewImage: "Ruta de imagen en public o URL externa. Ejemplo: /docqee-preview.png.",
  status: "Estado interno o publico del proyecto: completado, en progreso, concepto, etc.",
  featuredLevel: "Nivel de destaque en el portafolio. Principal debe reservarse para el proyecto mas importante.",
  showInHome: "Activalo si este proyecto debe aparecer en la pagina principal del portafolio.",
  extraLinks: "Enlaces adicionales como documentacion, articulo, video externo o landing relacionada.",
  metrics: "Datos destacados del resultado. Ejemplo: +35%, 4 modulos, 2 semanas.",
  modules: "Partes funcionales del proyecto. Ejemplo: Panel administrativo, autenticacion, reportes.",
  flow: "Pasos del recorrido o proceso del proyecto. Sirve para explicar la evolucion de la solucion.",
  images: "Capturas o imagenes que apareceran en la ficha. Usa rutas de public como /captura.png.",
  videos: "Videos locales o URLs que documenten el proyecto.",
  sectionOrder: "Orden en que apareceran estas secciones en el preview. Las secciones sin contenido se ocultan solas.",
  englishFallback: "Version en ingles. Si queda vacio, el portafolio usara el texto en espanol como respaldo.",
} as const;

type OptionalListKey = "extraLinks" | "metrics" | "modules" | "flow" | "images" | "videos";

type OptionalListItem = ProjectExtraLink | ProjectMetric | ProjectModule | ProjectFlowStep | ProjectImage | ProjectVideo;

type ImagePickSource = "import" | "existing";

type ImagePickTarget =
  | { kind: "preview" }
  | { kind: "gallery"; index: number }
  | { kind: "videoPoster"; index: number };

const optionalListItems = {
  extraLinks: (): ProjectExtraLink => ({ type: "custom", href: "", labelEs: "", labelEn: "" }),
  metrics: (): ProjectMetric => ({ value: "", label: "", labelEn: "" }),
  modules: (): ProjectModule => ({ title: "", titleEn: "", description: "", descriptionEn: "" }),
  flow: (): ProjectFlowStep => ({ step: "", title: "", titleEn: "", description: "", descriptionEn: "" }),
  images: (): ProjectImage => ({ src: "", altEs: "", altEn: "", captionEs: "", captionEn: "" }),
  videos: (): ProjectVideo => ({ src: "", poster: "", titleEs: "", titleEn: "", captionEs: "", captionEn: "" }),
};

const previewSectionOptions: Array<{ id: ProjectPreviewSection; label: string; detail: string }> = [
  { id: "images", label: "Imagenes", detail: "Carrusel de capturas y mockups" },
  { id: "videos", label: "Videos", detail: "Carrusel de demos o videos" },
  { id: "modules", label: "Modulos y flujo", detail: "Bloques funcionales y pasos extra" },
];

const stackCatalog = [
  "Astro",
  "React",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Node.js",
  "Vite",
  "Tauri",
  "Rust",
  "Python",
  "FastAPI",
  "Django",
  "Next.js",
  "Express",
  "Supabase",
  "Firebase",
  "PostgreSQL",
  "MongoDB",
  "SQLite",
  "Prisma",
  "GraphQL",
  "REST API",
  "OpenAI",
  "Figma",
  "Git",
  "GitHub",
  "Docker",
  "Vercel",
  "Netlify",
];

const normalizeStackKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const splitStackItems = (value: string) =>
  value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const uniqueStackItems = (items: string[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = normalizeStackKey(item);
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const formatStackItems = (items: string[]) => uniqueStackItems(items).join(", ");

function FieldHint({ text }: { text: string }) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    arrowLeft: number;
    left: number;
    placement: "bottom" | "top";
    top: number;
    width: number;
  } | null>(null);

  const openTooltip = () => {
    const button = buttonRef.current;
    if (!button) {
      setIsOpen(true);
      return;
    }

    const viewportPadding = 16;
    const tooltipGap = 10;
    const tooltipWidth = Math.min(320, window.innerWidth - viewportPadding * 2);
    const rect = button.getBoundingClientRect();
    const idealLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
    const left = Math.min(
      Math.max(idealLeft, viewportPadding),
      window.innerWidth - tooltipWidth - viewportPadding,
    );
    const estimatedHeight = 128;
    const placement = rect.top - tooltipGap - estimatedHeight > viewportPadding ? "top" : "bottom";
    const top = placement === "bottom" ? rect.bottom + tooltipGap : rect.top - tooltipGap;
    const arrowLeft = Math.min(
      Math.max(rect.left + rect.width / 2 - left, 14),
      tooltipWidth - 14,
    );

    setTooltipPosition({ arrowLeft, left, placement, top, width: tooltipWidth });
    setIsOpen(true);
  };

  const tooltipStyle = tooltipPosition
    ? ({
        "--tooltip-arrow-left": `${tooltipPosition.arrowLeft}px`,
        "--tooltip-left": `${tooltipPosition.left}px`,
        "--tooltip-top": `${tooltipPosition.top}px`,
        "--tooltip-width": `${tooltipPosition.width}px`,
      } as CSSProperties)
    : undefined;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`field-hint${isOpen ? " is-open" : ""}`}
        aria-label={text}
        onBlur={() => setIsOpen(false)}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (isOpen) {
            setIsOpen(false);
          } else {
            openTooltip();
          }
        }}
      >
        <HelpCircle size={14} strokeWidth={2.2} aria-hidden="true" />
      </button>

      {isOpen &&
        tooltipPosition &&
        createPortal(
          <span
            className="field-tooltip is-open"
            data-placement={tooltipPosition.placement}
            role="tooltip"
            style={tooltipStyle}
          >
            {text}
          </span>,
          document.body,
        )}
    </>
  );
}

function FieldLabel({ children, hint }: { children: string; hint: string }) {
  return (
    <span className="field-label">
      {children}
      <FieldHint text={hint} />
    </span>
  );
}

function StackSelector({
  hint,
  onChange,
  value,
}: {
  hint: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const [customStack, setCustomStack] = useState("");
  const selectedItems = uniqueStackItems(splitStackItems(value));
  const selectedKeys = new Set(selectedItems.map(normalizeStackKey));
  const options = uniqueStackItems([
    ...stackCatalog,
    ...selectedItems.filter((item) => !stackCatalog.some((option) => normalizeStackKey(option) === normalizeStackKey(item))),
  ]);

  const updateItems = (items: string[]) => {
    onChange(formatStackItems(items));
  };

  const toggleStack = (item: string) => {
    const key = normalizeStackKey(item);

    if (selectedKeys.has(key)) {
      updateItems(selectedItems.filter((selected) => normalizeStackKey(selected) !== key));
      return;
    }

    updateItems([...selectedItems, item]);
  };

  const addCustomStack = () => {
    const nextStack = customStack.trim();
    if (!nextStack) {
      return;
    }

    updateItems([...selectedItems, nextStack]);
    setCustomStack("");
  };

  return (
    <div className="stack-selector">
      <FieldLabel hint={hint}>Stack</FieldLabel>

      <div className="stack-option-list" aria-label="Seleccionar tecnologias">
        {options.map((option) => {
          const isSelected = selectedKeys.has(normalizeStackKey(option));

          return (
            <button
              type="button"
              key={option}
              className={`stack-option${isSelected ? " is-selected" : ""}`}
              onClick={() => toggleStack(option)}
              aria-pressed={isSelected}
            >
              <span>{option}</span>
              {isSelected && <CheckCircle2 size={14} strokeWidth={2.4} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {selectedItems.length > 0 ? (
        <div className="stack-selected-list" aria-label="Stack seleccionado">
          {selectedItems.map((item) => (
            <span className="stack-chip" key={item}>
              <span>{item}</span>
              <button type="button" onClick={() => toggleStack(item)} aria-label={`Quitar ${item}`}>
                <X size={13} strokeWidth={2.4} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="stack-empty">Selecciona tecnologias o agrega una nueva.</p>
      )}

      <div className="stack-custom-row">
        <input
          value={customStack}
          onChange={(event) => setCustomStack(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustomStack();
            }
          }}
          placeholder="Agregar stack nuevo"
          aria-label="Agregar stack nuevo"
        />
        <button type="button" className="stack-add-button" onClick={addCustomStack} disabled={!customStack.trim()}>
          <Plus size={15} strokeWidth={2.3} />
          Agregar
        </button>
      </div>
    </div>
  );
}

function ProcessStepsEditor({
  addLabel = "Agregar paso",
  emptyText = "Agrega pasos para construir la linea de tiempo del proceso.",
  hint,
  label = "Proceso",
  onChange,
  placeholder = "Investigacion, prototipo, desarrollo...",
  value,
}: {
  addLabel?: string;
  emptyText?: string;
  hint: string;
  label?: string;
  onChange: (value: string[]) => void;
  placeholder?: string;
  value: string[];
}) {
  const addStep = () => {
    onChange([...value, ""]);
  };

  const updateStep = (index: number, nextValue: string) => {
    onChange(value.map((step, stepIndex) => (stepIndex === index ? nextValue : step)));
  };

  const removeStep = (index: number) => {
    onChange(value.filter((_, stepIndex) => stepIndex !== index));
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= value.length) {
      return;
    }

    const nextValue = [...value];
    [nextValue[index], nextValue[targetIndex]] = [nextValue[targetIndex], nextValue[index]];
    onChange(nextValue);
  };

  return (
    <div className="process-step-editor">
      <FieldLabel hint={hint}>{label}</FieldLabel>

      {value.length === 0 ? (
        <p className="process-step-empty">{emptyText}</p>
      ) : (
        <div className="process-step-list">
          {value.map((step, index) => (
            <div className="process-step-row" key={`process-step-${index}`}>
              <span className="process-step-number">{String(index + 1).padStart(2, "0")}</span>
              <input
                value={step}
                onChange={(event) => updateStep(index, event.target.value)}
                placeholder={placeholder}
                aria-label={`Paso ${index + 1}`}
              />
              <div className="process-step-actions">
                <button
                  type="button"
                  className="move-row-button"
                  onClick={() => moveStep(index, -1)}
                  disabled={index === 0}
                  aria-label={`Subir paso ${index + 1}`}
                  title="Subir"
                >
                  <ChevronUp size={15} strokeWidth={2.3} />
                </button>
                <button
                  type="button"
                  className="move-row-button"
                  onClick={() => moveStep(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label={`Bajar paso ${index + 1}`}
                  title="Bajar"
                >
                  <ChevronDown size={15} strokeWidth={2.3} />
                </button>
                <button
                  type="button"
                  className="remove-row-button"
                  onClick={() => removeStep(index)}
                  aria-label={`Quitar paso ${index + 1}`}
                  title="Quitar"
                >
                  <Trash2 size={15} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="add-row-button process-step-add" onClick={addStep}>
        <Plus size={16} strokeWidth={2.2} />
        {addLabel}
      </button>
    </div>
  );
}

function OptionalItemActions({
  canMoveDown,
  canMoveUp,
  onMoveDown,
  onMoveUp,
  onRemove,
  removeLabel,
}: {
  canMoveDown: boolean;
  canMoveUp: boolean;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <div className="optional-item-actions">
      <button
        type="button"
        className="move-row-button"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        aria-label="Subir"
        title="Subir"
      >
        <ChevronUp size={15} strokeWidth={2.3} />
      </button>
      <button
        type="button"
        className="move-row-button"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        aria-label="Bajar"
        title="Bajar"
      >
        <ChevronDown size={15} strokeWidth={2.3} />
      </button>
      <button type="button" className="remove-row-button" onClick={onRemove} aria-label={removeLabel} title="Quitar">
        <Trash2 size={15} strokeWidth={2.2} />
      </button>
    </div>
  );
}

function SectionOrderControl({
  hint,
  onMove,
  value,
}: {
  hint: string;
  onMove: (index: number, direction: -1 | 1) => void;
  value: ProjectPreviewSection[];
}) {
  const orderedSections = value
    .map((sectionId) => previewSectionOptions.find((section) => section.id === sectionId))
    .filter((section): section is (typeof previewSectionOptions)[number] => Boolean(section));

  return (
    <div className="section-order-panel">
      <div>
        <FieldLabel hint={hint}>Orden en preview</FieldLabel>
        <p>Organiza como quieres que aparezcan estas secciones en la pagina del proyecto.</p>
      </div>

      <div className="section-order-list">
        {orderedSections.map((section, index) => (
          <div className="section-order-item" key={section.id}>
            <span className="section-order-number">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{section.label}</strong>
              <span>{section.detail}</span>
            </div>
            <div className="optional-item-actions">
              <button
                type="button"
                className="move-row-button"
                onClick={() => onMove(index, -1)}
                disabled={index === 0}
                aria-label={`Subir ${section.label}`}
                title="Subir"
              >
                <ChevronUp size={15} strokeWidth={2.3} />
              </button>
              <button
                type="button"
                className="move-row-button"
                onClick={() => onMove(index, 1)}
                disabled={index === orderedSections.length - 1}
                aria-label={`Bajar ${section.label}`}
                title="Bajar"
              >
                <ChevronDown size={15} strokeWidth={2.3} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [activeSection, setActiveSection] = useState<StudioSectionId>("projects");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [workspaceView, setWorkspaceView] = useState<"home" | "project-create">("home");
  const [projectForm, setProjectForm] = useState<ProjectFormState>(() => defaultProjectForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [projectResult, setProjectResult] = useState<CreatedProject | null>(null);
  const [projectError, setProjectError] = useState("");
  const [imagePickMessage, setImagePickMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isOpeningLivePreview, setIsOpeningLivePreview] = useState(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState("");
  const [livePreviewMessage, setLivePreviewMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const selected = useMemo(() => getSectionById(activeSection), [activeSection]);
  const SelectedIcon = selected.icon;

  useEffect(() => {
    if (!livePreviewUrl || workspaceView !== "project-create") {
      return;
    }

    const syncPreview = window.setTimeout(async () => {
      try {
        await invoke<ProjectPreviewResult>("write_project_preview", { input: projectForm });
        setLivePreviewMessage({
          tone: "success",
          text: "Preview real sincronizado en el portafolio local.",
        });
      } catch (error) {
        setLivePreviewMessage({
          tone: "error",
          text: error instanceof Error ? error.message : String(error),
        });
      }
    }, 550);

    return () => window.clearTimeout(syncPreview);
  }, [livePreviewUrl, projectForm, workspaceView]);

  const updateProjectField = <Key extends keyof ProjectFormState>(
    field: Key,
    value: ProjectFormState[Key],
  ) => {
    setProjectForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "title" && !slugTouched && typeof value === "string") {
        next.slug = slugify(value);
      }

      if (field === "slug" && typeof value === "string") {
        next.slug = slugify(value);
      }

      return next;
    });

    if (field === "slug") {
      setSlugTouched(true);
    }
  };

  const addOptionalItem = (listKey: OptionalListKey) => {
    setProjectForm((current) => ({
      ...current,
      [listKey]: [...current[listKey], optionalListItems[listKey]()],
    }) as ProjectFormState);
  };

  const updateOptionalItem = (
    listKey: OptionalListKey,
    index: number,
    field: string,
    value: string,
  ) => {
    setProjectForm((current) => ({
      ...current,
      [listKey]: current[listKey].map((item, itemIndex) =>
        itemIndex === index ? ({ ...item, [field]: value } as OptionalListItem) : item,
      ),
    }) as ProjectFormState);
  };

  const removeOptionalItem = (listKey: OptionalListKey, index: number) => {
    setProjectForm((current) => ({
      ...current,
      [listKey]: current[listKey].filter((_, itemIndex) => itemIndex !== index),
    }) as ProjectFormState);
  };

  const moveOptionalItem = (listKey: OptionalListKey, index: number, direction: -1 | 1) => {
    setProjectForm((current) => {
      const nextList = [...current[listKey]] as OptionalListItem[];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= nextList.length) {
        return current;
      }

      [nextList[index], nextList[targetIndex]] = [nextList[targetIndex], nextList[index]];

      return {
        ...current,
        [listKey]: nextList,
      } as ProjectFormState;
    });
  };

  const movePreviewSection = (index: number, direction: -1 | 1) => {
    setProjectForm((current) => {
      const nextOrder = [...current.sectionOrder];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= nextOrder.length) {
        return current;
      }

      [nextOrder[index], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[index]];

      return {
        ...current,
        sectionOrder: nextOrder,
      };
    });
  };

  const pickImageForField = async (target: ImagePickTarget, source: ImagePickSource) => {
    setProjectError("");
    setImagePickMessage(null);

    try {
      const pickedImage = await invoke<string | null>("pick_project_image", {
        source,
        slug: projectForm.slug || slugify(projectForm.title) || "nuevo-proyecto",
      });

      if (!pickedImage) {
        return;
      }

      if (target.kind === "preview") {
        updateProjectField("previewImage", pickedImage);
      } else if (target.kind === "gallery") {
        updateOptionalItem("images", target.index, "src", pickedImage);
      } else {
        updateOptionalItem("videos", target.index, "poster", pickedImage);
      }

      setImagePickMessage({
        tone: "success",
        text:
          source === "import"
            ? `Imagen importada: ${pickedImage}`
            : `Imagen seleccionada: ${pickedImage}`,
      });
    } catch (error) {
      setImagePickMessage({
        tone: "error",
        text: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const renderImagePickerActions = (target: ImagePickTarget) => (
    <div className="media-picker-actions">
      <button
        type="button"
        className="media-picker-button"
        onClick={() => pickImageForField(target, "import")}
      >
        <ImagePlus size={15} strokeWidth={2.2} />
        Importar archivo
      </button>
      <button
        type="button"
        className="media-picker-button"
        onClick={() => pickImageForField(target, "existing")}
      >
        <FolderOpen size={15} strokeWidth={2.2} />
        Elegir del portafolio
      </button>
    </div>
  );

  const handleOpenLivePreview = async () => {
    setProjectError("");
    setLivePreviewMessage(null);
    setIsOpeningLivePreview(true);

    try {
      const result = await invoke<ProjectPreviewResult>("open_project_preview", { input: projectForm });
      setLivePreviewUrl(result.url);
      setLivePreviewMessage({
        tone: "success",
        text: `Preview real abierto en ${result.url}`,
      });
    } catch (error) {
      setLivePreviewMessage({
        tone: "error",
        text: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsOpeningLivePreview(false);
    }
  };

  const openProjectCreator = () => {
    setActiveSection("projects");
    setWorkspaceView("project-create");
    setProjectError("");
    setImagePickMessage(null);
    setProjectResult(null);
  };

  const resetProjectForm = () => {
    setProjectForm(defaultProjectForm());
    setSlugTouched(false);
    setProjectError("");
    setImagePickMessage(null);
    setProjectResult(null);
  };

  const handleSectionClick = (sectionId: StudioSectionId) => {
    setActiveSection(sectionId);
    setWorkspaceView("home");
  };

  const handleSectionAction = (action: string) => {
    if (selected.id === "projects" && action === "Nuevo proyecto") {
      openProjectCreator();
    }
  };

  const handleCreateProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProjectError("");
    setImagePickMessage(null);
    setProjectResult(null);
    setIsSavingProject(true);

    try {
      const result = await invoke<CreatedProject>("create_project", { input: projectForm });
      setProjectResult(result);
      setSlugTouched(false);
      setProjectForm((current) => ({
        ...defaultProjectForm(),
        category: current.category,
        year: current.year,
        tag: current.tag,
        accent: current.accent,
        detailCategory: current.detailCategory,
        detailCategoryEn: current.detailCategoryEn,
        visualClass: current.visualClass,
      }));
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingProject(false);
    }
  };

  return (
    <main className={`studio-app ${theme}`} data-theme={theme}>
      <div className="studio-grid" aria-hidden="true" />
      <div className="studio-shell">
        <header className="topbar">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <FolderCog size={21} strokeWidth={2.1} />
            </span>
            <div>
              <p className="app-kicker">Portfolio Studio</p>
              <h1>Gestor local</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <span className="privacy-pill">
              <ShieldCheck size={16} strokeWidth={2.2} />
              Solo escritorio
            </span>
            <button
              type="button"
              className="icon-button"
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {workspaceView === "home" ? (
          <section className="intro-panel" aria-labelledby="studio-title">
            <div className="intro-copy">
              <span className="section-label">Inicio</span>
              <h2 id="studio-title">Elige el modulo del portafolio que vas a gestionar.</h2>
            </div>
            <div className="session-card">
              <span className="session-icon" aria-hidden="true">
                <Clock3 size={18} strokeWidth={2.2} />
              </span>
              <div>
                <p>Sesion privada</p>
                <strong>Archivos locales</strong>
              </div>
            </div>
          </section>
        ) : (
          <section className="creator-strip" aria-label="Crear proyecto">
            <button type="button" className="back-button" onClick={() => setWorkspaceView("home")}>
              <ArrowLeft size={17} strokeWidth={2.2} />
              Inicio
            </button>
            <div>
              <p className="section-label">Proyectos</p>
              <h2>Nuevo proyecto</h2>
            </div>
            <div className="creator-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleOpenLivePreview}
                disabled={isOpeningLivePreview}
                title="Abre la ficha real en el portafolio local y la mantiene sincronizada mientras escribes."
              >
                <ExternalLink size={16} strokeWidth={2.2} />
                {isOpeningLivePreview ? "Abriendo..." : "Preview real"}
              </button>
              <button type="button" className="secondary-button" onClick={resetProjectForm}>
                Limpiar
              </button>
            </div>
          </section>
        )}

        {workspaceView === "home" ? (
          <section className="workspace" aria-label="Modulos de gestion">
          <div className="module-grid">
            {studioSections.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;

              return (
                <button
                  type="button"
                  key={section.id}
                  className={`module-card accent-${section.accent}${isActive ? " is-active" : ""}`}
                  onClick={() => handleSectionClick(section.id)}
                  aria-pressed={isActive}
                >
                  <span className="module-card-top">
                    <span className="module-icon" aria-hidden="true">
                      <Icon size={22} strokeWidth={2.1} />
                    </span>
                    <span className="module-metric">{section.metric}</span>
                  </span>
                  <span className="module-eyebrow">{section.eyebrow}</span>
                  <span className="module-title">
                    {section.title}
                    <ChevronRight size={18} strokeWidth={2.3} />
                  </span>
                  <span className="module-description">{section.description}</span>
                </button>
              );
            })}
          </div>

          <aside className={`selection-panel accent-${selected.accent}`} aria-live="polite">
            <div className="selection-head">
              <span className="selection-icon" aria-hidden="true">
                <SelectedIcon size={28} strokeWidth={2.1} />
              </span>
              <div>
                <p>{selected.eyebrow}</p>
                <h3>{selected.title}</h3>
              </div>
            </div>

            <p className="selection-copy">{selected.description}</p>

            <div className="selection-status">
              <span>
                <CircleDot size={16} strokeWidth={2.4} />
                {selected.metric}
              </span>
              <span>
                <CheckCircle2 size={16} strokeWidth={2.4} />
                {selected.detail}
              </span>
            </div>

            <div className="action-stack" aria-label={`Acciones de ${selected.title}`}>
              {selected.actions.map((action) => (
                <button
                  type="button"
                  key={action}
                  className="action-row"
                  onClick={() => handleSectionAction(action)}
                >
                  <span>{action}</span>
                  <ArrowRight size={17} strokeWidth={2.2} />
                </button>
              ))}
            </div>
          </aside>
          </section>
        ) : (
          <section
            className="project-creator-layout"
            aria-label="Formulario de nuevo proyecto"
          >
            <form className="project-form-panel" onSubmit={handleCreateProject}>
              <div className="form-scroll">
                <div className="form-section-heading">
                  <span className="section-label">Base</span>
                  <h3>Datos para la tarjeta</h3>
                </div>

                <div className="form-grid">
                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.title}>Nombre del proyecto</FieldLabel>
                    <input
                      value={projectForm.title}
                      onChange={(event) => updateProjectField("title", event.target.value)}
                      placeholder="Docqee"
                      required
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.slug}>Slug</FieldLabel>
                    <input
                      value={projectForm.slug}
                      onChange={(event) => updateProjectField("slug", event.target.value)}
                      placeholder="docqee"
                      required
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.year}>Año</FieldLabel>
                    <input
                      value={projectForm.year}
                      onChange={(event) => updateProjectField("year", event.target.value)}
                      placeholder={currentYear}
                      required
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.category}>Categoria</FieldLabel>
                    <select
                      value={projectForm.category}
                      onChange={(event) => updateProjectField("category", event.target.value)}
                    >
                      <option value="web">Web</option>
                      <option value="design">Diseno</option>
                      <option value="automation">Automatizacion</option>
                      <option value="content">Contenido</option>
                      <option value="ai">IA</option>
                    </select>
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.tag}>Etiqueta</FieldLabel>
                    <input
                      value={projectForm.tag}
                      onChange={(event) => updateProjectField("tag", event.target.value)}
                      placeholder="Web"
                      required
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.accent}>Acento</FieldLabel>
                    <input
                      value={projectForm.accent}
                      onChange={(event) => updateProjectField("accent", event.target.value)}
                      placeholder="Producto digital"
                      required
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.visualClass}>Visual</FieldLabel>
                    <select
                      value={projectForm.visualClass}
                      onChange={(event) => updateProjectField("visualClass", event.target.value)}
                    >
                      <option value="visual-brand">Marca</option>
                      <option value="visual-control">Control</option>
                      <option value="visual-launch">Lanzamiento</option>
                      <option value="visual-notes">Notas</option>
                      <option value="visual-system">Sistema</option>
                      <option value="visual-ai">IA</option>
                    </select>
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.description}>Descripcion corta</FieldLabel>
                    <textarea
                      value={projectForm.description}
                      onChange={(event) => updateProjectField("description", event.target.value)}
                      placeholder="Una frase clara para la tarjeta del portafolio."
                      rows={3}
                      required
                    />
                  </label>
                </div>

                <div className="form-section-heading">
                  <span className="section-label">English</span>
                  <h3>Textos base en ingles</h3>
                </div>

                <div className="form-grid">
                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Project name</FieldLabel>
                    <input
                      value={projectForm.titleEn}
                      onChange={(event) => updateProjectField("titleEn", event.target.value)}
                      placeholder="Docqee"
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.englishFallback}>Tag</FieldLabel>
                    <input
                      value={projectForm.tagEn}
                      onChange={(event) => updateProjectField("tagEn", event.target.value)}
                      placeholder="Web"
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.englishFallback}>Focus</FieldLabel>
                    <input
                      value={projectForm.accentEn}
                      onChange={(event) => updateProjectField("accentEn", event.target.value)}
                      placeholder="Digital product"
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Short description</FieldLabel>
                    <textarea
                      value={projectForm.descriptionEn}
                      onChange={(event) => updateProjectField("descriptionEn", event.target.value)}
                      placeholder="A clear sentence for the portfolio card."
                      rows={3}
                    />
                  </label>
                </div>

                <div className="form-section-heading">
                  <span className="section-label">Ficha</span>
                  <h3>Contenido del caso</h3>
                </div>

                <div className="form-grid">
                  <label className="field">
                    <FieldLabel hint={fieldHints.detailCategory}>Categoria visible</FieldLabel>
                    <input
                      value={projectForm.detailCategory}
                      onChange={(event) => updateProjectField("detailCategory", event.target.value)}
                      placeholder="Producto digital"
                    />
                  </label>

                  <div className="field field-wide">
                    <StackSelector
                      hint={fieldHints.stack}
                      value={projectForm.stack}
                      onChange={(value) => updateProjectField("stack", value)}
                    />
                  </div>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.summary}>Resumen</FieldLabel>
                    <textarea
                      value={projectForm.summary}
                      onChange={(event) => updateProjectField("summary", event.target.value)}
                      rows={2}
                      required
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.overview}>Descripcion larga</FieldLabel>
                    <textarea
                      value={projectForm.overview}
                      onChange={(event) => updateProjectField("overview", event.target.value)}
                      rows={4}
                      required
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.challenge}>Reto</FieldLabel>
                    <textarea
                      value={projectForm.challenge}
                      onChange={(event) => updateProjectField("challenge", event.target.value)}
                      rows={3}
                      required
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.solution}>Solucion</FieldLabel>
                    <textarea
                      value={projectForm.solution}
                      onChange={(event) => updateProjectField("solution", event.target.value)}
                      rows={3}
                      required
                    />
                  </label>

                  <div className="field field-wide">
                    <ProcessStepsEditor
                      hint={fieldHints.process}
                      value={projectForm.process}
                      onChange={(value) => updateProjectField("process", value)}
                    />
                  </div>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.results}>Resultados</FieldLabel>
                    <input
                      value={projectForm.results}
                      onChange={(event) => updateProjectField("results", event.target.value)}
                      placeholder="Mejor lectura, flujo mas rapido"
                    />
                  </label>
                </div>

                <div className="form-section-heading">
                  <span className="section-label">English</span>
                  <h3>Contenido de la ficha en ingles</h3>
                </div>

                <div className="form-grid">
                  <label className="field">
                    <FieldLabel hint={fieldHints.englishFallback}>Visible category</FieldLabel>
                    <input
                      value={projectForm.detailCategoryEn}
                      onChange={(event) => updateProjectField("detailCategoryEn", event.target.value)}
                      placeholder="Digital product"
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Overview block</FieldLabel>
                    <textarea
                      value={projectForm.summaryEn}
                      onChange={(event) => updateProjectField("summaryEn", event.target.value)}
                      rows={2}
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Long description</FieldLabel>
                    <textarea
                      value={projectForm.overviewEn}
                      onChange={(event) => updateProjectField("overviewEn", event.target.value)}
                      rows={4}
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Challenge</FieldLabel>
                    <textarea
                      value={projectForm.challengeEn}
                      onChange={(event) => updateProjectField("challengeEn", event.target.value)}
                      rows={3}
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Solution</FieldLabel>
                    <textarea
                      value={projectForm.solutionEn}
                      onChange={(event) => updateProjectField("solutionEn", event.target.value)}
                      rows={3}
                    />
                  </label>

                  <div className="field field-wide">
                    <ProcessStepsEditor
                      addLabel="Add step"
                      emptyText="Add English steps for the process timeline."
                      hint={fieldHints.englishFallback}
                      label="Process"
                      placeholder="Research, prototype, development..."
                      value={projectForm.processEn}
                      onChange={(value) => updateProjectField("processEn", value)}
                    />
                  </div>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Results</FieldLabel>
                    <input
                      value={projectForm.resultsEn}
                      onChange={(event) => updateProjectField("resultsEn", event.target.value)}
                      placeholder="Better readability, faster flow"
                    />
                  </label>
                </div>

                <div className="form-section-heading">
                  <span className="section-label">Enlaces</span>
                  <h3>Demo y archivos</h3>
                </div>

                <div className="form-grid">
                  <label className="field">
                    <FieldLabel hint={fieldHints.liveUrl}>URL demo</FieldLabel>
                    <input
                      value={projectForm.liveUrl}
                      onChange={(event) => updateProjectField("liveUrl", event.target.value)}
                      placeholder="https://..."
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.repoUrl}>Repositorio</FieldLabel>
                    <input
                      value={projectForm.repoUrl}
                      onChange={(event) => updateProjectField("repoUrl", event.target.value)}
                      placeholder="https://github.com/..."
                    />
                  </label>

                  <div className="field">
                    <FieldLabel hint={fieldHints.previewImage}>Imagen preview</FieldLabel>
                    <div className="media-picker-row">
                      <input
                        value={projectForm.previewImage}
                        onChange={(event) => updateProjectField("previewImage", event.target.value)}
                        placeholder="/docqee.png o https://..."
                      />
                      {renderImagePickerActions({ kind: "preview" })}
                    </div>
                  </div>

                  <label className="field">
                    <FieldLabel hint={fieldHints.status}>Estado</FieldLabel>
                    <select
                      value={projectForm.status}
                      onChange={(event) => updateProjectField("status", event.target.value)}
                    >
                      <option value="">Sin estado</option>
                      <option value="completed">Completado</option>
                      <option value="in-progress">En progreso</option>
                      <option value="concept">Concepto</option>
                      <option value="experimental">Experimental</option>
                      <option value="paused">Pausado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.featuredLevel}>Destacado</FieldLabel>
                    <select
                      value={projectForm.featuredLevel}
                      onChange={(event) => updateProjectField("featuredLevel", event.target.value)}
                    >
                      <option value="">Normal</option>
                      <option value="featured">Destacado</option>
                      <option value="main">Principal</option>
                    </select>
                  </label>

                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={projectForm.showInHome}
                      onChange={(event) => updateProjectField("showInHome", event.target.checked)}
                    />
                    <FieldLabel hint={fieldHints.showInHome}>Mostrar en inicio</FieldLabel>
                  </label>
                </div>

                <div className="form-section-heading">
                  <span className="section-label">Opcional</span>
                  <h3>Mas campos del proyecto</h3>
                </div>

                <div className="optional-content-panel">
                  <SectionOrderControl
                    hint={fieldHints.sectionOrder}
                    value={projectForm.sectionOrder}
                    onMove={movePreviewSection}
                  />

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.metrics}>Metricas</FieldLabel>
                        <p>Resultados numericos o indicadores visibles en la ficha.</p>
                      </div>
                      <button type="button" className="add-row-button" onClick={() => addOptionalItem("metrics")}>
                        <Plus size={16} strokeWidth={2.2} />
                        Agregar
                      </button>
                    </div>
                    {projectForm.metrics.length === 0 ? (
                      <p className="optional-empty">Sin metricas adicionales.</p>
                    ) : (
                      <div className="optional-list">
                        {projectForm.metrics.map((metric, index) => (
                          <div className="optional-item" key={`metric-${index}`}>
                            <div className="optional-item-head">
                              <strong>Metrica {index + 1}</strong>
                              <OptionalItemActions
                                canMoveUp={index > 0}
                                canMoveDown={index < projectForm.metrics.length - 1}
                                onMoveUp={() => moveOptionalItem("metrics", index, -1)}
                                onMoveDown={() => moveOptionalItem("metrics", index, 1)}
                                onRemove={() => removeOptionalItem("metrics", index)}
                                removeLabel={`Quitar metrica ${index + 1}`}
                              />
                            </div>
                            <div className="optional-item-grid">
                              <label className="field">
                                <span className="compact-label">Valor</span>
                                <input
                                  value={metric.value}
                                  onChange={(event) => updateOptionalItem("metrics", index, "value", event.target.value)}
                                  placeholder="+35%"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Etiqueta</span>
                                <input
                                  value={metric.label}
                                  onChange={(event) => updateOptionalItem("metrics", index, "label", event.target.value)}
                                  placeholder="menos tiempo de carga"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Label EN</span>
                                <input
                                  value={metric.labelEn}
                                  onChange={(event) => updateOptionalItem("metrics", index, "labelEn", event.target.value)}
                                  placeholder="less load time"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.extraLinks}>Enlaces extra</FieldLabel>
                        <p>Documentacion, articulo, prototipo, video externo o cualquier recurso relacionado.</p>
                      </div>
                      <button type="button" className="add-row-button" onClick={() => addOptionalItem("extraLinks")}>
                        <Plus size={16} strokeWidth={2.2} />
                        Agregar
                      </button>
                    </div>
                    {projectForm.extraLinks.length === 0 ? (
                      <p className="optional-empty">Sin enlaces adicionales.</p>
                    ) : (
                      <div className="optional-list">
                        {projectForm.extraLinks.map((link, index) => (
                          <div className="optional-item" key={`extra-link-${index}`}>
                            <div className="optional-item-head">
                              <strong>Enlace {index + 1}</strong>
                              <OptionalItemActions
                                canMoveUp={index > 0}
                                canMoveDown={index < projectForm.extraLinks.length - 1}
                                onMoveUp={() => moveOptionalItem("extraLinks", index, -1)}
                                onMoveDown={() => moveOptionalItem("extraLinks", index, 1)}
                                onRemove={() => removeOptionalItem("extraLinks", index)}
                                removeLabel={`Quitar enlace ${index + 1}`}
                              />
                            </div>
                            <div className="optional-item-grid">
                              <label className="field">
                                <span className="compact-label">Tipo</span>
                                <input
                                  value={link.type}
                                  onChange={(event) => updateOptionalItem("extraLinks", index, "type", event.target.value)}
                                  placeholder="docs"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Texto ES</span>
                                <input
                                  value={link.labelEs}
                                  onChange={(event) => updateOptionalItem("extraLinks", index, "labelEs", event.target.value)}
                                  placeholder="Ver documentacion"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Texto EN</span>
                                <input
                                  value={link.labelEn}
                                  onChange={(event) => updateOptionalItem("extraLinks", index, "labelEn", event.target.value)}
                                  placeholder="View documentation"
                                />
                              </label>
                              <label className="field field-wide">
                                <span className="compact-label">URL</span>
                                <input
                                  value={link.href}
                                  onChange={(event) => updateOptionalItem("extraLinks", index, "href", event.target.value)}
                                  placeholder="https://..."
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.images}>Imagenes</FieldLabel>
                        <p>Capturas, mockups o imagenes del proyecto.</p>
                      </div>
                      <button type="button" className="add-row-button" onClick={() => addOptionalItem("images")}>
                        <Plus size={16} strokeWidth={2.2} />
                        Agregar
                      </button>
                    </div>
                    {projectForm.images.length === 0 ? (
                      <p className="optional-empty">Sin imagenes adicionales.</p>
                    ) : (
                      <div className="optional-list">
                        {projectForm.images.map((image, index) => (
                          <div className="optional-item" key={`image-${index}`}>
                            <div className="optional-item-head">
                              <strong>Imagen {index + 1}</strong>
                              <OptionalItemActions
                                canMoveUp={index > 0}
                                canMoveDown={index < projectForm.images.length - 1}
                                onMoveUp={() => moveOptionalItem("images", index, -1)}
                                onMoveDown={() => moveOptionalItem("images", index, 1)}
                                onRemove={() => removeOptionalItem("images", index)}
                                removeLabel={`Quitar imagen ${index + 1}`}
                              />
                            </div>
                            <div className="optional-item-grid">
                              <div className="field field-wide">
                                <span className="compact-label">Ruta o URL</span>
                                <div className="media-picker-row">
                                  <input
                                    value={image.src}
                                    onChange={(event) => updateOptionalItem("images", index, "src", event.target.value)}
                                    placeholder="/captura-proyecto.png o https://..."
                                  />
                                  {renderImagePickerActions({ kind: "gallery", index })}
                                </div>
                              </div>
                              <label className="field">
                                <span className="compact-label">Alt ES</span>
                                <input
                                  value={image.altEs}
                                  onChange={(event) => updateOptionalItem("images", index, "altEs", event.target.value)}
                                  placeholder="Pantalla principal"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Alt EN</span>
                                <input
                                  value={image.altEn}
                                  onChange={(event) => updateOptionalItem("images", index, "altEn", event.target.value)}
                                  placeholder="Main screen"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Caption ES</span>
                                <input
                                  value={image.captionEs}
                                  onChange={(event) => updateOptionalItem("images", index, "captionEs", event.target.value)}
                                  placeholder="Opcional"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Caption EN</span>
                                <input
                                  value={image.captionEn}
                                  onChange={(event) => updateOptionalItem("images", index, "captionEn", event.target.value)}
                                  placeholder="Optional"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.videos}>Videos</FieldLabel>
                        <p>Videos locales, demos grabadas o recursos audiovisuales.</p>
                      </div>
                      <button type="button" className="add-row-button" onClick={() => addOptionalItem("videos")}>
                        <Plus size={16} strokeWidth={2.2} />
                        Agregar
                      </button>
                    </div>
                    {projectForm.videos.length === 0 ? (
                      <p className="optional-empty">Sin videos adicionales.</p>
                    ) : (
                      <div className="optional-list">
                        {projectForm.videos.map((video, index) => (
                          <div className="optional-item" key={`video-${index}`}>
                            <div className="optional-item-head">
                              <strong>Video {index + 1}</strong>
                              <OptionalItemActions
                                canMoveUp={index > 0}
                                canMoveDown={index < projectForm.videos.length - 1}
                                onMoveUp={() => moveOptionalItem("videos", index, -1)}
                                onMoveDown={() => moveOptionalItem("videos", index, 1)}
                                onRemove={() => removeOptionalItem("videos", index)}
                                removeLabel={`Quitar video ${index + 1}`}
                              />
                            </div>
                            <div className="optional-item-grid">
                              <label className="field field-wide">
                                <span className="compact-label">Ruta o URL</span>
                                <input
                                  value={video.src}
                                  onChange={(event) => updateOptionalItem("videos", index, "src", event.target.value)}
                                  placeholder="/demo-proyecto.mp4"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Titulo ES</span>
                                <input
                                  value={video.titleEs}
                                  onChange={(event) => updateOptionalItem("videos", index, "titleEs", event.target.value)}
                                  placeholder="Demo del flujo"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Titulo EN</span>
                                <input
                                  value={video.titleEn}
                                  onChange={(event) => updateOptionalItem("videos", index, "titleEn", event.target.value)}
                                  placeholder="Flow demo"
                                />
                              </label>
                              <div className="field">
                                <span className="compact-label">Poster</span>
                                <div className="media-picker-row">
                                  <input
                                    value={video.poster}
                                    onChange={(event) => updateOptionalItem("videos", index, "poster", event.target.value)}
                                    placeholder="/poster.png o https://..."
                                  />
                                  {renderImagePickerActions({ kind: "videoPoster", index })}
                                </div>
                              </div>
                              <label className="field">
                                <span className="compact-label">Caption ES</span>
                                <input
                                  value={video.captionEs}
                                  onChange={(event) => updateOptionalItem("videos", index, "captionEs", event.target.value)}
                                  placeholder="Opcional"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Caption EN</span>
                                <input
                                  value={video.captionEn}
                                  onChange={(event) => updateOptionalItem("videos", index, "captionEn", event.target.value)}
                                  placeholder="Optional"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.modules}>Modulos</FieldLabel>
                        <p>Partes funcionales o bloques importantes del proyecto.</p>
                      </div>
                      <button type="button" className="add-row-button" onClick={() => addOptionalItem("modules")}>
                        <Plus size={16} strokeWidth={2.2} />
                        Agregar
                      </button>
                    </div>
                    {projectForm.modules.length === 0 ? (
                      <p className="optional-empty">Sin modulos adicionales.</p>
                    ) : (
                      <div className="optional-list">
                        {projectForm.modules.map((module, index) => (
                          <div className="optional-item" key={`module-${index}`}>
                            <div className="optional-item-head">
                              <strong>Modulo {index + 1}</strong>
                              <OptionalItemActions
                                canMoveUp={index > 0}
                                canMoveDown={index < projectForm.modules.length - 1}
                                onMoveUp={() => moveOptionalItem("modules", index, -1)}
                                onMoveDown={() => moveOptionalItem("modules", index, 1)}
                                onRemove={() => removeOptionalItem("modules", index)}
                                removeLabel={`Quitar modulo ${index + 1}`}
                              />
                            </div>
                            <div className="optional-item-grid">
                              <label className="field">
                                <span className="compact-label">Titulo ES</span>
                                <input
                                  value={module.title}
                                  onChange={(event) => updateOptionalItem("modules", index, "title", event.target.value)}
                                  placeholder="Panel administrativo"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Titulo EN</span>
                                <input
                                  value={module.titleEn}
                                  onChange={(event) => updateOptionalItem("modules", index, "titleEn", event.target.value)}
                                  placeholder="Admin panel"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Descripcion ES</span>
                                <input
                                  value={module.description}
                                  onChange={(event) => updateOptionalItem("modules", index, "description", event.target.value)}
                                  placeholder="Gestiona usuarios y estados"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Descripcion EN</span>
                                <input
                                  value={module.descriptionEn}
                                  onChange={(event) => updateOptionalItem("modules", index, "descriptionEn", event.target.value)}
                                  placeholder="Manages users and statuses"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.flow}>Flujo</FieldLabel>
                        <p>Pasos para explicar como avanza el usuario o el proceso.</p>
                      </div>
                      <button type="button" className="add-row-button" onClick={() => addOptionalItem("flow")}>
                        <Plus size={16} strokeWidth={2.2} />
                        Agregar
                      </button>
                    </div>
                    {projectForm.flow.length === 0 ? (
                      <p className="optional-empty">Sin pasos de flujo adicionales.</p>
                    ) : (
                      <div className="optional-list">
                        {projectForm.flow.map((step, index) => (
                          <div className="optional-item" key={`flow-${index}`}>
                            <div className="optional-item-head">
                              <strong>Paso {index + 1}</strong>
                              <OptionalItemActions
                                canMoveUp={index > 0}
                                canMoveDown={index < projectForm.flow.length - 1}
                                onMoveUp={() => moveOptionalItem("flow", index, -1)}
                                onMoveDown={() => moveOptionalItem("flow", index, 1)}
                                onRemove={() => removeOptionalItem("flow", index)}
                                removeLabel={`Quitar paso ${index + 1}`}
                              />
                            </div>
                            <div className="optional-item-grid">
                              <label className="field">
                                <span className="compact-label">Numero</span>
                                <input
                                  value={step.step}
                                  onChange={(event) => updateOptionalItem("flow", index, "step", event.target.value)}
                                  placeholder="01"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Titulo ES</span>
                                <input
                                  value={step.title}
                                  onChange={(event) => updateOptionalItem("flow", index, "title", event.target.value)}
                                  placeholder="Ingreso"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Titulo EN</span>
                                <input
                                  value={step.titleEn}
                                  onChange={(event) => updateOptionalItem("flow", index, "titleEn", event.target.value)}
                                  placeholder="Entry"
                                />
                              </label>
                              <label className="field field-wide">
                                <span className="compact-label">Descripcion ES</span>
                                <input
                                  value={step.description}
                                  onChange={(event) => updateOptionalItem("flow", index, "description", event.target.value)}
                                  placeholder="El usuario inicia el recorrido desde..."
                                />
                              </label>
                              <label className="field field-wide">
                                <span className="compact-label">Descripcion EN</span>
                                <input
                                  value={step.descriptionEn}
                                  onChange={(event) => updateOptionalItem("flow", index, "descriptionEn", event.target.value)}
                                  placeholder="The user starts the journey from..."
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {imagePickMessage && (
                  <p className={`form-message is-${imagePickMessage.tone}`}>{imagePickMessage.text}</p>
                )}
                {livePreviewMessage && (
                  <p className={`form-message is-${livePreviewMessage.tone}`}>{livePreviewMessage.text}</p>
                )}
                {projectError && <p className="form-message is-error">{projectError}</p>}
                {projectResult && (
                  <div className="form-message is-success">
                    <strong>Proyecto creado: {projectResult.slug}</strong>
                    <span>Total: {projectResult.totalProjects}</span>
                  </div>
                )}
              </div>

              <div className="form-footer">
                <button type="button" className="secondary-button" onClick={resetProjectForm}>
                  Limpiar
                </button>
                <button type="submit" className="primary-button" disabled={isSavingProject}>
                  <Save size={17} strokeWidth={2.2} />
                  {isSavingProject ? "Creando..." : "Crear proyecto"}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
