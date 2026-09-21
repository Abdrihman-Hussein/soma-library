import fs from 'fs'
import path from 'path'
import { env } from '../config/env'

// backend/ — correct whether we run from src (tsx) or dist (node), which keeps
// storage paths stable no matter where the process was started from.
const projectRoot = path.resolve(__dirname, '..', '..')

// One flat filename, no path segments: blocks `../` traversal by construction.
const SAFE_PDF_FILENAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.pdf$/

/** Private PDF storage (gitignored — files never live in the repo). */
export function pdfDirectory(): string {
  return path.isAbsolute(env.storage.pdfPath)
    ? env.storage.pdfPath
    : path.resolve(projectRoot, env.storage.pdfPath)
}

export function ensurePdfDirectory(): string {
  const directory = pdfDirectory()
  fs.mkdirSync(directory, { recursive: true })
  return directory
}

export function isSafePdfFilename(filename: string): boolean {
  return SAFE_PDF_FILENAME.test(filename) && !filename.includes('..')
}

/**
 * Absolute path of a stored PDF, or `null` when the name is unsafe or the file
 * is missing. Callers get a 404/400 rather than an arbitrary file read.
 */
export function resolvePdfFile(filename: string): string | null {
  if (!isSafePdfFilename(filename)) return null
  const directory = pdfDirectory()
  const resolved = path.resolve(directory, filename)
  if (path.dirname(resolved) !== directory) return null
  return fs.existsSync(resolved) ? resolved : null
}

const fixtureDirectory = path.resolve(projectRoot, 'fixtures', 'pdfs')

/**
 * Demo PDFs are tracked in `backend/fixtures/pdfs` (tiny placeholders) and
 * copied into private storage on the first development boot, so a fresh clone
 * has something to read without committing files into the storage folder.
 */
export function seedSamplePdfs(): string[] {
  if (!fs.existsSync(fixtureDirectory)) return []
  const directory = ensurePdfDirectory()
  const copied: string[] = []
  for (const name of fs.readdirSync(fixtureDirectory)) {
    if (!isSafePdfFilename(name)) continue
    const target = path.join(directory, name)
    if (fs.existsSync(target)) continue
    fs.copyFileSync(path.join(fixtureDirectory, name), target)
    copied.push(name)
  }
  return copied
}
