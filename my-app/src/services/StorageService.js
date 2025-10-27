const STORAGE_KEY = "swingEventos";

export const StorageService = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Error cargando eventos:", e);
      return [];
    }
  },
  save(eventos) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(eventos));
    } catch (e) {
      console.error("Error guardando eventos:", e);
    }
  },
};
