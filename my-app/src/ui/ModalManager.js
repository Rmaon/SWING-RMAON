export default class ModalManager {
  constructor() {
    this.modals = new Map();
    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => this.close(btn.closest(".modal").id));
    });

    window.addEventListener("click", (ev) => {
      const el = ev.target;
      if (el.classList && el.classList.contains("modal")) {
        el.classList.remove("show");
      }
    });
  }

  open(id) {
    document.getElementById(id).classList.add("show");
  }

  close(id) {
    document.getElementById(id).classList.remove("show");
  }
}