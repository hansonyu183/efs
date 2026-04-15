#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { scaffoldPreset, listPresets } from '@efs/presets'

const args = process.argv.slice(2)
function readArg(name) {
 const idx = args.indexOf(`--${name}`)
 return idx >= 0 ? args[idx + 1] : null
}

const preset = readArg('preset')
const name = readArg('name')
const out = readArg('out')

if (!preset || !name || !out) {
 console.error('Usage: node packages/cli/bin/efs-scaffold.mjs --preset <preset> --name <AppName> --out <dir>')
 console.error(`Available presets: ${listPresets().join(', ')}`)
 process.exit(1)
}

const generated = scaffoldPreset(preset, name)
const outDir = path.resolve(out)
const srcDir = path.join(outDir, 'src')
fs.mkdirSync(srcDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'app.schema.ts'), generated.appSchema)
fs.writeFileSync(path.join(srcDir, 'app-from-schema.ts'), generated.runtimeEntry)
fs.writeFileSync(path.join(srcDir, 'DemoRoot.vue'), generated.rootVue)
console.log(`Generated app.schema.ts, src/app-from-schema.ts and src/DemoRoot.vue in ${outDir}`)
