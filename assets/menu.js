document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger-menu');
  const navLinks = document.querySelector('.nav-links');
  
  // Toggle menu when clicking hamburger
  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });

  // Close menu when clicking on a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
  
  // Close menu when pressing escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });
});
