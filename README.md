# ✦ Book Editor — Setup

App web para editar tu libro en Markdown con voz + Claude + GitHub.

## Setup en 5 minutos

### 1. Clona y despliega en Vercel

```bash
# Sube esta carpeta a un repo de GitHub
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/TU_USUARIO/book-editor.git
git push -u origin main
```

Luego ve a [vercel.com](https://vercel.com) → New Project → importa el repo → Deploy.

No necesitas variables de entorno en Vercel (las keys se guardan en tu navegador).

### 2. Consigue tus API Keys

**GitHub Token:**
- GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Permisos necesarios: `repo` (lectura y escritura)

**Claude API Key:**
- [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key
- Necesitas tener créditos o estar en un plan de pago

### 3. Usa la app

1. Abre la app en el móvil
2. Toca ⚙️ Config → introduce tus keys y el repo
3. Formato del repo: `usuario/nombre-repo`
4. Ruta del archivo: `libro.md` (o `docs/libro.md`, etc.)
5. Toca "Cargar archivo"
6. Dicta tu instrucción con el botón 🎙️ (mantén pulsado)
7. Toca ✦ Aplicar → Claude edita el documento
8. Revisa el resultado y toca ↑ GitHub para guardar

### Estructura recomendada para tu libro.md

```markdown
# Mi Libro

## Sinopsis

...

## Personajes

### Protagonista
...

### Antagonista
...

## Mundo y ambientación

...

## Arcos narrativos

...

## Capítulos
```

### Ejemplos de instrucciones por voz

- *"Añade un personaje llamado Elena, médica de 35 años, en la sección de personajes"*
- *"Modifica la sinopsis para que sea más oscura y añade un elemento de misterio"*
- *"Crea una nueva sección llamada Temas principales"*
- *"Expande la descripción del mundo añadiendo detalles sobre el sistema político"*

## Seguridad

Las API keys se guardan en el localStorage de tu navegador y nunca se envían a ningún servidor propio. Las llamadas a GitHub y Claude se hacen desde el servidor de Vercel directamente.

Para mayor seguridad puedes usar la app solo desde tu móvil personal.
