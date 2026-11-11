/**
 * App Router `template.tsx` re-mounts on every navigation (unlike `layout.tsx`),
 * so this gives a gentle page-transition on each route change.
 *
 * PERF: this is a pure-CSS fade on purpose. It used to be a Framer `m.div` with
 * `initial={{ opacity: 0 }}`, which meant the server-rendered HTML stayed fully
 * invisible until React hydrated — on throttled mobile that pushed LCP to ~7s
 * (Lighthouse: ~0ms load, ~7s render delay). A CSS animation runs from first
 * paint with no JS, and the `prefers-reduced-motion` rule in globals.css
 * collapses it to instant. Opacity only (never transform) so it can't re-root
 * fixed/sticky descendants.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
