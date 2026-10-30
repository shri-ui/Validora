import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    try {
      if (localStorage.getItem("Validora-theme") === "dark") setTheme("dark");
    } catch {
      /* Theme switching still works when storage is unavailable. */
    }
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("Validora-theme", next);
    } catch {
      /* Optional browser preference. */
    }
  };
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  const label =
    theme === "dark" ? "Switch to day mode" : "Switch to night mode";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={label}
      title={label}
      onClick={toggle}
    >
      {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
    </Button>
  );
}
