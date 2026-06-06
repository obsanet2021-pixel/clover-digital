// CLOVER DIGITAL - Main JavaScript

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('open');
    });

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('open');
        });
    });
}

// Header Scroll Effect
let lastScroll = 0;
const header = document.querySelector('.main-header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Hide navbar when scrolling near footer on index.html only
    if (document.body.contains(document.querySelector('.footer-hero'))) {
        const footer = document.querySelector('.footer-hero');
        if (footer) {
            const footerTop = footer.getBoundingClientRect().top + window.pageYOffset;
            const viewportHeight = window.innerHeight;
            const scrollTrigger = footerTop - viewportHeight * 0.3; // Hide when 30% of viewport height from footer
            
            if (currentScroll > scrollTrigger) {
                header.classList.add('hidden-on-footer');
            } else {
                header.classList.remove('hidden-on-footer');
            }
        }
    }
    
    lastScroll = currentScroll;
});

// Animated Counter
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 20);
}

// Trigger counters when they come into view
const counters = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.count);
            animateCounter(entry.target, target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => counterObserver.observe(counter));

// Load Services
async function loadServices() {
    try {
        const response = await fetch('data/services.json');
        const data = await response.json();
        const servicesGrid = document.getElementById('services-grid');
        
        if (servicesGrid && data.services) {
            servicesGrid.innerHTML = data.services.map(service => `
                <div class="service-card reveal">
                    <i class="${service.icon} service-icon"></i>
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                    <a href="services.html" class="service-link">Learn More <i class="fas fa-arrow-right"></i></a>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadServices();
});

// Reveal animations
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));
