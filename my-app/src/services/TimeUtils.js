export function generarHorariosPorDia(dia) {
  const horarios = [];
  const { horaInicio, horaFin } = dia;
  for (let h = horaInicio; h < horaFin; h++) {
    const hh = h.toString().padStart(2, "0");
    horarios.push(`${hh}:00`);
    if (h !== horaFin - 1) horarios.push(`${hh}:30`);
  }
  return horarios;
}

export function horaADecimal(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h + m / 60;
}
