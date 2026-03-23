    const drawer = document.getElementById("drawer");
    const overlay = document.getElementById("overlay");
    const openBtn = document.getElementById("openBtn");
    const closeBtn = document.getElementById("closeBtn");
    const drawerLinks = drawer.querySelectorAll("a");

    drawerLinks.forEach(link => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    let isOpen = false;

    // Build a timeline (paused) for smooth coordinated animation
    const tl = gsap.timeline({ paused: true, defaults: { overwrite: "auto" } })
      .set(overlay, { pointerEvents: "auto" })
      .to(overlay, { opacity: 1, duration: 0.25, ease: "power2.out" }, 0)
      .to(drawer,  { x: "0%", duration: 0.55, ease: "power4.out" }, 0)
      .fromTo(drawer, { opacity: 0.9 }, { opacity: 1, duration: 0.2, ease: "power1.out" }, 0);

    // Ensure initial state is off-canvas
    gsap.set(drawer, { x: "-100%" });
    gsap.set(overlay, { opacity: 0, pointerEvents: "none" });

    function openMenu() {
      if (isOpen) return;
      isOpen = true;
      drawer.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden"; // scroll lock
      tl.play(0);
    }

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;
      drawer.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = ""; // restore scroll

      // Reverse animation, then disable overlay clicks
      tl.reverse();
      // When fully closed, remove overlay pointer-events (so page is clickable)
      tl.eventCallback("onReverseComplete", () => {
        gsap.set(overlay, { pointerEvents: "none" });
        tl.eventCallback("onReverseComplete", null);
      });
    }

    openBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);

    // ESC to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
