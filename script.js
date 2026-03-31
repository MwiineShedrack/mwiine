/* ============================================================
   SHEDRACK MWIINE — PORTFOLIO SCRIPTS
   Features: Page transitions, scroll animations, active nav,
             mobile hamburger, scroll-aware nav, lightbox
   ============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────
     1. PAGE TRANSITION
  ────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.classList.add('page-transition');
  document.body.appendChild(overlay);

  // Animate in on load
  window.addEventListener('load', () => {
    overlay.classList.remove('entering');
    overlay.classList.add('leaving');
    setTimeout(() => overlay.classList.remove('leaving'), 500);
  });

  // Intercept internal link clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Skip external links, hash-only links, or non-html
    const isInternal =
      !href.startsWith('http') &&
      !href.startsWith('mailto') &&
      !href.startsWith('tel') &&
      !href.startsWith('#') &&
      (href.endsWith('.html') || href === '/');

    if (isInternal) {
      e.preventDefault();
      overlay.classList.add('entering');
      setTimeout(() => {
        window.location.href = href;
      }, 420);
    }
  });

  /* ──────────────────────────────────────────────
     2. SCROLL-AWARE NAV (shadow on scroll)
  ────────────────────────────────────────────── */
  const nav = document.querySelector('.nav');

  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* ──────────────────────────────────────────────
     3. ACTIVE NAV LINK HIGHLIGHTING
  ────────────────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach((link) => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });

  /* ──────────────────────────────────────────────
     4. MOBILE HAMBURGER / DRAWER
  ────────────────────────────────────────────── */
  const hamburger = document.querySelector('.nav-hamburger');
  const drawer    = document.querySelector('.nav-drawer');

  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      drawer.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close drawer when a link is clicked
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        drawer.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !drawer.contains(e.target)) {
        hamburger.classList.remove('open');
        drawer.classList.remove('open');
      }
    });
  }

  /* ──────────────────────────────────────────────
     5. SCROLL REVEAL ANIMATION
        Targets elements with class .reveal
  ────────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });

  // Also observe .exp-entry elements (experience page)
  document.querySelectorAll('.exp-entry').forEach((el) => {
    revealObserver.observe(el);
  });

  /* ──────────────────────────────────────────────
     6. ABOUT SECTION FADE (index.html specific)
  ────────────────────────────────────────────── */
  const aboutFadeTargets = document.querySelectorAll(
    '.about, .about-intro, .about-body, .about-sidebar'
  );

  if (aboutFadeTargets.length) {
    const aboutObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity    = '1';
            entry.target.style.transform  = 'translateY(0)';
            aboutObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    aboutFadeTargets.forEach((el) => {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(24px)';
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      aboutObserver.observe(el);
    });
  }

  /* ──────────────────────────────────────────────
     7. PROJECTS FILTER (projects.html)
  ────────────────────────────────────────────── */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length && projectCards.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        projectCards.forEach((card) => {
          const tags = card.dataset.tags || '';
          const show = filter === 'all' || tags.includes(filter);

          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

          if (show) {
            card.style.opacity   = '1';
            card.style.transform = 'scale(1)';
            card.style.pointerEvents = 'auto';
          } else {
            card.style.opacity   = '0.15';
            card.style.transform = 'scale(0.97)';
            card.style.pointerEvents = 'none';
          }
        });
      });
    });
  }

  /* ──────────────────────────────────────────────
     8. GALLERY LIGHTBOX (gallery.html)
  ────────────────────────────────────────────── */
  const galleryItems = document.querySelectorAll('.gallery-item');
  let lightbox = document.querySelector('.lightbox');

  if (galleryItems.length) {
    // Create lightbox if not present in HTML
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.classList.add('lightbox');
      lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close">✕ Close</button>
        <img src="" alt="Gallery image" />
      `;
      document.body.appendChild(lightbox);
    }

    const lbImg   = lightbox.querySelector('img');
    const lbClose = lightbox.querySelector('.lightbox-close');

    const openLightbox = (src, alt) => {
      lbImg.src = src;
      lbImg.alt = alt || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    galleryItems.forEach((item) => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) openLightbox(img.src, img.alt);
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ──────────────────────────────────────────────
     9. EXPERIENCE NAV HIGHLIGHT (experience.html)
  ────────────────────────────────────────────── */
  const expNavItems  = document.querySelectorAll('.exp-nav-item');
  const expEntries   = document.querySelectorAll('.exp-entry');

  if (expNavItems.length && expEntries.length) {
    expNavItems.forEach((item) => {
      item.addEventListener('click', () => {
        const target = document.getElementById(item.dataset.target);
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 90,
            behavior: 'smooth',
          });
        }
      });
    });

    // Highlight nav item on scroll
    const expScrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            expNavItems.forEach((item) => {
              item.classList.toggle('active', item.dataset.target === id);
            });
          }
        });
      },
      { threshold: 0.4 }
    );

    expEntries.forEach((entry) => expScrollObserver.observe(entry));
  }

  /* ──────────────────────────────────────────────
     10. CONTACT FORM HANDLING (contact.html)
  ────────────────────────────────────────────── */
  const contactForm   = document.querySelector('.contact-form');
  const formStatus    = document.querySelector('.form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('[type="submit"]');
      const original  = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled    = true;

      // Simulate / hook up to a real form service (e.g. Formspree)
      const formData = new FormData(contactForm);
      const action   = contactForm.getAttribute('action');

      try {
        if (action) {
          const res = await fetch(action, {
            method: 'POST',
            body: formData,
            headers: { Accept: 'application/json' },
          });

          if (res.ok) {
            showFormStatus('success', 'Message sent — I\'ll be in touch soon.');
            contactForm.reset();
          } else {
            showFormStatus('error', 'Something went wrong. Please try again.');
          }
        } else {
          // No action set — show success as placeholder
          await new Promise((r) => setTimeout(r, 1000));
          showFormStatus('success', 'Message received — I\'ll be in touch soon.');
          contactForm.reset();
        }
      } catch {
        showFormStatus('error', 'Network error. Please try again.');
      } finally {
        submitBtn.textContent = original;
        submitBtn.disabled    = false;
      }
    });

    function showFormStatus(type, message) {
      if (!formStatus) return;
      formStatus.textContent = message;
      formStatus.className   = `form-status ${type}`;
      setTimeout(() => {
        formStatus.className = 'form-status';
      }, 5000);
    }
  }

  /* ──────────────────────────────────────────────
     11. STAGGERED CARD ANIMATIONS
         Auto-applies reveal-delay to grid children
  ────────────────────────────────────────────── */
  document.querySelectorAll(
    '.projects-grid, .edu-grid, .certs-grid'
  ).forEach((grid) => {
    Array.from(grid.children).forEach((child, i) => {
      child.classList.add('reveal');
      if (i < 6) child.classList.add(`reveal-delay-${(i % 5) + 1}`);
      revealObserver.observe(child);
    });
  });

  /* ──────────────────────────────────────────────
     12. STATS COUNTER ANIMATION (index.html)
  ────────────────────────────────────────────── */
  const statNumbers = document.querySelectorAll('.stat-number');

  if (statNumbers.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el     = entry.target;
            const target = parseInt(el.dataset.target || el.textContent, 10);
            if (isNaN(target)) return;

            const suffix = el.dataset.suffix || '';
            let current  = 0;
            const step   = Math.max(1, Math.floor(target / 40));
            const timer  = setInterval(() => {
              current = Math.min(current + step, target);
              el.textContent = current + suffix;
              if (current >= target) clearInterval(timer);
            }, 30);

            countObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => countObserver.observe(el));
  }

})();


document.querySelectorAll('.project-nav-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Remove active class from all buttons
        document.querySelectorAll('.project-nav-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
    });
});