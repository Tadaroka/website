'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.getElementById('primary-nav');
const mobileViewport = window.matchMedia('(max-width: 980px)');

document.documentElement.classList.add('js');
menuToggle.hidden = false;

function closeMenu() {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'باز کردن منو');
}

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
});

document.querySelector('.site-header').addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || !mobileViewport.matches) return;
  closeMenu();
  const destination = document.querySelector(link.hash);
  if (destination) {
    destination.setAttribute('tabindex', '-1');
    destination.focus({ preventScroll: true });
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu();
    menuToggle.focus();
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header')) closeMenu();
});

mobileViewport.addEventListener('change', () => closeMenu());
document.getElementById('year').textContent = new Intl.NumberFormat('fa-IR', {
  useGrouping: false,
}).format(new Date().getFullYear());

// Reveal once on scroll. Content stays visible without JS or with reduced motion.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!motionPreference.matches && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.section-heading, .product-card, .customer-grid article, .purchase-panel, .benefit-grid article, .comparison-section, .experiences-section, .process-heading, .process-steps li, .supplier-intro, .supplier-brief, .faq, .contact-section');
  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08 });
  for (const target of revealTargets) {
    // Keep initial viewport and any linked destination immediately readable.
    if (target.getBoundingClientRect().top < window.innerHeight || window.location.hash) continue;
    target.dataset.reveal = '';
    target.classList.add('reveal-pending');
    revealObserver.observe(target);
  }
  function revealAll() {
    revealObserver.disconnect();
    for (const target of revealTargets) target.classList.remove('reveal-pending');
  }
  motionPreference.addEventListener('change', revealAll);
  // In-page navigation and keyboard focus never land on invisible content.
  document.addEventListener('click', (event) => {
    if (event.target.closest('a[href^="#"]')) revealAll();
  });
  document.addEventListener('focusin', (event) => {
    event.target.closest('.reveal-pending')?.classList.remove('reveal-pending');
  });
}
