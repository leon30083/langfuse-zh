function save(settings) {
  return new Promise(resolve => chrome.storage.local.set(settings, resolve))
}

function load(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve))
}

async function init() {
  const els = {
    enabled: document.getElementById("enabled"),
    hosts: document.getElementById("hosts"),
    exportBtn: document.getElementById("exportBtn"),
    importBtn: document.getElementById("importBtn"),
    fileInput: document.getElementById("fileInput")
  }

  const s = await load(["enabled", "hostWhitelist"])
  els.enabled.checked = s.enabled !== false
  els.hosts.value = Array.isArray(s.hostWhitelist) ? s.hostWhitelist.join(",") : ""

  els.enabled.addEventListener("change", () => save({ enabled: els.enabled.checked }))
  els.hosts.addEventListener("change", () => {
    const list = els.hosts.value.split(",").map(x => x.trim()).filter(Boolean)
    save({ hostWhitelist: list })
  })

  els.exportBtn.addEventListener("click", async () => {
    const url = chrome.runtime.getURL("translations/zh.json")
    const res = await fetch(url)
    const blob = new Blob([await res.text()], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "zh.json"
    a.click()
  })

  els.importBtn.addEventListener("click", () => els.fileInput.click())
  els.fileInput.addEventListener("change", async () => {
    const file = els.fileInput.files[0]
    if (!file) return
    const text = await file.text()
    try {
      const json = JSON.parse(text)
      await save({ userDict: json })
      alert("导入成功")
    } catch (e) {
      alert("JSON 格式错误")
    }
  })
}

init()
