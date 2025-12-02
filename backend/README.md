# Backend - Simple Auth Login

API Express.js con autenticación JWT y PostgreSQL en Supabase.

## Instalación Local

```bash
npm install
cp .env.example .env
# Completar las variables en .env
node server.js
```

## Despliegue en Google Cloud Run

### 1. Construir imagen Docker localmente (opcional para pruebas)
```bash
docker build -t simple-auth-backend .
docker run -p 8080:8080 --env-file .env simple-auth-backend
```

### 2. Desplegar en Cloud Run

**Usando Cloud Console:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a Cloud Run → Create Service
4. Selecciona "Deploy one-off revision from an existing image" o "Continuously deploy from a source repository"
5. Configura:
   - Runtime: Node.js 20
   - Memory: 256 MB
   - CPU: 1
   - Timeout: 3600 segundos
6. En "Environment variables", añade las variables de `.env.example`

**Usando gcloud CLI:**
```bash
gcloud run deploy simple-auth-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DB_HOST=your_db_host,DB_PORT=6543,DB_USER=your_user,DB_PASSWORD=your_pass,DB_NAME=postgres,JWT_SECRET=your_secret,JWT_EXPIRES_IN=7d,FRONTEND_URL=https://yourusername.github.io/simple-auth-login
```

## Variables de Entorno

Ver `.env.example` para todas las variables necesarias.

**Importante:** 
- `FRONTEND_URL` debe ser actualizada a tu URL de GitHub Pages
- `DB_PASSWORD` debe ser protegida en Cloud Run

## Endpoints

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Login (retorna JWT)
- `GET /api/auth/profile` - Obtener perfil (requiere token)
- `POST /api/auth/logout` - Logout

## Seguridad

- Rate limiting: 5 intentos de auth por 15 minutos
- Contraseñas hasheadas con bcryptjs (10 rounds)
- JWT tokens con expiración de 7 días
- Validación de email y contraseña fuerte
