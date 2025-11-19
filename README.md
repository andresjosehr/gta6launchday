# GTA VI Countdown

Contador que muestra el tiempo restante hasta el lanzamiento de GTA VI el 19 de noviembre de 2026.

## Características

- Cuenta regresiva en tiempo real (días, horas, minutos, segundos)
- Barra de progreso mostrando el tiempo transcurrido desde el anuncio
- Diseño responsive para todos los dispositivos
- Estilo temático de GTA con fuentes personalizadas

## Tecnologías

- HTML5
- CSS3 (con custom properties y animaciones)
- JavaScript vanilla
- Vite (herramienta de build)

## Inicio rápido

### Requisitos

- Node.js (v18 o superior)

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## Estructura del proyecto

```
gta6counter/
├── assets/
│   ├── fonts/          # Fuentes GTA Art Deco
│   └── images/         # Imágenes de fondo y logo
├── index.html          # Archivo HTML principal
├── style.css           # Estilos
├── script.js           # Lógica del contador
├── vite.config.js      # Configuración de Vite
└── package.json        # Dependencias y scripts
```

## Despliegue

Compila el proyecto y despliega la carpeta `dist/` en cualquier servicio de hosting estático:

- Cloudflare Pages
- Netlify
- Vercel
- GitHub Pages

## Licencia

MIT
