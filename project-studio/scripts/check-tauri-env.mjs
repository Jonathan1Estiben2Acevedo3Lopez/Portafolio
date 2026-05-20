import { spawnSync } from "node:child_process";

function commandExists(command) {
  const result = spawnSync(command, ["--version"], {
    encoding: "utf8",
  });

  return result.status === 0;
}

const hasCargo = commandExists("cargo");
const hasRustc = commandExists("rustc");

if (!hasCargo || !hasRustc) {
  console.error(`
Project Studio necesita Rust/Cargo para ejecutar Tauri.

No encuentro ${!hasCargo ? "cargo" : ""}${!hasCargo && !hasRustc ? " ni " : ""}${!hasRustc ? "rustc" : ""} en PATH.

Instalacion recomendada en Windows:
  winget install Rustlang.Rustup

Despues cierra y abre de nuevo PowerShell, y verifica:
  cargo --version
  rustc --version

Cuando ambos funcionen, ejecuta:
  npm run studio:dev
`);
  process.exit(1);
}
