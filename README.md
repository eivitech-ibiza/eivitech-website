# Eivitech Ibiza

Sitio web corporativo y plataforma digital de Eivitech, empresa especializada en reformas, instalaciones y acabados en Ibiza.

El proyecto presenta los servicios, el método de trabajo y una selección de transformaciones realizadas en apartamentos, villas, fincas, espacios exteriores y locales comerciales.

Sitio web oficial: [https://eivitech.com](https://eivitech.com)

## Sobre Eivitech

Eivitech acompaña cada proyecto desde la primera conversación hasta la entrega final, coordinando profesionales, materiales, instalaciones, decisiones y acabados.

El objetivo es crear espacios funcionales, duraderos y coherentes con la forma de vivir de cada cliente, combinando gestión clara, atención al detalle, materiales naturales y soluciones a medida.

## Contenido del sitio

El sitio incluye:

- presentación de la empresa;
- servicios de reformas e instalaciones;
- portfolio de transformaciones seleccionadas;
- metodología de trabajo «The Eivitech Way»;
- sección dedicada a materiales y atmósfera;
- formularios de contacto y captación de solicitudes;
- landing pages para campañas de Google Ads y Meta Ads;
- páginas legales y gestión del consentimiento de cookies;
- área CRM privada;
- módulo protegido de contactos, segmentos y campañas de email marketing.

## Servicios presentados

- Reformas integrales
- Electricidad e iluminación
- Albañilería y acabados
- Fontanería
- Cocinas y baños
- Carpintería y soluciones a medida
- Terrazas y exteriores
- Locales comerciales

## Idiomas

El sitio está disponible en:

- Español
- Italiano
- Inglés
- Neerlandés

Cada idioma utiliza rutas propias y metadatos SEO localizados.

Ejemplos:

~~~text
/es/
/it/
/en/
/nl/
~~~

## Tecnologías principales

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui y Radix UI
- TanStack Query
- React Helmet Async
- Framer Motion

### Backend y CRM

- Node.js
- Express
- TypeScript
- PostgreSQL
- Clerk para autenticación y control de acceso
- Resend para notificaciones y comunicaciones por correo electrónico
- Railway para el alojamiento de la API

### Publicación y control de calidad

- GitHub Pages
- GitHub Actions
- generación automática de sitemap y páginas multilingües;
- comprobaciones de TypeScript, lint y pruebas;
- validaciones SEO antes de la publicación;
- auditoría de dependencias de producción.

## Estructura principal

~~~text
.
├── api/                    # API del CRM y del módulo de email marketing
├── public/                 # Imágenes, vídeos, sitemap y archivos públicos
├── scripts/                # Generación SEO, validaciones y pruebas
├── src/
│   ├── components/         # Componentes reutilizables
│   ├── data/               # Servicios, proyectos y datos del sitio
│   ├── lib/                # Internacionalización, API y utilidades
│   └── pages/              # Páginas públicas, legales y privadas
├── .github/workflows/      # Automatización de controles y despliegue
└── package.json
~~~

## Desarrollo local

### Requisitos

- Node.js 24
- npm

### Instalación

~~~bash
git clone https://github.com/eivitech-ibiza/eivitech-website.git
cd eivitech-website
npm ci
~~~

### Variables de entorno

Crear un archivo local a partir del ejemplo incluido:

~~~bash
cp .env.example .env.local
~~~

Las credenciales y claves privadas nunca deben añadirse al repositorio.

Las variables que empiezan por VITE_ pueden quedar expuestas en el código generado para el navegador y no deben utilizarse para almacenar secretos.

### Iniciar el frontend

~~~bash
npm run dev
~~~

El entorno local estará disponible normalmente en:

~~~text
http://localhost:8080
~~~

## Comandos disponibles

~~~bash
npm run dev
~~~

Inicia el servidor de desarrollo.

~~~bash
npm run typecheck
~~~

Comprueba los tipos de TypeScript.

~~~bash
npm run lint
~~~

Ejecuta las reglas de calidad del código.

~~~bash
npm test
~~~

Ejecuta las pruebas automatizadas.

~~~bash
npm run build
~~~

Genera la versión de producción y los archivos SEO multilingües.

~~~bash
npm run seo:check
~~~

Comprueba la salida SEO generada.

~~~bash
npm run audit:prod
~~~

Audita las dependencias utilizadas en producción.

~~~bash
npm run preview
~~~

Permite revisar localmente la compilación de producción.

## API del CRM

El backend se encuentra dentro de la carpeta api y se ejecuta como un servicio independiente.

Instalación y verificación:

~~~bash
npm --prefix api ci
npm --prefix api test
npm --prefix api run build
~~~

Para trabajar localmente con la API deben configurarse sus variables de entorno siguiendo el archivo:

~~~text
api/.env.example
~~~

Las credenciales de PostgreSQL, Clerk y Resend pertenecen exclusivamente al backend y nunca deben incorporarse al frontend ni publicarse en GitHub Pages.

## Despliegue

El frontend se publica mediante GitHub Actions y GitHub Pages.

Cada actualización de la rama main activa el flujo de:

1. instalación de dependencias;
2. comprobación de TypeScript;
3. lint;
4. pruebas automatizadas;
5. compilación de producción;
6. validación de la salida SEO;
7. auditoría de dependencias;
8. publicación en GitHub Pages.

La API del CRM se despliega por separado en Railway utilizando la carpeta api como directorio raíz del servicio.

## Criterios para las modificaciones

Antes de integrar cualquier cambio:

1. crear una rama específica;
2. limitar la modificación al objetivo solicitado;
3. mantener la coherencia visual y editorial de Eivitech;
4. actualizar todas las traducciones afectadas;
5. comprobar la experiencia en escritorio y dispositivos móviles;
6. ejecutar las pruebas, el lint, la comprobación de tipos y la compilación;
7. verificar que no se hayan incluido credenciales ni datos personales;
8. abrir una pull request para su revisión.

## Uso del repositorio

Este repositorio corresponde al proyecto digital oficial de Eivitech. El código, la marca, los textos y los recursos visuales están destinados exclusivamente a usos autorizados relacionados con el proyecto.

---

**Eivitech Ibiza**  
Reformas · Instalaciones · Acabados · Ibiza  
[https://eivitech.com](https://eivitech.com)
