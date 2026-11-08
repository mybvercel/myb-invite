# Onboarding para Sonnet: Panel del organizador 2.0

Documento de trabajo. Lo escribió Opus para que Sonnet desarrolle, fase por fase, la
ampliación del panel del organizador de MyB Invite (`/panel/[slug]`). Leelo entero
antes de tocar código. Cada fase termina en un commit que compila y se puede subir.

---

## 0. Reglas de la casa (no negociables)

1. **Repo**: `C:\Users\benja\OneDrive\Desktop\MYB Digitals\myb-invite` (rama `main`,
   remoto `mybvercel/myb-invite`). No toques el repo viejo `website` ni nada que no sea
   el panel. Si algo de afuera del panel parece roto, avisá en vez de arreglarlo.
2. **Next.js 16.2 + React 19 + TypeScript**. `AGENTS.md` avisa que Next cambió: ante la
   duda, leé `node_modules/next/dist/docs/` antes de usar una API.
3. **Idioma**: todo el código, los nombres y los textos en español rioplatense, como el
   resto del repo (`cambiar`, `invitados`, `Confirmá`, `Agregá`). Comentarios cortos que
   explican el porqué, con la misma densidad que `src/panel/logica.ts`.
4. **Diseño**:
   - Sin emojis. En ningún lado: ni textos, ni botones, ni estados vacíos.
   - Sin "kickers": nada de rótulos chiquitos encima de los títulos ("N.º 02 —", "SECCIÓN").
     Benja lo pidió dos veces.
   - Seguí el lenguaje que ya tiene `src/app/panel/panel.css`: líneas finas en vez de
     tarjetas con sombra, radios de 3px (nunca píldoras), cifras tabulares, el acento
     usado poco (ítem activo, botón principal, cosas hechas). Montserrat en todo.
   - Íconos, si hacen falta: SVG de trazo de 16px como los de deshacer/rehacer en
     `Panel.tsx`. Nada de librerías de íconos nuevas.
   - 100% responsive. Se prueba a 375, 768 y 1280 px. Sin scroll horizontal de página.
5. **Estado**: todo cambio pasa por `cambiar(f, clave)` (ver sección 1). Nunca `setDoc`
   directo. Así funcionan solos el autoguardado, el deshacer (Ctrl+Z) y el control de
   conflictos entre dos celulares.
6. **Servidor**: cada campo nuevo del documento se valida en `sanearDoc` y se completa en
   `normalizar` (`src/panel/logica.ts`). Si no lo agregás ahí, el servidor lo borra al
   guardar y parece que "no guarda".
7. **Verificación por fase** (en este orden, una sola vez al final de la fase):
   - `npx tsc --noEmit`
   - `npx eslint <archivos que tocaste>`
   - `node scripts/probar-panel.mjs` (ampliarlo con cada pantalla nueva)
   - `npx next build`
   - Capturas con Edge headless a 375 y 1280 (ver sección 7). **No abras el panel de
     Browser de la app**: se cierra por un problema de GPU.
   - Si `next build` falla con "next/font/google queries have exactly one entry", es un
     error intermitente de Turbopack: corré el build de nuevo antes de investigar.
8. **Commits**: uno por fase, mensaje que empieza con `@ Panel:` y termina con la línea
   de coautoría que indique la sesión. Push a `origin/main` sólo si Benja lo pide.
9. **Ahorro**: Benja pide gastar pocos créditos. Leé sólo la parte del archivo que
   necesitás, ediciones quirúrgicas, nada de reescribir archivos enteros que funcionan.

---

## 1. Cómo funciona hoy el panel

| Archivo | Qué hace |
|---|---|
| `src/panel/tipos.ts` | Forma del documento `DocPanel` (invitados, salón, tema, ajustes, descartes) y los planes. |
| `src/panel/logica.ts` | Lógica pura: métricas, sentar, salón, `sanearDoc` (validación del servidor) y `normalizar` (migración de paneles viejos). |
| `src/components/panel/Panel.tsx` | Contenedor: autoguardado (900 ms), deshacer/rehacer, exportar Excel, cabecera, pestañas y la vista activa. |
| `src/components/panel/{Resumen,Invitados,Links,Mesas,Salon,Estilo,Fechas}.tsx` | Una vista por pestaña. `piezas.tsx` tiene piezas compartidas (`Cifra`, `EditorEtiquetas`). |
| `src/components/panel/Plano.tsx`, `Muebles.tsx` | Plano del salón en SVG. |
| `src/components/panel/Asistente.tsx` + `src/panel/agente/*` | Asistente de texto y voz que arma el salón (hoy vive dentro de Salón). |
| `src/app/panel/panel.css` | Todos los estilos, bajo `.pnl`. |
| `src/app/api/panel/[slug]/route.ts` | GET/PUT del documento con versión (concurrencia optimista, tope 2 MB). |
| `src/lib/panel-almacen.ts`, `panel-acceso.ts` | Dónde se guarda (Neon / archivo / memoria) y la clave por evento. |
| `scripts/probar-panel.mjs` | Prueba de humo: renderiza cada pestaña con `renderToString`. |

Puntos clave:

