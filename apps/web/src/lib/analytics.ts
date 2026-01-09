// Plausible Analytics custom events
// These events will be tracked in Plausible dashboard

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number> }
    ) => void;
  }
}

export function trackEvent(
  event: string,
  props?: Record<string, string | number>
) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event, props ? { props } : undefined);
  }
}

// Tracked events:
// - copy_yaml: User copied the workflow YAML
// - download_yaml: User downloaded the YAML file
// - view_secrets: User expanded the secrets section
// - view_failures: User expanded a failure accordion
// - outbound_click: User clicked an external link
