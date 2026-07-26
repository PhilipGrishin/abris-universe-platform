/**
 * Phase 0 application shell: import one OXS file, open the local Project, and
 * keep progress across reload without a network dependency.
 */
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { emitEngineeringEvidence } from "./engineering-evidence.ts";
import { issueMessage, formatCount } from "./messages.ts";
import {
  ImportRejectedError,
  ProjectService,
  isImportBoundaryError,
  type LoadedProject,
} from "./project-service.ts";
import { PatternViewer } from "./viewer.tsx";

type AppState =
  | { readonly status: "starting" }
  | { readonly status: "empty" }
  | { readonly status: "importing"; readonly filename: string }
  | {
      readonly status: "error";
      readonly message: string;
      readonly report: ImportRejectedError["report"] | null;
    }
  | { readonly status: "ready"; readonly loaded: LoadedProject };

function codedError(error: unknown): string | null {
  if (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return null;
}

export function App() {
  const service = useRef<ProjectService | null>(null);
  const importAbort = useRef<AbortController | null>(null);
  const [state, setState] = useState<AppState>({ status: "starting" });

  useEffect(() => {
    let active = true;
    let opened: ProjectService | null = null;
    void ProjectService.open()
      .then(async (nextService) => {
        opened = nextService;
        if (!active) {
          nextService.close();
          return;
        }
        service.current = nextService;
        const loaded = await nextService.loadActiveProject();
        if (active) {
          setState(loaded === null ? { status: "empty" } : { status: "ready", loaded });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: "error",
            message: issueMessage(codedError(error) ?? ""),
            report: null,
          });
        }
      });
    return () => {
      active = false;
      importAbort.current?.abort();
      opened?.close();
      if (service.current === opened) service.current = null;
    };
  }, []);

  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file === undefined || service.current === null) return;
    importAbort.current?.abort();
    const controller = new AbortController();
    importAbort.current = controller;
    const importStartedAt = performance.now();
    setState({ status: "importing", filename: file.name });
    try {
      const loaded = await service.current.importFile(file, controller.signal);
      emitEngineeringEvidence(
        "import-latency",
        performance.now() - importStartedAt,
        loaded.summary.stitchCount,
      );
      setState({ status: "ready", loaded });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (error instanceof ImportRejectedError) {
        setState({
          status: "error",
          message: issueMessage(error.report.errors[0]?.code ?? ""),
          report: error.report,
        });
        return;
      }
      setState({
        status: "error",
        message: isImportBoundaryError(error)
          ? issueMessage(error.code)
          : issueMessage(codedError(error) ?? ""),
        report: null,
      });
    }
  };

  const loaded = state.status === "ready" ? state.loaded : null;

  return (
    <main>
      <header className="app-header">
        <a className="brand" href="/" aria-label="Abris Universe home">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>
            <strong>Abris Universe</strong>
            <small>Pattern workspace</small>
          </span>
        </a>
        <label className="import-button">
          <span>{state.status === "importing" ? "Importing…" : "Import OXS"}</span>
          <input
            type="file"
            accept=".oxs,application/xml,text/xml"
            disabled={state.status === "starting" || state.status === "importing"}
            onChange={(event) => void selectFile(event)}
          />
        </label>
      </header>

      {state.status === "starting" && (
        <section className="center-card" aria-live="polite">
          <p className="eyebrow">Local workspace</p>
          <h1>Opening your project</h1>
          <p>Checking local storage and recovering any interrupted import.</p>
        </section>
      )}

      {state.status === "empty" && (
        <section className="hero">
          <div>
            <p className="eyebrow">Phase 0 · local-first</p>
            <h1>Your pattern, ready to follow stitch by stitch.</h1>
            <p className="hero-copy">
              Import a supported OXS 1.0 file. Your original chart and progress
              stay in this browser and remain available after reload.
            </p>
            <label className="import-button import-button-large">
              <span>Choose an OXS file</span>
              <input
                type="file"
                accept=".oxs,application/xml,text/xml"
                onChange={(event) => void selectFile(event)}
              />
            </label>
          </div>
          <aside aria-label="Import boundaries">
            <span className="aside-number">01</span>
            <h2>One clear route</h2>
            <p>OXS 1.0 from the registered Abris route-1 producer.</p>
            <span className="aside-number">02</span>
            <h2>Private by design</h2>
            <p>No upload and no account. Import runs in an isolated Worker.</p>
          </aside>
        </section>
      )}

      {state.status === "importing" && (
        <section className="center-card" aria-live="assertive">
          <div className="spinner" aria-hidden="true" />
          <p className="eyebrow">Import in progress</p>
          <h1>Reading {state.filename}</h1>
          <p>The chart is being validated and converted outside the UI thread.</p>
        </section>
      )}

      {state.status === "error" && (
        <section className="error-card" role="alert">
          <p className="eyebrow">Import not completed</p>
          <h1>We could not open this pattern.</h1>
          <p>{state.message}</p>
          {state.report !== null && (
            <p className="report-meta">
              {state.report.errors.length} error
              {state.report.errors.length === 1 ? "" : "s"} ·{" "}
              {state.report.warnings.length} warning
              {state.report.warnings.length === 1 ? "" : "s"}
            </p>
          )}
          <label className="import-button">
            <span>Try another OXS file</span>
            <input
              type="file"
              accept=".oxs,application/xml,text/xml"
              onChange={(event) => void selectFile(event)}
            />
          </label>
        </section>
      )}

      {loaded !== null && service.current !== null && (
        <>
          <section className="project-summary" aria-label="Imported project summary">
            <div>
              <span>Grid</span>
              <strong>{loaded.summary.grid.width} × {loaded.summary.grid.height}</strong>
            </div>
            <div>
              <span>Stitches</span>
              <strong>{formatCount(loaded.summary.stitchCount)}</strong>
            </div>
            <div>
              <span>Thread colors</span>
              <strong>
                {formatCount(
                  loaded.pattern.paletteItems.filter((item) => item.role === "thread").length,
                )}
              </strong>
            </div>
            <div>
              <span>Import report</span>
              <strong>
                {loaded.report.warnings.length === 0
                  ? "No warnings"
                  : `${loaded.report.warnings.length} warning${loaded.report.warnings.length === 1 ? "" : "s"}`}
              </strong>
            </div>
          </section>
          {loaded.persistenceCapability?.granted === false && (
            <p className="durability-warning" role="status">
              This browser did not grant persistent storage. Progress is saved
              locally, but the browser may remove it under storage pressure.
            </p>
          )}
          <PatternViewer loaded={loaded} service={service.current} />
        </>
      )}
    </main>
  );
}
