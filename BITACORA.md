## Reto 1

- Datos: Tomó aproximadamente 15 minutos.
- Tomamos la captura del reto, luego a Claude le pedimos que nos ayudara a realizar un buen prompt estructurado y finalmente, haciendo uso de Claude Code generamos la aplicación. La IA decidió un scaffolding y definió los requerimientos mínimos de la app. Por nuestra parte, decidimos usar Next Js para contar con una app en typescript en el frontend y backend.
- El front de la aplicación esta demasiado genérico y en el apartado de registrar mascotas no hay ninguna validación.
- Hariamos uso de herramientas que mejoren las pantallas siguiendo las leyes de UX y las heurísticas de Nielsen algún tipo de validación.

## Reto 2 — Cambian las reglas

- Fecha: 30 de octubre de 2026.
- Minutos reales: pendientes de completar por el equipo; no se estimaron.
- Decisión: entidad Responsable y relación muchos a muchos mediante responsableIds, manteniendo JSON y las dependencias existentes.
- Migración: respaldo previo, conservación de IDs y visitas, normalización por nombre y teléfono, ejecución repetible sin duplicar registros. Se verificaron las cuatro mascotas reales, incluida Volcan, y las cuatro visitas contra el respaldo.
- Interfaz: formulario con responsables nuevos/existentes, filas agregables y removibles, fichas enlazadas en ambos sentidos y búsqueda por cualquier responsable.
- Compatibilidad: creación con dueno/telefono; respuestas con esos campos derivados del primer responsable. Mezclar formatos devuelve 400.
- Validación: solicitudes completas antes de persistir; rechazo de duplicados, responsables inexistentes, edad inválida y campos vacíos. Escritura conjunta y atómica del JSON en un único proceso.
- Pruebas: 11 escenarios automatizados más su prueba contenedora (12 resultados aprobados), con archivos temporales. TypeScript aprobado. Compilación con Webpack aprobada; Turbopack inicialmente encontró restricciones del entorno para abrir puertos.
- Navegador: en una copia temporal se registró Luna prueba con Ana Prueba y Luis Prueba; luego Sol prueba reutilizando a Ana. Se comprobó el detalle con los dos responsables y la ficha de Ana con ambas mascotas. No se agregaron datos de prueba a la base real.
- Pendiente del cierre: minutos reales, commit de entrega y tag reto2, check en Miro. No se realizaron el tag ni el check.

### Prompt utilizado

<details>
<summary>Solicitud de implementación del reto 2</summary>

