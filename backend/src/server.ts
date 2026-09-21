import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import { env } from './config/env'

const app = express()
const pdfDirectory = path.resolve(process.cwd(), env.storage.pdfPath)

fs.mkdirSync(pdfDirectory, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination: pdfDirectory,
    filename: (_req, _file, callback) => callback(null, `book-${Date.now()}-${randomUUID()}.pdf`),
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const isPdf = file.mimetype === 'application/pdf' && path.extname(file.originalname).toLowerCase() === '.pdf'
    if (!isPdf) {
      callback(new Error('Only PDF files are allowed.'))
      return
    }
    callback(null, true)
  },
})

app.use(cors({ origin: env.corsOrigin }))
app.use('/pdfs', express.static(pdfDirectory))

app.post('/api/books/upload-pdf', (req, res) => {
  upload.single('pdf')(req, res, (error: unknown) => {
    if (error) {
      const message = error instanceof Error ? error.message : 'PDF upload failed.'
      res.status(400).json({ error: message })
      return
    }
    if (!req.file) {
      res.status(400).json({ error: 'A PDF file is required.' })
      return
    }
    res.status(201).json({ pdfPath: req.file.filename })
  })
})

app.listen(env.port, () => {
  console.log(`SomaLibrary API listening on http://localhost:${env.port}`)
})
