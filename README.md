# TodoApp - Frontend

Aplicación web moderna de gestión de tareas desarrollada con React y Vite.

## 🚀 Características

- Autenticación con JWT y refresh automático de tokens
- Gestión de tareas (crear, editar, completar, eliminar)
- Estadísticas en tiempo real
- Historial de eventos
- Interfaz responsive con diseño minimalista
- Validación de formularios en tiempo real
- Indicador de fortaleza de contraseña
- Soporte para entrada por voz y texto

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn

## 🔧 Instalación

1. Clonar el repositorio
```bash
git clone <repository-url>
cd frontend
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# URL del backend API
# Producción: https://todoapp-backend-vtpp.onrender.com
# Desarrollo local: http://localhost:2411
VITE_BASE_API=https://todoapp-backend-vtpp.onrender.com
```

**Nota:** Si no se define `VITE_BASE_API`, la aplicación usará la URL de producción por defecto.

## 🏃 Ejecución

### Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Producción
```bash
npm run build
npm run preview
```

## 🔐 Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `VITE_BASE_API` | URL base del backend API | `https://todoapp-backend-vtpp.onrender.com` |

### Configuración para Desarrollo Local

Para conectar con un backend local, crear `.env` con:
```env
VITE_BASE_API=http://localhost:2411
```

### Configuración para Producción

Para producción, usar la URL del backend en la nube:
```env
VITE_BASE_API=https://todoapp-backend-vtpp.onrender.com
```

O simplemente no definir la variable para usar el valor por defecto.

## 📁 Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
│   ├── auth/        # Componentes de autenticación
│   ├── common/      # Componentes comunes
│   └── layout/      # Componentes de layout
├── context/         # Contextos de React
├── hooks/           # Custom hooks
├── pages/           # Páginas principales
├── router/          # Configuración de rutas
├── services/        # Servicios API
├── styles/          # Estilos globales
└── utils/           # Utilidades y constantes
```

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca de UI
- **React Router DOM** - Enrutamiento
- **Vite** - Build tool
- **Lucide React** - Iconos
- **CSS3** - Estilos con variables CSS y gradientes

## 📝 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Previsualiza build de producción
- `npm run lint` - Ejecuta el linter

## 🔒 Seguridad

- Los tokens JWT se almacenan en `localStorage`
- Los tokens se refrescan automáticamente antes de expirar
- Validación de datos en cliente y servidor
- Sanitización de inputs
- Autocompletado deshabilitado en campos sensibles

## 📄 Licencia

Este proyecto es parte de un curso de formación.

## 🤝 Contribuciones

Este es un proyecto educativo. Las contribuciones son bienvenidas.
