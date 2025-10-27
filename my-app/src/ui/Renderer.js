import { abrirModal, cerrarModal } from "./Modals.js";

export class Renderer {
  constructor(scheduleService) {
    this.svc = scheduleService;
    this.grid = null;
  }

  mountGrid() {
    this.grid = document.getElementById("scheduleGrid");
  }

  renderHorario() {
    const ubicaciones = this.svc.getUbicaciones();
    const eventos = this.svc.getEventosFiltrados();

    this.grid.style.gridTemplateColumns = `100px repeat(${ubicaciones.length}, minmax(150px, 1fr))`;

    let html = `
      <div class="schedule-header ubicaciones">
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

    this.svc.getDias().forEach((diaInfo) => {
      html += `<div class="day-separator">
        <svg class="icon" style="display: inline-block; vertical-align: middle; width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        ${diaInfo.nombre}
      </div>`;

      const horarios = this.svc.generarHorariosPorDia(diaInfo);
      const celdasOcupadas = new Set();

      horarios.forEach((hora, indexHora) => {
        html += `<div class="schedule-time">${hora}</div>`;
        ubicaciones.forEach((ubicacion) => {
          const celdaKey = `${diaInfo.nombre}-${hora}-${ubicacion}`;
          if (celdasOcupadas.has(celdaKey)) return;

          const evento = eventos.find(
            (e) =>
              e.hora === hora &&
              e.ubicacion === ubicacion &&
              e.dia === diaInfo.nombre
          );

          if (evento) {
            const slotsOcupados = Math.ceil(evento.duracion * 2);
            for (let i = 1; i < slotsOcupados; i++) {
              if (indexHora + i < horarios.length) {
                const horaSiguiente = horarios[indexHora + i];
                celdasOcupadas.add(
                  `${diaInfo.nombre}-${horaSiguiente}-${ubicacion}`
                );
              }
            }

            html += `
              <div class="schedule-cell"
                   data-dia="${diaInfo.nombre}"
                   data-hora="${hora}"
                   data-ubicacion="${ubicacion}"
                   style="grid-row: span ${slotsOcupados};">
                <div class="event-card ${
                  evento.tipo
                }" draggable="true" data-id="${evento.id}">
                  <div class="event-title">${evento.nombre}</div>
                  ${
                    evento.estilo
                      ? `<div class="event-subtitle">${evento.estilo}</div>`
                      : ""
                  }
                  ${
                    evento.nivel
                      ? `<div class="event-subtitle">${evento.nivel}</div>`
                      : ""
                  }
                  <div class="event-subtitle">${
                    evento.duracion
                  }h (${hora})</div>
                </div>
              </div>`;
          } else {
            html += `
              <div class="schedule-cell"
                   data-dia="${diaInfo.nombre}"
                   data-hora="${hora}"
                   data-ubicacion="${ubicacion}">
              </div>`;
          }
        });
      });
    });

    this.grid.innerHTML = html;
    this._addListeners();
  }

  _addListeners() {
    // Drag start/end & click
    this.grid.querySelectorAll(".event-card").forEach((card) => {
      card.addEventListener("dragstart", (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        this.itemArrastrado =
          this.svc.state.eventos.find((ev) => ev.id === id) || null;
        e.currentTarget.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });
      card.addEventListener("dragend", (e) => {
        e.currentTarget.classList.remove("dragging");
        this.grid
          .querySelectorAll(".schedule-cell")
          .forEach((c) => c.classList.remove("drag-over"));
        this.itemArrastrado = null;
      });
      card.addEventListener("click", (e) => {
        const eventoId = parseInt(e.currentTarget.dataset.id);
        this.mostrarDetalle(eventoId);
      });
    });

    // Drag over/leave/drop en celdas
    this.grid.querySelectorAll(".schedule-cell").forEach((cell) => {
      cell.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        cell.classList.add("drag-over");
      });
      cell.addEventListener("dragleave", () =>
        cell.classList.remove("drag-over")
      );
      cell.addEventListener("drop", (e) => {
        e.preventDefault();
        cell.classList.remove("drag-over");
        if (!this.itemArrastrado) return;

        const nuevoDia = cell.dataset.dia;
        const nuevaHora = cell.dataset.hora;
        const nuevaUbicacion = cell.dataset.ubicacion;

        const ok = this.svc.verificarDisponibilidad(
          nuevoDia,
          nuevaHora,
          nuevaUbicacion,
          this.itemArrastrado.duracion,
          this.itemArrastrado.id
        );
        if (ok) {
          this.svc.moveEvento(this.itemArrastrado.id, {
            dia: nuevoDia,
            hora: nuevaHora,
            ubicacion: nuevaUbicacion,
          });
          this.renderHorario();
        } else {
          alert("Esta ubicación no está disponible en ese horario");
        }
        this.itemArrastrado = null;
      });
    });
  }

  mostrarDetalle(eventoId) {
    const evento = this.svc.state.eventos.find((e) => e.id === eventoId);
    if (!evento) return;

    const header = document.getElementById("detalleHeader");
    header.className = `modal-header ${evento.tipo}`;

    document.getElementById("detalleNombre").textContent = evento.nombre;
    document.getElementById("detalleFecha").innerHTML = `
      <svg class="icon" style="display: inline-block; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <span style="text-transform: capitalize;">${evento.dia}</span>
      <svg class="icon" style="display: inline-block; vertical-align: middle; margin-left: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      ${evento.hora} - ${evento.duracion}h`;

