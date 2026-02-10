# Documentación Técnica del Proyecto: Aplicación de Los Simpsons

## 1. Visión General de la Arquitectura

Esta aplicación es una **Web App Moderna (Single Page Application)** construida con dos partes principales separadas:

1.  **Backend (API)**: Desarrollado en **Symfony (PHP)** con **API Platform**. Se encarga de la seguridad, gestión de usuarios y almacenamiento de favoritos en una base de datos propia.
2.  **Frontend (Cliente)**: Desarrollado en **Angular** (versión 17+ con Standalone Components). Se encarga de la interfaz de usuario y de consumir **dos** fuentes de datos distintas:
    *   La **API de Los Simpsons (Externa)** para obtener personajes, episodios y localizaciones.
    *   Tu **Backend Propio** para gestionar el registro, login y la lista de favoritos personal de cada usuario.

---

## 2. Almacenamiento de Usuarios (`User`)

### ¿Cómo se almacenan?
Los usuarios se guardan en tu propia base de datos (PostgreSQL o MySQL) a través de la entidad `User`.

**Estructura de la Tabla `user`:**
*   **id**: Identificador único (Auto-increment).
*   **email**: Correo electrónico (debe ser único).
*   **username**: Nombre de usuario visible.
*   **roles**: Array JSON que define permisos (ej. `["ROLE_USER"]` o `["ROLE_ADMIN"]`).
*   **password**: La contraseña **nunca se guarda en texto plano**.

### El proceso de Seguridad (Hashing):
Cuando un usuario se registra (`POST /api/users`):
1.  Symfony recibe la contraseña "cruda" (ej. `123456`).
2.  Utiliza un **State Processor** (`UserPasswordHasher`) configurado en la entidad `User.php`.
3.  La contraseña se transforma en un hash criptográfico (usando algoritmos modernos como **Argon2i** o **Bcrypt**).
4.  Solo este hash se guarda en la base de datos via Doctrine ORM.

Al hacer login (`POST /api/login_check`):
*   El backend verifica si la contraseña enviada coincide con el hash guardado.
*   Si es correcto, **no crea una sesión**, sino que devuelve un **Token JWT** (Json Web Token).

---

## 3. Almacenamiento de Favoritos (`Favorite`)

### ¿Cómo se relacionan con los datos?
Dado que la información de Los Simpsons viene de una API externa, tu base de datos **NO guarda** toda la información de los personajes. Solo guarda una **referencia** (el ID) y datos mínimos para mostrar la lista rápidamente.

**Estructura de la Tabla `favorite`:**
*   **id**: ID único del favorito.
*   **user_id**: Clave foránea que lo une al usuario que le dio "like" (Relación *Many-to-One*).
*   **character_id**: El número identificador que viene de la API de Los Simpsons.
    *   *Nota Técnica*: En tu código (`auth.service.ts`), este campo se reutiliza para guardar también IDs de episodos y localizaciones, unificando la lógica.
*   **name**: El nombre del personaje/episodio (guardado como caché para no tener que pedirlo a la API externa solo para listar favoritos).
*   **portrait_path**: URL de la imagen (también caché).

### Lógica de Negocio:
*   Un usuario (`User`) tiene una colección de favoritos (`OneToMany`).
*   Cuando borras un usuario (`Validación Cascade`), todos sus favoritos se borran automáticamente de la base de datos para no dejar basura.
*   La API expone un endpoint `/api/favorites` protegido, donde cada usuario solo puede ver y gestionar sus propios favoritos gracias a los filtros de seguridad de API Platform o del Query en Angular (`user=/api/users/{id}`).

---

## 4. Extracción de Información de la API (Scraping/Agregación)

Esta es una de las partes más interesantes de tu frontend (`api.ts`).

### El Problema:
La API externa (`thesimpsonsapi.com`) devuelve los datos **paginados** (ej. 20 resultados por página). Si tú quieres buscar o filtrar en *todos* los personajes en tu app, no puedes hacerlo fácilmente si la API solo te da la página 1.

### Tu Solución (`api.ts`):
Has implementado un patrón de **Agregación en Cliente** usando **RxJS** (Programación Reactiva).

1.  **Petición Inicial**: Se pide la página 1 para saber cuántas páginas hay en total (`firstPage.pages`).
2.  **Bucle de Peticiones**:
    *   Si hay más páginas, el código genera un array de peticiones HTTP (`HttpClient.get`) para todas las páginas restantes (de la 2 a la `totalPages`).
3.  **Paralelismo (`forkJoin`)**:
    *   Usas el operador `forkJoin` para lanzar **todas las peticiones a la vez** en paralelo, en lugar de esperar una por una. Esto hace la carga muchísimo más rápida.
4.  **Unificación**:
    *   Cuando todas las peticiones vuelven, combinas todos los resultados en un solo array gigante (`[...firstPage.results, ...res.results]`).
5.  **Deduplicación**:
    *   Usas un `Map` para eliminar duplicados por ID, asegurando una lista limpia.

### Resultado:
El componente recibe un array con **todos** los personajes existentes, permitiéndote hacer filtros instantáneos (buscador) en el navegador sin volver a preguntar al servidor.

---

## 5. El Servicio de Autenticación (`AuthService`)

Este servicio actúa como el **cerebro central** del frontend.

*   **Estado Reactivo (`BehaviorSubject`)**: Mantiene el estado de la aplicación en memoria (usuario logueado, lista de favoritos, personajes cargados). Así, si cambias de página y vuelves, los datos ya están ahí y no hay tiempos de carga.
*   **Manejo del JWT**:
    *   Al hacer login, guarda el token en `localStorage`.
    *   Decodifica el token (`jwtDecode`) para leer el ID de usuario y si es Administrador (`ROLE_ADMIN`), sin necesidad de preguntar al backend.
*   **Lógica Unificada**: Los métodos `addFavorite`, `addEpisodeFavorite`, etc., normalizan los datos antes de enviarlos al backend, asegurando que la base de datos reciba siempre la estructura esperada.
