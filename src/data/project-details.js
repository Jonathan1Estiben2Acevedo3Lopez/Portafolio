import projectCards from "./projects.generated.json";

const categoryLabels = {
  web: "Web",
  branding: "Marca",
  automation: "Automatizacion",
};

function buildProjectDetail(project) {
  const copy = project.copy?.es ?? {};
  const detail = project.detail ?? {};

  return {
    ...project,
    title: detail.title ?? copy.title ?? project.slug,
    accent: detail.accent ?? copy.accent ?? "",
    tag: detail.tag ?? copy.tag ?? "",
    category: detail.category ?? categoryLabels[project.category] ?? project.category,
    summary: detail.summary ?? copy.description ?? "",
    overview: detail.overview ?? "",
    challenge: detail.challenge ?? "",
    solution: detail.solution ?? "",
    results: detail.results ?? [],
    stack: detail.stack ?? [],
    deliverables: detail.deliverables ?? [],
    metrics: detail.metrics ?? [],
    modules: detail.modules ?? [],
    flow: detail.flow ?? [],
    interactiveTitle: detail.interactiveTitle,
    interactiveDescription: detail.interactiveDescription,
    previewImage: detail.previewImage ?? project.previewImage,
    visualClass: detail.visualClass ?? project.visualClass,
    liveUrl: detail.liveUrl ?? project.liveUrl,
  };
}

export const projectDetails = projectCards.filter((project) => project.detail).map(buildProjectDetail);

export function getProjectDetailBySlug(slug) {
  return projectDetails.find((project) => project.slug === slug);
}