- **Un evento = un documento.** Se guarda entero con número de versión.
- **`Cambiar`**: `(f: (d: DocPanel) => DocPanel, clave?: string) => void`. Cambios seguidos
  con la misma `clave` en menos de 700 ms se deshacen de una vez (usalo al tipear en un
  campo: `clave = "tarea:" + id + ":titulo"`).
- **Planes**: `esencial`, `completa`, `completa-plus`. Hoy sólo `completa-plus`
  (`esPlanCompleto`) ve Resumen, Links, Mesas, Salón y Estilo; los otros ven Invitados.
- **Invitado = una fila que puede representar varias personas** (`personas`), con un
  `grupo` de texto ("Familia Gómez") y una sola `mesa`. Hoy se sienta por familia o fila
  completa (`Mesas.tsx`, `unidadesSinMesa`). Esto cambia en la fase 7.
- **Probar en local**: `npx next dev`, y abrir `http://localhost:3000/panel/rosa?plan=completa-plus`.
  En desarrollo el panel entra sin clave y las demos aceptan `?plan=`.

---

## 2. Qué se pide (palabras de Benja, ordenadas)

1. **Checklist** de lo que ya se hizo y lo que falta.
2. **Asignar responsables**: "este se encarga de esto" (fotógrafo, luces, DJ, comida,
   catering, etc.).
3. **Cronograma** para ir preparándolo.
4. **Mesas con personitas**: ver las familias y cada persona, y poder agarrar a cada una
   y ponerla en la mesa que quieras (por afinidad).
5. **Cotizar todo** en un solo lugar.
6. **Las opciones del panel al costado** (menú lateral), sin emojis.

Más lo que surgió de investigar (sección 8).

---

## 3. Principios de UX

- **Una herramienta de trabajo, no un dashboard de plantilla.** Densidad de planilla,
  pero con aire. Cada pantalla responde una pregunta: "¿qué me falta?", "¿quién hace
  qué?", "¿cuánto llevo gastado?", "¿quién se sienta con quién?".
- **Todo conectado.** Una tarea puede tener responsable (un proveedor o una persona) y
  fecha; un pago tiene vencimiento; los vencimientos y las tareas atrasadas aparecen en
  el Resumen y en el cronograma. Nada de módulos sueltos que se repiten.
- **Arrancar lleno, no vacío.** Checklist, rubros y cronograma del día traen una
  plantilla editable según el tipo de evento. El organizador borra lo que no usa.
- **Editar en el lugar.** Click en un texto y se edita ahí (como ya hace Invitados). Sin
  modales para cosas chicas; un panel lateral (ficha) para el detalle.
- **Táctil primero.** Objetivos de toque de 44 px, arrastrar con Pointer Events (anda en
  celular y en mouse), y siempre una alternativa sin arrastrar (tocar y elegir).
- **Teclado y lector de pantalla.** Checkboxes nativos, `aria-current` en el menú, foco
  visible, Escape cierra fichas y el menú en celular.
