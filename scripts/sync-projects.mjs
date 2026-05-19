import path from "node:path";
import { generatedProjectsFile, rootDir, syncGeneratedProjects } from "./project-utils.mjs";

const projects = await syncGeneratedProjects();
const outputPath = path.relative(rootDir, generatedProjectsFile).replaceAll(path.sep, "/");

console.log(`Proyectos sincronizados: ${projects.length} -> ${outputPath}`);
