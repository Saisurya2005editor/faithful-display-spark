import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Database,
  FileText,
  FileUp,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { AdminGate } from "@/components/AdminGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteDocument,
  ingestDocument,
  listIndexedDocuments,
  reindexDocument,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/ingest")({
  head: () => ({
    meta: [
      { title: "Admin — Ingest BIS documents | BISmart" },
      { name: "description", content: "Upload Indian Standards PDFs to the BISmart knowledge base." },
      { property: "og:title", content: "BISmart admin — document ingestion" },
      { property: "og:description", content: "Upload and index real BIS documents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IngestPage,
});

interface PendingFile {
  key: string;
  file: File;
  standardNumber: string;
  title: string;
  division: string;
  year: string;
  sourceUrl: string;
  status: "queued" | "working" | "done" | "error";
  steps: string[];
  error?: string;
}

interface IndexedDoc {
  id: string;
  standard_number: string;
  title: string;
  division: string | null;
  year: number | null;
  source_url: string | null;
  data_origin: string;
  created_at: string;
  chunkCount: number;
}

const uid = () => crypto.randomUUID();

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      resolve(url.slice(url.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function IngestPage() {
  return (
    <AdminGate>
      <IngestBody />
    </AdminGate>
  );
}

function IngestBody() {
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [docs, setDocs] = useState<IndexedDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const refreshDocs = useCallback(() => {
    setLoadingDocs(true);
    void listIndexedDocuments()
      .then((d) => setDocs(d as IndexedDoc[]))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoadingDocs(false));
  }, []);

  useEffect(refreshDocs, [refreshDocs]);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: PendingFile[] = [...files].map((f) => ({
      key: uid(),
      file: f,
      standardNumber: f.name.replace(/\.(pdf|txt)$/i, "").replace(/[-_]+/g, " ").slice(0, 60),
      title: f.name.replace(/\.(pdf|txt)$/i, ""),
      division: "",
      year: "",
      sourceUrl: "",
      status: "queued",
      steps: [],
    }));
    setPending((prev) => [...prev, ...next]);
  };

  const updatePending = (key: string, patch: Partial<PendingFile>) =>
    setPending((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  const ingestOne = async (p: PendingFile) => {
    updatePending(p.key, { status: "working", steps: ["Parsing…"], error: undefined });
    try {
      const contentBase64 = await readAsBase64(p.file);
      updatePending(p.key, { steps: ["Parsing…", "Chunking & embedding…"] });
      const result = await ingestDocument({
        data: {
          fileName: p.file.name,
          contentBase64,
          isPdf: p.file.name.toLowerCase().endsWith(".pdf"),
          standardNumber: p.standardNumber.trim() || p.file.name,
          title: p.title.trim() || p.file.name,
          division: p.division.trim(),
          year: p.year.trim() ? Number(p.year.trim()) : null,
          sourceUrl: p.sourceUrl.trim(),
        },
      });
      updatePending(p.key, { status: "done", steps: result.steps });
      toast.success(`${p.file.name}: indexed ${result.chunkCount} chunks`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ingestion failed";
      updatePending(p.key, { status: "error", error: msg });
      toast.error(msg);
    }
  };

  const ingestAll = async () => {
    setBusy(true);
    for (const p of pending.filter((x) => x.status === "queued" || x.status === "error")) {
      await ingestOne(p);
    }
    setBusy(false);
    refreshDocs();
  };

  const removeDoc = (id: string) => {
    void deleteDocument({ data: { documentId: id } })
      .then(() => {
        toast.success("Document deleted");
        refreshDocs();
      })
      .catch((e: Error) => toast.error(e.message));
  };

  const reindex = (id: string) => {
    toast.info("Re-indexing embeddings…");
    void reindexDocument({ data: { documentId: id } })
      .then((r) => toast.success(`Re-indexed ${r.reindexed} chunks`))
      .catch((e: Error) => toast.error(e.message));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Database className="h-6 w-6 text-accent" aria-hidden />
        Knowledge base ingestion
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload real Indian Standards / BIS scheme documents (text-based PDF or .txt). Each is parsed,
        chunked, embedded and stored — then cited as <strong>Verified source</strong> in answers.
      </p>

      {/* Upload zone */}
      <div
        className="mt-6 rounded-xl border-2 border-dashed border-border bg-card p-8 text-center transition-colors hover:border-accent"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
      >
        <UploadCloud className="mx-auto h-8 w-8 text-accent" aria-hidden />
        <p className="mt-2 text-sm font-medium">Drag PDFs or text files here</p>
        <Button variant="outline" className="mt-3" onClick={() => fileInput.current?.click()}>
          <FileUp className="mr-2 h-4 w-4" /> Browse files
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.txt"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Pending uploads */}
      {pending.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Uploads ({pending.length})</h2>
            <Button onClick={() => void ingestAll()} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ingest all
            </Button>
          </div>
          <div className="mt-3 space-y-3">
            {pending.map((p) => (
              <div key={p.key} className="card-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                  <span className="text-sm font-medium">{p.file.name}</span>
                  <Badge
                    variant="outline"
                    className={
                      p.status === "done"
                        ? "border-success/40 text-success"
                        : p.status === "error"
                          ? "border-destructive/40 text-destructive"
                          : p.status === "working"
                            ? "border-accent/40 text-accent-foreground"
                            : ""
                    }
                  >
                    {p.status === "working" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                    {p.status}
                  </Badge>
                  {p.status !== "working" && (
                    <button
                      className="ml-auto text-xs text-muted-foreground underline hover:text-foreground"
                      onClick={() => setPending((prev) => prev.filter((x) => x.key !== p.key))}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {p.status === "queued" && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    <Input
                      value={p.standardNumber}
                      onChange={(e) => updatePending(p.key, { standardNumber: e.target.value })}
                      placeholder="Standard number (e.g. IS 302)"
                      aria-label="Standard number"
                    />
                    <Input
                      value={p.title}
                      onChange={(e) => updatePending(p.key, { title: e.target.value })}
                      placeholder="Title"
                      aria-label="Title"
                    />
                    <Input
                      value={p.division}
                      onChange={(e) => updatePending(p.key, { division: e.target.value })}
                      placeholder="Division"
                      aria-label="Division"
                    />
                    <Input
                      value={p.year}
                      onChange={(e) => updatePending(p.key, { year: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="Year"
                      aria-label="Year"
                      inputMode="numeric"
                    />
                    <Input
                      value={p.sourceUrl}
                      onChange={(e) => updatePending(p.key, { sourceUrl: e.target.value })}
                      placeholder="Source URL"
                      aria-label="Source URL"
                    />
                  </div>
                )}
                {p.steps.length > 0 && (
                  <ol className="mt-3 space-y-1">
                    {p.steps.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
                        {s}
                      </li>
                    ))}
                  </ol>
                )}
                {p.error && <p className="mt-2 text-xs text-destructive">{p.error}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Indexed documents */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Indexed documents ({docs.length})</h2>
          <Button variant="ghost" size="sm" onClick={refreshDocs}>
            <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
          </Button>
        </div>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Standard</th>
                <th className="px-4 py-2.5">Title</th>
                <th className="px-4 py-2.5">Year</th>
                <th className="px-4 py-2.5">Chunks</th>
                <th className="px-4 py-2.5">Origin</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingDocs ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : (
                docs.map((d) => (
                  <tr key={d.id} className="border-t border-border">
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold">{d.standard_number}</td>
                    <td className="max-w-[280px] truncate px-4 py-2.5">{d.title}</td>
                    <td className="px-4 py-2.5">{d.year ?? "—"}</td>
                    <td className="px-4 py-2.5">{d.chunkCount}</td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant="outline"
                        className={
                          d.data_origin === "Verified source"
                            ? "border-success/40 text-success"
                            : "border-warning/40 text-warning-foreground"
                        }
                      >
                        {d.data_origin}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => reindex(d.id)} aria-label="Re-index">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeDoc(d.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
