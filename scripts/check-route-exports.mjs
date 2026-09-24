#!/usr/bin/env node
/**
 * Keep TanStack Router route modules limited to their route export.
 *
 * The router lazy-loads route modules. Exporting reusable page code from one
 * of those modules can make that code load with the route and trigger a
 * code-splitting warning, so this check treats `Route` as the only allowed
 * public export.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, join, sep } from "node:path";
import ts from "typescript";
import { isMainModule, projectRoot } from "./with-app-env.mjs";

const ROUTES_REL_PATH = "src/routes";
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const ALLOWED_EXPORT = "Route";

function sourceExtension(filePath) {
  const dot = filePath.lastIndexOf(".");
  return dot === -1 ? "" : filePath.slice(dot);
}

function routeSourceFiles(routesDir) {
  try {
    if (!statSync(routesDir).isDirectory()) return [];
  } catch {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(routesDir, { withFileTypes: true })) {
    const entryPath = join(routesDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...routeSourceFiles(entryPath));
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(sourceExtension(entry.name))) {
      files.push(entryPath);
    }
  }
  return files.sort();
}

function hasModifier(node, kind) {
  return node.modifiers?.some((modifier) => modifier.kind === kind) ?? false;
}

function declarationNames(declaration) {
  const names = [];
  function collect(name) {
    if (ts.isIdentifier(name)) {
      names.push(name.text);
    } else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
      for (const element of name.elements) {
        if (ts.isBindingElement(element)) collect(element.name);
      }
    }
  }
  collect(declaration.name);
  return names;
}

function exportedNames(statement) {
  if (ts.isExportAssignment(statement)) return ["default"];

  if (ts.isExportDeclaration(statement)) {
    if (!statement.exportClause) return ["*"];
    if (ts.isNamespaceExport(statement.exportClause)) {
      return [statement.exportClause.name.text];
    }
    return statement.exportClause.elements.map((element) => element.name.text);
  }

  if (!hasModifier(statement, ts.SyntaxKind.ExportKeyword)) return [];
  if (hasModifier(statement, ts.SyntaxKind.DefaultKeyword)) return ["default"];

  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.flatMap(declarationNames);
  }

  return statement.name && ts.isIdentifier(statement.name) ? [statement.name.text] : [];
}

/**
 * Find public exports in one route source file that are not `Route`.
 *
 * The returned line is one-based and points to the export declaration, making
 * the CLI output useful without requiring a second search.
 */
export function findRouteExportViolations(source, filePath) {
  const scriptKind = sourceExtension(filePath) === ".tsx" ? ts.ScriptKind.TSX : undefined;
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );
  const violations = [];

  for (const statement of sourceFile.statements) {
    for (const name of exportedNames(statement)) {
      if (name === ALLOWED_EXPORT) continue;
      const { line } = sourceFile.getLineAndCharacterOfPosition(statement.getStart(sourceFile));
      violations.push({ exportName: name, line: line + 1 });
    }
  }

  return violations;
}

/**
 * Check all source route modules below `root/src/routes`.
 */
export function checkRouteExports(root = projectRoot()) {
  const routesDir = join(root, ROUTES_REL_PATH);
  const files = routeSourceFiles(routesDir);
  const violations = [];

  for (const filePath of files) {
    const relativePath = relative(root, filePath).split(sep).join("/");
    for (const violation of findRouteExportViolations(readFileSync(filePath, "utf8"), filePath)) {
      violations.push({ ...violation, filePath: relativePath });
    }
  }

  return { files, violations };
}

export function formatRouteExportViolation(violation) {
  return (
    `[route-exports] ${violation.filePath}:${violation.line} exports ` +
    `"${violation.exportName}". Route modules may only export "Route"; ` +
    "move reusable page code to another module to preserve code splitting."
  );
}

function parseArgs(argv) {
  const rootFlag = argv.indexOf("--root");
  if (rootFlag === -1) {
    if (argv.length > 0) {
      throw new Error("usage: node scripts/check-route-exports.mjs [--root <path>]");
    }
    return projectRoot();
  }
  if (rootFlag !== 0 || argv.length !== 2 || !argv[1]) {
    throw new Error("usage: node scripts/check-route-exports.mjs [--root <path>]");
  }
  return argv[1];
}

function main(argv) {
  let root;
  try {
    root = parseArgs(argv);
  } catch (error) {
    console.error(`[route-exports] ${error.message}`);
    return 2;
  }

  const result = checkRouteExports(root);
  if (result.violations.length > 0) {
    for (const violation of result.violations) {
      console.error(formatRouteExportViolation(violation));
    }
    return 1;
  }

  console.log(
    `[route-exports] checked ${result.files.length} route module(s); all exports are valid.`,
  );
  return 0;
}

if (isMainModule(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
