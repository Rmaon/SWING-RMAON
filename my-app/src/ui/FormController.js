import { UBICACIONES_CLASES, UBICACIONES_ACTIVIDADES } from "../constants";

export default class FormController {
  constructor({ modal, store, getEventos, setEventos, verificarDisponibilidad, defaults }) {
    this.modal = modal;
    this.store = store;
    this.getEventos = getEventos;
    this.setEventos = setEventos;
    this.verificarDisponibilidad = verificarDisponibilidad;
    this.defaults = defaults;

    // Elements
    this.el = {
      tipo: document.getElementById("formTipo"),
      nombre: document.getElementById("formNombre"),
      dia: document.getElementById("formDia"),
      hora: document.getElementById("formHora"),
      duracion: document.getElementById("formDuracion"),
      ubicacion: document.getElementById("formUbicacion"),
      ubicInfo: document.getElementById("ubicacionesInfo"),
      estilo: document.getElementById("formEstilo"),
      nivel: document.getElementById("formNivel"),
      tipoActividad: document.getElementById("formTipoActividad"),
      banda: document.getElementById("formBanda"),
      descripcion: document.getElementById("formDescripcion"),
      nivelContainer: document.getElementById("nivelContainer"),
      tipoActividadContainer: document.getElementById("tipoActividadContainer"),
      bandaContainer: document.getElementById("bandaContainer"),
      btnGuardar: document.getElementById("btnGuardar"),
      btnNuevo: document.getElementById("btnNuevo"),
    };

    this.bind();
  }

  bind() {
    const { tipo, dia, hora, duracion, btnGuardar, btnNuevo } = this.el;

    const refreshUbic = () => this.actualizarUbicaciones();
    [tipo, dia, hora, duracion].forEach((el) => el.addEventListener("change", refreshUbic));

    tipo.addEventListener("change", () => this.actualizarFormulario());

    btnGuardar.addEventListener("click", () => this.guardar());
    btnNuevo.addEventListener("click", () => this.abrir());

    document.querySelectorAll('[data-close-modal]').forEach((b) =>
      b.addEventListener('click', () => this.modal.close("modalFormulario"))
    );
  }

  abrir() {
    const { tipoVista, dia } = this.defaults();
    this.el.tipo.value = tipoVista === "clases" ? "clase" : "actividad";
    this.el.dia.value = dia;
    this.el.hora.value = "20:00";
    this.el.duracion.value = "1";
    this.el.nombre.value = "";
    this.el.estilo.value = "";
    this.el.nivel.value = "";
    this.el.tipoActividad.value = "";
    this.el.banda.value = "";
    this.el.descripcion.value = "";

    this.actualizarFormulario();
    this.modal.open("modalFormulario");
  }

  actualizarFormulario() {
    const tipo = this.el.tipo.value;
    this.el.nivelContainer.style.display = tipo === "clase" ? "block" : "none";
    this.el.tipoActividadContainer.style.display = tipo === "actividad" ? "block" : "none";
    this.el.bandaContainer.style.display = tipo === "actividad" ? "block" : "none";
    this.actualizarUbicaciones();
  }

  actualizarUbicaciones() {
    const tipo = this.el.tipo.value;
    const dia = this.el.dia.value;
    const hora = this.el.hora.value;
    const duracion = parseFloat(this.el.duracion.value);

    const ubicaciones = tipo === "clase" ? UBICACIONES_CLASES : UBICACIONES_ACTIVIDADES;
    const disponibles = ubicaciones.filter((ub) => this.verificarDisponibilidad(dia, hora, ub, duracion));

    this.el.ubicacion.innerHTML = disponibles.length
      ? disponibles.map((u) => `<option value="${u}">${u}</option>`).join("")
      : '<option value="">No hay ubicaciones disponibles</option>';

    this.el.ubicInfo.textContent = `${disponibles.length} ubicaciones disponibles`;
  }

  guardar() {
    const nombre = this.el.nombre.value.trim();
    if (!nombre) return alert("Por favor, ingresa un nombre para el evento");

    if (!this.el.ubicacion.options.length || !this.el.ubicacion.value)
      return alert("No hay ubicaciones disponibles para esta fecha y hora");

    const nuevoEvento = {
      id: Date.now(),
      tipo: this.el.tipo.value,
      nombre,
      dia: this.el.dia.value,
      hora: this.el.hora.value,
      duracion: parseFloat(this.el.duracion.value),
      ubicacion: this.el.ubicacion.value,
      profesores: document.getElementById("formProfesores").value,
      estilo: this.el.estilo.value,
      nivel: this.el.nivel.value,
      tipoActividad: this.el.tipoActividad.value,
      banda: this.el.banda.value,
      descripcion: this.el.descripcion.value,
    };

    const eventos = this.getEventos();
    eventos.push(nuevoEvento);
    this.setEventos(eventos);
    this.modal.close("modalFormulario");
  }
}