- **Estados vacíos útiles**: una frase y un botón que resuelve ("Cargá tu primer
  proveedor"). Sin ilustraciones ni emojis.

---

## 4. Navegación: menú lateral

### Escritorio (>= 64rem)

```
+------------------+-------------------------------------------------------+
| Clara & Julián   |  Checklist                         [Ver invitación]   |
| 18 jun 2027      |  24 de 41 hechas        Guardado   [Bajar Excel]      |
| faltan 222 días  |  ---------------------------------------------------- |
|                  |                                                       |
|  Resumen         |   (contenido de la sección)                           |
|  Checklist  24/41|                                                       |
|  Cronograma      |                                                       |
|  ------------    |                                                       |
|  Invitados   148 |                                                       |
|  Links        32 |                                                       |
|  Mesas   120/148 |                                                       |
|  Salón    480 m² |                                                       |
|  ------------    |                                                       |
|  Equipo       12 |                                                       |
|  Presupuesto 62% |                                                       |
|  ------------    |                                                       |
|  Estilo          |                                                       |
|                  |                                                       |
|  [deshacer][rehacer]                                                     |
+------------------+-------------------------------------------------------+
```

- Columna fija de 15rem, `position: sticky; top: 0; height: 100svh`, fondo `--superficie`,
  borde derecho de 1px `--linea`.
- Arriba: nombres (fuente `--display`), fecha y cuenta regresiva (reusar `Fechas`).
- Ítems: texto a la izquierda, dato tabular a la derecha (cantidades, progreso). Activo:
  fondo `--acento-suave` y barra de 2px del acento a la izquierda.
- **Grupos separados sólo por una línea fina**, sin títulos de grupo (regla de "sin kickers").
- La cabecera del contenido queda con el título de la sección, el estado de guardado y
  las acciones (Ver invitación, Bajar Excel).
- La banda de "respuestas nuevas" y la de conflicto quedan arriba del contenido, como hoy.

### Celular y tablet (< 64rem)

```
+-------------------------------------+
| [Menú]  Checklist          Guardado |
+-------------------------------------+
|  contenido                          |
```

- Barra superior fija con botón "Menú" (texto, 44 px) y el nombre de la sección.
- El menú abre un cajón desde la izquierda (85% del ancho, máx. 20rem) con los mismos
  ítems, fondo velado detrás. Cierra con Escape, tocando afuera o eligiendo una sección.
  Foco atrapado mientras está abierto. Animación de 220 ms con `--salida`, y sin
  animación si `prefers-reduced-motion`.

### Planes

Los planes `esencial` y `completa` siguen viendo sólo Invitados: con una sola sección no
se muestra el menú, igual que hoy. Las secciones nuevas son de `completa-plus` salvo que
Benja decida otra cosa (sección 9).

---

## 5. Modelo de datos nuevo

Agregar a `src/panel/tipos.ts`. Todos los campos son opcionales para los paneles viejos:
`normalizar` los completa con su valor inicial.

```ts
/* ── Equipo: quién se encarga de qué ───────────────────────── */

export type Rubro =
  | "salon" | "catering" | "barra" | "fotografia" | "video" | "musica" | "luces"
  | "ambientacion" | "flores" | "torta" | "vestuario" | "belleza" | "ceremonia"
  | "show" | "cotillon" | "souvenirs" | "transporte" | "alojamiento"
  | "organizacion" | "otro";

export const RUBROS: { id: Rubro; nombre: string }[]; // "Salón", "Catering", "DJ y música", ...

export type EstadoProveedor = "buscando" | "cotizando" | "contratado" | "descartado";

/** Un proveedor o una persona del entorno (la tía que hace los souvenirs). */
export type Responsable = {
  id: string;
  rubro: Rubro;
  nombre: string;          // "Estudio Luz", "Tía Marta"
  contacto: string;        // persona de contacto
  telefono: string;
  email: string;
  estado: EstadoProveedor;
  /** true si es alguien del entorno y no un proveedor que cobra. */
  esPersona: boolean;
  notas: string;
};

/* ── Presupuesto ───────────────────────────────────────────── */

export type Moneda = "ARS" | "USD";

export type Cotizacion = {
  id: string;
  rubro: Rubro;
  responsableId: string | null;  // a quién se le pidió
  descripcion: string;           // "Paquete foto + video, 8 h"
  monto: number;
  moneda: Moneda;
  /** La elegida del rubro: cuenta para el total del presupuesto. Una por rubro. */
  elegida: boolean;
  notas: string;
};

export type Pago = {
  id: string;
  responsableId: string | null;
  concepto: string;        // "Seña", "Segundo pago", "Saldo"
  monto: number;
  moneda: Moneda;
  vence: string;           // "AAAA-MM-DD" o ""
  pagado: boolean;
  pagadoEl: string;        // "AAAA-MM-DD" o ""
};

export type Presupuesto = {
  /** Tope que se pusieron. 0 = sin tope. */
  tope: number;
  moneda: Moneda;
  /** Dólar de referencia para sumar ARS y USD en un solo total. 0 = no se suma. */
  dolar: number;
};

/* ── Checklist ─────────────────────────────────────────────── */

export type Etapa = "12m" | "9m" | "6m" | "3m" | "1m" | "semana" | "dia" | "despues";

export type Tarea = {
  id: string;
  titulo: string;
  hecha: boolean;
  hechaEl: string;              // ISO, para el historial
  etapa: Etapa;
  vence: string;                // "AAAA-MM-DD" o "" (si está vacío se calcula por etapa)
  responsableId: string | null; // proveedor o persona del Equipo
  rubro: Rubro | null;          // para conectar con Equipo y Presupuesto
  notas: string;
  origen: "plantilla" | "manual";
};

/* ── Cronograma del día (minuto a minuto) ──────────────────── */

export type Momento = {
  id: string;
  hora: string;                 // "HH:MM"
  titulo: string;               // "Entrada de los novios"
  lugar: string;                // "Salón principal"
  responsables: string[];       // ids del Equipo (DJ, fotógrafo, catering)
  notas: string;                // "Canción: ..."
};

/* ── Mesas: personas y afinidad ────────────────────────────── */

/** Una persona dentro de una fila de invitados. */
export type Miembro = {
  id: string;
  nombre: string;               // "Acompañante 2" hasta que le pongan nombre
  /** null = va con la mesa de su fila (`Invitado.mesa`). */
  mesa: string | null;
};

export type Afinidad = {
  id: string;
  a: string;                    // id de invitado (fila o familia)
  b: string;
  tipo: "juntos" | "separados";
};
```

Cambios en tipos existentes:

- `Invitado` suma `miembros: Miembro[]`.
- `DocPanel` suma `equipo: Responsable[]`, `cotizaciones: Cotizacion[]`, `pagos: Pago[]`,
  `presupuesto: Presupuesto`, `tareas: Tarea[]`, `plantilla: "casamiento" | "quince" |
  "cumple" | "empresa" | ""` (la elegida para el checklist; vacío = todavía no eligieron),
  `momentos: Momento[]`, `afinidades: Afinidad[]`.
- `docVacio` los inicializa vacíos; `presupuesto = { tope: 0, moneda: "ARS", dolar: 0 }`.

Validación en `sanearDoc` (topes, con los helpers `txt`, `num` que ya existen):

| Campo | Tope | Reglas |
|---|---|---|
| `equipo` | 120 | `rubro` dentro de `RUBROS`, textos 80, notas 400 |
| `cotizaciones` | 400 | `monto` 0 a 1e10, `elegida` sólo una por rubro (si llegan varias, queda la primera) |
| `pagos` | 400 | fechas con `/^\d{4}-\d{2}-\d{2}$/` o "" |
| `tareas` | 400 | `titulo` 140 obligatorio, `etapa` válida, `responsableId` debe existir en `equipo` o queda null |
| `momentos` | 150 | `hora` con `/^\d{2}:\d{2}$/`, `responsables` filtrados contra `equipo` |
| `afinidades` | 600 | `a` y `b` deben existir en `invitados` y ser distintos; sin duplicados |
| `miembros` | 30 por invitado | `mesa` debe ser una mesa existente o null |

Al sumar todo, el documento crece unos KB: el tope de 2 MB del PUT sobra.

---

## 6. Las secciones

### 6.1 Checklist

**Pregunta que responde**: ¿qué hice y qué me falta?

```
Checklist                                       [+ Tarea]   [Plantilla]
24 de 41 hechas   ================------  58%
Filtros: (Todas) (Pendientes) (Atrasadas 3) (Mías por responsable v)

Faltan 12 meses o más
 [x] Definir el presupuesto total                       hecho 02/03
 [x] Reservar el salón               Salón · Quinta Los Olivos
 [ ] Contratar fotógrafo             Fotografía · sin asignar   vence 15/09  !
...
Último mes
 [ ] Pasar el número final al catering   Catering · Sabores    vence 04/06
```

- Primera vez: se pregunta qué evento es (Casamiento, Quince, Cumpleaños, Evento de
  empresa) y se carga la plantilla (sección 6.7). "Plantilla" permite cambiarla después
  (agrega las que faltan, no borra las propias ni las hechas).
- Agrupado por etapa, con el título de la etapa como encabezado normal (no rótulo chico).
- Cada fila: checkbox nativo, título editable en el lugar, chip de rubro y responsable
  (elegible de una lista del Equipo, o "Agregar responsable" que crea uno nuevo), fecha.
- Vencimiento: si `vence` está vacío, se calcula desde la fecha del evento y la etapa
  (12m = 365 días antes, 9m = 270, 6m = 180, 3m = 90, 1m = 30, semana = 7, dia = 0,
  despues = +14). Atrasada = no hecha y vencida: fecha en `--alerta`.
- Tocar la fila abre la ficha lateral (notas, responsable, fecha exacta, borrar).
- Marcar como hecha: tilde con transición corta de 160 ms y el título pasa a `--tinta-3`
  tachado. No se mueve de lugar (no reordenar mientras el usuario mira).
- Progreso en el menú lateral: "24/41".

### 6.2 Equipo (quién se encarga de qué)

**Pregunta que responde**: ¿quién hace cada cosa y cómo lo contacto?

```
Equipo                                                   [+ Agregar]
Contratados 7 · Cotizando 3 · Buscando 4

Rubro            Quién                Contacto            Estado
Fotografía       Estudio Luz          Juan · 351 555 ...  Contratado
DJ y música      —                    —                   Buscando   [Asignar]
Catering         Sabores              Ana · ...           Cotizando
Souvenirs        Tía Marta (persona)  351 ...             Contratado
```

- Arranca con los rubros típicos del tipo de evento en estado "Buscando" y sin nombre,
  para que se vea lo que falta cubrir de un vistazo.
- Un rubro puede tener varios candidatos (mientras cotizan); el contratado se destaca.
- Teléfono como link `tel:` y botón "WhatsApp" que abre `wa.me` con el número.
- Ficha lateral: datos, notas, sus tareas del checklist, sus cotizaciones, sus pagos y
  sus momentos del cronograma (todo lo que lo nombra, en un solo lugar).
- En celular la tabla pasa a lista de dos líneas (rubro arriba, quién y estado abajo).

### 6.3 Cronograma

Dos vistas con un selector simple arriba (dos botones, no pestañas anidadas):

**Preparación**: las tareas y los pagos con fecha en una línea de tiempo por mes.

```
Julio 2026
  03  Pago   Seña fotógrafo  USD 300           Estudio Luz
  15  Tarea  Contratar DJ                       sin asignar   atrasada
Agosto 2026
  ...
Hoy ----------------------------------------------------------
```

- La línea de "Hoy" separa pasado y futuro y la vista abre centrada en hoy.
- No duplica datos: lee `tareas` y `pagos`. Tocar un ítem lleva a su ficha.

**El día**: minuto a minuto, editable.

```
20:30  Recepción y cóctel        Jardín     Catering, DJ
21:30  Entrada de los novios     Salón      DJ, Fotografía   "Canción: ..."
23:00  Vals                      Pista      DJ, Video, Luces
```

- Hora editable con `<input type="time">`; la lista se ordena por hora al salir del campo.
- Responsables elegidos del Equipo (varios).
- Plantilla opcional por tipo de evento (sección 6.7).
- Botón "Imprimir" con una hoja de estilos `@media print` limpia (sin menú). Así se lo
  pueden mandar al DJ, al fotógrafo y al salón.

### 6.4 Mesas con personas y afinidad

**Pregunta que responde**: ¿quién se sienta con quién?

Modelo: cada fila de invitados tiene `miembros`, uno por persona esperada. La mesa de la
fila (`Invitado.mesa`) es la de toda la familia; un miembro con `mesa` propia la pisa.
Así no se rompe nada de lo que hoy usa `Invitado.mesa` (métricas, Excel, asistente,
sentar automático) y se puede separar a una persona sola.

Sincronización (función pura en `logica.ts`, `sincronizarMiembros(inv)`):
- La cantidad de miembros es `esperadas(inv)` (confirmados o esperados).
- Si sube, se agregan "Acompañante N" (el primero toma el nombre de la fila si es una
  persona sola). Si baja, se sacan primero los que no tienen nombre propio ni mesa propia.
- Se llama al confirmar (en `mezclarConfirmaciones`), al editar `personas` y en `normalizar`.

Ocupación: `ocupacion()` y `metricas()` cuentan por miembro (`m.mesa ?? inv.mesa`).

Pantalla:

```
Sin mesa (18)                         Mesas
+--------------------------+          +----------- Mesa 4  8/10 --+
| Familia Gómez  4   [v]   |          | (CG) (LG) (Caro) (TG) ... |
|   (Caro G.) (Luis G.)    |          | o o  libres               |
|   (Tomi G.) (Acomp. 4)   |          +---------------------------+
| Amigos facu   6   [v]    |          +----------- Principal 10/12 -+
+--------------------------+
```

- Columna "Sin mesa": familias plegables; desplegadas muestran a cada persona como chip
  con iniciales y nombre.
- Arrastrar la familia sienta a todos los que no tienen mesa; arrastrar un chip sienta a
  esa persona sola. Soltar sobre una mesa llena: no entra, la mesa tiembla 200 ms y un
  aviso dice cuántos lugares faltan.
- Sin arrastrar: tocar un chip o una familia la selecciona (borde del acento) y después
  tocar la mesa. Mismo flujo que hoy, extendido a personas.
- Dentro de una mesa, cada persona es un chip que se puede volver a arrastrar a otra
  mesa o a "Sin mesa". Los lugares libres se dibujan como círculos vacíos.
- Comidas especiales: punto chico en el chip con la restricción en el título accesible.
- Arrastre con Pointer Events (`setPointerCapture`), una copia fantasma del chip que
  sigue al dedo, y la mesa de destino resaltada. Funciona en el plano del salón también
  (soltar sobre la mesa dibujada).

**Afinidad**:
- En la ficha de un invitado: "Sentar junto a..." y "No sentar con..." (buscador de
  invitados). Se guarda en `afinidades`.
- El sentado automático (`sentar`) las respeta: primero agrupa a los "juntos" como una
  unidad si entran en una mesa, y nunca pone a dos "separados" en la misma mesa.
- Avisos en la parte superior de Mesas: "Gómez y Pérez están en la misma mesa y marcaste
  que no" con botón para ir a la mesa. Sin bloquear: decide el organizador.

### 6.5 Presupuesto

**Pregunta que responde**: ¿cuánto llevo, cuánto falta pagar y cuándo?

```
Presupuesto                                    Tope: $ 18.000.000 [editar]
Comprometido $ 12.400.000 (69%)   Pagado $ 5.100.000   Falta pagar $ 7.300.000
=============----------------  (barra apilada: pagado / comprometido / libre)

Próximos vencimientos
  15/07  Seña DJ            $ 300.000   Sonido Max      [Marcar pagado]
  01/08  Saldo fotógrafo    USD 900     Estudio Luz     vence en 12 días

Por rubro                Cotizaciones   Elegida            Pagado / Total
Fotografía               3              Estudio Luz  USD 1.200   300 / 1.200
Catering                 2              Sabores  $ 6.500.000      2.000.000 / 6.500.000
DJ y música              0              —                  [Pedir cotización]
```

- Por rubro, al abrir: comparador de cotizaciones lado a lado (proveedor, monto,
  descripción, notas) con "Elegir esta". Elegir una pone al proveedor como "Contratado"
  en el Equipo y ofrece armar el plan de pagos (seña + saldo con fechas).
- Montos con `Intl.NumberFormat("es-AR")`. ARS y USD se suman por separado; si cargan un
  dólar de referencia, se muestra además el total en pesos. No se buscan cotizaciones
  online: el valor lo pone el organizador.
- Barras hechas con CSS (divs con ancho %), sin librerías de gráficos.
- Pagos vencidos y no pagados en `--alerta` y en el Resumen.

### 6.6 Resumen (ampliado)

Agregar al Resumen actual, arriba de lo que ya muestra:
- Progreso del checklist y las próximas 3 tareas (con responsable).
- Próximos 3 vencimientos de pago.
- Rubros todavía sin cubrir ("Buscando").
- Avisos de afinidad rotos.
Cada bloque lleva a su sección. Nada de cifras decorativas.

### 6.7 Plantillas (contenido inicial)

Van en un archivo nuevo `src/panel/plantillas.ts`. Textos cortos, en imperativo.

**Casamiento, checklist**

- 12m: Definir el presupuesto total · Armar la lista tentativa de invitados · Elegir la
  fecha y reservar el salón · Sacar turno en el Registro Civil · Reservar la iglesia o
  el lugar de la ceremonia · Decidir si contratan organizadora
- 9m: Contratar el catering (si el salón no lo incluye) · Contratar fotografía y video ·
  Contratar DJ y sonido · Contratar ambientación y luces · Elegir vestido y traje ·
  Mandar el save the date · Elegir padrinos y testigos
- 6m: Mandar la invitación digital · Contratar torta y mesa dulce · Elegir souvenirs ·
  Contratar cotillón · Reservar maquillaje y peinado · Elegir las alianzas · Armar la
  lista de regalos o el alias · Organizar el traslado de invitados · Ver alojamiento
  para los que vienen de afuera · Reservar la luna de miel
- 3m: Completar los trámites del Registro Civil · Hacer la degustación del menú ·
  Elegir las canciones de los momentos clave · Confirmar horarios con cada proveedor ·
  Hacer la prueba de maquillaje y peinado
- 1m: Llamar a los que no confirmaron · Pasar el número final al catering · Armar el
  plano de mesas y mandarlo al salón · Armar el cronograma del día y mandarlo a los
  proveedores · Pagar los saldos pendientes · Última prueba de vestido y traje
- semana: Retirar vestido y traje · Preparar los sobres para pagar el día del evento ·
  Armar el bolso del día · Confirmar traslados
- despues: Agradecer a los invitados · Dejar reseñas a los proveedores · Descargar las
  fotos del álbum compartido

**Quince**: igual estructura, cambiando: vestido de quince y cambio de vestido, vals con
el padre, ceremonia de las velas o de los 15 momentos, video de fotos de la infancia,
entrada y coreografía, souvenirs, mesa dulce. Sin Registro Civil ni luna de miel.

**Cumpleaños**: versión corta (salón o casa, comida, torta, música, invitación,
confirmaciones, decoración, souvenirs) con etapas 3m, 1m, semana, dia, despues.

**Evento de empresa**: lugar, catering, registro y acreditación, técnica (sonido,
pantalla, proyector), oradores y agenda, prensa y fotografía, merchandising, comunicación
de la invitación, confirmaciones, informe posterior.

**Rubros iniciales del Equipo** (estado "Buscando"): casamiento = salón, catering,
fotografía, video, música, luces, ambientación, torta, vestuario, belleza, ceremonia,
cotillón, souvenirs. Quince = igual sin ceremonia, con show. Cumpleaños = salón,
catering, torta, música, ambientación. Empresa = salón, catering, video (técnica),
fotografía, organización.

**El día (casamiento)**, opcional y editable: 20:30 Recepción · 21:30 Entrada de los
novios · 22:00 Plato principal · 23:00 Vals · 23:30 Baile · 01:00 Mesa dulce y postre ·
02:30 Fin de fiesta · 04:30 Cierre. Quince: igual, con "Entrada de la quinceañera",
"Vals" y "Ceremonia de las velas". Empresa: Acreditación · Bienvenida · Charlas ·
Corte · Cierre y brindis.

---

## 7. Fases de trabajo

Cada fase: implementar, verificar (regla 0.7), commitear. No empezar la siguiente con la
anterior rota. Al terminar cada fase, mandar a Benja las capturas de 375 y 1280.

### Fase 0: maqueta para aprobar (sin tocar el panel)

- Hacer una maqueta HTML estática en el scratchpad con el menú lateral, Checklist,
  Equipo, Presupuesto y Mesas con personas, a 375 y 1280, con los estilos del panel.
- Mandarle las capturas a Benja y esperar su OK antes de la fase 1. Es la regla del
  proyecto: primero el diseño aprobado, después el código.

### Fase 1: menú lateral

- `Panel.tsx`: reemplazar `pnl-pestanas` por un componente nuevo `Menu.tsx` (escritorio
  columna sticky, celular cajón). Mover deshacer/rehacer al pie del menú en escritorio.
- `panel.css`: layout de dos columnas con `display: grid; grid-template-columns: 15rem
  minmax(0, 1fr)` desde 64rem; cajón con `transform: translateX(-100%)` y transición.
- Mantener el `Vista` como estado; sumar las vistas nuevas cuando existan (no mostrar
  ítems que todavía no tienen pantalla).
- Aceptación: mismas secciones de hoy, misma funcionalidad, el plan esencial sin menú,
  cajón accesible con teclado, sin scroll horizontal a 375.

### Fase 2: modelo de datos

- Tipos de la sección 5 en `tipos.ts`, `docVacio`, `sanearDoc`, `normalizar`.
- `src/panel/plantillas.ts` con las plantillas de 6.7 y una función
  `aplicarPlantilla(doc, tipo, fechaEvento)` que agrega tareas, rubros y momentos que
  falten (por título normalizado), sin borrar nada.
- `logica.ts`: `venceTarea(t, fechaEvento)`, `tareasAtrasadas`, `proximosPagos`,
  `totalesPresupuesto`, `sincronizarMiembros`, `afinidadesRotas`.
- Script nuevo `scripts/probar-datos.mjs` (con jiti, como `probar-panel.mjs`) que
  prueba: un doc viejo sin campos nuevos se normaliza bien; `sanearDoc` corta los topes y
  descarta referencias rotas; `aplicarPlantilla` no duplica si se llama dos veces;
  `sincronizarMiembros` sube y baja bien.
- Aceptación: un panel guardado antes de esta fase abre igual que antes.

### Fase 3: Equipo

- `Equipo.tsx` + ficha lateral. Alta rápida por rubro. Estados. WhatsApp y teléfono.
- Aceptación: crear, editar, cambiar estado, borrar (con deshacer), ver en celular.

### Fase 4: Presupuesto

- `Presupuesto.tsx`: resumen, barra, próximos vencimientos, tabla por rubro, comparador
  de cotizaciones, plan de pagos.
- Elegir cotización marca al proveedor como contratado.
- Aceptación: totales correctos con ARS y USD mezclados; con y sin dólar de referencia;
  marcar pagado mueve el monto de "Falta pagar" a "Pagado".

### Fase 5: Checklist

- `Checklist.tsx`: elección de plantilla la primera vez, agrupado por etapa, filtros,
  ficha, responsable desde el Equipo (o crear uno).
- Aceptación: progreso correcto en la sección y en el menú; atrasadas marcadas; aplicar
  la plantilla de nuevo no duplica.

### Fase 6: Cronograma

- `Cronograma.tsx` con las vistas Preparación (lee tareas y pagos) y El día (momentos).
- Hoja de impresión del día.
- Aceptación: la línea de Hoy en su lugar; editar una hora reordena; imprimir sale limpio.

### Fase 7: Mesas con personas y afinidad

- `Mesas.tsx`: chips por persona, arrastre con Pointer Events, selección por toque,
  lugares libres, afinidades en la ficha de Invitados, avisos.
- `sentar()` y `ocupacion()` por miembro y respetando afinidades.
- Revisar que Excel (hoja Mesas), métricas, Links y el asistente sigan bien.
- Aceptación: separar a una persona de su familia y volver a juntarla; arrastrar en
  celular (probar con emulación táctil) y con mouse; un "separados" nunca queda junto
  por el automático.

### Fase 8: Resumen y Excel

- Bloques nuevos del Resumen (6.6).
- Excel: hojas nuevas Checklist, Equipo, Presupuesto, Pagos y Cronograma del día.
- Aceptación: el Excel abre sin errores y con acentos bien.

### Capturas con Edge headless (sin el panel de Browser)

Script de ejemplo (guardarlo en el scratchpad):

```js
// node captura.mjs <carpeta> <url>
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
const [, , salida, url] = process.argv;
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const proc = spawn(edge, ["--headless=new", "--disable-gpu", "--remote-debugging-port=9350", `--user-data-dir=${salida}/perfil`, "about:blank"], { stdio: "ignore" });
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
let info;
for (let i = 0; i < 40; i++) { try { info = await (await fetch("http://127.0.0.1:9350/json")).json(); if (info.find((t) => t.type === "page")) break; } catch {} await dormir(250); }
const ws = new WebSocket(info.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) pend.get(d.id)(d); };
const cmd = (method, params = {}) => new Promise((r) => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); setTimeout(() => r({}), 8000); });
await cmd("Page.enable");
for (const [ancho, alto, movil] of [[375, 812, true], [1280, 800, false]]) {
  await cmd("Emulation.setDeviceMetricsOverride", { width: ancho, height: alto, deviceScaleFactor: 1, mobile: movil });
  await cmd("Page.navigate", { url }); await dormir(3000);
  const r = await cmd("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
  writeFileSync(`${salida}/panel-${ancho}.png`, Buffer.from(r.result.data, "base64"));
}
ws.close(); proc.kill(); process.exit(0);
```

En Git Bash, los heredocs rompen las barras invertidas: escribí los scripts con la
herramienta de escribir archivos, no con `cat <<EOF`.

---

## 8. Funciones extra (investigación)

Qué ofrecen las herramientas conocidas (Bodas.net, Zola, The Knot, Wedding Seat,
Aisle Planner) y qué se repite en foros y reseñas. Ordenado por valor para MyB Invite.

**Alta prioridad (después de las fases 1 a 8)**

1. **Recordatorios de vencimientos.** Un comentario que se repite es haber perdido una
   seña por pasarse de fecha. Primer paso sin servidor de mails: un aviso en el panel y un
   botón "Agregar a mi calendario" que baja un `.ics` con las fechas de pagos y tareas.
2. **Cronograma compartible con proveedores.** Un link de sólo lectura del minuto a
   minuto (token propio, como los links por familia) para mandarle al DJ, al fotógrafo y
   al salón. Necesita una ruta nueva y no exponer datos de invitados.
3. **Varias versiones del plano de mesas** ("plan A" y "plan B"), algo que Wedding Seat
   destaca. Útil cuando todavía no está la lista final.
4. **Importar desde planilla.** Pegar o subir un Excel/CSV de invitados y proveedores.
   Ya existe el pegado de listas en Invitados: extenderlo a columnas.
5. **Colaboradores con permisos.** Que la organizadora o los padres entren con su propia
   clave y sólo vean lo que les toca (por ejemplo, Presupuesto oculto).

**Media**

6. Lista de lo recibido y agradecimientos: quién regaló qué y si ya se le agradeció.
7. Hoja para el catering: menú por mesa con las restricciones, lista para imprimir.
8. Documentos por proveedor: guardar el contrato o el presupuesto en PDF (requiere
   almacenamiento de archivos).
9. Asistente de voz para el resto del panel: "agregá una tarea: confirmar al DJ para el
   viernes", "el fotógrafo cobra 1200 dólares". El motor ya existe en `src/panel/agente/`.
10. Alojamiento y traslados: quién duerme dónde y quién va en el micro.

**Baja**

11. Notas de canciones pedidas por los invitados (ya llega `cancion` en la confirmación):
    juntarlas en una lista para el DJ.
12. Vista para imprimir el plano de mesas con nombres, para la entrada del salón.

Fuentes consultadas:
- [Bodas.net: organiza tu boda con estas 5 herramientas](https://www.bodas.net/articulos/organiza-tu-boda-con-estas-5-herramientas--c9499)
- [Bodas.net: presupuestador](https://www.bodas.net/articulos/presupuestador-bodas-net--c125)
- [Bodas.net: agenda de tareas](https://www.bodas.net/articulos/agenda-tareas-bodas-net--c7450)
- [Wedding Seat en Capterra](https://www.capterra.com/p/10050162/Wedding-Seat/)
- [RaftLabs: cómo construir una plataforma de bodas](https://www.raftlabs.com/blog/how-to-build-wedding-planning-platform)
- [Zola: mejores apps para organizar la boda](https://www.zola.com/expert-advice/best-wedding-planning-apps)
- [DEV: el error de USD 2800 que evitó una planilla](https://dev.to/sheetcraftco/the-2800-wedding-mistake-a-spreadsheet-prevented-5g1a)
- [Fueled: análisis de la app de The Knot](https://fueled.com/blog/wedding-planner-app-the-knot/)
- [WeddingWire: foro de herramientas de planificación](https://www.weddingwire.com/wedding-forums/planning-tools/5efbd0302e800973.html)
- [planning.wedding: cronograma típico](https://planning.wedding/es/timeline/typical)

Nota: no se encontraron hilos de Reddit en las búsquedas; lo de "foros" sale de WeddingWire
y de reseñas. Las listas de funciones de las páginas de producto son lo que dicen los
propios vendedores.

---

## 9. Decisiones abiertas para Benja (con lo que se hace si no contesta)

| Decisión | Por defecto |
|---|---|
| ¿Qué plan ve las secciones nuevas? | Sólo Completa + (como Mesas y Salón hoy). |
| ¿El checklist y el presupuesto también en los planes Esencial y Completa como gancho? | No por ahora. |
| ¿Moneda principal? | Pesos, con dólares por rubro y dólar de referencia opcional. |
| ¿La maqueta de la fase 0 se hace en Claude Design o en HTML? | HTML estático en el scratchpad, por costo. |
| ¿Cuál de las funciones extra va primero? | Recordatorios con `.ics` y cronograma compartible. |

---

## 10. Antes de cerrar cada fase

- [ ] Todo cambio pasa por `cambiar` y se puede deshacer.
- [ ] Campos nuevos validados en `sanearDoc` y completados en `normalizar`.
- [ ] Un panel viejo abre sin errores.
- [ ] Sin emojis, sin rótulos chicos sobre los títulos, sin píldoras.
- [ ] 375 y 1280 sin scroll horizontal; objetivos de toque de 44 px.
- [ ] `tsc`, `eslint` de lo tocado, `probar-panel.mjs`, `probar-datos.mjs` y `next build` en verde.
- [ ] Capturas mandadas a Benja.
- [ ] Commit `@ Panel: ...` con la línea de coautoría.

---

## 11. Estado del trabajo

Decisión de Benja: **moneda principal = ARS y USD** (cada cotización y cada pago lleva su
moneda; no hay una "principal"). El dólar de referencia sigue siendo opcional.

| Fase | Estado |
|---|---|
| 0. Maqueta | Salteada: Benja pidió avanzar; se muestra con capturas del panel real. |
| 1. Menú lateral | Hecha (`Menu.tsx`, columna fija desde 64rem y cajón en celular). |
| 2. Modelo de datos | Parcial: `equipo`, `tareas`, `plantilla`, `cotizaciones`, `pagos`, `presupuesto` (tope por moneda y dólar de referencia) + `plantillas.ts` + validación + `scripts/probar-datos.mjs`. Faltan `momentos`, `afinidades`, `miembros`. |
| 5. Checklist | Hecha (`Checklist.tsx`, con responsable creable desde la ficha, hoja nueva en el Excel y bloque en el Resumen). |
| 3. Equipo | Hecha (`Equipo.tsx`: alta, ficha, estados, WhatsApp, rubros sin cubrir, lo que tiene asignado). |
| 4. Presupuesto | Hecha (`Presupuesto.tsx`: totales ARS y USD, tope, dólar de referencia, próximos pagos, cotizaciones por rubro, pagos, seña y saldo). |
| 6, 7, 8 | Pendientes. Sigue Cronograma, después Mesas con personas y el cierre del Resumen y el Excel. |

Notas para quien siga:
- La vista Equipo todavía no existe: el responsable se crea desde la ficha de una tarea
  y vive en `doc.equipo`. Al construir Equipo, reutilizar ese mismo arreglo.
- Para probar el panel en local hay que usar `next dev` (con `next start` el panel de
  demos da 404 porque no hay motor de datos en memoria).
- El nombre `pnl-barra` ya era la barra de progreso; la barra de arriba del contenido
  se llama `pnl-tope`.
