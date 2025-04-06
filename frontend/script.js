// Form submission handling
document.getElementById('contact-form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Form submitted! We will get back to you soon.');
    this.reset();
});

// Scroll animation using Intersection Observer
const observerOptions = {
    root: null, // Use the viewport as the root
    rootMargin: '0px',
    threshold: 0.1 // Trigger when 10% of the element is visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optionally, unobserve the element after animation to improve performance
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Select elements to animate
const fadeInElements = document.querySelectorAll('.fade-in');
const slideInLeftElements = document.querySelectorAll('.slide-in-left');
const slideInRightElements = document.querySelectorAll('.slide-in-right');
const scaleUpElements = document.querySelectorAll('.scale-up');
const featureCards = document.querySelectorAll('.feature-cards .card');
const projectCards = document.querySelectorAll('.project-cards .project-card');
const contactFormElements = document.querySelectorAll('.contact form input, .contact form textarea, .contact form .submit-btn');

// Observe each element
[...fadeInElements, ...slideInLeftElements, ...slideInRightElements, ...scaleUpElements, ...featureCards, ...projectCards, ...contactFormElements].forEach(element => {
    observer.observe(element);
});

// Navigation menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});