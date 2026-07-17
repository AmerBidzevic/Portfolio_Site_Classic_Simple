const root = document.documentElement
const themeToggle = document.querySelector("#theme-toggle")
const menuToggle = document.querySelector("#menu-toggle")
const mobileNav = document.querySelector("#mobile-nav")
const dialog = document.querySelector("#command-dialog")
const commandOpen = document.querySelector("#command-open")
const commandClose = document.querySelector("#command-close")
const toast = document.querySelector("#toast")
const scrollProgressBar = document.querySelector("#scroll-progress-bar")
const tracePanel = document.querySelector(".trace-panel")
const traceSteps = [...document.querySelectorAll("[data-trace-step]")]
const traceDetail = document.querySelector("#trace-detail")
const traceCount = document.querySelector("#trace-count")
const traceDetailNumber = document.querySelector("#trace-detail-number")
const traceKicker = document.querySelector("#trace-kicker")
const traceDetailTitle = document.querySelector("#trace-detail-title")
const traceDetailBody = document.querySelector("#trace-detail-body")
const traceTags = document.querySelector("#trace-tags")
const traceProofTitle = document.querySelector("#trace-proof-title")
const traceProofMeta = document.querySelector("#trace-proof-meta")
const traceProgressBar = document.querySelector("#trace-progress-bar")
const scrollProgressAnimation = scrollProgressBar?.animate
  ? scrollProgressBar.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: 1000, fill: "both" }
    )
  : null

scrollProgressAnimation?.pause()

root.classList.add("motion-ready")

