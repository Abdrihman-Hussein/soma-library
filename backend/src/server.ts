import express from 'express'
import cors from 'cors'
import path from 'path'
import { env } from './config/env'

const app = express()

app.use(cors({ origin: env.corsOrigin }))
app.use('/pdfs', express.static(path.resolve(process.cwd(), env.storage.pdfPath)))

app.listen(env.port, () => {
  console.log(`SomaLibrary API listening on http://localhost:${env.port}`)
})
