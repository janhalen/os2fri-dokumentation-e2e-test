#!/usr/bin/env node

interface EnvVars {
  ISSUE_NUMBER: string
  ISSUE_TITLE: string
  ISSUE_BODY: string
  ISSUE_LABELS: string
  ISSUE_CLOSED_AT: string
  ISSUE_URL?: string
  OUTPUT_LOG?: string
}

function getEnv(): EnvVars {
  const missing: string[] = []
  const required = ['ISSUE_NUMBER', 'ISSUE_TITLE', 'ISSUE_BODY', 'ISSUE_LABELS', 'ISSUE_CLOSED_AT']
  for (const key of required) {
    if (!process.env[key]) missing.push(key)
  }
  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(', ')}`)
    process.exit(1)
  }
  return {
    ISSUE_NUMBER: process.env.ISSUE_NUMBER!,
    ISSUE_TITLE: process.env.ISSUE_TITLE!,
    ISSUE_BODY: process.env.ISSUE_BODY!,
    ISSUE_LABELS: process.env.ISSUE_LABELS!,
    ISSUE_CLOSED_AT: process.env.ISSUE_CLOSED_AT!,
    ISSUE_URL: process.env.ISSUE_URL,
    OUTPUT_LOG: process.env.OUTPUT_LOG || 'DECISION_LOG.md',
  }
}

function parseSection(body: string, heading: string): string {
  const regex = new RegExp(`## ${heading}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`)
  const match = body.match(regex)
  return match ? match[1].trim() : ''
}

function extractLabels(labels: string): string[] {
  return labels
    .split(',')
    .map(l => l.trim())
    .filter(l => l.length > 0)
}

function formatDate(iso: string): string {
  return iso.slice(0, 10)
}

function buildEntry(vars: EnvVars): string {
  const decisionMakers = parseSection(vars.ISSUE_BODY, 'Beslutningstagere')
  const context = parseSection(vars.ISSUE_BODY, 'Kontekst')
  const decision = parseSection(vars.ISSUE_BODY, 'Beslutning')
  const consequences = parseSection(vars.ISSUE_BODY, 'Konsekvenser')
  const labels = extractLabels(vars.ISSUE_LABELS).filter(l => l !== 'Beslutning')
  const date = formatDate(vars.ISSUE_CLOSED_AT)
  const category = labels.length > 0 ? labels.join(', ') : 'generel'
  const issueRef = vars.ISSUE_URL
    ? `[#${vars.ISSUE_NUMBER}](${vars.ISSUE_URL})`
    : `#${vars.ISSUE_NUMBER}`
  const decisionMakersMeta = decisionMakers ? `**Beslutningstagere:** ${decisionMakers} | ` : ''

  return `## BDR-#${vars.ISSUE_NUMBER}: ${vars.ISSUE_TITLE} (${date})
${decisionMakersMeta}**Kategori:** ${category} | **Sag:** ${issueRef}

### Kontekst
${context || '*Ingen kontekst angivet.*'}

### Beslutning
${decision || '*Ingen beslutning angivet.*'}

### Konsekvenser
${consequences || '*Ingen konsekvenser angivet.*'}
`
}

const LOG_HEADER = [
  '# Beslutningslog',
  '',
  'Denne log indeholder **accepterede** beslutninger for OS2fri-projektet.',
  'Hver entry stammer fra et issue med label `Beslutning` der er lukket som løst og efterfølgende godkendt via en pull request.',
  '',
].join('\n')

function prependEntry(content: string, entry: string): string {
  const firstEntryMatch = content.match(/^## BDR-#/m)
  if (firstEntryMatch) {
    const insertAt = firstEntryMatch.index!
    return content.slice(0, insertAt) + entry + '\n' + content.slice(insertAt)
  }
  return content.trimEnd() + '\n\n' + entry
}

function isDuplicate(content: string, issueNumber: string): boolean {
  const regex = new RegExp(`^## BDR-#${issueNumber}:`, 'm')
  return regex.test(content)
}

async function main() {
  const vars = getEnv()
  const logPath = vars.OUTPUT_LOG!
  const fs = await import('fs')

  let content = ''
  try {
    content = fs.readFileSync(logPath, 'utf-8')
  } catch {
    content = LOG_HEADER
  }

  if (isDuplicate(content, vars.ISSUE_NUMBER)) {
    console.log(`BDR-#${vars.ISSUE_NUMBER} already exists in ${logPath} — skipping.`)
    return
  }

  const entry = buildEntry(vars)
  const updated = prependEntry(content, entry)
  fs.writeFileSync(logPath, updated, 'utf-8')
  console.log(`Added BDR-#${vars.ISSUE_NUMBER} to ${logPath}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
