import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Monitor,
  Smartphone,
  Code2,
  Eye,
  Download,
  RotateCw,
  Save,
  ArrowUpRight,
  PanelsTopLeft,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Workspace, PageHeading, EmptyState } from "./shell";
import { getValidations, downloadBlob, type Validation } from "@/lib/preview-data";
import { loadHistory } from "@/lib/api";
const previewHtml =
  '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;font-family:Arial,sans-serif;background:#f7faf8;color:#163b30}nav{padding:24px;display:flex;justify-content:space-between;border-bottom:1px solid #dce9df}nav b{font-size:20px}main{padding:80px 30px;text-align:center}small{font-size:11px;letter-spacing:2px}h1{font-size:48px;line-height:1.1;margin:24px auto;max-width:550px}p{color:#667c72;line-height:1.7;max-width:440px;margin:0 auto 30px}button{background:#265f46;color:white;border:0;padding:15px 25px;border-radius:6px}section{padding:30px;display:flex;gap:20px;justify-content:center;border-top:1px solid #dce9df}section div{padding:20px;flex:1}footer{text-align:center;font-size:11px;padding:25px;color:#667c72}@media(max-width:500px){h1{font-size:34px}main{padding:55px 20px}section{display:block}}</style></head><body><nav><b>Bloom.</b><span>Our story &nbsp; · &nbsp; Get started</span></nav><main><small>A LITTLE BALANCE. A BETTER EVERYDAY.</small><h1>Your wellbeing,<br>wherever you work.</h1><p>Make space for a healthier, happier workday. Small habits that bring your team closer, even from a distance.</p><button>Find your balance ↗</button></main><section><div><b>Mindful moments</b><p>A little reset for your everyday.</p></div><div><b>Stronger connections</b><p>Make wellbeing a team effort.</p></div><div><b>Room to grow</b><p>Build habits that stay with you.</p></div></section><footer>Bloom · Static sample website · Not a generated production website</footer></body></html>';
