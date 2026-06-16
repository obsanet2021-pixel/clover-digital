// Nav scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Reveal on scroll
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Mobile nav toggle (simple show/hide)
const toggle = document.querySelector('.nav-mobile-toggle');
const navLinks = document.querySelector('.nav-links');
const navCta = document.querySelector('.nav-cta');
if (toggle) {
  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('open');
    if (navLinks) navLinks.style.display = open ? 'flex' : '';
    if (navCta) navCta.style.display = open ? 'block' : '';
  });
}

