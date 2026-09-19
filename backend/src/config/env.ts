import dotenv from 'dotenv'
dotenv.config()

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'soma_library',
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-prod',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  storage: {
    pdfPath: process.env.PDF_STORAGE_PATH ?? './storage/pdfs',
    coverPath: process.env.COVER_STORAGE_PATH ?? './storage/covers',
  },

  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
} as const