export function BuilderPage() {
  const [name, setName] = useState("");
  const [generated, setGenerated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState("preview");
  const [mobile, setMobile] = useState(false);
  const [color, setColor] = useState("green");
  const [version, setVersion] = useState(1);
  const [saved, setSaved] = useState(false);
  const [validations, setValidations] = useState<Validation[]>(getValidations);
  useEffect(() => { void loadHistory().then(() => setValidations(getValidations())).catch(() => {}); }, []);
  async function download() {
    const { zipSync, strToU8 } = await import("fflate");
    const zipped = zipSync({
      "index.html": strToU8(previewHtml),
      "README.txt": strToU8(
        "Validora static UI sample. No AI generation or business logic is connected.",
      ),
    });
    downloadBlob(
      new Blob([new Uint8Array(zipped).buffer], { type: "application/zip" }),
      "Validora-sample-website.zip",
    );
  }
  function generate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a website name.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setGenerated(true);
      if (generated) setVersion(version + 1);
      toast.info(
        "Static sample preview ready. AI website generation is not connected.",
      );
    }, 800);
  }
  return (
    <Workspace title="Website builder">
      <PageHeading
        eyebrow="FROM INSIGHT TO LAUNCH"
        title="Give your idea a home."
        description="Shape the first impression of your next big thing."
      />
      <div className="builder-layout">
        <section className="builder-config">
          <h2>Website details</h2>
          <p className="subtle-text">Start with a concept. Make it your own.</p>
          <form onSubmit={generate}>
            <label htmlFor="validation-source">Start from a validation</label>
            <select id="validation-source">
              <option>Choose a previous idea</option>
              {validations.map((v) => (
                <option key={v.id}>{v.name}</option>
              ))}
            </select>
            <label htmlFor="website-name">
              Website name <span className="required">*</span>
            </label>
            <input
              id="website-name"
              placeholder="e.g. Bloom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
            />
            <div className="form-two">
              <div>
                <label htmlFor="category">Business category</label>
                <select id="category">
                  <option>Health & wellness</option>
                  <option>Fintech</option>
                  <option>E-commerce</option>
                  <option>SaaS</option>
                </select>
              </div>
              <div>
                <label htmlFor="design-style">Design style</label>
                <select id="design-style">
                  <option>Clean & minimal</option>
                  <option>Bold & expressive</option>
                  <option>Editorial</option>
                </select>
              </div>
            </div>
            <label htmlFor="builder-audience">Target audience</label>
            <input
              id="builder-audience"
              placeholder="e.g. Remote teams"
              maxLength={150}
            />
            <label>Primary color</label>
            <div className="color-swatches">
              {["green", "violet", "blue", "amber", "charcoal"].map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant="ghost"
                  aria-label={`${c} primary color`}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className={`swatch swatch-${c} ${color === c ? "swatch-selected" : ""}`}
                />
              ))}
            </div>
            <label>Required pages</label>
            <div className="checkbox-options">
              {["Home", "About", "Pricing", "Contact"].map((p) => (
                <label key={p}>
                  <input
                    type="checkbox"
                    defaultChecked={p === "Home" || p === "About"}
                  />
                  {p}
                </label>
              ))}
            </div>
            <label htmlFor="functionality">Required functionality</label>
            <select id="functionality">
              <option>Contact form</option>
              <option>Newsletter signup</option>
              <option>Booking form</option>
              <option>Product catalog</option>
            </select>
            <label htmlFor="stack">Preferred frontend stack</label>
            <select id="stack">
              <option>React + Tailwind CSS</option>
              <option>HTML + CSS</option>
            </select>
            <label htmlFor="instructions">Additional instructions</label>
            <textarea
              id="instructions"
              placeholder="Anything else you have in mind?"
              maxLength={2000}
            />
            <Button type="submit" className="w-full" disabled={busy}>
              <Sparkles />
              {busy ? "Preparing sample…" : "Create website preview"}
            </Button>
            <p className="builder-disclaimer">
              UI preview only · No AI generation connected
            </p>
          </form>
        </section>
        <section className="builder-preview">
          <div className="preview-toolbar">
            <div>
              <Button
                variant={view === "preview" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("preview")}
              >
                <Eye />
                Preview
              </Button>
              <Button
                variant={view === "code" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("code")}
              >
                <Code2 />
                Code
              </Button>
            </div>
            <div>
              <Button
                variant={mobile ? "ghost" : "secondary"}
                size="icon"
                aria-label="Desktop website preview"
                onClick={() => setMobile(false)}
              >
                <Monitor />
              </Button>
              <Button
                variant={mobile ? "secondary" : "ghost"}
                size="icon"
                aria-label="Mobile website preview"
                onClick={() => setMobile(true)}
              >
                <Smartphone />
              </Button>
            </div>
          </div>
          {!generated ? (
            <EmptyState
              title="Something great starts here."
              text="Your website preview will appear here."
              action={<PanelsTopLeft size={40} />}
            />
          ) : view === "code" ? (
            <pre className="code-view">
              <code>{previewHtml}</code>
            </pre>
          ) : (
            <div className={`iframe-wrap ${mobile ? "iframe-mobile" : ""}`}>
              <iframe
                title="Sandboxed sample website"
                sandbox=""
                srcDoc={previewHtml}
              />
            </div>
          )}
          <div className="preview-bottom">
            <span>
              {generated
                ? `Static sample · Version ${version}`
                : "No website yet"}
            </span>
            <div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Regenerate sample website"
                disabled={!generated || busy}
                onClick={() => generate()}
              >
                <RotateCw />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!generated}
                onClick={() => {
                  setSaved(true);
                  toast.info(
                    "Marked as saved for this visit. Persistent project storage is not connected.",
                  );
                }}
              >
                <Save />
                {saved ? "Saved for this visit" : "Save sample"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!generated}
                onClick={download}
              >
                <Download />
                ZIP
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Workspace>
  );
}
export function ProjectsPage() {
  return (
    <Workspace title="My projects">
      <PageHeading
        title="Ideas taking shape."
        description="A home for the things you’re bringing to life."
        action={
          <Button asChild>
            <Link to="/builder">
              <Sparkles />
              New website
            </Link>
          </Button>
        }
      />
      <div className="notice mb-6">
        <PanelsTopLeft size={17} />
        <span>
          Illustrative projects · Project storage and AI generation are not
          connected.
        </span>
      </div>
      <div className="project-grid">
        {[
          {
            name: "Bloom",
            category: "Remote team wellness",
            style: "green",
            letter: "B",
            version: 3,
          },
          {
            name: "Pocketwise",
            category: "Personal finance coach",
            style: "violet",
            letter: "P",
            version: 2,
          },
          {
            name: "Rewear",
            category: "Sustainable fashion marketplace",
            style: "amber",
            letter: "R",
            version: 1,
          },
        ].map((p) => (
          <article className="project-card" key={p.name}>
            <div className={`project-art tone-${p.style}`}>
              <span>
                {p.letter}
                <span>↗</span>
              </span>
              <div>
                {p.name}
                <small>Something good is growing.</small>
              </div>
            </div>
            <div className="project-details">
              <div className="section-heading">
                <h3>{p.name}</h3>
                <span className="badge badge-neutral">Sample</span>
              </div>
              <p>{p.category}</p>
              <div className="project-meta">
                <span>
                  <Clock3 size={14} />
                  Oct 12, 2026
                </span>
                <span>{p.version} versions</span>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link to="/builder">
                  Open in builder
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </Workspace>
  );
}
