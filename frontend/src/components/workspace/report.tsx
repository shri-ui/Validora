import { useState } from "react";
import {
  BarChart3,
  Users,
  GitBranch,
  Target,
  Download,
  ArrowUpRight,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { agents, downloadReport, type Validation } from "@/lib/preview-data";
import { MarkdownContent } from "@/components/workspace/markdown-content";
import { toast } from "sonner";
export const agentIcons = [Target, BarChart3, Users, GitBranch];
export function ReportDialog({
  item,
  onClose,
}: {
  item: Validation | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(0);
  const finding = item?.results?.[tab];
  async function download() {
    if (!item) return;
    try { await downloadReport(item); toast.success("PDF report downloaded."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not download report."); }
  }
  return (
    <Dialog
      open={Boolean(item)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="report-dialog">
        <DialogHeader>
          <div className="eyebrow">VALIDATION REPORT</div>
          <DialogTitle>{item?.name}</DialogTitle>
          <DialogDescription>
            {item?.date} · {item?.apiPayload ? `${item.apiPayload.elapsed}s` : "Saved validation"}
          </DialogDescription>
        </DialogHeader>
        {item && (
          <>
            <div className="report-overview">
              <div className="report-score">
                {item.score ?? "—"}
                <span>/100</span>
              </div>
              <div>
                <span
                  className={`badge ${item.verdict === "Go" ? "badge-green" : item.verdict === "Caution" ? "badge-amber" : "badge-red"}`}
                >
                  {item.verdict}
                </span>
                <h3>Executive summary</h3>
                <p>{item.apiPayload?.summary ?? item.description}</p>
              </div>
            </div>
            <div className="notice">
              <Info size={17} />
              <span>
                {item.apiPayload ? `Live research results${item.apiPayload.cached ? " · served from cache" : ""}.` : "No research evidence is attached to this saved item."}
              </span>
            </div>
            <div className="agent-tabs">
              {agents.map((agent, i) => (
                <Button
                  variant={tab === i ? "secondary" : "ghost"}
                  key={agent.name}
                  onClick={() => setTab(i)}
                >
                  {agent.name}
                </Button>
              ))}
            </div>
            <div className="report-finding">
              <h3>{agents[tab]?.name ?? "Research findings"}</h3>
              {finding?.findings ? <MarkdownContent text={finding.findings} /> : <p>{(
                [
                    "Assess direct and indirect competitors, differentiation, and barriers to entry.",
                    "Estimate addressable market, reachable customers, and growth assumptions.",
                    "Review customer conversations, unmet needs, and willingness to pay.",
                    "Assess open-source alternatives, dependencies, licensing, and maintenance risk.",
                ][tab]
              )}</p>}
              {finding?.sources?.length ? <div className="source-list">{finding.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title || source.domain || source.url} <ArrowUpRight size={13} /></a>)}</div> : <div className="evidence-empty">No source links were returned for this agent.</div>}
            </div>
            <div className="dialog-actions">
              <span>
                <CheckCircle2 size={15} />
                {item.apiPayload ? "Research complete" : "Saved validation"}
              </span>
              <Button onClick={download}>
                <Download />
                Download PDF report
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
