# Backend de Back-Real-Chat

Este es el backend de la aplicación de chat en tiempo real "Back-Real-Chat", que forma parte del proyecto completo de clon de WhatsApp junto con el frontend.

Proporciona una API REST y soporte para WebSockets para mensajería en tiempo real y autenticación de usuarios.

## Tecnologías Utilizadas

- [NestJS](https://nestjs.com/) - Framework progresivo de Node.js para construir aplicaciones del lado del servidor eficientes y escalables.
- [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript.
- [TypeORM](https://typeorm.io/) - ORM para TypeScript y JavaScript.
- [PostgreSQL](https://www.postgresql.org/) - Sistema de base de datos relacional.
- [JWT (JSON Web Tokens)](https://jwt.io/) - Para autenticación segura de usuarios.
- [Passport](http://www.passportjs.org/) - Middleware de autenticación para Node.js.
- [Socket.IO](https://socket.io/) - Comunicación bidireccional en tiempo real basada en eventos.
- [Swagger](https://swagger.io/) - Documentación de la API.
- [Class Validator & Transformer](https://github.com/typestack/class-validator) - Para validación y transformación de DTOs.
- [Bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Hashing de contraseñas.
- [Moment.js](https://momentjs.com/) - Manipulación de fechas y horas.

## Cómo Empezar

1. Clonar el repositorio:

   ```bash
   git clone <url-del-repositorio>
   cd back-whatsapp-clone
   ```

2. Instalar dependencias:

   ```bash
   yarn install
   ```

   ```bash
   npm install
   ```

3. Crear un archivo `.env` basado en `.env.template` y configurar las variables de entorno.

4. Levantar la base de datos PostgreSQL (por ejemplo, usando Docker):

   ```bash
   docker compose up -d
   ```

5. Ejecutar el servidor en modo desarrollo:

   ```bash
   yarn start:dev
   ```

   ```bash
   npm run start:dev
   ```

## Producción

Para construir y ejecutar en modo producción:

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## Licencia

Este proyecto está bajo licencia UNLICENSED.
