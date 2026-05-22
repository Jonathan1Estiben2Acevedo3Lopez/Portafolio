import {
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit3,
  Eye,
  FolderOpen,
  GripVertical,
  ImagePlus,
  LayoutDashboard,
  Monitor,
  PanelLeft,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Smartphone,
  Tablet,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import categoriesSource from "../data/categories.json";
import modulesSource from "../data/modules.json";
import technologiesSource from "../data/technologies.json";
import templatesSource from "../data/visual-templates.json";
import type {
  CategoryDefinition,
  FeaturedLevel,
  ModuleDefinition,
  ProjectDraft,
  ProjectImage,
  ProjectModule,
  ProjectStatus,
  ProjectSummary,
  Technology,
  ValidationMessage,
  VisualTemplateDefinition,
} from "./types";
import {
  addTechnology,
  buildAssetInputs,
  buildCompatibleProject,
  createEmptyProject,
  extractYoutubeId,
  featuredLabels,
  normalizeProject,
  retargetProjectAssetPaths,
  slugify,
  statusLabels,
  technologyCategories,
  validateProject,
} from "./lib/project";
import {
  deleteProject,
  duplicateProject,
  listProjects,
  openPreview,
  readAssetDataUrl,
  readProject,
  runSyncProjects,
  saveProject,
  saveTechnology,
} from "./lib/studio-api";

const categories = categoriesSource as CategoryDefinition[];
const moduleDefinitions = modulesSource as ModuleDefinition[];
const visualTemplates = templatesSource as VisualTemplateDefinition[];
const initialTechnologies = technologiesSource as Technology[];

const steps = [
  "Categoría",
  "Información básica",
  "Media",
  "Tecnologías",
  "Módulos",
  "Visual",
  "Vista previa",
];

const statusOptions = Object.keys(statusLabels) as ProjectStatus[];
const featuredOptions = Object.keys(featuredLabels) as FeaturedLevel[];

type ViewMode = "list" | "editor";
type PreviewSize = "desktop" | "tablet" | "mobile";

interface DeleteState {
  project: ProjectSummary;
  deleteJson: boolean;
  deleteAssets: boolean;
  deleteAssetFolder: boolean;
}

function getCategory(id: string) {
  return categories.find((category) => category.id === id) || categories[0];
}

function getTemplate(id: string) {
  return visualTemplates.find((template) => template.id === id) || visualTemplates[0];
}

function getModuleDefinition(id: string) {
  return moduleDefinitions.find((module) => module.id === id);
}

function getDraftImageSource(draft: ProjectDraft, src?: string) {
  if (!src) {
    return "";
  }

  const matchingImage = draft.media.gallery.find((image) => image.src === src || image.sourcePath === src);
  return matchingImage?.sourcePath || src;
}

function getDraftPreviewSource(draft: ProjectDraft) {
  return getDraftImageSource(draft, draft.previewImage || draft.media.cover || draft.media.gallery[0]?.src || "");
}

function cloneDraft(draft: ProjectDraft): ProjectDraft {
  return JSON.parse(JSON.stringify(draft)) as ProjectDraft;
}

function AssetImage({ src, alt = "", className, fallback }: { src?: string; alt?: string; className?: string; fallback?: ReactNode }) {
  const [resolvedSrc, setResolvedSrc] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;
    const nextSrc = src?.trim() || "";
    setHasError(false);

    if (!nextSrc) {
      setResolvedSrc("");
      return () => {
        isActive = false;
      };
    }

    readAssetDataUrl(nextSrc)
      .then((dataUrl) => {
        if (isActive) {
          setResolvedSrc(dataUrl);
        }
      })
      .catch(() => {
        if (isActive) {
          setResolvedSrc("");
          setHasError(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, [src]);

  if (!src || !resolvedSrc || hasError) {
    return <>{fallback}</>;
  }

  return <img className={className} src={resolvedSrc} alt={alt} onError={() => setHasError(true)} />;
}

function App() {
  const [view, setView] = useState<ViewMode>("list");
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [draft, setDraft] = useState<ProjectDraft>(() => createEmptyProject(categories, visualTemplates));
  const [originalSlug, setOriginalSlug] = useState<string | undefined>();
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [techSearch, setTechSearch] = useState("");
  const [technologies, setTechnologies] = useState<Technology[]>(initialTechnologies);
  const [messages, setMessages] = useState<ValidationMessage[]>([]);
  const [toast, setToast] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [previewSize, setPreviewSize] = useState<PreviewSize>("desktop");
  const [templatePreviewId, setTemplatePreviewId] = useState("minimal");
  const [dragModule, setDragModule] = useState<string | null>(null);
  const [dragImageIndex, setDragImageIndex] = useState<number | null>(null);
  const [hasStoredDraft, setHasStoredDraft] = useState(() => Boolean(window.localStorage.getItem("project-studio-draft")));

  const existingSlugs = useMemo(() => projects.map((project) => project.slug), [projects]);
  const selectedCategory = getCategory(draft.category);
  const templateInPreview = getTemplate(templatePreviewId || draft.visualTemplate);
  const allowedModules = selectedCategory.allowedModules;

  const filteredProjects = projects.filter((project) => {
    const haystack = `${project.title} ${project.slug} ${project.category}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const visibleTechOptions = technologies.filter((tech) => {
    const query = techSearch.toLowerCase();
    return `${tech.name} ${tech.category}`.toLowerCase().includes(query);
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (view !== "editor") {
      return;
    }

    window.localStorage.setItem(
      "project-studio-draft",
      JSON.stringify({
        originalSlug,
        draft,
      }),
    );
    setHasStoredDraft(true);
  }, [draft, originalSlug, view]);

  useEffect(() => {
    if (draft.media.video.url) {
      updateDraft((current) => {
        current.media.video.youtubeId = extractYoutubeId(current.media.video.url);
      });
    }
  }, [draft.media.video.url]);

  function updateDraft(mutator: (current: ProjectDraft) => void) {
    setDraft((current) => {
      const next = cloneDraft(current);
      mutator(next);
      next.href = `/proyectos/${next.slug}`;
      const template = getTemplate(next.visualTemplate);
      next.visualClass = template.visualClass;
      next.previewImage = next.previewImage || next.media.cover || next.media.gallery[0]?.src || "";
      return next;
    });
  }

  function getNextGalleryImageNumber(project: ProjectDraft) {
    const usedNumbers = project.media.gallery
      .map((image) => image.src.match(/^\/projects\/[^/]+\/gallery-(\d+)\.webp$/)?.[1])
      .filter(Boolean)
      .map((value) => Number(value))
      .filter(Number.isFinite);

    return usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;
  }

  async function loadProjects() {
    try {
      const result = await listProjects();
      setProjects(result);
    } catch (error) {
      setToast(`No se pudieron cargar proyectos: ${String(error)}`);
    }
  }

  function startNewProject() {
    const next = createEmptyProject(categories, visualTemplates);
    setDraft(next);
    setOriginalSlug(undefined);
    setStep(0);
    setTemplatePreviewId(next.visualTemplate);
    setMessages(validateProject(next, existingSlugs));
    setView("editor");
  }

  function recoverStoredDraft() {
    const stored = window.localStorage.getItem("project-studio-draft");
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as { originalSlug?: string; draft?: ProjectDraft };
      if (parsed.draft) {
        setDraft(parsed.draft);
        setOriginalSlug(parsed.originalSlug);
        setStep(1);
        setMessages(validateProject(parsed.draft, existingSlugs, parsed.originalSlug));
        setView("editor");
      }
    } catch {
      setToast("No se pudo recuperar el borrador local.");
    }
  }

  async function startEditProject(project: ProjectSummary) {
    try {
      const raw = await readProject(project.slug);
      const next = normalizeProject(raw, categories, visualTemplates);
      setDraft(next);
      setOriginalSlug(project.slug);
      setStep(1);
      setTemplatePreviewId(next.visualTemplate);
      setMessages(validateProject(next, existingSlugs, project.slug));
      setView("editor");
    } catch (error) {
      setToast(`No se pudo abrir ${project.slug}: ${String(error)}`);
    }
  }

  async function startDuplicateProject(project: ProjectSummary) {
    const targetSlug = window.prompt("Nuevo slug para la copia", `${project.slug}-copia`);
    if (!targetSlug) {
      return;
    }

    const normalizedSlug = slugify(targetSlug);
    const copyAssets = window.confirm("¿Copiar assets del proyecto original?");

    try {
      const duplicated = await duplicateProject(project.slug, normalizedSlug, copyAssets);
      const next = normalizeProject(duplicated, categories, visualTemplates);
      setDraft(next);
      setOriginalSlug(normalizedSlug);
      setStep(1);
      setTemplatePreviewId(next.visualTemplate);
      await loadProjects();
      setView("editor");
      setToast("Proyecto duplicado. Revisa textos y guarda para sincronizar.");
    } catch (error) {
      setToast(`No se pudo duplicar: ${String(error)}`);
    }
  }

  function setTitle(language: "es" | "en", value: string) {
    updateDraft((current) => {
      current.copy[language].title = value;
      if (language === "es" && (!originalSlug || current.slug === "nuevo-proyecto")) {
        current.slug = slugify(value);
      }
    });
  }

  async function selectLocalImages() {
    const selected = await openDialog({
      multiple: true,
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }],
    });

    const paths = Array.isArray(selected) ? selected : selected ? [selected] : [];
    if (paths.length === 0) {
      return;
    }

    updateDraft((current) => {
      const start = getNextGalleryImageNumber(current);
      paths.forEach((path, index) => {
        const position = start + index;
        const src = `/projects/${current.slug}/gallery-${String(position).padStart(2, "0")}.webp`;
        current.media.gallery.push({
          src,
          sourcePath: path,
          isExternal: false,
          alt: {
            es: `${current.copy.es.title || current.slug} captura ${position}`,
            en: `${current.copy.en.title || current.slug} screenshot ${position}`,
          },
        });
      });
      current.media.cover ||= current.media.gallery[0]?.src || "";
      current.previewImage ||= current.media.cover;
    });
    setToast(paths.length === 1 ? "Imagen agregada a la galeria." : `${paths.length} imagenes agregadas a la galeria.`);
  }

  function addExternalImage() {
    const url = window.prompt("URL externa de la imagen");
    if (!url) {
      return;
    }

    updateDraft((current) => {
      current.media.gallery.push({
        src: url,
        isExternal: true,
        alt: {
          es: `${current.copy.es.title || current.slug} imagen`,
          en: `${current.copy.en.title || current.slug} image`,
        },
      });
      current.media.cover ||= url;
      current.previewImage ||= url;
    });
  }

  function reorderGallery(from: number, to: number) {
    updateDraft((current) => {
      const [item] = current.media.gallery.splice(from, 1);
      current.media.gallery.splice(to, 0, item);
    });
  }

  function addModule(moduleId: string) {
    updateDraft((current) => {
      if (!current.modulesOrder.includes(moduleId)) {
        current.modulesOrder.push(moduleId);
      }

      current.modules[moduleId] ||= {
        title: { es: getModuleDefinition(moduleId)?.label || moduleId, en: getModuleDefinition(moduleId)?.label || moduleId },
        body: { es: "", en: "" },
        items: [],
      };
    });
  }

  function removeModule(moduleId: string) {
    updateDraft((current) => {
      current.modulesOrder = current.modulesOrder.filter((item) => item !== moduleId);
      delete current.modules[moduleId];
    });
  }

  function reorderModules(fromId: string, toId: string) {
    updateDraft((current) => {
      const from = current.modulesOrder.indexOf(fromId);
      const to = current.modulesOrder.indexOf(toId);
      if (from < 0 || to < 0) {
        return;
      }

      const [item] = current.modulesOrder.splice(from, 1);
      current.modulesOrder.splice(to, 0, item);
    });
  }

  async function addStackTechnology(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    const tech = addTechnology(technologies, trimmed);
    if (!technologies.some((item) => item.slug === tech.slug)) {
      try {
        const updated = await saveTechnology(tech);
        setTechnologies(updated);
      } catch {
        setTechnologies((current) => [...current, tech].sort((a, b) => a.name.localeCompare(b.name)));
      }
    }

    updateDraft((current) => {
      if (!current.stack.includes(tech.name)) {
        current.stack.push(tech.name);
      }
    });
    setTechSearch("");
  }

  async function saveAndSync() {
    const validation = validateProject(draft, existingSlugs, originalSlug);
    setMessages(validation);
    if (validation.some((message) => message.level === "error")) {
      setToast("Corrige los errores antes de guardar.");
      return;
    }

    setIsSaving(true);
    try {
      const project = retargetProjectAssetPaths(
        buildCompatibleProject(draft, categories, visualTemplates),
        originalSlug,
        draft.slug,
      );
      await saveProject(originalSlug, project, buildAssetInputs(draft));
      const syncOutput = await runSyncProjects();
      await loadProjects();
      setOriginalSlug(draft.slug);
      window.localStorage.removeItem("project-studio-draft");
      setHasStoredDraft(false);
      setToast(syncOutput.trim() || "Proyecto guardado y sincronizado.");
      await openPreview(draft.slug);
    } catch (error) {
      setToast(`No se pudo guardar: ${String(error)}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDeleteProject() {
    if (!deleteState) {
      return;
    }

    try {
      await deleteProject(
        deleteState.project.slug,
        deleteState.deleteJson,
        deleteState.deleteAssets,
        deleteState.deleteAssetFolder,
      );
      await runSyncProjects();
      await loadProjects();
      setToast("Proyecto eliminado según la configuración elegida.");
    } catch (error) {
      setToast(`No se pudo eliminar: ${String(error)}`);
    } finally {
      setDeleteState(null);
    }
  }

  return (
    <div className="studio-app">
      <aside className="studio-rail">
        <div className="studio-logo">
          <LayoutDashboard size={21} />
        </div>
        <button className={view === "list" ? "rail-button active" : "rail-button"} onClick={() => setView("list")} title="Mis proyectos">
          <PanelLeft size={20} />
        </button>
        <button className="rail-button" onClick={startNewProject} title="Nuevo proyecto">
          <Plus size={20} />
        </button>
        <button className="rail-button" onClick={loadProjects} title="Recargar">
          <RefreshCcw size={19} />
        </button>
      </aside>

      <main className="studio-main">
        {view === "list" ? (
          <section className="project-list-view">
            <header className="studio-header">
              <div>
                <p className="eyebrow">Project Studio</p>
                <h1>Mis proyectos</h1>
              </div>
              <button className="primary-button" onClick={startNewProject}>
                <Plus size={18} />
                Nuevo proyecto
              </button>
            </header>

            <div className="toolbar">
              <label className="search-field">
                <Search size={18} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título, slug o categoría" />
              </label>
              <button className="ghost-button" onClick={loadProjects}>
                <RefreshCcw size={17} />
                Recargar JSON
              </button>
              {hasStoredDraft && (
                <button className="ghost-button" onClick={recoverStoredDraft}>
                  <Archive size={17} />
                  Recuperar borrador
                </button>
              )}
            </div>

            <div className="project-grid">
              {filteredProjects.map((project) => (
                <article className="project-card" key={project.slug}>
                  <div className="project-card-visual">
                    <AssetImage src={project.previewImage} fallback={<span>{project.visualTemplate}</span>} />
                  </div>
                  <div className="project-card-body">
                    <div>
                      <p className="card-kicker">{getCategory(project.category).label.es || project.category}</p>
                      <h2>{project.title}</h2>
                    </div>
                    <div className="meta-grid">
                      <span>{project.year || "Sin año"}</span>
                      <span>{statusLabels[project.status] || project.status}</span>
                      <span>{featuredLabels[project.featuredLevel] || project.featuredLevel}</span>
                      <span>{getTemplate(project.visualTemplate).name}</span>
                    </div>
                    <div className="card-actions">
                      <button onClick={() => startEditProject(project)}>
                        <Edit3 size={16} />
                        Editar
                      </button>
                      <button onClick={() => startDuplicateProject(project)}>
                        <Copy size={16} />
                        Duplicar
                      </button>
                      <button className="danger" onClick={() => setDeleteState({ project, deleteJson: true, deleteAssets: false, deleteAssetFolder: false })}>
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="editor-view">
            <header className="studio-header compact">
              <button className="ghost-button" onClick={() => setView("list")}>
                <ChevronLeft size={17} />
                Volver
              </button>
              <div>
                <p className="eyebrow">{originalSlug ? "Editando" : "Nuevo proyecto"}</p>
                <h1>{draft.copy.es.title || draft.slug}</h1>
              </div>
              <button className="primary-button" disabled={isSaving} onClick={saveAndSync}>
                <Save size={18} />
                {isSaving ? "Guardando..." : "Guardar y actualizar portafolio"}
              </button>
            </header>

            <div className="editor-shell">
              <aside className="wizard-sidebar">
                {steps.map((label, index) => (
                  <button key={label} className={step === index ? "wizard-step active" : "wizard-step"} onClick={() => setStep(index)}>
                    <span>{index + 1}</span>
                    {label}
                  </button>
                ))}
                <div className="validation-panel">
                  {messages.map((message, index) => (
                    <p key={`${message.message}-${index}`} className={`validation ${message.level}`}>
                      {message.message}
                    </p>
                  ))}
                </div>
              </aside>

              <div className="wizard-content">
                {step === 0 && (
                  <div className="panel">
                    <PanelTitle eyebrow="Paso 1" title="Categoría del proyecto" />
                    <div className="option-grid">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          className={draft.category === category.id ? "option-card selected" : "option-card"}
                          onClick={() => {
                            setTemplatePreviewId(category.recommendedVisualTemplate);
                            updateDraft((current) => {
                              current.category = category.id;
                              current.visualTemplate = category.recommendedVisualTemplate;
                              const template = getTemplate(category.recommendedVisualTemplate);
                              current.visualClass = template.visualClass;
                              current.modulesOrder = [...new Set([...current.modulesOrder, ...category.recommendedModules])];
                            });
                          }}
                        >
                          <span>{category.label.es}</span>
                          <small>{category.description}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="panel">
                    <PanelTitle eyebrow="Paso 2" title="Información básica" />
                    <div className="form-grid">
                      <Field label="Título ES" value={draft.copy.es.title} onChange={(value) => setTitle("es", value)} />
                      <Field label="Título EN" value={draft.copy.en.title} onChange={(value) => setTitle("en", value)} />
                      <Field label="Slug" value={draft.slug} onChange={(value) => updateDraft((current) => (current.slug = slugify(value)))} />
                      <Field label="Año" value={draft.year} onChange={(value) => updateDraft((current) => (current.year = value))} />
                      <Field label="Tag ES" value={draft.copy.es.tag} onChange={(value) => updateDraft((current) => (current.copy.es.tag = value))} />
                      <Field label="Tag EN" value={draft.copy.en.tag} onChange={(value) => updateDraft((current) => (current.copy.en.tag = value))} />
                      <Field label="Acento ES" value={draft.copy.es.accent || ""} onChange={(value) => updateDraft((current) => (current.copy.es.accent = value))} />
                      <Field label="Acento EN" value={draft.copy.en.accent || ""} onChange={(value) => updateDraft((current) => (current.copy.en.accent = value))} />
                      <Field label="URL demo (opcional)" value={draft.liveUrl || ""} onChange={(value) => updateDraft((current) => (current.liveUrl = value))} />
                      <Field label="GitHub URL" value={draft.githubUrl || ""} onChange={(value) => updateDraft((current) => (current.githubUrl = value))} />
                      <SelectField label="Estado" value={draft.status} options={statusOptions} labels={statusLabels} onChange={(value) => updateDraft((current) => (current.status = value as ProjectStatus))} />
                      <SelectField label="Featured" value={draft.featuredLevel} options={featuredOptions} labels={featuredLabels} onChange={(value) => updateDraft((current) => (current.featuredLevel = value as FeaturedLevel))} />
                    </div>
                    <TextField label="Descripción corta ES" value={draft.copy.es.description} onChange={(value) => updateDraft((current) => (current.copy.es.description = value))} />
                    <TextField label="Descripción corta EN" value={draft.copy.en.description} onChange={(value) => updateDraft((current) => (current.copy.en.description = value))} />
                    <TextField label="Descripción larga ES" value={draft.copy.es.longDescription || ""} onChange={(value) => updateDraft((current) => (current.copy.es.longDescription = value))} rows={5} />
                    <TextField label="Descripción larga EN" value={draft.copy.en.longDescription || ""} onChange={(value) => updateDraft((current) => (current.copy.en.longDescription = value))} rows={5} />
                    <label className="check-row">
                      <input type="checkbox" checked={Boolean(draft.pinned)} onChange={(event) => updateDraft((current) => (current.pinned = event.target.checked))} />
                      Fijar prioridad en home
                    </label>
                    <Field label="Prioridad manual opcional" value={draft.priority?.toString() || ""} onChange={(value) => updateDraft((current) => (current.priority = value ? Number(value) : undefined))} />
                  </div>
                )}

                {step === 2 && (
                  <div className="panel">
                    <PanelTitle eyebrow="Paso 3" title="Media e imágenes" />
                    <div className="button-row">
                      <button className="secondary-button" onClick={selectLocalImages}>
                        <ImagePlus size={18} />
                        Subir imágenes locales
                      </button>
                      <button className="secondary-button" onClick={addExternalImage}>
                        <FolderOpen size={18} />
                        Pegar URL externa
                      </button>
                    </div>
                    <div className="media-summary" role="status">
                      <strong>{draft.media.gallery.length}</strong>
                      <span>{draft.media.gallery.length === 1 ? "imagen en galeria" : "imagenes en galeria"}</span>
                      <small>Puedes agregar todas las que quieras; el portafolio las mostrara completas.</small>
                    </div>
                    <Field label="Preview principal" value={draft.previewImage || ""} onChange={(value) => updateDraft((current) => (current.previewImage = value))} />
                    <Field label="Cover" value={draft.media.cover} onChange={(value) => updateDraft((current) => (current.media.cover = value))} />
                    <Field label="URL de YouTube" value={draft.media.video.url} onChange={(value) => updateDraft((current) => (current.media.video.url = value))} />
                    <p className={draft.media.video.url && !draft.media.video.youtubeId ? "inline-error" : "inline-help"}>
                      YouTube ID: {draft.media.video.youtubeId || "sin video"}
                    </p>
                    <div className="gallery-grid">
                      {draft.media.gallery.map((image, index) => (
                        <div
                          key={`${image.src}-${index}`}
                          className="gallery-item"
                          draggable
                          onDragStart={() => setDragImageIndex(index)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (dragImageIndex !== null) {
                              reorderGallery(dragImageIndex, index);
                            }
                            setDragImageIndex(null);
                          }}
                        >
                          <div className="gallery-thumb">
                            <AssetImage src={image.sourcePath || image.src} fallback={<ImagePlus size={28} />} />
                          </div>
                          <input value={image.src} onChange={(event) => updateDraft((current) => (current.media.gallery[index].src = event.target.value))} />
                          <div className="mini-actions">
                            <button onClick={() => updateDraft((current) => (current.previewImage = image.src))}>Preview</button>
                            <button onClick={() => updateDraft((current) => (current.media.cover = image.src))}>Cover</button>
                            <button onClick={() => updateDraft((current) => current.media.gallery.splice(index, 1))}>Eliminar</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="panel">
                    <PanelTitle eyebrow="Paso 4" title="Tecnologías" />
                    <div className="tech-picker">
                      <input value={techSearch} onChange={(event) => setTechSearch(event.target.value)} placeholder="Buscar o crear tecnología" />
                      <button className="primary-button small" onClick={() => addStackTechnology(techSearch)}>
                        Crear/agregar
                      </button>
                    </div>
                    <div className="chip-row">
                      {draft.stack.map((tech) => (
                        <button key={tech} className="chip selected" onClick={() => updateDraft((current) => (current.stack = current.stack.filter((item) => item !== tech)))}>
                          {tech}
                          <X size={13} />
                        </button>
                      ))}
                    </div>
                    <div className="tech-grid">
                      {visibleTechOptions.map((tech) => (
                        <button key={tech.slug} className="tech-card" onClick={() => addStackTechnology(tech.name)}>
                          <span style={{ background: tech.color }} />
                          <strong>{tech.name}</strong>
                          <small>{tech.category}</small>
                        </button>
                      ))}
                    </div>
                    <div className="category-strip">
                      {technologyCategories.map((category) => (
                        <span key={category}>{category}</span>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="panel">
                    <PanelTitle eyebrow="Paso 5" title="Módulos dinámicos" />
                    <div className="module-picker">
                      {allowedModules.map((moduleId) => {
                        const definition = getModuleDefinition(moduleId);
                        return (
                          <button key={moduleId} disabled={draft.modulesOrder.includes(moduleId)} onClick={() => addModule(moduleId)}>
                            <Plus size={15} />
                            {definition?.label || moduleId}
                          </button>
                        );
                      })}
                    </div>
                    <div className="module-list">
                      {draft.modulesOrder.map((moduleId) => (
                        <ModuleEditor
                          key={moduleId}
                          moduleId={moduleId}
                          moduleValue={draft.modules[moduleId] || {}}
                          dragModule={dragModule}
                          onDragStart={() => setDragModule(moduleId)}
                          onDrop={() => {
                            if (dragModule) {
                              reorderModules(dragModule, moduleId);
                            }
                            setDragModule(null);
                          }}
                          onRemove={() => removeModule(moduleId)}
                          onChange={(next) => updateDraft((current) => (current.modules[moduleId] = next))}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="panel">
                    <PanelTitle eyebrow="Paso 6" title="Configuración visual" />
                    <TemplateShowcasePreview
                      draft={draft}
                      template={templateInPreview}
                      isSelected={draft.visualTemplate === templateInPreview.id}
                      onUse={() =>
                        updateDraft((current) => {
                          current.visualTemplate = templateInPreview.id;
                        })
                      }
                    />
                    <div className="template-grid professional">
                      {visualTemplates.map((template) => (
                        <article
                          key={template.id}
                          className={draft.visualTemplate === template.id ? "template-card selected" : "template-card"}
                        >
                          <TemplatePreviewArt templateId={template.id} />
                          <div className="template-card-title">
                            <strong>{template.name}</strong>
                            {draft.visualTemplate === template.id && <Check size={15} />}
                          </div>
                          <p>{template.description}</p>
                          <small>{template.bestFor}</small>
                          {selectedCategory.recommendedVisualTemplate === template.id && <em>Recomendada</em>}
                          <div className="template-card-actions">
                            <button type="button" onClick={() => setTemplatePreviewId(template.id)}>
                              <Eye size={14} />
                              Ver preview
                            </button>
                            <button
                              type="button"
                              className="use-template"
                              onClick={() => {
                                setTemplatePreviewId(template.id);
                                updateDraft((current) => {
                                  current.visualTemplate = template.id;
                                });
                              }}
                            >
                              Usar
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className="form-grid">
                      <SelectField label="Hero style" value={draft.visualOptions.heroStyle} options={["minimal", "split", "immersive"]} onChange={(value) => updateDraft((current) => (current.visualOptions.heroStyle = value))} />
                      <SelectField label="Motion" value={draft.visualOptions.motion} options={["none", "soft", "expressive"]} onChange={(value) => updateDraft((current) => (current.visualOptions.motion = value))} />
                      <SelectField label="Card style" value={draft.visualOptions.cardStyle} options={["glass", "solid", "outline"]} onChange={(value) => updateDraft((current) => (current.visualOptions.cardStyle = value))} />
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="panel">
                    <PanelTitle eyebrow="Paso 7" title="Vista previa" />
                    <div className="preview-toolbar">
                      {(["desktop", "tablet", "mobile"] as PreviewSize[]).map((size) => (
                        <button key={size} className={previewSize === size ? "active" : ""} onClick={() => setPreviewSize(size)}>
                          {size === "desktop" ? <Monitor size={16} /> : size === "tablet" ? <Tablet size={16} /> : <Smartphone size={16} />}
                          {size}
                        </button>
                      ))}
                    </div>
                    <ProjectPreview draft={draft} previewSize={previewSize} />
                  </div>
                )}

                <div className="wizard-footer">
                  <button className="ghost-button" disabled={step === 0} onClick={() => setStep((current) => Math.max(current - 1, 0))}>
                    <ChevronLeft size={17} />
                    Anterior
                  </button>
                  <button className="ghost-button" disabled={step === steps.length - 1} onClick={() => setStep((current) => Math.min(current + 1, steps.length - 1))}>
                    Siguiente
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {deleteState && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Eliminar {deleteState.project.title}</h2>
            <p>Esta acción no toca Git. Elige exactamente qué quieres borrar.</p>
            <label className="check-row">
              <input type="checkbox" checked={deleteState.deleteJson} onChange={(event) => setDeleteState({ ...deleteState, deleteJson: event.target.checked })} />
              Eliminar JSON
            </label>
            <label className="check-row">
              <input type="checkbox" checked={deleteState.deleteAssets} onChange={(event) => setDeleteState({ ...deleteState, deleteAssets: event.target.checked })} />
              Eliminar assets asociados
            </label>
            <label className="check-row">
              <input type="checkbox" checked={deleteState.deleteAssetFolder} onChange={(event) => setDeleteState({ ...deleteState, deleteAssetFolder: event.target.checked })} />
              Eliminar carpeta public/projects/{deleteState.project.slug}
            </label>
            <div className="modal-actions">
              <button className="ghost-button" onClick={() => setDeleteState(null)}>
                Cancelar
              </button>
              <button className="danger-button" onClick={confirmDeleteProject}>
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <button className="toast" onClick={() => setToast("")}>
          {toast}
        </button>
      )}
    </div>
  );
}

function PanelTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="panel-title">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextField({ label, value, onChange, rows = 3 }: { label: string; value: string; rows?: number; onChange: (value: string) => void }) {
  return (
    <label className="field full">
      <span>{label}</span>
      <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  labels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] || option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ModuleEditor({
  moduleId,
  moduleValue,
  onChange,
  onRemove,
  dragModule,
  onDragStart,
  onDrop,
}: {
  moduleId: string;
  moduleValue: ProjectModule;
  onChange: (next: ProjectModule) => void;
  onRemove: () => void;
  dragModule: string | null;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  const definition = getModuleDefinition(moduleId);
  const [itemText, setItemText] = useState("");

  function patch(mutator: (next: ProjectModule) => void) {
    const next = JSON.parse(JSON.stringify(moduleValue || {})) as ProjectModule;
    mutator(next);
    onChange(next);
  }

  return (
    <article className={dragModule === moduleId ? "module-editor dragging" : "module-editor"} draggable onDragStart={onDragStart} onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
      <header>
        <span className="drag-handle">
          <GripVertical size={17} />
        </span>
        <div>
          <strong>{definition?.label || moduleId}</strong>
          <small>{definition?.description}</small>
        </div>
        <button className="icon-danger" onClick={onRemove}>
          <Trash2 size={16} />
        </button>
      </header>
      <div className="form-grid">
        <Field label="Título ES" value={moduleValue.title?.es || ""} onChange={(value) => patch((next) => (next.title = { ...(next.title || {}), es: value }))} />
        <Field label="Título EN" value={moduleValue.title?.en || ""} onChange={(value) => patch((next) => (next.title = { ...(next.title || { es: "" }), en: value }))} />
      </div>
      <TextField label="Contenido ES" value={moduleValue.body?.es || ""} onChange={(value) => patch((next) => (next.body = { ...(next.body || {}), es: value }))} />
      <TextField label="Contenido EN" value={moduleValue.body?.en || ""} onChange={(value) => patch((next) => (next.body = { ...(next.body || { es: "" }), en: value }))} />
      <div className="rich-toolbar">
        <button onClick={() => patch((next) => (next.body = { ...(next.body || {}), es: `${next.body?.es || ""}\n**texto en negrita**` }))}>Negrita</button>
        <button onClick={() => patch((next) => (next.body = { ...(next.body || {}), es: `${next.body?.es || ""}\n- item` }))}>Lista</button>
        <button onClick={() => patch((next) => (next.body = { ...(next.body || {}), es: `${next.body?.es || ""}\n[link](https://)` }))}>Link</button>
        <button onClick={() => patch((next) => (next.body = { ...(next.body || {}), es: `${next.body?.es || ""}\n> bloque destacado` }))}>Destacado</button>
      </div>
      <div className="item-editor">
        <input value={itemText} onChange={(event) => setItemText(event.target.value)} placeholder="Agregar item/lista/métrica" />
        <button
          onClick={() => {
            if (!itemText.trim()) {
              return;
            }
            patch((next) => {
              next.items ||= [];
              next.items.push(itemText.trim());
            });
            setItemText("");
          }}
        >
          Agregar
        </button>
      </div>
      {Array.isArray(moduleValue.items) && moduleValue.items.length > 0 && (
        <div className="chip-row">
          {moduleValue.items.map((item, index) => (
            <button key={`${String(item)}-${index}`} className="chip" onClick={() => patch((next) => next.items?.splice(index, 1))}>
              {typeof item === "string" ? item : item.label || item.title || item.value}
              <X size={13} />
            </button>
          ))}
        </div>
      )}
      {definition?.type === "code" && <TextField label="Código" value={moduleValue.code || ""} rows={6} onChange={(value) => patch((next) => (next.code = value))} />}
    </article>
  );
}

function TemplatePreviewArt({ templateId }: { templateId: string }) {
  return (
    <div className={`template-preview ${templateId}`}>
      <span className="template-preview-hero" />
      <span className="template-preview-line" />
      <span className="template-preview-line short" />
      <span className="template-preview-card one" />
      <span className="template-preview-card two" />
      <span className="template-preview-card three" />
    </div>
  );
}

function TemplateShowcasePreview({
  draft,
  template,
  isSelected,
  onUse,
}: {
  draft: ProjectDraft;
  template: VisualTemplateDefinition;
  isSelected: boolean;
  onUse: () => void;
}) {
  const previewSource = getDraftPreviewSource(draft);
  const category = getCategory(draft.category);

  return (
    <section className={`template-showcase ${template.id}`}>
      <div className="template-showcase-copy">
        <p className="eyebrow">Preview visual</p>
        <h3>{template.name}</h3>
        <span>{template.description}</span>
        <small>{template.bestFor}</small>
        <button type="button" className={isSelected ? "secondary-button selected-template-button" : "primary-button selected-template-button"} onClick={onUse}>
          {isSelected ? <Check size={17} /> : <Wand2 size={17} />}
          {isSelected ? "Plantilla activa" : "Usar esta plantilla"}
        </button>
      </div>

      <div className="template-showcase-canvas">
        <div className="template-browser-bar">
          <span />
          <span />
          <span />
        </div>
        <div className="template-showcase-page">
          <div className="template-showcase-heading">
            <p>{draft.copy.es.accent || category.label.es}</p>
            <h4>{draft.copy.es.title || "Nombre del proyecto"}</h4>
            <span>{draft.copy.es.description || "Narrativa breve, visual claro y módulos adaptados al tipo de proyecto."}</span>
          </div>
          <div className="template-showcase-media">
            <AssetImage src={previewSource} fallback={<TemplatePreviewArt templateId={template.id} />} />
          </div>
          <div className="template-showcase-stats">
            <span>{draft.year || "2026"}</span>
            <span>{statusLabels[draft.status]}</span>
            <span>{draft.stack[0] || "Stack"}</span>
          </div>
          <div className="template-showcase-blocks">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectPreview({ draft, previewSize }: { draft: ProjectDraft; previewSize: PreviewSize }) {
  const modules = draft.modulesOrder.filter((moduleId) => {
    const module = draft.modules[moduleId];
    return module && (module.body?.es || module.items?.length || module.code || module.links?.length);
  });
  const previewSource = getDraftPreviewSource(draft);

  return (
    <div className={`preview-frame ${previewSize}`}>
      <section className={`preview-page ${draft.visualTemplate}`}>
        <div className="preview-hero">
          <div>
            <p>{draft.copy.es.accent || getCategory(draft.category).label.es}</p>
            <h1>{draft.copy.es.title || "Título del proyecto"}</h1>
            <span>{draft.copy.es.description || "Descripción corta del proyecto."}</span>
            <div className="chip-row">
              {draft.stack.slice(0, 5).map((tech) => (
                <span className="chip" key={tech}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="preview-cover">
            <AssetImage src={previewSource} fallback={<Wand2 size={44} />} />
          </div>
        </div>
        <div className="preview-card-row">
          <div>
            <small>Estado</small>
            <strong>{statusLabels[draft.status]}</strong>
          </div>
          <div>
            <small>Featured</small>
            <strong>{featuredLabels[draft.featuredLevel]}</strong>
          </div>
          <div>
            <small>Plantilla</small>
            <strong>{getTemplate(draft.visualTemplate).name}</strong>
          </div>
        </div>
        {draft.media.video.youtubeId && (
          <div className="preview-video">
            <iframe title="YouTube preview" src={`https://www.youtube.com/embed/${draft.media.video.youtubeId}`} />
          </div>
        )}
        <div className="preview-modules">
          {modules.map((moduleId) => {
            const module = draft.modules[moduleId];
            return (
              <article key={moduleId}>
                <p>{getModuleDefinition(moduleId)?.label || moduleId}</p>
                <h3>{module.title?.es || getModuleDefinition(moduleId)?.label || moduleId}</h3>
                <span>{module.body?.es || module.items?.map((item) => (typeof item === "string" ? item : item.label || item.title)).join(", ")}</span>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default App;
