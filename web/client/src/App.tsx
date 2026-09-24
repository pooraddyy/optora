/** Optora — Obsidian Console. Dark-only; motion respects the OS reduced-motion setting. */
import { MotionConfig } from "framer-motion";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <Router />
      </MotionConfig>
    </ErrorBoundary>
  );
}
