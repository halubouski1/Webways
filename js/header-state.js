    const header = document.querySelector('.header');
    const lightSections = document.querySelectorAll('.light');

    function updateHeaderTheme() {
        const headerHeight = header.offsetHeight;

        const isOnLightSection = [...lightSections].some((section) => {
            const rect = section.getBoundingClientRect();
            return rect.top <= headerHeight && rect.bottom > headerHeight;
        });

        header.classList.toggle('is-dark', isOnLightSection);
    }

    window.addEventListener('scroll', updateHeaderTheme);
    window.addEventListener('resize', updateHeaderTheme);
    window.addEventListener('load', updateHeaderTheme);

document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('openBtn');
  const closeBtn = document.getElementById('closeBtn');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');

  const focusableSelectors = 'a, button, [tabindex]:not([tabindex="-1"])';

  function openDrawer() {
    drawer.removeAttribute('inert');
    drawer.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    overlay.removeAttribute('aria-hidden');
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
  }

  function closeDrawer() {
    drawer.setAttribute('inert', '');
    drawer.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');

    openBtn.focus();
  }

  function trapFocus(e) {
    const focusable = Array.from(drawer.querySelectorAll(focusableSelectors));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
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

    if (e.key === 'Escape') {
      closeDrawer();
    }
  }

  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  drawer.addEventListener('keydown', trapFocus);
});