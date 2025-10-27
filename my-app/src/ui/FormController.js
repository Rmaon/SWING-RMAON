import { EventItem } from "../models/Event.js";
import { abrirModal, cerrarModal } from "./Modals.js";

export class FormController {
  constructor(scheduleService) {
    this.svc = scheduleService;
  }
  abrirFormulario() {
    const tipo = this.svc.getTipoFiltro();
    document.getElementById("formTipo").value = tipo;
    document.getElementById("formDia").value = "viernes";
    document.getElementById("formHora").value = "20:00";
    document.getElementById("formDuracion").value = "1";
    document.getElementById("formNombre").value = "";
    document.getElementById("formProfesores").value = "";
    document.getElementById("formEstilo").value = "";
    document.getElementById("formNivel").value = "";
    document.getElementById("formTipoActividad").value = "";
    document.getElementById("formBanda").value = "";
    document.getElementById("formDescripcion").value = "";

    this.actualizarFormulario();
    abrirModal("modalFormulario");
  }
  actualizarFormulario() {
    const tipo = document.getElementById("formTipo").value;
    document.getElementById("nivelContainer").style.display =
      tipo === "clase" ? "block" : "none";
    document.getElementById("tipoActividadContainer").style.display =
      tipo === "actividad" ? "block" : "none";
    document.getElementById("bandaContainer").style.display =
      tipo === "actividad" ? "block" : "none";
    this.actualizarUbicaciones();
  }

  actualizarUbicaciones() {
    const tipo = document.getElementById("formTipo").value;
    const dia = document.getElementById("formDia").value;
    const hora = document.getElementById("formHora").value;
    const duracion = parseFloat(document.getElementById("formDuracion").value);

    const ubicaciones = this.svc.getUbicaciones();
    const disponibles = ubicaciones.filter((ub) =>
      this.svc.verificarDisponibilidad(dia, hora, ub, duracion)
    );

    const select = document.getElementById("formUbicacion");
    select.innerHTML = disponibles.length
      ? disponibles.map((ub) => `<option value="${ub}">${ub}</option>`).join("")
      : '<option value="">No hay ubicaciones disponibles</option>';

    document.getElementById(
      "ubicacionesInfo"
    ).textContent = `${disponibles.length} ubicaciones disponibles`;
  }
  guardarEvento() {
    const nombre = document.getElementById("formNombre").value.trim();
    if (!nombre) return alert("Por favor, ingresa un nombre para el evento");

    const disponibles = document.getElementById("formUbicacion").options.length;
    if (disponibles === 0)
      return alert("No hay ubicaciones disponibles para esta fecha y hora");

    const nuevoEvento = new EventItem({
      tipo: document.getElementById("formTipo").value,
      nombre,
      dia: document.getElementById("formDia").value,
      hora: document.getElementById("formHora").value,
      duracion: parseFloat(document.getElementById("formDuracion").value),
      ubicacion: document.getElementById("formUbicacion").value,
      profesores: document.getElementById("formProfesores").value,
      estilo: document.getElementById("formEstilo").value,
      nivel: document.getElementById("formNivel").value,
      tipoActividad: document.getElementById("formTipoActividad").value,
      banda: document.getElementById("formBanda").value,
      descripcion: document.getElementById("formDescripcion").value,
    });

    this.svc.addEvento(nuevoEvento);
    cerrarModal("modalFormulario");
  }
}
