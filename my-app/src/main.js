import "./style.css";
import { StorageService } from "./services/StorageService.js";
import { ScheduleService } from "./services/ScheduleService.js";
import { Renderer } from "./ui/Renderer.js";
import { FormController } from "./ui/FormController.js";
import { state } from "./state.js";

// HTML de la app (igual que en tu implementación original)
function injectAppShell() {
  document.querySelector("#app").innerHTML = `
    <header>
      <div class="header-content">
        <div class="header-title">
          <img src="/resources/logoSwing.png" alt="Logo Swing CR" class="logo-img" style="width: 5rem; height: 5rem; margin-right: 1rem; border-radius: 50%; object-fit: cover;">
          <div>
            <h1>Swing CR Festival 2026</h1>
            <p class="subtitle">Sistema de Gestión de Eventos</p>
          </div>
        </div>
        <button class="btn btn-primary" id="btnNuevoEvento">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nuevo Evento
        </button>
      </div>
    </header>

    <nav class="nav-bar">
      <div class="nav-content">
        <button class="btn-filter active" data-vista="clases">Clases</button>
        <button class="btn-filter" data-vista="actividad">Actividades</button>
      </div>
    </nav>

    <div class="container">
      <div class="schedule-wrapper">
        <div class="schedule-container">
          <div class="schedule-grid" id="scheduleGrid"></div>
        </div>
      </div>
    </div>

    <div class="modal" id="modalFormulario">
      <div class="modal-content">
        <div class="modal-header form">
          <h2>Registrar Nuevo Evento</h2>
          <button class="btn-close" data-close="modalFormulario">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <div class="form-row">
              <div>
                <label class="form-label">Tipo</label>
                <select class="form-select" id="formTipo">
                  <option value="clase">Clase</option>
                  <option value="actividad">Actividad</option>
                </select>
              </div>
              <div>
                <label class="form-label">Nombre *</label>
                <input type="text" class="form-input" id="formNombre" required>
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="form-row">
              <div>
                <label class="form-label">Día *</label>
                <select class="form-select" id="formDia">
                  <option value="viernes">Viernes</option>
                  <option value="sabado">Sábado</option>
                  <option value="domingo">Domingo</option>
                </select>
              </div>
              <div>
                <label class="form-label">Hora *</label>
                <input type="time" class="form-input" id="formHora">
              </div>
              <div>
                <label class="form-label">Duración (horas)</label>
                <input type="number" class="form-input" id="formDuracion" value="1" min="0.5" max="4" step="0.5">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Ubicación *</label>
            <select class="form-select" id="formUbicacion"></select>
            <p class="help-text" id="ubicacionesInfo"></p>
          </div>

          <div class="form-group">
            <div class="form-row">
              <div>
                <label class="form-label">Estilo</label>
                <select class="form-select" id="formEstilo">
                  <option value="">Seleccionar</option>
                  <option value="Lindy Hop">Lindy Hop</option>
                  <option value="Shag">Shag</option>
                  <option value="Solo Jazz">Solo Jazz</option>
                  <option value="Balboa">Balboa</option>
                  <option value="Charleston">Charleston</option>
                </select>
              </div>
              <div id="nivelContainer">
                <label class="form-label">Nivel</label>
                <select class="form-select" id="formNivel">
                  <option value="">Seleccionar</option>
                  <option value="Básico">Básico</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
              <div id="tipoActividadContainer" style="display: none;">
                <label class="form-label">Tipo Actividad</label>
                <select class="form-select" id="formTipoActividad">
                  <option value="">Seleccionar</option>
                  <option value="Taster">Taster</option>
                  <option value="Social">Social</option>
                  <option value="Concierto">Concierto</option>
                  <option value="Mix & Match">Mix & Match</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Profesores/as</label>
            <input type="text" class="form-input" id="formProfesores" placeholder="Nombres separados por comas">
          </div>

          <div class="form-group" id="bandaContainer" style="display: none;">
            <label class="form-label">Banda</label>
            <input type="text" class="form-input" id="formBanda">
          </div>

          <div class="form-group">
            <label class="form-label">Descripción</label>
            <textarea class="form-textarea" id="formDescripcion"></textarea>
          </div>

          <div class="form-row">
            <button class="btn btn-primary" id="btnGuardarEvento">Registrar Evento</button>
            <button class="btn btn-secondary" data-close="modalFormulario">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" id="modalDetalle">
      <div class="modal-content">
        <div class="modal-header" id="detalleHeader">
          <div>
            <h2 id="detalleNombre"></h2>
            <div id="detalleFecha" style="margin-top: 0.5rem; font-size: 0.9rem; opacity: 0.9;"></div>
          </div>
          <button class="btn-close" data-close="modalDetalle">×</button>
        </div>
        <div class="modal-body" id="detalleBody"></div>
      </div>
    </div>
  `;
}

function wireShellEvents(formCtrl, renderer, scheduleService) {
  // Cambiar tipo de vista
  document.querySelectorAll(".btn-filter").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".btn-filter")
        .forEach((b) => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      const tipo = e.currentTarget.dataset.vista; // 'clases' | 'actividad'
      state.tipoVista = tipo;
      renderer.renderHorario();
    });
  });

  // Abrir formulario
  document
    .getElementById("btnNuevoEvento")
    .addEventListener("click", () => formCtrl.abrirFormulario());

  // Cerrar modales genérico
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-close");
      document.getElementById(id)?.classList.remove("show");
    });
  });

  // Click fuera para cerrar modal
  window.addEventListener("click", (event) => {
    if (event.target.classList?.contains("modal"))
      event.target.classList.remove("show");
  });

  // Form dynamics
  document
    .getElementById("formTipo")
    .addEventListener("change", () => formCtrl.actualizarFormulario());
  document
    .getElementById("formDia")
    .addEventListener("change", () => formCtrl.actualizarUbicaciones());
  document
    .getElementById("formHora")
    .addEventListener("change", () => formCtrl.actualizarUbicaciones());
  document
    .getElementById("formDuracion")
    .addEventListener("change", () => formCtrl.actualizarUbicaciones());

  // Guardar
  document.getElementById("btnGuardarEvento").addEventListener("click", () => {
    formCtrl.guardarEvento();
    renderer.renderHorario();
  });
}

// Bootstrap
const scheduleService = new ScheduleService(state, StorageService);
const renderer = new Renderer(scheduleService);
const formCtrl = new FormController(scheduleService);

document.addEventListener("DOMContentLoaded", () => {
  injectAppShell();
  scheduleService.init();
  renderer.mountGrid();
  renderer.renderHorario();
  wireShellEvents(formCtrl, renderer, scheduleService);
});
