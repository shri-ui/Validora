import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Lightbulb,
  Check,
  Clock3,
  ChevronDown,
  Plus,
  ShieldCheck,
  FileText,
  TrendingUp,
  CircleCheck,
  Ellipsis,
  LoaderCircle,
  Info,
  Circle,
  CircleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import rocket from "@/assets/startup-launch.jpg";
import { getValidations, mapValidation, agents, type Validation } from "@/lib/preview-data";
import { getStoredUser, getToken, loadHistory, validateStartup, type ValidationProgress, type ValidationResponse } from "@/lib/api";
import { Workspace, PageHeading } from "./shell";
import { agentIcons, ReportDialog } from "./report";
const agentKeys = ["competitor_analysis", "market_sizing", "community_sentiment", "os_risk"];
type AgentRunStatus = "waiting" | "running" | "complete" | "failed";
const initialAgentProgress = () => Object.fromEntries(agentKeys.map((key) => [key, "waiting" as AgentRunStatus]));
export function Dashboard() {
  const [idea, setIdea] = useState("");
  const [busy, setBusy] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [selected, setSelected] = useState<Validation | null>(null);
  const [items, setItems] = useState(getValidations);
  const [user, setUser] = useState(getStoredUser);
  const [agentProgress, setAgentProgress] = useState<Record<string, AgentRunStatus>>(initialAgentProgress);
  const [progressPhase, setProgressPhase] = useState<"idle" | "research" | "scoring" | "complete">("idle");
  useEffect(() => {
    const refresh = () => { setItems(getValidations()); setUser(getStoredUser()); };
    if (getToken()) void loadHistory().then(() => setItems(getValidations())).catch(() => {});
    window.addEventListener("validora-history-change", refresh);
    const refreshAuth = () => { refresh(); if (getToken()) void loadHistory().then(() => setItems(getValidations())).catch(() => {}); };
    window.addEventListener("validora-auth-change", refreshAuth);
    return () => { window.removeEventListener("validora-history-change", refresh); window.removeEventListener("validora-auth-change", refreshAuth); };
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (idea.trim().length < 3) {
      toast.error("Please describe your idea in at least 3 characters.");
      return;
    }
    if (!getStoredUser()) { toast.error("Sign in to validate an idea."); window.location.assign("/login"); return; }
    setBusy(true);
    setAgentProgress(initialAgentProgress());
    setProgressPhase("research");
    try {
      const result: ValidationResponse = await validateStartup(idea.trim(), (progress: ValidationProgress) => {
        if (progress.type === "phase") setProgressPhase("scoring");
        else setAgentProgress((current) => ({ ...current, [progress.agent]: progress.status === "running" ? "running" : "complete" }));
      });
      setProgressPhase("complete");
      setItems(getValidations()); setSelected(mapValidation(result));
      toast.success(result.cached ? "Loaded your cached validation." : `Validation complete in ${result.elapsed}s.`);
    } catch (error) {
      setAgentProgress((current) => Object.fromEntries(Object.entries(current).map(([key, status]) => [key, status === "running" ? "failed" : status])));
      toast.error(error instanceof Error ? error.message : "Validation failed.");
    }
    finally { setBusy(false); }
  }
  return (
    <Workspace>
      <PageHeading
        // title={`Good morning${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        title={`${getIndiaGreeting()}${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Big ideas deserve a little clarity. Let’s find your next opportunity."
        action={
          <div className="date-label">
            <Clock3 size={15} />
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </div>
        }
      />
      <section className="welcome-banner">
        <img
          src={rocket}
          alt="Sculptural rocket beside market growth bars"
          width={1536}
          height={768}
        />
        <div className="banner-content">
          <span className="banner-eyebrow">
            <Sparkles size={14} />
            FROM WHAT IF TO WHAT’S NEXT
          </span>
          <h2>Your idea. A clearer path forward.</h2>
          <p>
            Turn your startup concept into an informed decision,
            <br className="desktop-break" /> backed by four focused research
            perspectives.
          </p>
          <Button
            variant="default"
            onClick={() => document.getElementById("startup-idea")?.focus()}
          >
            Validate an idea <ArrowRight size={16} />
          </Button>
        </div>
      </section>
      <div className="stats-grid">
        {[
          {
            label: "Total validations",
            value: String(items.length),
            note: "Saved to your account",
            icon: Lightbulb,
            tone: "violet",
            trend: true,
          },
          {
            label: "Promising ideas",
            value: String(items.filter((v) => (v.score ?? 0) >= 80).length),
            note: "Scored 80 or above",
            icon: CircleCheck,
            tone: "green",
          },
          {
            label: "Average viability",
            value: String(items.length ? Math.round(items.reduce((n, v) => n + (v.score ?? 0), 0) / items.length) : 0),
            suffix: "/100",
            note: "Across all validations",
            icon: TrendingUp,
            tone: "amber",
          },
          {
            label: "Websites created",
            value: "—",
            note: "From idea to something real",
            icon: PanelsIcon,
            tone: "blue",
          },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-top">
              <span>{s.label}</span>
              <span className={`icon-tile tone-${s.tone}`}>
                <s.icon size={18} />
              </span>
            </div>
            <div className="stat-value">
              {s.value}
              <span>{s.suffix}</span>
            </div>
            <div className={`stat-note ${s.trend ? "positive" : ""}`}>
              {s.trend && <TrendingUp size={13} />} {s.note}
            </div>
          </div>
        ))}
      </div>
      <div className="analysis-layout">
        <section className="idea-section">
          <div className="section-title">
            <span className="heading-icon">
              <Sparkles size={19} />
            </span>
            <div>
              <h2>Validate your startup idea</h2>
              <p>A fresh perspective on what you’re building.</p>
            </div>
            <span className="badge badge-neutral">AI-powered</span>
          </div>
          <form onSubmit={submit}>
            <label htmlFor="startup-idea">
              What’s your big idea?<span className="required">*</span>
            </label>
            <div className="idea-input-wrap">
              <textarea
                id="startup-idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                maxLength={2000}
                placeholder="Describe your startup idea, the problem it solves, and who it’s for. The more detail, the better the perspective."
              />
              <span className="character-count">{idea.length} / 2,000</span>
            </div>
            <div className="form-two">
              <div>
                <label htmlFor="industry">
                  Industry <span className="optional">(optional)</span>
                </label>
                <select id="industry">
                  <option>Select an industry</option>
                  <option>Fintech</option>
                  <option>Health & wellness</option>
                  <option>E-commerce</option>
                  <option>Education</option>
                  <option>Developer tools</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="audience">
                  Target audience <span className="optional">(optional)</span>
                </label>
                <input
                  id="audience"
                  placeholder="e.g. Small business owners"
                  maxLength={150}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="advanced-button"
              onClick={() => setAdvanced(!advanced)}
            >
              <Plus size={14} />
              Advanced options
              <ChevronDown className={advanced ? "rotate-180" : ""} size={14} />
            </Button>
            {advanced && (
              <div className="advanced-options">
                <div>
                  <label htmlFor="region">Target market</label>
                  <select id="region">
                    <option>Global</option>
                    <option>North America</option>
                    <option>Europe</option>
                    <option>Asia Pacific</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="stage">Startup stage</label>
                  <select id="stage">
                    <option>Idea stage</option>
                    <option>Prototype</option>
                    <option>Early traction</option>
                  </select>
                </div>
              </div>
            )}
            <div className="form-submit">
              <span>
                <ShieldCheck size={14} />
                Your ideas stay private
              </span>
              <Button type="submit" disabled={busy}>
                {busy ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}{" "}
                {busy ? "Researching…" : "Validate idea"}
                <ArrowRight size={15} />
              </Button>
            </div>
          </form>
        </section>
        <section className="research-section">
          <div className="research-heading">
            <h2>Four agents. One clear picture.</h2>
            <p>Sequential research with live progress.</p>
          </div>
          <div className="agent-list">
            {agents.map((a, i) => {
              const Icon = agentIcons[i] ?? Lightbulb;
              return (
                <div className="agent-card" key={a.name}>
                  <span className={`agent-icon tone-${a.tone}`}>
                    <Icon size={21} />
                  </span>
                  <div>
                    <h3>{a.name}</h3>
                    <p>{agentKeys[i] && agentProgress[agentKeys[i]] === "running" ? "Researching now…" : agentKeys[i] && agentProgress[agentKeys[i]] === "complete" ? "Research complete" : agentKeys[i] && agentProgress[agentKeys[i]] === "failed" ? "Could not complete" : a.description}</p>
                  </div>
                  <span className={`agent-ready agent-status-${agentKeys[i] ? agentProgress[agentKeys[i]] : "idle"}`} title={agentKeys[i] ? agentProgress[agentKeys[i]] : "idle"} aria-label={`${a.name}: ${agentKeys[i] ? agentProgress[agentKeys[i]] : "idle"}`}>
                    {!agentKeys[i] ? <Circle size={13} /> : agentProgress[agentKeys[i]] === "running" ? <LoaderCircle className="animate-spin" size={13} /> : agentProgress[agentKeys[i]] === "complete" ? <Check size={13} /> : agentProgress[agentKeys[i]] === "failed" ? <CircleAlert size={13} /> : <Circle size={13} />}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="research-note">
            <Info size={15} />
                <span>{progressPhase === "scoring" ? "Research complete. Preparing your final score…" : progressPhase === "complete" ? "All agents finished. Validation saved to your history." : busy ? `Working through agent ${Object.values(agentProgress).filter((status) => status === "complete").length + 1} of 4…` : "Research runs through the connected validation API."}</span>
          </div>
        </section>
      </div>
      <section className="recent-section">
        <div className="section-heading">
          <div>
            <h2>
              Recent validations <span className="sample-tag">{items.length} saved</span>
            </h2>
            <p>Your ideas, with a little more perspective.</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/history">
              View all history
              <ArrowRight size={15} />
            </Link>
          </Button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>STARTUP IDEA</th>
                <th>VIABILITY SCORE</th>
                <th>VERDICT</th>
                <th>DATE</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 3).map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="idea-cell">
                      <span
                        className={`table-icon tone-${v.id === 1 ? "violet" : v.id === 2 ? "green" : "amber"}`}
                      >
                        <Lightbulb size={18} />
                      </span>
                      <div>
                        <Button
                          variant="link"
                          className="table-name"
                          onClick={() => setSelected(v)}
                        >
                          {v.name}
                        </Button>
                        <span>{v.category}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="score-cell">
                      <strong>
                        {v.score}
                        <span>/100</span>
                      </strong>
                      <meter min="0" max="100" value={v.score ?? 0} />
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${v.verdict === "Go" ? "badge-green" : "badge-amber"}`}
                    >
                      <span className="badge-dot" />
                      {v.verdict}
                    </span>
                  </td>
                  <td className="table-date">{new Date(v.date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`View ${v.name}`}
                      onClick={() => setSelected(v)}
                    >
                      <ArrowUpRight size={17} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            {items.length === 0 && <tbody><tr><td colSpan={5}>Your completed validations will appear here.</td></tr></tbody>}
          </table>
        </div>
      </section>
      <ReportDialog item={selected} onClose={() => setSelected(null)} />
    </Workspace>
  );
}
function PanelsIcon({ size = 18 }: { size?: number }) {
  return <FileText size={size} />;
}

function getIndiaGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date()),
  ) % 24;

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}
