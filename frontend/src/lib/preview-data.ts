import { downloadApiReport, readHistory, type AgentResult, type ValidationResponse } from "./api";
export type Validation = {
  id: number;
  name: string;
  description: string;
  category: string;
  date: string;
  score: number | null;
  verdict: string;
  status: string;
  results?: AgentResult[];
  apiPayload?: ValidationResponse;
};
export function mapValidation(item: ValidationResponse, index = 0): Validation {
  const savedAt = item.savedAt ?? Date.now() - index;
  const order = ["competitor_analysis", "market_sizing", "community_sentiment", "os_risk"];
  const results = [...item.results].sort((a, b) => order.indexOf(a.agent) - order.indexOf(b.agent));
  return { id: item.historyId ?? savedAt, name: item.idea.split(/[.!?\n]/)[0].slice(0, 90), description: item.summary, category: "Startup idea", date: new Date(savedAt).toISOString().slice(0, 10), score: item.score, verdict: item.verdict, status: "Completed", results, apiPayload: item };
}
export function getValidations(): Validation[] {
  return readHistory().flatMap((item, i) => {
    try {
      return [mapValidation(item, i)];
    } catch (error) {
      console.warn("Skipping malformed history item", item, error);
      return [];
    }
  });
}
export const agents = [
  {
    name: "Competitor analysis",
    description: "Competition & market positioning",
    icon: "competitors",
    tone: "violet",
  },
  {
    name: "Market sizing",
    description: "Market opportunity & growth potential",
    icon: "market",
    tone: "green",
  },
  {
    name: "Community sentiment",
    description: "Real conversations & customer demand",
    icon: "community",
    tone: "amber",
  },
  {
    name: "Open-source risk",
    description: "Technical landscape & dependency risks",
    icon: "risk",
    tone: "blue",
  },
];
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
export async function downloadReport(item: Validation) {
  if (item.apiPayload) {
    downloadBlob(await downloadApiReport(item.apiPayload), `validora-report-${item.id}.pdf`);
    return;
  }
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  pdf.setFontSize(24);
  pdf.text("Validora / Sample validation report", 20, 25);
  pdf.setFontSize(12);
  pdf.text(pdf.splitTextToSize(item.name, 170), 20, 45);
  pdf.text(
    `Sample score: ${item.score ?? "Not available"} / 100 | ${item.verdict}`,
    20,
    65,
  );
  pdf.text(`Date: ${item.date}`, 20, 75);
  pdf.text(
    pdf.splitTextToSize(
      "UI DEMONSTRATION ONLY. This is sample data, not verified research or investment advice. No AI agents have been executed. Evidence and external sources are unavailable in this preview.",
      170,
    ),
    20,
    95,
  );
  pdf.text(pdf.splitTextToSize(item.description, 170), 20, 130);
  pdf.save(`Validora-sample-report-${item.id}.pdf`);
}
