export function abrirModal(id) {
  document.getElementById(id)?.classList.add("show");
}

export function cerrarModal(id) {
  document.getElementById(id)?.classList.remove("show");
}
