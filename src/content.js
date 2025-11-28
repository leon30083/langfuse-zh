async function start() {
  console.log("langfuse-zh: content script start")
  const mod = await import(chrome.runtime.getURL("src/i18n.js"))
  console.log("langfuse-zh: i18n module loaded", Object.keys(mod))
  await mod.initI18n()
  console.log("langfuse-zh: i18n initialized, enabled=", mod.isEnabled())
  try { window.langfuseZhDump = mod.dumpTexts } catch {}
  mod.applyI18n(document.body)
  const mo = new MutationObserver(muts => {
    if (!mod.isEnabled()) return
    for (const m of muts) {
      if (m.type === "childList") {
        m.addedNodes.forEach(n => {
          if (n.nodeType === 1) mod.applyI18n(n)
        })
      } else if (m.type === "characterData") {
        const el = m.target.parentElement
        if (el) mod.applyI18n(el)
      }
    }
  })
  mo.observe(document.body, { childList: true, subtree: true, characterData: true })
}

start()
