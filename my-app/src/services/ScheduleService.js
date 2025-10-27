import { horaADecimal, generarHorariosPorDia } from "./TimeUtils.js";
import {
  DIAS,
  UBICACIONES_CLASES,
  UBICACIONES_ACTIVIDADES,
} from "../constants.js";

export class ScheduleService {
  constructor(state, storage) {
    this.state = state;
    this.storage = storage;
  }
  Schedul;
  init() {
    this.state.eventos = this.storage.load();
  }

  persist() {
    this.storage.save(this.state.eventos);
  }

  getUbicaciones() {
    return this.state.tipoVista === "clases"
      ? UBICACIONES_CLASES
      : UBICACIONES_ACTIVIDADES;
  }

  getTipoFiltro() {
    return this.state.tipoVista === "clases" ? "clase" : "actividad";
  }

  getDias() {
    return DIAS;
  }

  generarHorariosPorDia(dia) {
    return generarHorariosPorDia(dia);
  }

  verificarDisponibilidad(dia, hora, ubicacion, duracion, eventoId = null) {
    const horaNum = horaADecimal(hora);
    const horaFin = horaNum + parseFloat(duracion);
    return !this.state.eventos.some((e) => {
      if (eventoId && e.id === eventoId) return false;
      if (e.dia !== dia || e.ubicacion !== ubicacion) return false;
      const eHoraNum = horaADecimal(e.hora);
      const eHoraFin = eHoraNum + parseFloat(e.duracion);
      return horaNum < eHoraFin && horaFin > eHoraNum;
    });
  }

  addEvento(evt) {
    this.state.eventos.push(evt);
    this.persist();
  }

  removeEvento(id) {
    this.state.eventos = this.state.eventos.filter((e) => e.id !== id);
    this.persist();
  }

  moveEvento(id, { dia, hora, ubicacion }) {
    this.state.eventos = this.state.eventos.map((e) =>
      e.id === id ? { ...e, dia, hora, ubicacion } : e
    );
    this.persist();
  }

  getEventosFiltrados() {
    const tipo = this.getTipoFiltro();
    return this.state.eventos.filter((e) => e.tipo === tipo);
  }
}
