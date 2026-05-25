/* ═══════════════════════════════════════════════════════
   CYPHER GATE — script.js
   Three.js Hero + GSAP Animations + Scroll Interactions
════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────
   1. NAVIGATION — Scroll shrink + hamburger menu
───────────────────────────────────────────────────── */
(function initNav() {
  const nav        = document.getElementById('nav');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Shrink nav on scroll
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // Helper: close the mobile menu
  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = ''; // re-enable body scroll
  }

  // Helper: open the mobile menu
  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  // Replace hamburger toggle with open/close helpers
  hamburger.removeEventListener('click', hamburger._toggleHandler);
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mobileMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Re-wire mobile links to use closeMenu helper
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  mobileMenu.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', closeMenu);
  });

  // Close on outside click (desktop browsers)
  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on outside touchstart (iOS Safari fix — touch events on body)
  document.addEventListener('touchstart', (e) => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  }, { passive: true });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
      hamburger.focus(); // return focus for accessibility
    }
  });
})();


/* ─────────────────────────────────────────────────────
   2. THREE.JS — Particle field + Glowing Shield
───────────────────────────────────────────────────── */
(function initThreeJS() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  /* ── Ambient & Point Lights ── */
  scene.add(new THREE.AmbientLight(0x10B981, 0.4));

  const pointLight1 = new THREE.PointLight(0x10B981, 1.5, 20);
  pointLight1.position.set(2, 2, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x10B981, 0.8, 15);
  pointLight2.position.set(-2, -1, 2);
  scene.add(pointLight2);

  /* ── Shield Geometry (Icosahedron as polished shield base) ── */
  const shieldGeo = new THREE.IcosahedronGeometry(1, 1);
  const shieldMat = new THREE.MeshStandardMaterial({
    color:       0x10B981,
    emissive:    0x10B981,
    emissiveIntensity: 0.18,
    metalness:   0.6,
    roughness:   0.25,
    transparent: true,
    opacity:     0.85,
    wireframe:   false,
  });
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  scene.add(shieldMesh);

  /* ── Shield Wireframe Overlay ── */
  const wireMat = new THREE.MeshBasicMaterial({
    color:       0x10B981,
    wireframe:   true,
    transparent: true,
    opacity:     0.08,
  });
  const wireMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.02, 1), wireMat);
  scene.add(wireMesh);

  /* ── Glow Sphere (point glow around shield) ── */
  const glowGeo = new THREE.SphereGeometry(1.45, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color:       0x10B981,
    transparent: true,
    opacity:     0.04,
    side:        THREE.BackSide,
  });
  scene.add(new THREE.Mesh(glowGeo, glowMat));

  /* ── Orbit Ring ── */
  const ringGeo = new THREE.TorusGeometry(1.6, 0.008, 8, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color:       0x10B981,
    transparent: true,
    opacity:     0.25,
  });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 3;
  scene.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(1.9, 0.005, 8, 100),
    new THREE.MeshBasicMaterial({ color: 0x10B981, transparent: true, opacity: 0.1 })
  );
  ring2.rotation.x = Math.PI / 5;
  ring2.rotation.z = Math.PI / 4;
  scene.add(ring2);

  /* ── Floating Particles ── */
  const PARTICLE_COUNT = 280;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes     = new Float32Array(PARTICLE_COUNT);
  const speeds    = new Float32Array(PARTICLE_COUNT);
  const offsets   = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 3 + Math.random() * 7;

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi) - 2;

    sizes[i]   = Math.random() * 2.5 + 0.5;
    speeds[i]  = Math.random() * 0.3 + 0.1;
    offsets[i] = Math.random() * Math.PI * 2;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('size',     new THREE.BufferAttribute(sizes,     1));

  const particleMat = new THREE.PointsMaterial({
    color:       0x10B981,
    size:        0.045,
    transparent: true,
    opacity:     0.55,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ── Distant accent particles (dimmer) ── */
  const ACC_COUNT = 120;
  const accPos    = new Float32Array(ACC_COUNT * 3);
  for (let i = 0; i < ACC_COUNT; i++) {
    accPos[i * 3]     = (Math.random() - 0.5) * 26;
    accPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
    accPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 4;
  }
  const accGeo = new THREE.BufferGeometry();
  accGeo.setAttribute('position', new THREE.BufferAttribute(accPos, 3));
  const accMat = new THREE.PointsMaterial({ color: 0x34D399, size: 0.025, transparent: true, opacity: 0.2 });
  scene.add(new THREE.Points(accGeo, accMat));

  /* ── Mouse parallax ── */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('mousemove', e => {
    mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 0.6;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 0.4;
  }, { passive: true });

  /* ── Resize Handler ── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });

  /* ── Animation Loop ── */
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;

    // Smooth mouse follow
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;

    // Shield slow drift
    shieldMesh.rotation.y  = t * 0.18 + mouse.x * 0.4;
    shieldMesh.rotation.x  = Math.sin(t * 0.25) * 0.15 + mouse.y * 0.3;
    wireMesh.rotation.y    = shieldMesh.rotation.y;
    wireMesh.rotation.x    = shieldMesh.rotation.x;

    // Emissive pulse
    shieldMat.emissiveIntensity = 0.16 + Math.sin(t * 1.2) * 0.06;

    // Rings orbit
    ring1.rotation.y = t * 0.22;
    ring1.rotation.z = t * 0.08;
    ring2.rotation.y = -t * 0.14;
    ring2.rotation.x += 0.003;

    // Particle slow rotation
    particles.rotation.y = t * 0.04 + mouse.x * 0.15;
    particles.rotation.x = mouse.y * 0.1;

    // Float particles vertically
    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3 + 1] += Math.sin(t * speeds[i] + offsets[i]) * 0.001;
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Light pulse
    pointLight1.intensity = 1.4 + Math.sin(t * 0.9) * 0.3;

    renderer.render(scene, camera);
  }

  animate();
})();


