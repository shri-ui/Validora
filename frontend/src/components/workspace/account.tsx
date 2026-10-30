import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Workspace, PageHeading, Brand } from "./shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "./theme";
import { getStoredUser, login, signup as signupUser, updateProfile, changePassword } from "@/lib/api";

// inside AccountPage, next to useState("Profile")
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import startupArtwork from "@/assets/startup-launch.jpg";

import {
  User,
  Shield,
  Sliders,
  Save,
  LogOut,
  Sparkles,
  ShieldCheck,
  Search,
  MessageSquareText,
  ChartNoAxesCombined,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
  Bell,
  Globe,
  Lock,
  Mail,
} from "lucide-react";

// export function AccountPage() {
//   const [tab, setTab] = useState("Profile");
//   const [busy, setBusy] = useState(false);
//   const user = getStoredUser();
//   return (
//     <Workspace title="Settings">
//       <PageHeading
//         title="A space that’s yours."
//         description="Your profile, preferences, and account details."
//       />
//       <div className="settings-tabs">
//         {["Profile", "Security", "Preferences"].map((t) => (
//           <Button
//             key={t}
//             variant={tab === t ? "secondary" : "ghost"}
//             onClick={() => setTab(t)}
//           >
//             {t}
//           </Button>
//         ))}
//       </div>
//       <section className="settings-section">
//         <h2>
//           {tab === "Profile"
//             ? "Personal information"
//             : tab === "Security"
//               ? "Password & security"
//               : "Workspace preferences"}
//         </h2>
//         <p className="subtle-text">Profile and password updates are not supported by the current API.</p>
//         <form
//           onSubmit={async (e) => {
//             e.preventDefault();
//             const form = e.currentTarget;
//             const data = new FormData(form);
//             try {
//               setBusy(true);
//               if (tab === "Profile") {
//                 await updateProfile({
//                   name: String(data.get("name")),
//                   email: String(data.get("email")),
//                 });
//                 toast.success("Profile updated.");
//               } else if (tab === "Security") {
//                 await changePassword({
//                   current_password: String(data.get("current_password")),
//                   new_password: String(data.get("new_password")),
//                 });
//                 form.reset();
//                 toast.success("Password updated.");
//               } else {
//                 toast.info("Preferences aren't saved yet.");
//               }
//             } catch (err) {
//               toast.error(err instanceof Error ? err.message : "Something went wrong.");
//             } finally {
//               setBusy(false);
//             }
//           }}
//         >
//           {tab === "Profile" ? (
//             <>
//               <div className="profile-avatar">
//                 {(user?.name ?? "?")
//                   .split(" ")
//                   .map((w) => w[0])
//                   .join("")
//                   .slice(0, 2)
//                   .toUpperCase()}
//               </div>
//               <label htmlFor="full-name">Full name</label>
//               <input
//                 id="full-name"
//                 name="name"
//                 defaultValue={user?.name ?? ""}
//                 required
//                 maxLength={100}
//               />
//               <label htmlFor="email">Email address</label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 defaultValue={user?.email ?? ""}
//                 required
//                 maxLength={255}
//               />
//             </>
//           ) : tab === "Security" ? (
//             <>
//               <label htmlFor="current-password">Current password</label>
//               <input
//                 id="current-password"
//                 name="current_password"
//                 type="password"
//                 required
//                 minLength={8}
//               />
//               <label htmlFor="new-password">New password</label>
//               <input
//                 id="new-password"
//                 name="new_password"
//                 type="password"
//                 required
//                 minLength={8}
//                 maxLength={128}
//               />
//             </>
//           ) : (
//             <>
//               <label htmlFor="notification-preference">
//                 Email notifications
//               </label>
//               <label className="checkbox-label">
//                 <input
//                   id="notification-preference"
//                   type="checkbox"
//                   defaultChecked
//                 />
//                 Validation completion updates
//               </label>
//               <label htmlFor="language">Language</label>
//               <select id="language">
//                 <option>English</option>
//                 <option>Hindi</option>
//                 <option>French</option>
//               </select>
//             </>
//           )}
//           <div className="settings-actions">
//             <Button type="submit">
//               <Save />
//               Save changes
//             </Button>
//             <Button asChild variant="ghost">
//               <Link to="/login">
//                 <LogOut />
//                 Sign in / out
//               </Link>
//             </Button>
//           </div>
//         </form>
//       </section>
//     </Workspace>
//   );
// }