function setTheme(theme) {
  root.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#121722" : "#f3f0e8")
  try {
    localStorage.setItem("amer-portfolio-theme-v2", theme)
  } catch {
    // Persistence is optional when browser storage is unavailable.
  }
  themeToggle?.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`)
}

function getSavedTheme() {
  try {
    return localStorage.getItem("amer-portfolio-theme-v2")
  } catch {
    return null
  }
}

const savedTheme = getSavedTheme()
setTheme(savedTheme || "light")

themeToggle?.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark")
})

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true"
  menuToggle.setAttribute("aria-expanded", String(!isOpen))
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation")
  mobileNav.classList.toggle("open", !isOpen)
})

mobileNav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false")
    menuToggle.setAttribute("aria-label", "Open navigation")
    mobileNav.classList.remove("open")
  })
})

function openCommands() {
  if (!dialog?.open) {
    if (typeof dialog.showModal === "function") dialog.showModal()
    else dialog.setAttribute("open", "")
    dialog.querySelector("a")?.focus()
  }
}

function closeCommands() {
  if (dialog?.open) {
    if (typeof dialog.close === "function") dialog.close()
    else dialog.removeAttribute("open")
  }
}

commandOpen?.addEventListener("click", openCommands)
commandClose?.addEventListener("click", closeCommands)
dialog?.addEventListener("click", event => {
  if (event.target === dialog) closeCommands()
})
dialog?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeCommands))

const traceStages = [
  {
    kicker: "USER PROFILE",
    title: "Save ratings and preferences.",
    body: "The app stores ratings and preferences in PostgreSQL and uses them to build a profile for later recommendations.",
    tags: ["React", "PostgreSQL"],
    proof: "User profile in PostgreSQL",
    meta: "Ratings / preferences / history"
  },
  {
    kicker: "CATALOG SEARCH",
    title: "Find movies worth ranking.",
    body: "Flask pulls a candidate set from the 10,000-title MovieLens catalog before running the recommendation models.",
    tags: ["Flask", "MovieLens"],
    proof: "Candidate set from 10,000 titles",
    meta: "Flask / MovieLens"
  },
  {
    kicker: "RECOMMENDATION MODEL",
    title: "Run the four recommendation signals.",
    body: "The ranker combines collaborative filtering, TF-IDF, Sentence Transformer embeddings, and a confidence score.",
    tags: ["scikit-learn", "Sentence Transformers"],
    proof: "Four-signal hybrid ranker",
    meta: "Collaborative / content / semantic / confidence"
  },
  {
    kicker: "API RESPONSE",
    title: "Send ranked movies back to the app.",
    body: "The API returns the movie list with match information and the signals that affected each result.",
    tags: ["Confidence", "Explainability"],
    proof: "Ranked response with explanation",
    meta: "Movie / score / contributing signals"
  }
]

let activeTraceStage = 0

function updateTraceStage(index, moveFocus = false) {
  const nextIndex = (index + traceStages.length) % traceStages.length
  const stage = traceStages[nextIndex]
  const stageNumber = String(nextIndex + 1).padStart(2, "0")

  traceSteps.forEach((step, stepIndex) => {
    const isActive = stepIndex === nextIndex
    step.classList.toggle("active", isActive)
    step.setAttribute("aria-selected", String(isActive))
    step.tabIndex = isActive ? 0 : -1
  })

  if (traceCount) traceCount.textContent = `PROJECT TRACE / ${stageNumber}`
  if (traceDetailNumber) traceDetailNumber.textContent = stageNumber
  if (traceKicker) traceKicker.textContent = stage.kicker
  if (traceDetailTitle) traceDetailTitle.textContent = stage.title
  if (traceDetailBody) traceDetailBody.textContent = stage.body
  if (traceProofTitle) traceProofTitle.textContent = stage.proof
  if (traceProofMeta) traceProofMeta.textContent = stage.meta
  if (traceDetail) traceDetail.setAttribute("aria-labelledby", `trace-tab-${nextIndex + 1}`)
  if (traceProgressBar) traceProgressBar.style.transform = `scaleX(${(nextIndex + 1) / traceStages.length})`

  if (traceTags) {
    const labels = stage.tags.map(tag => {
      const label = document.createElement("span")
      label.textContent = tag
      return label
    })
    traceTags.replaceChildren(...labels)
  }

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && traceDetail?.animate) {
    traceDetail.animate(
      [{ opacity: .35, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
      { duration: 260, easing: "cubic-bezier(.2,.7,.2,1)" }
    )
  }

  activeTraceStage = nextIndex
  if (moveFocus) traceSteps[nextIndex]?.focus()
}

traceSteps.forEach((step, index) => {
  step.addEventListener("click", () => updateTraceStage(index))
})

tracePanel?.addEventListener("keydown", event => {
  if (/^[1-4]$/.test(event.key)) {
    event.preventDefault()
    updateTraceStage(Number(event.key) - 1, true)
    return
  }

  if (!event.target.matches("[role='tab']")) return

  const destinations = {
    ArrowRight: activeTraceStage + 1,
    ArrowDown: activeTraceStage + 1,
    ArrowLeft: activeTraceStage - 1,
    ArrowUp: activeTraceStage - 1,
    Home: 0,
    End: traceStages.length - 1
  }

  if (event.key in destinations) {
    event.preventDefault()
    updateTraceStage(destinations[event.key], true)
  }
})

document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault()
    dialog.open ? closeCommands() : openCommands()
    return
  }

  if (dialog?.open && !event.ctrlKey && !event.metaKey && !event.altKey) {
    const key = event.key.toLowerCase()
    const command = [...dialog.querySelectorAll("[data-shortcut]")]
      .find(link => link.dataset.shortcut === key)
    if (command) {
      event.preventDefault()
      command.click()
      closeCommands()
    }
  }
})

let toastTimer
function showToast(message) {
  toast.textContent = message
  toast.classList.add("visible")
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200)
}

document.querySelector("#copy-email")?.addEventListener("click", async event => {
  const email = event.currentTarget.dataset.email
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable")
    await navigator.clipboard.writeText(email)
    showToast("EMAIL COPIED TO CLIPBOARD")
  } catch {
    window.location.href = `mailto:${email}`
  }
})

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
const reveals = document.querySelectorAll(".reveal")
if (reduceMotion || !("IntersectionObserver" in window)) {
  reveals.forEach(element => element.classList.add("visible"))
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.08, rootMargin: "0px 0px -30px" })
  reveals.forEach(element => observer.observe(element))
}


document.querySelector("#current-year").textContent = new Date().getFullYear()

let scrollFrame
function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
  if (scrollProgressAnimation) scrollProgressAnimation.currentTime = progress * 1000
  scrollFrame = null
}

window.addEventListener("scroll", () => {
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(updateScrollProgress)
}, { passive: true })
updateScrollProgress()

const sectionLinks = document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-nav a[href^="#"]')
const observedSections = [...new Set([...sectionLinks].map(link => document.querySelector(link.hash)).filter(Boolean))]

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      sectionLinks.forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "page")
        else link.removeAttribute("aria-current")
      })
    })
  }, { rootMargin: "-35% 0px -55%", threshold: 0 })
  observedSections.forEach(section => sectionObserver.observe(section))
}
