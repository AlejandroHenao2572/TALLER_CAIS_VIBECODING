## Reto 1

- Datos: Tomó aproximadamente 15 minutos.
- Tomamos la captura del reto, luego a Claude le pedimos que nos ayudara a realizar un buen prompt estructurado y finalmente, haciendo uso de Claude Code generamos la aplicación. La IA decidió un scaffolding y definió los requerimientos mínimos de la app. Por nuestra parte, decidimos usar Next Js para contar con una app en typescript en el frontend y backend.
- El front de la aplicación esta demasiado genérico y en el apartado de registrar mascotas no hay ninguna validación.
- Hariamos uso de herramientas que mejoren las pantallas siguiendo las leyes de UX y las heurísticas de Nielsen algún tipo de validación.

## Reto 2

- Datos: Tomó aproximadamente 15 minutos.
- Al cambiar los roles, teníamos que nuevamente contextualizar a nuestra herramienta de inteligencia artificial, para esto tomamos captura del reto 2 y preparamos las funciones necesarias. Primero identificamos dónde podríamos añadir las funciones necesarias para cumplir los criterios de aceptación, en esta ocasión utilizamos Chat-GPT Astra
- Al tener que iniciar nuevamente el proceso la herramienta de inteligencia artificial se demora más.
- Haríamos enfoque en aplicar patrones de diseño que mantengan buenas prácticas y eviten problemas.

## Reto 3
- Datos: Hicimos un fork del repo del equipo A, ellos hicieoron un SPA en React con las funcionalidades definidas en el reto 1 y 2. Tenemos una aplicacion a nivel funcional muy similar a la que hicimos en los retons anteriores, pero con un front mas detallado y completo.

- Que hicimos y que decidio la AI por nosotros: Clonamos el proyecto, probamos sus funcionalidades y corrio correctamente. Le pedimos a ClaudeCode que primero analizara todo el proyecto para tener un mejor contexto y luego le pedimos que nos ayudara a realizar un prompt estructurado para implementar las nuevas funcionalidades. 

- Que nos sorprendio o salio mal: Nos sorprendio que a pesar de ser otro proyecto hereado, la AI respeasto el contexto y nos ayudo a implementar las nuevas funcionalidades sin problemas. Sigui la estructura que ya tenian de pestañas y implemento la funcionalidad de exportar el excel, sin dañar o cambiar las funcionalidades que ya se tenian.

Salio mal que en algunas pantallas y componentes el front no es responsive y no se adapta a todos los tamaños de pantalla, por lo que algunas cosas se sobreponen.

- Que hariamos distinto: Como equipo considereamos que usariamos otro framework para el backend ademas de React para no acoplar la logica de negocio con el front, y asi poder tener un backend mas robusto y escalable. Tambien consideramos que hariamos un analisis previo de la aplicacion para ver si es necesario hacer un refactor o no
