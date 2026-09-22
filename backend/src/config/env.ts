import dotenv from 'dotenv'
dotenv.config()

const nodeEnv = process.env.NODE_ENV ?? 'development'

/** The placeholder shipped in .env.example — refusing to boot with it in production. */
export const DEFAULT_JWT_SECRET = 'dev-secret-do-not-use-in-prod'

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv,
  isProduction: nodeEnv === 'production',

  /**
   * Dev-only reader escape hatch. Until the API owns auth (#9, #10) the demo
   * reader may fetch PDFs without a token. Production always requires a
   * signed, file-scoped reader token — see `requireReaderAccess`.
   */
  pdfDevPublic: nodeEnv !== 'production' && (process.env.PDF_DEV_PUBLIC ?? 'true').toLowerCase() !== 'false',

  maxPdfUploadMb: Number(process.env.MAX_PDF_UPLOAD_MB ?? 50),

  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'soma_library',
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  storage: {
    pdfPath: process.env.PDF_STORAGE_PATH ?? './storage/pdfs',
    coverPath: process.env.COVER_STORAGE_PATH ?? './storage/covers',
  },

  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
} as const