export function AccountPage() {
  const [tab, setTab] = useState("Profile");
  const [busy, setBusy] = useState(false);
  const user = getStoredUser();

  const userInitials = (user?.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      setBusy(true);
      if (tab === "Profile") {
        await updateProfile({
          name: String(data.get("name")),
          email: String(data.get("email")),
        });
        toast.success("Profile updated.");
      } else if (tab === "Security") {
        await changePassword({
          current_password: String(data.get("current_password")),
          new_password: String(data.get("new_password")),
        });
        form.reset();
        toast.success("Password updated.");
      } else {
        toast.info("Preferences saved.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Workspace title="Settings">
      <div className=" mx-0 space-y-0 pb-12">
        <PageHeading
          title="Account & Settings"
          description="Manage your profile information, security settings, and workspace preferences."
        />

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="Profile" className="flex items-center gap-2">
              <User size={16} />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="Security" className="flex items-center gap-2">
              <Shield size={16} />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="Preferences" className="flex items-center gap-2">
              <Sliders size={16} />
              <span>Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Card */}
          <TabsContent value="Profile">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your public profile details and contact email address.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar section */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground text-lg font-semibold shadow">
                      {userInitials}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{user?.name || "User Avatar"}</h4>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full name</Label>
                    <Input
                      id="full-name"
                      name="name"
                      defaultValue={user?.name ?? ""}
                      placeholder="e.g. Jane Doe"
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={user?.email ?? ""}
                      placeholder="you@example.com"
                      required
                      maxLength={255}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground italic">
                    Note: Direct profile updates are subject to backend API support.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button type="submit" disabled={busy}>
                    <Save size={16} className="mr-2" />
                    {busy ? "Saving..." : "Save changes"}
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/login">
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </Link>
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Security Card */}
          <TabsContent value="Security">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Password & Security</CardTitle>
                  <CardDescription>
                    Manage your account security and authentication settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <Input
                      id="current-password"
                      name="current_password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input
                      id="new-password"
                      name="new_password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={8}
                      maxLength={128}
                    />
                    <p className="text-xs text-muted-foreground">Must be at least 8 characters long.</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button type="submit" disabled={busy}>
                    <Save size={16} className="mr-2" />
                    {busy ? "Updating..." : "Update Password"}
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/login">
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </Link>
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Preferences Card */}
          <TabsContent value="Preferences">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Workspace Preferences</CardTitle>
                  <CardDescription>
                    Customize your notifications and platform language preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <Bell size={16} /> Email notifications
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Receive validation completion updates and activity alerts.
                      </p>
                    </div>
                    <Switch id="notification-preference" defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="flex items-center gap-2">
                      <Globe size={16} /> Platform Language
                    </Label>
                    <select
                      id="language"
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button type="submit" disabled={busy}>
                    <Save size={16} className="mr-2" />
                    {busy ? "Saving..." : "Save Preferences"}
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/login">
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </Link>
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Workspace>
  );
}


