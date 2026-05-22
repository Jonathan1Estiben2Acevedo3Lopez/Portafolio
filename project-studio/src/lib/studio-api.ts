import { invoke } from "@tauri-apps/api/core";
import type { AssetInput, ProjectDraft, ProjectSummary, Technology } from "../types";

export async function listProjects() {
  return invoke<ProjectSummary[]>("list_projects");
}

export async function readProject(slug: string) {
  return invoke<unknown>("read_project", { slug });
}

export async function saveProject(originalSlug: string | undefined, project: unknown, assets: AssetInput[]) {
  return invoke<{ slug: string; jsonPath: string; assetPaths: string[] }>("save_project", {
    payload: {
      originalSlug,
      project,
      assets,
    },
  });
}

export async function duplicateProject(sourceSlug: string, targetSlug: string, copyAssets: boolean) {
  return invoke<ProjectDraft>("duplicate_project", {
    payload: {
      sourceSlug,
      targetSlug,
      copyAssets,
    },
  });
}

export async function deleteProject(slug: string, deleteJson: boolean, deleteAssets: boolean, deleteAssetFolder: boolean) {
  return invoke<void>("delete_project", {
    payload: {
      slug,
      deleteJson,
      deleteAssets,
      deleteAssetFolder,
    },
  });
}

export async function saveTechnology(technology: Technology) {
  return invoke<Technology[]>("save_technology", { technology });
}

export async function readAssetDataUrl(reference: string) {
  return invoke<string>("read_asset_data_url", { reference });
}

export async function runSyncProjects() {
  return invoke<string>("run_sync_projects");
}

export async function openPreview(slug: string) {
  return invoke<void>("open_preview", { slug });
}
