# TallerPro · Demo de cotizaciones

Demo de gestión de un **taller mecánico** centrada en **cotizaciones de servicios**, clientes, vehículos y el **costo del personal** (comisiones por porcentaje o monto fijo).

- **React + Vite + TypeScript**
- **Tailwind CSS v4 + shadcn/ui** (Radix)
- **Recharts** para los gráficos del dashboard
- **localStorage** como única persistencia: no hay backend ni base de datos
- Tema **claro en blanco y negro por defecto**, con opción de tema oscuro (controles monocromáticos; gráficos y badges con colores sólidos y texto blanco)
- Interfaz en **español (es-AR)**

## Pantallas

### Resumen
KPIs de total cotizado, servicios activos, comisiones pendientes y clientes/vehículos. Gráfico de barras de cotizaciones por estado, gráfico de comisiones por persona, cotizaciones por vencer, servicios en curso y comisiones a pagar.

### Catálogo de servicios
Servicios frecuentes del taller (**tren delantero**, **lavado de auto**, cambio de aceite, frenos, diagnóstico, etc.) con categoría, descripción y precio sugerido. Se pueden agregar, editar y eliminar servicios propios. Estos ítems aparecen al armar cotizaciones y servicios; también se pueden cargar ítems personalizados.

### Clientes
Alta, edición y eliminación en páginas propias. La ficha muestra datos de contacto, vehículos asociados, cotizaciones, servicios y total cotizado.

### Vehículos
Patente, marca, modelo, año, **kilometraje**, combustible, color y notas. La ficha muestra el propietario y su historial de cotizaciones y servicios.

### Cotizaciones
- Presupuestos con estado (Borrador → Enviada → Aceptada / Rechazada / Vencida), fecha y vigencia.
- Ítems del catálogo o personalizados, mano de obra, descuento porcentual y total calculado.
- Condiciones y notas internas.
- Desde la ficha se puede **generar un servicio** a partir de la cotización aceptada y **asignar comisiones**.

### Servicios
- Trabajos del taller con vehículo, **kilometraje al ingreso**, estado, fechas de ingreso/entrega y tiempo en garage.
- Se pueden crear directamente o desde una cotización (se cargan automáticamente cliente, vehículo, kilometraje e ítems).
- Misma estructura de secciones en formulario y ficha: Datos generales → Estado y tiempos → Servicios y costos → Notas → Comisiones.
- **Asignación de comisiones** del personal sobre el servicio.

### Personal
Integrantes del taller (incluido el **titular**, que puede asignarse comisiones a sí mismo) con comisión por defecto en **porcentaje del total** o **monto fijo**. La ficha muestra total asignado, pagado y pendiente, y el detalle de cada comisión.

### Comisiones
Asignaciones sobre cotizaciones o servicios. Cada comisión guarda la modalidad, el valor, la base (total del origen al momento de asignar) y el monto calculado. Se pueden marcar como **pagadas** o **pendientes**, editar y eliminar.

## Datos de ejemplo

La primera vez se cargan servicios del catálogo, clientes, vehículos, cotizaciones, servicios, personal y comisiones con fechas relativas al día actual. El botón **Restaurar datos de ejemplo** (barra lateral) vuelve a ese estado. Todo se guarda bajo la clave `cotizaciones-demo:datos:v1` en `localStorage` (tema: `cotizaciones-demo:tema`).

> Al ser una demo, los datos son **por navegador**: no se sincronizan entre dispositivos ni usuarios.

## Desarrollo

```bash
npm install
npm run dev
```

Verificación de tipos, lint y build:

```bash
npm run build
npm run lint
```

## Producción con Docker / Dokploy

El `Dockerfile` compila la app (multi-stage) y sirve el `dist` con nginx en el **puerto 80** del contenedor. El `docker-compose.prod.yml` **no publica puertos en el host**: el 80 queda solo en la red interna de Docker.

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

En Dokploy: crear una aplicación de tipo **Docker Compose**, apuntar al repositorio y al archivo `docker-compose.prod.yml`. Configurar el **puerto interno 80** y asignar un dominio; el reverse proxy (Traefik) enruta por dominio hacia el contenedor, por lo que varios apps pueden usar el mismo 80 sin chocar con el puerto 3000 del host. No requiere variables de entorno obligatorias. El contenedor expone `/health` para el healthcheck.

Si querés probarlo sin dominio ni proxy, podés agregar temporalmente `- "3000:80"` bajo `ports:` (o `${PORT:-3000}:80`) y entrar por `http://localhost:3000`.

## Estructura

```
src/
  components/
    comunes/       Secciones, badges e ítems reutilizables
    layout/        Shell, sidebar, header y encabezados
    ui/            Componentes shadcn/ui
  lib/
    calculos.ts    Subtotal, total con descuento y monto de comisión
    format.ts      Formateo con Intl (moneda, fechas, números)
    seed.ts        Datos de ejemplo (incluye el catálogo de servicios)
    store.tsx      Contexto + persistencia en localStorage
    types.ts       Modelo de datos
  pages/           Dashboard y páginas de cada módulo (listado / formulario / ficha)
design-system/     Design system generado con ui-ux-pro-max
```