    let bodyHTML = `
      <div class="info-row">
        <svg class="icon" style="color: #ea580c;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <span class="info-label">Ubicación:</span>
        <span>${evento.ubicacion}</span>
      </div>`;

    if (evento.estilo) {
      bodyHTML += `
        <div class="info-row">
          <svg class="icon" style="color: #ea580c;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
          </svg>
          <span class="info-label">Estilo:</span>
          <span>${evento.estilo}</span>
        </div>`;
    }

    if (evento.nivel) {
      bodyHTML += `
        <div class="info-row">
          <span class="info-label">Nivel:</span>
          <span class="badge badge-blue">${evento.nivel}</span>
        </div>`;
    }

    if (evento.tipoActividad) {
      bodyHTML += `
        <div class="info-row">
          <span class="info-label">Tipo:</span>
          <span class="badge badge-purple">${evento.tipoActividad}</span>
        </div>`;
    }

    if (evento.profesores) {
      bodyHTML += `
        <div class="info-row" style="align-items: flex-start;">
          <svg class="icon" style="color: #ea580c; margin-top: 0.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <div>
            <span class="info-label">Profesores:</span>
            <div style="font-size: 0.9rem;">${evento.profesores}</div>
          </div>
        </div>`;
    }

    if (evento.banda) {
      bodyHTML += `
        <div class="info-row">
          <svg class="icon" style="color: #ea580c;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
          </svg>
          <span class="info-label">Banda:</span>
          <span>${evento.banda}</span>
        </div>`;
    }

    if (evento.descripcion) {
      bodyHTML += `
        <div style="margin-top: 1rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem;">
          <p style="font-size: 0.9rem; color: #374151;">${evento.descripcion}</p>
        </div>`;
    }

    bodyHTML += `
      <button class="btn btn-delete" data-delete-id="${evento.id}">Eliminar Evento</button>`;

    document.getElementById("detalleBody").innerHTML = bodyHTML;
    abrirModal("modalDetalle");

    document
      .querySelector("[data-delete-id]")
      ?.addEventListener("click", () => {
        if (confirm("¿Estás seguro de eliminar este evento?")) {
          this.svc.removeEvento(evento.id);
          cerrarModal("modalDetalle");
          this.renderHorario();
        }
      });
  }
}
