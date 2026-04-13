#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { scaffoldPreset, listPresets } from '../../presets/src/index.mjs'

const args = process.argv.slice(2)
function readArg(name) {
 const idx = args.indexOf(`--${name}`)
 return idx >= 0 ? args[idx + 1] : null
}

const preset = readArg('preset')
const name = readArg('name')
const out = readArg('out')

if (!preset || !name || !out) {
 console.error('Usage: node packages/cli/bin/efs-scaffold.mjs --preset <preset> --name <PageName> --out <dir>')
 console.error(`Available presets: ${listPresets().join(', ')}`)
 process.exit(1)
}

const generated = scaffoldPreset(preset, name)
const outDir = path.resolve(out)
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, `${name}.vue`), generated.vue)
fs.writeFileSync(path.join(outDir, `${name}.page.json`), `${JSON.stringify(generated.manifest, null, 2)}\n`)
console.log(`Generated ${name}.vue and ${name}.page.json in ${outDir}`)
