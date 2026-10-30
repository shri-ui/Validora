export type ApiUser = { id: number; email: string; name: string; created_at: number; status: "active" | "inactive" };
export type Source = { title: string; url: string; domain: string };
export type AgentResult = { agent: string; findings: string; sources: Source[] };
export type ValidationResponse = { idea: string; score: number; verdict: string; summary: string; results: AgentResult[]; elapsed: number; cached: boolean; savedAt?: number; historyId?: number };
export type ValidationProgress =
  | { type: "agent"; agent: string; status: "running" | "complete" }
  | { type: "phase"; phase: "scoring" };
export type AuthResponse = { token: string; user: ApiUser };

const BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:8000";
const TOKEN = "validora_api_token";
const USER = "validora_api_user";
const HISTORY = "validora_validation_history";

export function getToken() { return localStorage.getItem(TOKEN); }
export function getStoredUser(): ApiUser | null {
  try { return JSON.parse(localStorage.getItem(USER) ?? "null") as ApiUser | null; } catch { return null; }
}
function setSession(auth: AuthResponse) {
  localStorage.setItem(TOKEN, auth.token); localStorage.setItem(USER, JSON.stringify(auth.user));
  window.dispatchEvent(new Event("validora-auth-change"));
}
export function clearSession() {
  localStorage.removeItem(TOKEN); localStorage.removeItem(USER);
  window.dispatchEvent(new Event("validora-auth-change"));
}
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  const token = getToken(); if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try { response = await fetch(`${BASE_URL}${path}`, { ...options, headers }); }
  catch { throw new Error("Could not reach the API. Check that the backend is running."); }
  if (!response.ok) {
    let message = response.statusText || "Request failed";
    try { const body = await response.json(); if (typeof body.detail === "string") message = body.detail; } catch { /* use status text */ }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}
export async function signup(payload: { name: string; email: string; password: string }) {
  const auth = await request<AuthResponse>("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }); setSession(auth); return auth;
}
export async function login(payload: { email: string; password: string }) {
  const auth = await request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }); setSession(auth); return auth;
}
export async function getCurrentUser() {
  const user = await request<ApiUser>("/api/auth/me"); localStorage.setItem(USER, JSON.stringify(user)); window.dispatchEvent(new Event("validora-auth-change")); return user;
}
export const health = () => request<{ status: string }>("/api/health");
export async function validateStartup(idea: string, onProgress?: (progress: ValidationProgress) => void) {
  const headers = new Headers({ "Content-Type": "application/json", Accept: "text/event-stream" });
  const token = getToken(); if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/validate`, { method: "POST", headers, body: JSON.stringify({ idea }) });
  } catch {
    throw new Error("Could not reach the API. Check that the backend is running.");
  }
  if (!response.ok) {
    let message = response.statusText || "Validation failed";
    try { const body = await response.json(); if (typeof body.detail === "string") message = body.detail; } catch { /* keep status text */ }
    throw new Error(message);
  }
  if (!response.body) throw new Error("The API did not return validation progress.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let validation: ValidationResponse | undefined;
  const consume = (frame: string) => {
    const data = frame.split(/\r?\n/).find((line) => line.startsWith("data: "))?.slice(6);
    if (!data) return;
    const event = JSON.parse(data) as ValidationProgress | { type: "result"; result: ValidationResponse } | { type: "error"; detail: string };
    if (event.type === "result") validation = event.result;
    else if (event.type === "error") throw new Error(event.detail);
    else onProgress?.(event);
  };
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = frames.pop() ?? "";
    for (const frame of frames) consume(frame);
    if (done) break;
  }
  if (buffer.trim()) consume(buffer);
  if (!validation) throw new Error("Validation ended before returning a result.");
  const completedValidation = validation;
  const history = readHistory().filter((item) => item.idea.toLowerCase() !== completedValidation.idea.toLowerCase());
  localStorage.setItem(HISTORY, JSON.stringify([{ ...completedValidation, savedAt: completedValidation.savedAt ?? Date.now() }, ...history].slice(0, 25)));
  window.dispatchEvent(new Event("validora-history-change"));
  return completedValidation;
}
export async function loadHistory() {
  const history = await request<ValidationResponse[]>("/api/history");
  localStorage.setItem(HISTORY, JSON.stringify(history));
  return history;
}
export async function deleteHistoryItem(id: number) {
  await request<{ deleted: boolean }>(`/api/history/${id}`, { method: "DELETE" });
  const history = readHistory().filter((item) => item.historyId !== id);
  localStorage.setItem(HISTORY, JSON.stringify(history));
  window.dispatchEvent(new Event("validora-history-change"));
}
export function readHistory(): ValidationResponse[] {
  try { return JSON.parse(localStorage.getItem(HISTORY) ?? "[]") as ValidationResponse[]; } catch { return []; }
}
export async function downloadApiReport(validation: ValidationResponse): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/api/report`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` }, body: JSON.stringify(validation) });
  if (!response.ok) throw new Error(response.status === 401 ? "Login required." : "Report download failed.");
  return response.blob();
}
export async function updateProfile(data: { name: string; email: string }) {
  const user = await request<ApiUser>("/api/users/me/", { method: "PATCH", body: JSON.stringify(data) });
  localStorage.setItem(USER, JSON.stringify(user));
  window.dispatchEvent(new Event("validora-auth-change"));
  return user;
}

export const changePassword = (data: { current_password: string; new_password: string }) =>
  request<{ detail: string }>("/api/users/me/password/", { method: "POST", body: JSON.stringify(data) });
