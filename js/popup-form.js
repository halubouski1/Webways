const overlayModal = document.getElementById("modalOverlay");
const root = document.getElementById("modalRoot");
const card = document.getElementById("modalCard");
let isOpen2 = false;
let lastActiveEl = null;

if (!card.hasAttribute("tabindex")) {
  card.setAttribute("tabindex", "-1");
}

function setClosedState() {
  root.setAttribute("aria-hidden", "true");
  root.setAttribute("inert", "");
  overlayModal.style.pointerEvents = "none";
  root.style.pointerEvents = "none";
}

function setOpenState() {
  root.setAttribute("aria-hidden", "false");
  root.removeAttribute("inert");
  overlayModal.style.pointerEvents = "auto";
  root.style.pointerEvents = "auto";
}

function trapFocus(e) {
  const focusable = Array.from(card.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  ));
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.key === "Tab") {
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

gsap.set(overlayModal, { opacity: 0 });
gsap.set(card, { opacity: 0, y: 18, scale: 0.98 });
setClosedState();

const tl2 = gsap.timeline({ paused: true, defaults: { overwrite: "auto" } })
  .to(overlayModal, {
    opacity: 1,
    duration: 0.22,
    ease: "power2.out"
  }, 0)
  .to(card, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.38,
    ease: "power3.out"
  }, 0);

function openPopup(openerEl) {
  if (isOpen2) return;
  isOpen2 = true;
  lastActiveEl = openerEl || document.activeElement;
  setOpenState();
  document.documentElement.style.overflow = "hidden";
  tl2.play(0);
  card.focus();
  document.addEventListener("keydown", trapFocus);
}

function closePopup() {
  if (!isOpen2) return;
  isOpen2 = false;
  document.removeEventListener("keydown", trapFocus);
  if (lastActiveEl && typeof lastActiveEl.focus === "function") {
    lastActiveEl.focus({ preventScroll: true });
    lastActiveEl.blur();
  }
  document.documentElement.style.overflow = "";
  tl2.reverse();
  tl2.eventCallback("onReverseComplete", () => {
    setClosedState();
    tl2.eventCallback("onReverseComplete", null);
  });
}

document.addEventListener("click", (e) => {
  const openLink = e.target.closest("[data-popup-open]");
  const closeLink = e.target.closest("[data-popup-close]");
  if (openLink) {
    e.preventDefault();
    openPopup(openLink);
  }
  if (closeLink) {
    e.preventDefault();
    closePopup();
  }
});

overlayModal.addEventListener("click", closePopup);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePopup();
});