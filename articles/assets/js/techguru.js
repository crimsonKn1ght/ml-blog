/* ============================================================
   TechGuru — Particle Network + Typing Animation
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Particle Network Canvas ── */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const PARTICLE_COUNT = Math.min(80, Math.floor((W * H) / 18000));
    const MAX_DIST = 130;
    const CYAN = '0, 212, 255';
    const VIOLET = '124, 58, 237';

    const particles = [];

    function rand(min, max) { return Math.random() * (max - min) + min; }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x  = rand(0, W);
        this.y  = rand(0, H);
        this.vx = rand(-0.3, 0.3);
        this.vy = rand(-0.3, 0.3);
        this.r  = rand(1.5, 3);
        this.alpha = rand(0.3, 0.7);
        this.color = Math.random() > 0.6 ? VIOLET : CYAN;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${CYAN}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(loop);
    }

    loop();

    window.addEventListener('resize', () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });
  }

  /* ── 2. Typing Animation for Sidebar Name ── */
  function initTyping() {
    const el = document.getElementById('typed-name');
    if (!el) return;

    const fullText = el.getAttribute('data-text') || el.textContent;
    el.textContent = '';

    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typed-cursor';
    cursor.textContent = '█';
    cursor.style.cssText = 'color:#00d4ff;animation:blink 1s step-end infinite;font-weight:300;';
    el.parentNode.insertBefore(cursor, el.nextSibling);

    // inject blink keyframe
    const style = document.createElement('style');
    style.textContent = '@keyframes blink { 50% { opacity:0; } }';
    document.head.appendChild(style);

    function type() {
      if (i < fullText.length) {
        el.textContent += fullText[i++];
        setTimeout(type, 80 + Math.random() * 60);
      } else {
        setTimeout(() => { cursor.style.display = 'none'; }, 2000);
      }
    }

    setTimeout(type, 600);
  }

  /* ── 3. Scroll-reveal fade-in ── */
  function initFadeIn() {
    const sections = document.querySelectorAll('#main > section');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    sections.forEach((s, idx) => {
      s.style.cssText = `opacity:0;transform:translateY(24px);transition:opacity 0.6s ease ${idx * 0.1}s, transform 0.6s ease ${idx * 0.1}s;`;
      observer.observe(s);
    });
  }

  /* ── 4. Article card glow on hover ── */
  function initCardGlow() {
    document.querySelectorAll('.features article').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width)  * 100;
        const y = ((e.clientY - rect.top)  / rect.height) * 100;
        card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(0,212,255,0.06), rgba(255,255,255,0.02))`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.background = '';
      });
    });
  }

  /* ── 5. Sidebar active link tracking ── */
  function initScrollSpy() {
    const navLinks = document.querySelectorAll('#nav a');
    if (!navLinks.length) return;

    const ids = Array.from(navLinks)
      .map(a => a.getAttribute('href'))
      .filter(h => h && h.startsWith('#'))
      .map(h => h.slice(1));

    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);

    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 200) {
          current = section.id;
        }
      });
      navLinks.forEach(a => {
        const href = a.getAttribute('href');
        if (href === '#' + current) {
          a.classList.add('active');
        } else if (href && href.startsWith('#')) {
          a.classList.remove('active');
        }
      });
    }, { passive: true });
  }

  /* ── 6. Smooth scroll for subpages (main page uses jQuery scrolly) ── */
  function initSmoothScroll() {
    // Main page is identified by the terminal box; skip it — scrolly handles it there
    if (document.querySelector('.terminal-box')) return;

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ── 7. Sidebar Toggle ── */
  function initSidebarToggle() {
    var btn    = document.getElementById('sidebar-toggle');
    var header = document.getElementById('header');
    if (!btn || !header) return;

    /* Position the toggle button precisely at the sidebar's left edge.
       Uses offsetWidth (actual rendered pixels) so no em/pt unit mismatch. */
    var GAP = 10; // px gap between button right edge and sidebar left edge

    function syncBtn() {
      if (document.body.classList.contains('sidebar-collapsed')) {
        btn.style.right = GAP + 'px';
      } else {
        btn.style.right = (header.offsetWidth + GAP) + 'px';
      }
    }

    syncBtn();
    window.addEventListener('resize', syncBtn);

    btn.addEventListener('click', function () {
      var collapsing = !document.body.classList.contains('sidebar-collapsed');
      document.body.classList.toggle('sidebar-collapsed');
      /* Set the target position immediately so the CSS transition animates to it */
      btn.style.right = collapsing ? GAP + 'px' : (header.offsetWidth + GAP) + 'px';
    });
  }

  /* ── Bootstrap ── */
  function init() {
    initParticles();
    initTyping();
    initFadeIn();
    initCardGlow();
    initScrollSpy();
    initSmoothScroll();
    initSidebarToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
