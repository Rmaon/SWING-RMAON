const KEY = "swingEventos";

export default class EventStore {
  constructor(storage = window.localStorage) {
    this.storage = storage;
  }

  load() {
    try {
      const raw = this.storage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  save(events) {
    this.storage.setItem(KEY, JSON.stringify(events));
  }
}