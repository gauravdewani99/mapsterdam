// Single shared loader for the Google Maps JavaScript API.
//
// StreetView and MapSelector both need Maps, and each used to keep its own
// `scriptLoadedRef`. Because a ref is per-component, both injected their own
// <script> tag and Google warned "You have included the Google Maps JavaScript
// API multiple times on this page." Module scope is the only guard that both
// components actually share.

const MAPS_SCRIPT_ID = "google-maps-js-api";

let loadPromise: Promise<void> | null = null;

const isLoaded = () =>
  typeof window !== "undefined" && Boolean(window.google?.maps);

export const loadGoogleMaps = (apiKey: string): Promise<void> => {
  if (isLoaded()) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const fail = (message: string) => {
      // Allow a later attempt (e.g. after a network blip) to retry.
      loadPromise = null;
      reject(new Error(message));
    };

    const existing = document.getElementById(
      MAPS_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        fail("Failed to load the Google Maps JavaScript API")
      );
      return;
    }

    const script = document.createElement("script");
    script.id = MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      fail("Failed to load the Google Maps JavaScript API");
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};
