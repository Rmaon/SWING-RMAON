import { DIAS, UBICACIONES_CLASES, UBICACIONES_ACTIVIDADES } from "../constants";

export default class ScheduleRenderer {
  constructor({ gridEl, diasBtnsEl, onCellDrop, onEventClick, onStartDrag, tipoVistaGetter, diaGetter }) {
    this.gridEl = gridEl;
    this.diasBtnsEl = diasBtnsEl;
    this.onCellDrop = onCellDrop;
    this.onEventClick = onEventClick;
    this.onStartDrag = onStartDrag;
    this.getTipoVista = tipoVistaGetter;
    this.getDia = diaGetter;
  }

  generarHorarios(dia) {
    const horarios = [];
    const inicio = dia === "viernes" ? 20 : 10;
    const fin = dia === "domingo" ? 20 : 24;
    for (let h = inicio; h < fin; h++) {
      const hh = h.toString().padStart(2, "0");
      horarios.push(`${hh}:00`);
      if (h !== fin - 1) horarios.push(`${hh}:30`);
    }
    return horarios;
  }

  renderDias({ diaSeleccionado, onChange }) {
    this.diasBtnsEl.innerHTML = DIAS.map(
      (dia) => `
        <button class="btn-filter ${dia === diaSeleccionado ? "active" : ""}" data-dia="${dia}" style="text-transform: capitalize;">${dia}</button>
      `
    ).join("");

    this.diasBtnsEl.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => onChange(b.dataset.dia))
    );
  }

  renderGrid({ eventos }) {
    const dia = this.getDia();
    const tipoVista = this.getTipoVista();
    const horarios = this.generarHorarios(dia);
    const ubicaciones = tipoVista === "clases" ? UBICACIONES_CLASES : UBICACIONES_ACTIVIDADES;
    const eventosFiltrados = eventos.filter((e) => e.dia === dia && e.tipo === tipoVista);

    this.gridEl.style.gridTemplateColumns = `100px repeat(${ubicaciones.length}, minmax(150px, 1fr))`;

    let html = `
      <div class="schedule-header">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Hora
      </div>
      ${ubicaciones
        .map(
          (ub) => `
        <div class="schedule-header">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          ${ub}
        </div>`
        )
        .join("")}
    `;

    horarios.forEach((hora) => {
      html += `<div class="schedule-time">${hora}</div>`;
      ubicaciones.forEach((ubicacion) => {
        const evento = eventosFiltrados.find((e) => e.hora === hora && e.ubicacion === ubicacion);
        html += `
          <div class="schedule-cell" data-dia="${dia}" data-hora="${hora}" data-ubicacion="${ubicacion}">
            ${
              evento
                ? `
              <div class="event-card ${evento.tipo}" draggable="true" data-event-id="${evento.id}">
                <div class="event-title">${evento.nombre}</div>
                ${evento.estilo ? `<div class="event-subtitle">${evento.estilo}</div>` : ""}
                ${evento.nivel ? `<div class="event-subtitle">${evento.nivel}</div>` : ""}
                ${evento.duracion > 1 ? `<div class="event-subtitle">${evento.duracion}h</div>` : ""}
              </div>`
                : ""
            }
          </div>`;
      });
    });

    this.gridEl.innerHTML = html;

    // Wire up DnD + clicks
    this.gridEl.querySelectorAll(".schedule-cell").forEach((cell) => {
      cell.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        cell.classList.add("drag-over");
      });
      cell.addEventListener("dragleave", () => cell.classList.remove("drag-over"));
      cell.addEventListener("drop", (e) => {
        e.preventDefault();
        cell.classList.remove("drag-over");
        this.onCellDrop({
          dia: cell.dataset.dia,
          hora: cell.dataset.hora,
          ubicacion: cell.dataset.ubicacion,
        });
      });
    });

    this.gridEl.querySelectorAll(".event-card").forEach((card) => {
      const id = Number(card.dataset.eventId);
      card.addEventListener("dragstart", (e) => {
        card.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        this.onStartDrag(id);
      });
      card.addEventListener("dragend", () => card.classList.remove("dragging"));
      card.addEventListener("click", () => this.onEventClick(id));
    });
  }
}