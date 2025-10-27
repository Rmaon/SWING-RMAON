export class EventItem {
  constructor({
    id = Date.now(),
    tipo, // 'clase' | 'actividad'
    nombre,
    dia,
    hora,
    duracion,
    ubicacion,
    profesores = "",
    estilo = "",
    nivel = "",
    tipoActividad = "",
    banda = "",
    descripcion = "",
  }) {
    Object.assign(this, {
      id,
      tipo,
      nombre,
      dia,
      hora,
      duracion: parseFloat(duracion),
      ubicacion,
      profesores,
      estilo,
      nivel,
      tipoActividad,
      banda,
      descripcion,
    });
  }
}
