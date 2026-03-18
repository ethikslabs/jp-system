import Fastify from 'fastify'
import cors from '@fastify/cors'
import chokidar from 'chokidar'
import { readFile, readdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'
import tls from 'tls'
import os from 'os'

const execAsync = promisify(exec)

const __dirname  = dirname(fileURLToPath(import.meta.url))
const PROJECTS_DIR = join(__dirname, '..', 'projects')
const SECRETS_DIR  = join(__dirname, '..', 'secrets')
const HEALTH_DIR   = join(__dirname, '..', 'health')

const fastify = Fastify({ logger: false })
await fastify.register(cors, { origin: true })

// ─── Markdown parsers ─────────────────────────────────────

function parseStatus(content) {
  const match = content.match(/\*\*Status:\*\*\s*(.+)/)
  return match ? match[1].trim() : 'Unknown'
}

function getLight(status) {
  const s = status.toLowerCase()
  if (s.includes('blocked')) return 'red'
  if (s.includes('live'))    return 'green'
  if (s.includes('in progress')) return 'amber'
  return 'grey'
}

function parseSection(content, heading) {
  const regex = new RegExp(`## ${heading}[\\s\\S]*?(?=\\n## |$)`)
  const match = content.match(regex)
  if (!match) return []
  return match[0].split('\n')
    .slice(1)
    .filter(l => l.trim().startsWith('-'))
    .map(l => l.replace(/^[\s-]+/, '').trim())
    .filter(Boolean)
}

function parseDescription(content) {
  const regex = /## What it is\n([\s\S]*?)(?=\n## |$)/
  const match = content.match(regex)
  if (!match) return ''
  return match[1].trim().split('\n').find(l => l.trim()) || ''
}

function parseTarget(content) {
  const match = content.match(/\*\*Target:\*\*\s*(.+)/)
  return match ? match[1].trim() : null
}

function parseRepoPaths(content) {
  const matches = [...content.matchAll(/`(~\/Dropbox\/Projects\/[^`]+)`/g)]
  return matches.map(m => m[1].replace('~', os.homedir()))
}

// ─── Secrets ──────────────────────────────────────────────

const ROTATION_WARN   = 90
const ROTATION_DANGER = 180

function rotationStatus(dateStr) {
  if (!dateStr || dateStr === 'unknown' || dateStr === '—') return 'unknown'
  const rotated = new Date(dateStr)
  if (isNaN(rotated)) return 'unknown'
  const days = Math.floor((Date.now() - rotated) / 86400000)
  if (days >= ROTATION_DANGER) return 'danger'
  if (days >= ROTATION_WARN)   return 'warn'
  return 'ok'
}

async function parseSecrets(projectId) {
  try {
    const content = await readFile(join(SECRETS_DIR, `${projectId}.md`), 'utf-8')
    const rows = content.split('\n').filter(l => l.startsWith('|') && !l.includes('---') && !l.includes('Key |'))
    return rows.map(row => {
      const [, key, store, location, rotated] = row.split('|').map(s => s.trim())
      if (!key) return null
      return { key, store, location, rotated, status: rotationStatus(rotated) }
    }).filter(Boolean)
  } catch { return [] }
}

// ─── Git log ──────────────────────────────────────────────

async function getGitLog(repoPath) {
  try {
    const { stdout } = await execAsync(
      `git -C "${repoPath}" log -10 --format="%h|||%s|||%ar|||%an"`,
      { timeout: 5000 }
    )
    return stdout.trim().split('\n').filter(Boolean).map(line => {
      const [hash, subject, time, author] = line.split('|||')
      return { hash, subject, time, author }
    })
  } catch { return [] }
}

// ─── Health checks ────────────────────────────────────────

function checkSSL(hostname) {
  return new Promise(resolve => {
    const socket = tls.connect(443, hostname, { servername: hostname }, () => {
      try {
        const cert  = socket.getPeerCertificate()
        const expiry = new Date(cert.valid_to)
        const days  = Math.floor((expiry - Date.now()) / 86400000)
        socket.destroy()
        resolve({
          domain: hostname,
          expiresAt: expiry.toISOString().split('T')[0],
          daysRemaining: days,
          status: days < 14 ? 'danger' : days < 30 ? 'warn' : 'ok'
        })
      } catch { socket.destroy(); resolve({ domain: hostname, status: 'unknown' }) }
    })
    socket.on('error', () => resolve({ domain: hostname, status: 'unknown' }))
    socket.setTimeout(6000, () => { socket.destroy(); resolve({ domain: hostname, status: 'unknown' }) })
  })
}

async function runHttpCheck(check) {
  const start = Date.now()
  try {
    const res = await fetch(check.url, {
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    })
    return {
      name: check.name,
      url: check.url,
      status: res.status,
      responseTime: Date.now() - start,
      ok: res.status < 400,
      lastChecked: new Date().toISOString(),
    }
  } catch (e) {
    return {
      name: check.name,
      url: check.url,
      status: null,
      responseTime: Date.now() - start,
      ok: false,
      error: e.message,
      lastChecked: new Date().toISOString(),
    }
  }
}

async function runHealthChecks(projectId) {
  try {
    const raw = await readFile(join(HEALTH_DIR, `${projectId}.json`), 'utf-8')
    const config = JSON.parse(raw)
    const [checks, ssl] = await Promise.all([
      Promise.all((config.checks || []).map(runHttpCheck)),
      Promise.all((config.ssl || []).map(checkSSL)),
    ])
    const allOk = checks.every(c => c.ok)
    const anyWarn = ssl.some(s => s.status === 'warn')
    const anyDanger = checks.some(c => !c.ok) || ssl.some(s => s.status === 'danger')
    return {
      checks,
      ssl,
      summary: anyDanger ? 'danger' : anyWarn ? 'warn' : allOk ? 'ok' : 'unknown',
      lastChecked: new Date().toISOString(),
    }
  } catch {
    return { checks: [], ssl: [], summary: 'unconfigured', lastChecked: null }
  }
}

// In-memory health state
const healthState = {}

async function refreshHealth(projectId) {
  const result = await runHealthChecks(projectId)
  healthState[projectId] = result
  broadcast('health', { id: projectId, health: result })
  return result
}

async function refreshAllHealth() {
  const files = await readdir(PROJECTS_DIR)
  const ids = files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''))
  await Promise.all(ids.map(id => refreshHealth(id).catch(() => {})))
  console.log(`✓ Health checks complete — ${new Date().toLocaleTimeString()}`)
}

// ─── Project parsers ──────────────────────────────────────

async function parseProject(filename, full = false) {
  const content = await readFile(join(PROJECTS_DIR, filename), 'utf-8')
  const name    = content.match(/^# (.+)/m)?.[1] || filename.replace('.md', '')
  const status  = parseStatus(content)
  const id      = filename.replace('.md', '')

  const project = {
    id,
    name,
    status,
    light: getLight(status),
    target: parseTarget(content),
    description: parseDescription(content),
    next: parseSection(content, 'Next actions'),
    blockers: parseSection(content, 'Blockers'),
    repoPaths: parseRepoPaths(content),
    health: healthState[id] ?? null,
  }

  if (full) {
    const [commits, secrets] = await Promise.all([
      project.repoPaths.length > 0 ? getGitLog(project.repoPaths[0]) : [],
      parseSecrets(id),
    ])
    project.commits = commits
    project.secrets = secrets
  }

  return project
}

async function getAllProjects() {
  const files = await readdir(PROJECTS_DIR)
  return Promise.all(files.filter(f => f.endsWith('.md')).map(f => parseProject(f)))
}

// ─── SSE broadcast ────────────────────────────────────────

const clients = new Set()

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const client of clients) client.write(payload)
}

// ─── Routes ───────────────────────────────────────────────

fastify.get('/api/projects', async () => getAllProjects())

fastify.get('/api/projects/:id', async (req, reply) => {
  const files = await readdir(PROJECTS_DIR)
  const filename = files.find(f => f === `${req.params.id}.md`)
  if (!filename) return reply.status(404).send({ error: 'Not found' })
  return parseProject(filename, true)
})

fastify.get('/api/events', (req, reply) => {
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  reply.raw.write('event: connected\ndata: {}\n\n')
  const keepAlive = setInterval(() => reply.raw.write(': ping\n\n'), 25000)
  clients.add(reply.raw)
  req.raw.on('close', () => { clearInterval(keepAlive); clients.delete(reply.raw) })
})

// ─── File watcher ─────────────────────────────────────────

chokidar.watch(PROJECTS_DIR, { ignoreInitial: true }).on('change', async (filepath) => {
  if (!filepath.endsWith('.md')) return
  try {
    const project = await parseProject(filepath.split('/').pop())
    broadcast('update', project)
    console.log(`↺  ${filepath.split('/').pop()} → pushed to ${clients.size} client(s)`)
  } catch (e) { console.error('Parse error:', e.message) }
})

// ─── Health scheduler ─────────────────────────────────────

await refreshAllHealth()
setInterval(refreshAllHealth, 60 * 1000)

// ─── Start ────────────────────────────────────────────────

await fastify.listen({ port: 3333 })
console.log('⚡ Dashboard API → http://localhost:3333')
console.log(`📁 Projects    → ${PROJECTS_DIR}`)
console.log(`🏥 Health      → checking every 60s`)
