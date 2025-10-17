import "./styles.css";
import { DIAS } from "./constants";
import EventStore from "./storage/EventStore";
import ScheduleRenderer from "./ui/ScheduleRenderer";
import DragDropManager from "./ui/DragDropManager";
import ModalManager from "./ui/ModalManager";

export default class App {
  constructor() {
    this.store = new EventStore();
    this.modal = new ModalManager();
    this.drag = new DragDropManager();

    this.state = {
      eventos: this.store.load(),
      diaSeleccionado: "viernes",
      tipoVista: "clases", // 'clases' | 'actividad'
    };

    this.refs = {
      grid: document.getElementById("scheduleGrid"),
      diasBtns: document.getElementById("diasBtns"),
      btnClases: document.getElementById("btnClases"),
      btnActividades: document.getElementById("btnActividades"),
      detalleHeader: document.getElementById("detalleHeader"),
      detalleNombre: document.getElementById("detalleNombre"),
      detalleFecha: document.getElementById("detalleFecha"),
      detalleBody: document.getElementById("detalleBody"),
    };

    this.schedule = new ScheduleRenderer({
      gridEl: this.refs.grid,
      diasBtnsEl: this.refs.diasBtns,
      onCellDrop: (dest) => this.onDrop(dest),
      onEventClick: (id) => this.mostrarDetalle(id),
      onStartDrag: (id) => this.drag.start(this.state.eventos.find((e) => e.id === id)),
      tipoVistaGetter: () => this.state.tipoVista,
      diaGetter: () => this.state.diaSeleccionado,
    });

    this.bindFilters();
    this.render();
  }

  bindFilters() {
    this.schedule.renderDias({
      diaSeleccionado: this.state.diaSeleccionado,
      onChange: (dia) => {
        this.state.diaSeleccionado = dia;
        this.schedule.renderDias({ diaSeleccionado: dia, onChange: (d) => this.changeDay(d) });
        this.renderGrid();
      },
    });

    this.refs.btnClases.addEventListener("click", () => this.cambiarTipo("clases"));
    this.refs.btnActividades.addEventListener("click", () => this.cambiarTipo("actividad"));
  }

  changeDay(dia) {
    this.state.diaSeleccionado = dia;
    this.schedule.renderDias({ diaSeleccionado: dia, onChange: (d) => this.changeDay(d) });
    this.renderGrid();
  }

  cambiarTipo(tipo) {
    this.state.tipoVista = tipo;
    this.refs.btnClases.classList.toggle("active", tipo === "clases");
    this.refs.btnActividades.classList.toggle("active", tipo === "actividad");
    this.renderGrid();
  }

  render() {
    this.schedule.renderDias({
      diaSeleccionado: this.state.diaSeleccionado,
      onChange: (d) => this.changeDay(d),
    });
    this.renderGrid();
    this.bindForm();
  }

  renderGrid() {
    this.schedule.renderGrid({ eventos: this.state.eventos });
  }

  bindForm() {
    // Lazy import para evitar ciclos y cargar sólo cuando exista el DOM
    import("./ui/FormController").then(({ default: FormController }) => {
      this.form = new FormController({
        modal: this.modal,
        store: this.store,
        getEventos: () => this.state.eventos,
        setEventos: (evs) => {
          this.state.eventos = evs;
          this.store.save(evs);
          this.renderGrid();
        },
        verificarDisponibilidad: (...args) => this.verificarDisponibilidad(...args),
        defaults: () => ({ tipoVista: this.state.tipoVista, dia: this.state.diaSeleccionado }),
      });
    });
  }

  horaADecimal(hora) {
    const [h, m] = hora.split(":").map(Number);
    return h + m / 60;
  }

  verificarDisponibilidad(dia, hora, ubicacion, duracion, eventoId = null) {
    const horaNum = this.horaADecimal(hora);
    const horaFin = horaNum + parseFloat(duracion);

    return !this.state.eventos.some((e) => {
      if (eventoId && e.id === eventoId) return false;
      if (e.dia !== dia || e.ubicacion !== ubicacion) return false;
      const eHoraNum = this.horaADecimal(e.hora);
      const eHoraFin = eHoraNum + parseFloat(e.duracion);
      return horaNum < eHoraFin && horaFin > eHoraNum;
    });
  }

  onDrop({ dia, hora, ubicacion }) {
    const item = this.drag.get();
    if (!item) return;

    if (this.verificarDisponibilidad(dia, hora, ubicacion, item.duracion, item.id)) {
      this.state.eventos = this.state.eventos.map((e) =>
        e.id === item.id ? { ...e, dia, hora, ubicacion } : e
      );
      this.store.save(this.state.eventos);
      this.renderGrid();
    } else {
      alert("Esta ubicación no está disponible en ese horario");
    }

    this.drag.clear();
  }

  mostrarDetalle(eventoId) {
    const evento = this.state.eventos.find((e) => e.id === eventoId);
    if (!evento) return;

    this.refs.detalleHeader.className = `modal-header ${evento.tipo}`;
    this.refs.detalleNombre.textContent = evento.nombre;
    this.refs.detalleFecha.innerHTML = `
      <svg class="icon" style="display:inline-block;vertical-align:middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <span style="text-transform: capitalize;">${evento.dia}</span>
      <svg class="icon" style="display:inline-block;vertical-align:middle;margin-left:1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      ${evento.hora} - ${evento.duracion}h`;

    let bodyHTML = `
      <div class="info-row">
        <svg class="icon" style="color:#ea580c;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <span class="info-label">Ubicación:</span>
        <span>${evento.ubicacion}</span>
      </div>`;

    if (evento.estilo) {
      bodyHTML += `
        <div class="info-row">
          <svg class="icon" style="color:#ea580c;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
          </svg>
          <span class="info-label">Estilo:</span>
          <span>${evento.estilo}</span>
        </div>`;
    }

    if (evento.nivel) {
      bodyHTML += `<div class="info-row"><span class="info-label">Nivel:</span><span class="badge badge-blue">${evento.nivel}</span></div>`;
    }

    if (evento.tipoActividad) {
      bodyHTML += `<div class="info-row"><span class="info-label">Tipo:</span><span class="badge badge-purple">${evento.tipoActividad}</span></div>`;
    }

    if (evento.profesores) {
      bodyHTML += `
        <div class="info-row" style="align-items:flex-start;">
          <svg class="icon" style="color:#ea580c;margin-top:.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <div>
            <span class="info-label">Profesores:</span>
            <div style="font-size:.9rem;">${evento.profesores}</div>
          </div>
        </div>`;
    }

    if (evento.banda) {
      bodyHTML += `
        <div class="info-row">
          <svg class="icon" style="color:#ea580c;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
          </svg>
          <span class="info-label">Banda:</span>
          <span>${evento.banda}</span>
        </div>`;
    }

    if (evento.descripcion) {
      bodyHTML += `<div style="margin-top:1rem;padding:1rem;background:#f9fafb;border-radius:.5rem;"><p style="font-size:.9rem;color:#374151;">${evento.descripcion}</p></div>`;
    }

    bodyHTML += `<button class="btn btn-delete" id="btnEliminar">Eliminar Evento</button>`;

    this.refs.detalleBody.innerHTML = bodyHTML;

    document.getElementById("btnEliminar").addEventListener("click", () => this.eliminarEvento(evento.id));

    this.modal.open("modalDetalle");
  }

  eliminarEvento(id) {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;
    this.state.eventos = this.state.eventos.filter((e) => e.id !== id);
    this.store.save(this.state.eventos);
    this.modal.close("modalDetalle");
    this.renderGrid();
  }
}