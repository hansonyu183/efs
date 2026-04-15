#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const srcFile = path.join(packageRoot, 'src', 'index.mjs')
const distDir = path.join(packageRoot, 'dist')
const distFile = path.join(distDir, 'index.js')

fs.rmSync(distDir, { recursive: true, force: true })
fs.mkdirSync(distDir, { recursive: true })
fs.copyFileSync(srcFile, distFile)
