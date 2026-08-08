// Add any interactive JavaScript for about page here
console.log('About page loaded');

// Display user role
function displayUserRole() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const roleElement = document.getElementById('userRole');
    
    if (user.firstName && roleElement) {
        const roleBadge = user.role === 'admin' 
            ? '<span class="role-badge admin">👑 ADMIN</span>' 
            : '<span class="role-badge user">👤 USER</span>';
        roleElement.innerHTML = `${user.firstName} ${user.lastName || ''} ${roleBadge}`;
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', displayUserRole);

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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

// Add scroll animation to sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideInContent 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});