export function AuthPage({
  signup = false,
  reset = false,
}: {
  signup?: boolean;
  reset?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  return (
    <main className="auth-screen">
      <section className="auth-story" style={{ backgroundImage: `linear-gradient(135deg, rgb(24 32 67 / 84%), rgb(78 55 133 / 65%) 55%, rgb(30 111 101 / 68%)), url(${startupArtwork})` }}>
        <div className="auth-story-top"><Brand /></div>
        <div className="auth-story-content">
          <div className="auth-story-kicker"><Sparkles size={15} /> START WITH A BETTER QUESTION</div>
          <h2>Build boldly.<br />Validate with clarity.</h2>
          <p>Turn your startup idea into a smarter next move with focused research and real-world signals.</p>
          <div className="auth-feature-card">
            <div className="auth-feature-heading"><span><ShieldCheck size={17} /></span> A clearer view of what’s next</div>
            <div className="auth-feature-grid">
              <div><Search size={17} /><span>Competitors<br />&amp; market</span></div>
              <div><MessageSquareText size={17} /><span>Community<br />signals</span></div>
              <div><ChartNoAxesCombined size={17} /><span>One grounded<br />assessment</span></div>
            </div>
          </div>
          <div className="auth-story-note"><span className="auth-note-dots"><i /><i /><i /><i /></span> Four focused research perspectives. One clear direction.</div>
        </div>
        <div className="auth-story-footer">Make your next move an informed one.</div>
      </section>

      <section className="auth-side">
        <div className="auth-side-top">
          <ThemeToggle />
          <Link className="auth-home-link" to="/">Back to home</Link>
        </div>
        <div className="auth-panel">
          <div className="auth-panel-mark"><span><Sparkles size={19} /></span><span>VALIDORA <b>WORKSPACE</b></span></div>
          <span className="auth-eyebrow">{reset ? "ACCOUNT RECOVERY" : signup ? "YOUR IDEAS, WITH DIRECTION" : "YOUR NEXT MOVE STARTS HERE"}</span>
          <h1>
            {reset
              ? "Reset your password"
              : signup
                ? "Create your account"
                : "Welcome back"}
          </h1>
          <p className="auth-intro">
            {reset
              ? "Enter your email to request a reset link."
              : signup
                ? "Create a workspace for your next big idea."
                : "Sign in to continue validating your next big idea."}
          </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            if (signup && data.get("password") !== data.get("confirm")) {
              setMessage("Your passwords don’t match.");
              return;
            }
            if (reset) { setMessage("Password reset is unavailable because the backend has no reset endpoint."); return; }
            setBusy(true); setMessage("");
            const email = String(data.get("email") ?? "");
            const password = String(data.get("password") ?? "");
            (signup ? signupUser({ name: String(data.get("name") ?? ""), email, password }) : login({ email, password }))
              .then(() => { toast.success(signup ? "Account created." : "Signed in."); navigate("/"); })
              .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Authentication failed."))
              .finally(() => setBusy(false));
          }}
        >
          {signup && (
            <>
              <label htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                name="name"
                placeholder="Your full name"
                required
                maxLength={100}
              />
            </>
          )}
          <label htmlFor="auth-email">Email address</label>
          <input
            id="auth-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            maxLength={255}
          />
          {!reset && (
            <>
              <label htmlFor="auth-password">Password</label>
              <div className="password-wrap">
                <input
                  id="auth-password"
                  name="password"
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  minLength={8}
                  required
                  maxLength={128}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              {signup && (
                <>
                  <label htmlFor="confirm-password">Confirm password</label>
                  <input
                    id="confirm-password"
                    name="confirm"
                    type={show ? "text" : "password"}
                    placeholder="Re-enter your password"
                    minLength={8}
                    required
                    maxLength={128}
                  />
                </>
              )}
              <div className="auth-options">
                <label className="checkbox-label">
                  <input type="checkbox" required={signup} />
                  {signup
                    ? "I accept the terms and privacy policy"
                    : "Remember me"}
                </label>
                {!signup && <Link to="/forgot-password">Forgot password?</Link>}
              </div>
            </>
          )}
          {message && (
            <div className="auth-message" role="status">
              <Info size={16} />
              {message}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg">
            {busy ? "Please wait…" : reset ? "Send reset link" : signup ? "Create account" : "Sign in"}
            <ArrowRight />
          </Button>
        </form>
          {reset ? <div className="auth-unavailable">Password reset is not available yet.</div> : <div className="auth-secure-note"><ShieldCheck size={15} /> Your account and idea research stay in your workspace.</div>}
          <div className="auth-panel-bottom">{signup ? "Already have an account?" : reset ? "Remember your password?" : "New to Validora?"} <Link to={signup || reset ? "/login" : "/signup"}>{signup || reset ? "Sign in" : "Create an account"}</Link></div>
        </div>
        <footer className="auth-side-footer">© {new Date().getFullYear()} Validora <span>·</span> Built for ideas worth pursuing</footer>
      </section>
    </main>
  );
}
