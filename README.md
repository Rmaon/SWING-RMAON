# SWING-RMAON
## 📘 Descripción del Proyecto

**SWING-RMAON** es una aplicación web desarrollada como parte de las asignaturas:

- 🧩 **Diseño de Interfaces**
- 💻 **Diseño de Entorno Cliente**

El proyecto tiene como objetivo crear un sistema visual e interactivo para la **gestión de eventos y clases del Swing CR Festival 2026**.  
Permite **organizar horarios, gestionar ubicaciones, crear eventos** y realizar **interacciones de tipo drag & drop** de manera dinámica e intuitiva.

---

## 🧠 Tecnologías Utilizadas

- ⚡ **Vite** – entorno de desarrollo rápido para proyectos modernos.
- 🧱 **JavaScript (ES Modules)** – estructura modular y orientada a objetos.
- 🎨 **CSS3** – diseño adaptable y responsivo.
- 💾 **LocalStorage** – persistencia de los eventos en el navegador.
- 🧭 **HTML dinámico** – manipulación DOM sin frameworks externos.

---

## 🧩 Estructura del Proyecto

```
vite-schedule-app/
├─ index.html
├─ resources/
│  └─ logoSwing.png
├─ src/
│  ├─ main.js
│  ├─ style.css
│  ├─ constants.js
│  ├─ state.js
│  ├─ models/
│  │  └─ Event.js
│  ├─ services/
│  │  ├─ StorageService.js
│  │  ├─ TimeUtils.js
│  │  └─ ScheduleService.js
│  └─ ui/
│     ├─ Renderer.js
│     ├─ FormController.js
│     └─ Modals.js
└─ vite.config.js
```

---

## 🧭 Funcionalidades Principales

- 📅 **Vista de horarios interactiva** (por días y ubicaciones).
- 🏷️ **Gestión de clases y actividades** (crear, mover, eliminar).
- 🔄 **Arrastrar y soltar eventos** para reorganizar fácilmente los horarios.
- 💾 **Persistencia automática** mediante `localStorage`.
- 🖼️ **Interfaz visual limpia y moderna**, con el logo institucional del festival.

---

## 👨‍🎨 Autor

Proyecto desarrollado por:

**RMAON**  
💻 Estudiante de **Diseño de Interfaces** y **Diseño de Entorno Cliente**  
📍 Ciclo Formativo de Desarrollo de Aplicaciones Web (DAW)  
📅 Año académico 2025


```
_________________________________________________________________
                      |
                      |            .'
                  \   |   /
               `.  .d88b.   .'
                  d888888b
      --     --  (88888888)  --
                  Y888888Y
              .'   `Y88Y'   `.
                  /       \
           .'         !        `.
       .,,-~&,               ,~"~.
      { /___/\`.             > ::::
     { `}'~.~/\ \   ` `     <, ?::;
     {`}'\._/  ) }   ) )     l_  f
      ,__/ l_,'-/  .'.'    ,__}--{_.
     {  `.__.' (          /         }
      \ \    )  )        /          !
       \-\`-'`-'        /  ,    1  J;
  ` `   \ \___l,-_,___.'  /1    !  Y
   ) )   k____-~'-l_____.' |    l /
 .'.'   /===#==\           l     f
      .'        `.         I===I=I
    ,' ,'       `.`.       f     }
  ,' ,'  /      \ `.`.     |     }
.'^.^.^.'`.'`.^.'`.'`.^.   l    Y;
           `.   \          }    |
            !`,  \         |    |
            l /   }       ,1    |
            l/   /        !l   ,l
            /  ,'         ! \    \
           /  /!          !  \    \
    ' '   / ,f l          l___j.   \
   ( (   (_ \l_ `_    ,.-'`--(  `.,'`.
    `.`.  Y\__Y`--'   `-'~x__J    j'  >
                                ,/ ,^'
                               f__J
```
