import App from "./app";

if (!window.__APP_BOOTSTRAPPED__) {
  window.__APP_BOOTSTRAPPED__ = true;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.__APP_INSTANCE__ = new App();
    });
  } else {
    window.__APP_INSTANCE__ = new App();
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.__APP_INSTANCE__ = null;
    window.__APP_BOOTSTRAPPED__ = false;
  });
}
