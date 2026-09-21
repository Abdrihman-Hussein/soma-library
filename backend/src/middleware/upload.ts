import { randomUUID } from 'crypto'
import path from 'path'
import multer from 'multer'
import { env } from '../config/env'
import { ensurePdfDirectory } from '../lib/storage'
import { ApiError } from './errorHandler'

/**
 * PDF uploads land in private storage under a server-generated UUID name, so a
 * client can never choose (or traverse) the path a file is written to. The
 * original name is ignored on purpose.
 */
export const pdfUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      try {
        callback(null, ensurePdfDirectory())
      } catch (error) {
        callback(error as Error, '')
      }
    },
    filename: (_req, _file, callback) => callback(null, `book-${randomUUID()}.pdf`),
  }),
  limits: { fileSize: env.maxPdfUploadMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    // Browsers can lie about `mimetype`, so require a real .pdf extension too.
    const isPdf =
      file.mimetype === 'application/pdf' && path.extname(file.originalname).toLowerCase() === '.pdf'
    if (!isPdf) {
      callback(new ApiError(400, 'Only PDF files are allowed.'))
      return
    }
    callback(null, true)
  },
})
