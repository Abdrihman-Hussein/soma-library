import { app } from './app'
import { DEFAULT_JWT_SECRET, env } from './config/env'
import { ensurePdfDirectory, pdfDirectory, seedSamplePdfs } from './lib/storage'

// Fail fast instead of running production with the development secret.
if (env.isProduction && env.jwt.secret === DEFAULT_JWT_SECRET) {
  console.error(
    'Refusing to start: set JWT_SECRET to a long random value before running in production.',
  )
  process.exit(1)
}

ensurePdfDirectory()

if (!env.isProduction) {
  const seeded = seedSamplePdfs()
  if (seeded.length > 0) {
    console.log(`Copied demo PDFs into ${pdfDirectory()}: ${seeded.join(', ')}`)
  }
}

app.listen(env.port, () => {
  console.log(`SomaLibrary API listening on http://localhost:${env.port}`)
  if (env.pdfDevPublic) {
    console.warn(
      '⚠ PDF_DEV_PUBLIC=true — reader PDFs stream without a token in development. Production always requires one.',
    )
  }
})