/* ─────────────────────────────────────────────────────
   3. SCROLL REVEAL — IntersectionObserver
───────────────────────────────────────────────────── */
(function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('[data-reveal], .dash-card, .service-card, .contact-card, .timeline-step')
    .forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────────────────
   4. SECURITY SCORE — Animated counter + ring
───────────────────────────────────────────────────── */
(function initScoreAnimation() {
  const ring   = document.getElementById('scoreRing');
  const number = document.getElementById('scoreNumber');
  if (!ring || !number) return;

  const TARGET      = 92;
  const CIRCUMFERENCE = 2 * Math.PI * 52; // r=52
  ring.style.strokeDasharray  = CIRCUMFERENCE;
  ring.style.strokeDashoffset = CIRCUMFERENCE;

  let animated = false;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !animated) {
      animated = true;
      animateScore();
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  const card = document.querySelector('.dash-card--main');
  if (card) observer.observe(card);

  function animateScore() {
    let current = 0;
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutCubic(progress);
      current        = Math.round(eased * TARGET);

      number.textContent = current;

      const offset = CIRCUMFERENCE - (eased * TARGET / 100) * CIRCUMFERENCE;
      ring.style.strokeDashoffset = offset;

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }
})();


/* ─────────────────────────────────────────────────────
   5. PROGRESS BARS — Animate on scroll
───────────────────────────────────────────────────── */
(function initBarAnimations() {
  const bars = document.querySelectorAll('.bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const target = bar.style.getPropertyValue('--fill');
        bar.style.width = target;
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
})();


/* ─────────────────────────────────────────────────────
   6. TIMELINE TRACK — Fill line on scroll
───────────────────────────────────────────────────── */
(function initTimelineTrack() {
  const track    = document.getElementById('trackLine');
  const timeline = document.querySelector('.timeline');
  if (!track || !timeline) return;

  function updateTrack() {
    const rect     = timeline.getBoundingClientRect();
    const viewH    = window.innerHeight;
    const scrolled = Math.max(0, viewH - rect.top);
    const total    = rect.height + viewH;
    const pct      = Math.min(Math.max(scrolled / total, 0), 1);
    track.style.height = (pct * 100) + '%';
  }

  window.addEventListener('scroll', updateTrack, { passive: true });
  updateTrack();
})();


/* ─────────────────────────────────────────────────────
   7. SMOOTH SCROLL — Native behavior enhancement
───────────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      // Skip if href is just "#" — no valid target
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ─────────────────────────────────────────────────────
   8. GSAP ENHANCEMENTS (if available)
───────────────────────────────────────────────────── */
(function initGSAP() {
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* Service cards subtle parallax on hover */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 6;
      gsap.to(card, {
        rotateX: -y,
        rotateY: x,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 800,
        transformOrigin: 'center center',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'power2.out',
      });
    });
  });

  /* Contact cards subtle tilt */
  document.querySelectorAll('.contact-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 6;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 4;
      gsap.to(card, {
        rotateX: -y,
        rotateY: x,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 800,
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power2.out' });
    });
  });

  /* Philosophy card glow on hover */
  const philosophyCard = document.querySelector('.philosophy-card');
  if (philosophyCard) {
    philosophyCard.addEventListener('mouseenter', () => {
      gsap.to(philosophyCard, {
        boxShadow: '0 0 48px rgba(16,185,129,0.18)',
        duration: 0.4,
        ease: 'power2.out',
      });
    });
    philosophyCard.addEventListener('mouseleave', () => {
      gsap.to(philosophyCard, {
        boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
        duration: 0.5,
        ease: 'power2.out',
      });
    });
  }
})();


/* ─────────────────────────────────────────────────────
   9. ACTIVITY FEED — Simulate live updates
───────────────────────────────────────────────────── */
(function initLiveFeed() {
  const feed = document.querySelector('.activity-list');
  if (!feed) return;

  const events = [
    { msg: 'Port scan detected and blocked',         time: 'Just now · Firewall',      color: 'green' },
    { msg: 'New device enrolled — MDM verified',     time: 'Just now · IAM',           color: 'green' },
    { msg: 'SSL certificate renewed automatically',  time: 'Just now · System',        color: 'green' },
    { msg: 'Outbound traffic anomaly flagged',        time: 'Just now · MDR',           color: 'amber' },
    { msg: 'DNS filtering rule updated',             time: 'Just now · Network',       color: 'green' },
    { msg: 'Admin login from new location verified', time: 'Just now · IAM',           color: 'amber' },
    { msg: 'Endpoint scan completed — 0 threats',   time: 'Just now · Endpoint',      color: 'green' },
  ];

  let idx = 0;
  setInterval(() => {
    const items = feed.querySelectorAll('.activity-item');
    if (items.length === 0) return;

    const event = events[idx % events.length];
    idx++;

    const last = items[items.length - 1];
    last.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    last.style.opacity    = '0';
    last.style.transform  = 'translateX(10px)';

    setTimeout(() => {
      const dot = last.querySelector('.activity-dot');
      const msg = last.querySelector('.activity-msg');
      const time = last.querySelector('.activity-time');

      if (dot)  { dot.className = `activity-dot ${event.color}`; }
      if (msg)  { msg.textContent  = event.msg; }
      if (time) { time.textContent = event.time; }

      feed.insertBefore(last, feed.firstChild);

      last.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      last.style.opacity    = '1';
      last.style.transform  = 'translateX(0)';
    }, 400);

  }, 7000);
})();