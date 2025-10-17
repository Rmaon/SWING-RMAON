export default class DragDropManager {
  constructor() {
    this.item = null; // evento arrastrado
  }
  start(evento) {
    this.item = evento;
  }
  clear() {
    this.item = null;
  }
  get() {
    return this.item;
  }
}