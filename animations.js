/* ============================================================
   CYLIAN COLIBERT — PORTFOLIO  |  animations.js
   Responsabilités :
     1. Curseur personnalisé
     2. Effet de frappe (typewriter) dans le hero
     3. Apparition au scroll (Intersection Observer)
     4. Compteur animé pour les statistiques
     5. Effet ripple sur les boutons
     6. Particules flottantes dans le hero (canvas)
     7. Tilt 3D sur les cartes de projet
     8. Barre de progression de lecture
     9. Navbar scroll + scroll spy + hamburger
    10. Effet glitch sur le logo de navigation
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. CURSEUR PERSONNALISÉ
     Un anneau cyan suit la souris avec un léger lag (interpolation).
     Grossit sur les éléments cliquables.
     ============================================================ */
  const cursorRing = document.createElement('div');
  const cursorDot  = document.createElement('div');
  cursorRing.className = 'cursor-ring';
  cursorDot.className  = 'cursor-dot';
  document.body.appendChild(cursorRing);
  document.body.appendChild(cursorDot);

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  (function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(animateCursor);
  })();

  document.querySelectorAll('a, button, .project-card, .badge, .tag').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-ring--hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-ring--hover'));
  });

  document.body.style.cursor = 'none';

  /* ============================================================
     2. EFFET TYPEWRITER dans le hero
     Tape le sous-titre caractère par caractère après le chargement.
     ============================================================ */
  const heroSubtitle = document.querySelector('.hero-subtitle');
  if (heroSubtitle) {
    const originalHTML = heroSubtitle.innerHTML;
    const plainText    = heroSubtitle.textContent;
    heroSubtitle.textContent = '';
    heroSubtitle.style.opacity = '1';

    let charIndex = 0;
    setTimeout(() => {
      const interval = setInterval(() => {
        if (charIndex < plainText.length) {
          heroSubtitle.textContent += plainText[charIndex++];
        } else {
          clearInterval(interval);
          heroSubtitle.innerHTML = originalHTML; // Restaurer le HTML (spans, accents)
        }
      }, 28);
    }, 900);
  }

  /* ============================================================
     3. APPARITION AU SCROLL — Intersection Observer
     Chaque élément ciblé reçoit la classe .reveal, puis .reveal--visible
     dès qu'il entre dans le viewport. Délai échelonné (stagger).
     ============================================================ */
  const revealSelectors = [
    '.section-label', '.section-title',
    '.about-photo-wrap', '.about-text p', '.about-tags .tag', '.stat',
    '.timeline-item',
    '.project-card',
    '.skill-group', '.badge', '.lang-item',
    '.formation-card',
    '.contact-intro', '.contact-item',
  ];

  revealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', `${Math.min(i * 80, 500)}ms`);
    });
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ============================================================
     4. COMPTEUR ANIMÉ — les chiffres des stats défilent de 0 à cible
     ============================================================ */
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const raw     = el.textContent.trim();
      const suffix  = raw.replace(/[0-9]/g, '');
      const target  = parseInt(raw, 10);
      const start   = performance.now();
      const dur     = 1200;

      (function tick(now) {
        const t    = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
        el.textContent = Math.round(ease * target) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      })(performance.now());

      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

  /* ============================================================
     5. EFFET RIPPLE sur les boutons
     Un cercle se propage depuis le point de clic.
     ============================================================ */
  document.querySelectorAll('.hero-btn, .nav-cta, .contact-item').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.addEventListener('click', function(e) {
      const old = this.querySelector('.ripple');
      if (old) old.remove();

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x    = e.clientX - rect.left - size / 2;
      const y    = e.clientY - rect.top  - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ============================================================
     6. PARTICULES FLOTTANTES dans le hero (canvas)
     Des points cyan/émeraude scintillants animent l'arrière-plan.
     ============================================================ */
  const hero = document.getElementById('hero');
  if (hero) {
    const canvas = document.createElement('canvas');
    const ctx    = canvas.getContext('2d');
    canvas.className = 'hero-particles';
    hero.insertBefore(canvas, hero.firstChild);

    function resizeCanvas() {
      canvas.width  = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const particles = Array.from({ length: 55 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.5 + 0.3,
      vx:    (Math.random() - 0.5) * 0.3,
      vy:    (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '0,212,255' : '0,255,179',
    }));

    (function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        p.alpha += (Math.random() - 0.5) * 0.015;
        p.alpha  = Math.max(0.05, Math.min(0.65, p.alpha));
      });
      requestAnimationFrame(drawParticles);
    })();
  }

  /* ============================================================
     7. TILT 3D sur les cartes de projet
     La carte s'incline légèrement selon la position de la souris.
     Un reflet lumineux suit également le curseur.
     ============================================================ */
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect    = this.getBoundingClientRect();
      const cx      = rect.left + rect.width  / 2;
      const cy      = rect.top  + rect.height / 2;
      const rotY    =  ((e.clientX - cx) / (rect.width  / 2)) * 8;
      const rotX    = -((e.clientY - cy) / (rect.height / 2)) * 8;

      this.style.transform  = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
      this.style.transition = 'transform 0.1s ease';

      const inner = this.querySelector('.project-card-inner');
      if (inner) {
        const lx = e.clientX - rect.left;
        const ly = e.clientY - rect.top;
        inner.style.background =
          `radial-gradient(circle at ${lx}px ${ly}px, rgba(0,212,255,0.07), transparent 60%)`;
      }
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform  = '';
      this.style.transition = 'transform 0.5s ease, border-color 0.28s, box-shadow 0.28s';
      const inner = this.querySelector('.project-card-inner');
      if (inner) inner.style.background = '';
    });
  });

  /* ============================================================
     8. BARRE DE PROGRESSION DE LECTURE
     Barre fine en haut de la page, se remplit selon le scroll.
     ============================================================ */
  const progressBar = document.createElement('div');
  progressBar.className = 'read-progress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    progressBar.style.width = `${Math.min(scrolled * 100, 100)}%`;
  }, { passive: true });

  /* ============================================================
     9. NAVBAR : fond opaque au scroll + SCROLL SPY + HAMBURGER
     ============================================================ */
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id], header[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* Scroll spy */
  const spyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => spyObserver.observe(s));

  /* Hamburger */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  window.closeMobileMenu = function() {
    if (hamburger) hamburger.classList.remove('open');
    if (mobileMenu) mobileMenu.classList.remove('open');
  };

  /* ============================================================
     10. EFFET GLITCH sur le logo de navigation
     Scramble aléatoire du texte "<CC />" toutes les ~7 secondes
     et au survol.
     ============================================================ */
  const navLogo = document.querySelector('.nav-logo .mono');
  if (navLogo) {
    const original    = navLogo.textContent;
    const glitchChars = '!@#$%^&*<>/\\|{}[]?';

    function glitch() {
      let iter = 0;
      const interval = setInterval(() => {
        navLogo.textContent = original.split('').map((char, i) => {
          if (i < iter / 2) return char; // Restaure progressivement depuis le début
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }).join('');
        if (++iter > 8) {
          clearInterval(interval);
          navLogo.textContent = original;
        }
      }, 60);
    }

    /* Planification aléatoire */
    (function schedule() {
      setTimeout(() => { glitch(); schedule(); }, 5000 + Math.random() * 4000);
    })();

    navLogo.addEventListener('mouseenter', glitch);
  }

}); /* ── Fin DOMContentLoaded ── */
