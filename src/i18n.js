const state = { enabled: true, dictExact: null, dictNorm: null, rules: null, rulesCompiled: null }

function loadSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get(["enabled", "hostWhitelist", "userDict"], res => {
      const hostList = Array.isArray(res.hostWhitelist) ? res.hostWhitelist : null
      const hostOk = !hostList || hostList.length === 0 || hostList.includes(location.host)
      state.enabled = res.enabled !== false && hostOk
      state.userDict = res.userDict || null
      try { console.log("langfuse-zh: settings", { enabled: state.enabled, hostWhitelist: hostList, hostOk }) } catch {}
      resolve(res)
    })
  })
}

function norm(s) { return String(s).replace(/\s+/g, " ").trim().toLowerCase() }

async function loadDict() {
  if (state.dictExact) return { exact: state.dictExact, regex: state.rules }
  let base
  try {
    const mod = await import(chrome.runtime.getURL("translations/zh.js"))
    base = mod.default || mod
  } catch (e) {
    try {
      const url = chrome.runtime.getURL("translations/zh.json")
      const res = await fetch(url)
      base = await res.json()
    } catch (err) {
      base = {
        exact: {
          "Project Settings": "项目设置",
          "LLM Connections": "LLM连接",
          "Models": "模型",
          "Scores": "评分",
          "Evaluation": "评测",
          "Playground": "演练场",
          "Add model definition": "添加模型定义",
          "Clone": "克隆",
          "Save": "保存",
          "Cancel": "取消"
        },
        regex: [
          { pattern: "^Rows per page$", flags: "i", replace: "每页行数" },
          { pattern: "^Model Name$", flags: "i", replace: "模型名称" },
          { pattern: "^Actions$", flags: "i", replace: "操作" },
          { pattern: "^Loading\\.\\.\\.$", flags: "i", replace: "正在加载..." }
        ]
      }
      try { console.warn("langfuse-zh: dict fallback due to JSON error", err) } catch {}
    }
  }
  const user = state.userDict || {}
  const exact = Object.assign({}, base.exact || {}, user.exact || {})
  const rules = [].concat(base.regex || [], user.regex || [])
  const dictNorm = {}
  Object.keys(exact).forEach(k => { dictNorm[norm(k)] = exact[k] })
  state.dictExact = exact
  state.dictNorm = dictNorm
  state.rules = rules
  const compiled = []
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i]
    try {
      const re = new RegExp(r.pattern, r.flags || "")
      compiled.push({ re, replace: r.replace })
    } catch (e) {
      try { console.warn("langfuse-zh: invalid regex skipped", r) } catch {}
    }
  }
  state.rulesCompiled = compiled
  try { console.log("langfuse-zh: dict loaded", { exactCount: Object.keys(exact).length, regexCount: rules.length }) } catch {}
  return { exact, regex: rules }
}

function shouldSkip(node) {
  if (!node || !node.parentElement) return true
  const el = node.parentElement
  if (el.closest("input, textarea, code, pre, script, style")) return true
  if (el.hasAttribute("data-no-translate")) return true
  return false
}

function translateText(text) {
  if (!text || !state.enabled) return null
  const t0 = state.dictExact[text]
  if (t0) return t0
  let out = text
  let changed = false
  const rules = state.rulesCompiled || []
  for (let i = 0; i < rules.length; i++) {
    const { re, replace } = rules[i]
    const next = out.replace(re, replace)
    if (next !== out) { changed = true; out = next }
  }
  if (changed) return out
  const t1 = state.dictNorm[norm(text)]
  if (t1) return t1
  return null
}

function walkAndTranslate(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node
  let visited = 0, replaced = 0
  while ((node = walker.nextNode())) {
    if (shouldSkip(node)) continue
    const original = node.nodeValue
    const translated = translateText(original)
    visited++
    if (translated && translated !== original) { node.nodeValue = translated; replaced++ }
  }
  try { console.log("langfuse-zh: translate applied", { visited, replaced }) } catch {}
}

export async function initI18n() {
  await loadSettings()
  await loadDict()
}

export function applyI18n(root) {
  if (!state.enabled) return
  walkAndTranslate(root || document.body)
}

export function isEnabled() {
  return state.enabled
}

// 调试：导出页面文本样本
export function dumpTexts(limit = 2000) {
  const set = new Set()
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let node
  while ((node = walker.nextNode())) {
    if (shouldSkip(node)) continue
    const s = node.nodeValue && node.nodeValue.trim()
    if (s && s.length <= limit) set.add(s)
  }
  const arr = Array.from(set)
  try { console.log("langfuse-zh: dump", arr.slice(0, 100)) } catch {}
  return arr
}