Implementa el Reto 2: “Cambian las reglas” sobre la aplicación de clínica veterinaria de este repositorio.
Objetivo
La clínica necesita registrar mascotas con varios responsables, por ejemplo, los integrantes de una familia. Al abrir una mascota deben aparecer todos sus responsables y al abrir un responsable deben aparecer todas sus mascotas.
Implementa el cambio completo sobre la aplicación existente, conservando sus funciones y datos.
Contexto del proyecto
- La aplicación está en vet-clinic/.
- Utiliza Next.js App Router, TypeScript y Tailwind.
- La persistencia está en vet-clinic/data/db.json, mediante vet-clinic/lib/db.ts.
- Los modelos están en vet-clinic/lib/types.ts.
- Actualmente Mascota contiene dueno: string y telefono: string; no existe una entidad independiente de responsable.
- El formulario está en components/MascotaForm.tsx.
- El listado usa app/page.tsx y components/MascotaCard.tsx.
- El detalle está en app/mascotas/[id]/page.tsx.
- La API actual permite listar, buscar y crear mascotas, consultar su detalle y registrar y consultar visitas.
- El buscador permite buscar por nombre de mascota o dueño.
- Hay datos existentes que deben conservarse, incluida la mascota Volcan.
- README.md y BITACORA.md están en la raíz del repositorio.
Antes de modificar código, lee vet-clinic/AGENTS.md y las guías locales de Next.js pertinentes que indica ese archivo. Inspecciona el estado actual y respeta los cambios existentes.
1. Modelo de datos y migración
Introduce una entidad Responsable con id, nombre y telefono. Guarda los responsables en una colección propia y relaciona cada mascota mediante responsableIds: string[].
La relación debe permitir:
- Uno o varios responsables por mascota.
- Varias mascotas asociadas al mismo responsable.
- Identificación por ID, sin depender del nombre para consultar relaciones.
Migra los campos actuales dueno y telefono sin perder mascotas, identificadores ni visitas. Conserva los teléfonos como texto.
La migración debe ser segura y repetible: crea un respaldo antes de modificar los datos y evita duplicar responsables o asociaciones al ejecutarla nuevamente. Para los registros antiguos, reutiliza un responsable únicamente cuando coincidan nombre y teléfono normalizados; no fusiones personas solo por su nombre. No conviertas una lectura ordinaria de la base de datos en una escritura.
Usa las relaciones como fuente de verdad. Si conservas campos antiguos para compatibilidad, derívalos del primer responsable y documenta esa decisión.
2. Registro de mascotas
Actualiza el formulario para:
- Registrar una mascota con uno, dos o más responsables.
- Seleccionar responsables existentes y crear responsables nuevos dentro del flujo.
- Agregar y quitar responsables antes de guardar.
- Exigir al menos un responsable y evitar asociaciones repetidas.
Valida tanto en el formulario como en el servidor los campos obligatorios, los responsables seleccionados y la edad no negativa. Rechaza IDs inexistentes y solicitudes mal formadas con mensajes claros en español.
Valida toda la solicitud antes de persistir y guarda los nuevos responsables y la mascota conjuntamente, evitando registros parciales si ocurre un error.
3. Consulta y navegación
- En el detalle de la mascota, muestra todos sus responsables, con nombre, teléfono y enlace a su ficha.
- Crea /responsables/[id] con los datos del responsable y todas sus mascotas, enlazadas a sus respectivos detalles.
- Permite llegar a estas fichas desde el detalle de la mascota.
- Adapta las tarjetas y los textos que actualmente hablan de un único dueño.
- Conserva la búsqueda por mascota y amplíala para encontrar coincidencias en cualquiera de sus responsables, sin duplicar resultados.
- Mantén el estilo visual actual y evita enlaces anidados dentro de las tarjetas.
4. Persistencia y API
Adapta las funciones de datos y los endpoints afectados. Añade los endpoints de responsables necesarios para seleccionar responsables existentes y consultar sus mascotas.
Mantén las rutas actuales y sus funciones. Conserva la aceptación del formato antiguo de creación con dueno y telefono, transformándolo al nuevo modelo. Define y documenta qué ocurre si una solicitud mezcla los formatos antiguo y nuevo.
Las mascotas y responsables inexistentes deben producir un 404. Las visitas deben seguir asociadas al mismo mascotaId, conservando el historial y su orden.
5. Verificación
Comprueba estos escenarios con datos temporales, sin contaminar la información real:
1. Registrar una mascota con dos responsables.
2. Abrirla y ver a ambos, con sus datos y enlaces.
3. Asociar uno de esos responsables a otra mascota y comprobar que su ficha muestra ambas.
4. Buscar por el segundo responsable y encontrar la mascota.
5. Registrar una mascota con un solo responsable.
6. Rechazar formularios sin responsables, IDs inexistentes y campos obligatorios vacíos.
7. Confirmar que las mascotas anteriores conservan sus datos y visitas.
8. Registrar una nueva visita y comprobar que aparece correctamente.
9. Ejecutar nuevamente la migración y comprobar que no duplica datos.
Ejecuta la comprobación de TypeScript y npm run build desde vet-clinic. No supongas que existe un script de pruebas: revisa package.json. Indica qué verificaste realmente y cualquier comprobación pendiente.

Al terminar, resume los cambios y relaciona cada criterio de aceptación con su verificación. Incluye los pasos pendientes para el cierre del taller: tag `reto2` y check en Miro, sin afirmar que se completaron si no los realizaste.
Prioriza una solución pequeña y funcional acorde con el reto de 20 minutos. Conserva la persistencia JSON y las dependencias actuales; limita los cambios a lo necesario para este objetivo. Explica brevemente el enfoque y después implementa.

</details>
