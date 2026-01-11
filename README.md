# ProfeScore

**ProfeScore** es una plataforma web diseñada para la evaluación y consulta del desempeño docente en el ámbito universitario. El sistema permite a los estudiantes calificar profesores, buscar asignaturas y visualizar estadísticas, mientras proporciona un panel administrativo para la gestión de datos académicos.

## 📋 Descripción del Proyecto

El objetivo principal es centralizar y democratizar la información sobre la calidad académica. La arquitectura está dividida en un monorepo con `frontend` y `backend` desacoplados, priorizando la escalabilidad y la experiencia de usuario (UX) mediante una interfaz moderna y responsiva.

### Funcionalidades Principales

**Público (Estudiantes):**

* **Evaluación Docente:** Sistema de calificación por estrellas y comentarios escritos.
* **Búsqueda Avanzada:** Filtrado por facultad, materia o nombre del profesor.
* **Rankings:** Visualización de los profesores mejor calificados ("Top Rated").
* **Seguridad:** Implementación de reCAPTCHA para validar reseñas y evitar spam.

**Administrativo:**

* **Dashboard de Control:** Gestión CRUD de Facultades, Profesores y Materias.
* **Moderación:** Sistema de reportes para revisar y moderar comentarios inapropiados.
* **Autenticación:** Acceso protegido para administradores.

## 🛠 Stack Tecnológico

La aplicación utiliza una arquitectura cliente-servidor moderna basada completamente en TypeScript.

| Área | Tecnología | Propósito |
| --- | --- | --- |
| **Frontend** | React (v18+) | Biblioteca de interfaz de usuario. |
|  | TypeScript | Tipado estático y robustez del código. |
|  | Vite | Entorno de desarrollo y empaquetador (Build tool). |
|  | Tailwind CSS | Framework de utilidades para estilos y diseño responsivo. |
|  | Shadcn/UI | Colección de componentes de UI reutilizables (Radix UI). |
| **Backend** | Node.js | Entorno de ejecución de servidor. |
|  | Express | Framework web para manejo de rutas y middleware. |
|  | TypeScript | Lógica de negocio tipada. |
|  | Simple Cache | Implementación de caché en memoria para optimización. |
| **Seguridad** | JWT / AdminAuth | Middleware de autenticación para rutas protegidas. |
|  | Google reCAPTCHA | Protección contra bots en formularios públicos. |

## 📂 Estructura del Proyecto

El repositorio opera como un monorepo con la siguiente distribución de directorios clave:

```text
profescore-main/
├── backend/                 # API RESTful
│   ├── src/
│   │   ├── config/          # Configuración de DB y CORS
│   │   ├── controllers/     # Lógica de los endpoints (Admin, Faculty, Professor, etc.)
│   │   ├── middleware/      # Auth, validaciones, caché
│   │   ├── models/          # Definiciones de datos y esquemas
│   │   ├── routes/          # Definición de rutas de la API
│   │   └── utils/           # Utilidades (SimpleCache, helpers)
│   └── package.json
│
├── frontend/                # SPA React
│   ├── src/
│   │   ├── components/      # UI (Shadcn), Modales, Componentes compartidos
│   │   ├── hooks/           # Custom hooks (use-toast, etc.)
│   │   ├── layouts/         # Estructuras de página (Header, Skeleton)
│   │   ├── pages/           # Vistas (Admin, Public, Detail views)
│   │   ├── api.ts           # Cliente HTTP centralizado
│   │   └── App.tsx          # Enrutamiento principal
│   └── vite.config.ts
│
└── package.json             # Gestión de dependencias raíz

```

## 🚀 Instalación y Despliegue Local

### Pre-requisitos

* Node.js (v18 o superior)
* Gestor de paquetes (npm o pnpm recomendado)
* Instancia de Base de Datos (Configuración en `backend/src/config/db.ts`)

### Pasos

1. **Clonar el repositorio:**
```bash
git clone https://github.com/cgamcs/profescore-main.git
cd profescore-main

```


2. **Configuración del Backend:**
```bash
cd backend
npm install
# Crear archivo .env y configurarlo
npm run dev

```


3. **Configuración del Frontend:**
```bash
cd ../frontend
npm install
# Configurar variables de entorno para la API URL
npm run dev

```


4. **Acceso:**
* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:3000` (o puerto configurado)

### Ejemplo de archivos .env

**Front**
```
VITE_SITE_KEY=6LeyFQEr******************
VITE_API_URL=http://localhost:4000/api
VITE_BACKEND_URL=http://localhost:4000
VITE_PUBLIC_KEY=o5yjhyikfDZF************
```

**Back**
```
DATABASE_URL=mongodb+srv://profecopiadb:*************@cluster0.mtyzq.mongodb.net/profescore_copia
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:4000
SECRET_KEY=6LeyFQEr******************
JWT_SECRET=tu+palabra+secreta
```

## 📄 Licencia

Este proyecto se distribuye bajo la licencia especificada en el archivo `LICENSE` (MIT).