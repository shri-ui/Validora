import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Download,
  Trash2,
  RotateCw,
  FileText,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Workspace, PageHeading, NewIdeaLink, EmptyState } from "./shell";
import { ReportDialog } from "./report";
import { deleteHistoryItem, loadHistory } from "@/lib/api";
import {
  getValidations,
  downloadReport,
  type Validation,
} from "@/lib/preview-data";
export function HistoryPage({ reports = false }: { reports?: boolean }) {
  const [items, setItems] = useState(getValidations);
  const [search, setSearch] = useState("");
  const [verdict, setVerdict] = useState("All verdicts");
  const [status, setStatus] = useState("All statuses");
  const [order, setOrder] = useState("Newest first");
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState<Validation | null>(null);
  const [page, setPage] = useState(1);
  useEffect(() => {
    const refresh = () => setItems(getValidations());
    void loadHistory().then(() => setItems(getValidations())).catch((error) => toast.error(error instanceof Error ? error.message : "Could not load validation history."));
    window.addEventListener("validora-history-change", refresh);
    return () => window.removeEventListener("validora-history-change", refresh);
  }, []);
  const filtered = items
    .filter(
      (v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) &&
        (verdict === "All verdicts" || v.verdict === verdict) &&
        (status === "All statuses" || v.status === status) &&
        (!date || v.date >= date),
    )
    .sort((a, b) =>
      order === "Newest first"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / 5));
  const current = Math.min(page, pages);
  async function remove(item: Validation) {
    if (!window.confirm(`Delete the validation “${item.name}” from your history?`)) return;
    try {
      if (item.apiPayload?.historyId) await deleteHistoryItem(item.apiPayload.historyId);
      setItems((current) => current.filter((v) => v.id !== item.id));
      toast.success("Validation deleted from your history.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete validation."); }
  }
  return (
    <Workspace title={reports ? "Saved reports" : "Validation history"}>
      <PageHeading
        title={reports ? "Your ideas, documented." : "Every idea has a story."}
        description={
          reports
            ? "Revisit your research and take your next step with confidence."
            : "A little perspective on everything you’ve explored."
        }
        action={<NewIdeaLink />}
      />
      <div className="notice mb-6">
        <FileText size={17} />
        <span>
          Your completed validations are saved to your account and available across devices.
        </span>
      </div>
      <div className="section-heading">
        <h2>
          {reports ? "Saved reports" : "Validation history"}{" "}
          <span className="count-tag">{items.length}</span>
        </h2>
        <span className="subtle-text">Saved to your account</span>
      </div>
      <div className="filter-bar">
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Search startup ideas"
            placeholder="Search startup ideas…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          aria-label="Filter by verdict"
          value={verdict}
          onChange={(e) => setVerdict(e.target.value)}
        >
          {["All verdicts", "Go", "Caution", "No-Go"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        {!reports && (
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {[
              "All statuses",
              "Pending",
              "Running",
              "Completed",
              "Partially Completed",
              "Failed",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        )}
        <input
          type="date"
          aria-label="Submitted after"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select
          aria-label="Sort validations"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        >
          <option>Newest first</option>
          <option>Oldest first</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No ideas found"
          text="There are no saved validations matching these filters."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setVerdict("All verdicts");
                setStatus("All statuses");
                setDate("");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="history-list">
          {filtered.slice((current - 1) * 5, current * 5).map((v) => (
            <article className="history-item" key={v.id}>
              <span className="history-icon tone-violet">
                <Lightbulb size={24} />
              </span>
              <div className="history-description">
                <span className="eyebrow">{v.category}</span>
                <h3>{v.name}</h3>
                <p>{v.description}</p>
                <div className="history-meta">
                  <span>
                    {new Date(v.date + "T12:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </span>
                  <span>·</span>
                  <span>{v.status}</span>
                </div>
              </div>
              <div className="history-score">
                <strong>
                  {v.score}
                  <span>/100</span>
                </strong>
                <span
                  className={`badge ${v.verdict === "Go" ? "badge-green" : v.verdict === "Caution" ? "badge-amber" : "badge-red"}`}
                >
                  {v.verdict}
                </span>
              </div>
              <div className="history-actions">
                <Button variant="outline" onClick={() => setSelected(v)}>
                  View report
                  <ArrowUpRight />
                </Button>
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Download PDF report"
                    aria-label={`Download ${v.name}`}
                    onClick={() => downloadReport(v)}
                  >
                    <Download />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Re-run validation"
                    aria-label={`Re-run ${v.name}`}
                    onClick={() => {
                      toast.info(
                        "Re-run this idea from the overview page.",
                      );
                    }}
                  >
                    <RotateCw />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete validation"
                    aria-label={`Delete ${v.name}`}
                    onClick={() => remove(v)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="pagination-row">
        <span>
          Showing {filtered.length === 0 ? 0 : (current - 1) * 5 + 1}–
          {Math.min(current * 5, filtered.length)} of {filtered.length}{" "}
          validations
        </span>
        <div>
          <Button
            variant="outline"
            size="icon"
            disabled={current === 1}
            aria-label="Previous page"
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft />
          </Button>
          <span>
            {current} / {pages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={current === pages}
            aria-label="Next page"
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <ReportDialog item={selected} onClose={() => setSelected(null)} />
    </Workspace>
  );
}
