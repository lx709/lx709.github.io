document.addEventListener('DOMContentLoaded', function() {
  const yearNav = document.getElementById('yearNav');
  if (!yearNav) return;

  const buttons = yearNav.querySelectorAll('button');
  const sections = document.querySelectorAll('h2[id]');
  const SCROLL_OFFSET = 100; // Define constant for consistency
  
  // Add click handlers to buttons
  buttons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all buttons
      buttons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');

      const target = this.getAttribute('data-target');
      
      if (target === 'all') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        const section = document.getElementById(target === 'before-2020' ? '2019' : target);
        if (section) {
          const offset = section.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
          window.scrollTo({
            top: offset,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Create Intersection Observer for sections
  const observerOptions = {
    rootMargin: `-${SCROLL_OFFSET}px 0px -50% 0px`,
    threshold: [0, 0.1, 1]  // Added 0.1 threshold for better detection
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const year = parseInt(id);
        
        buttons.forEach(btn => btn.classList.remove('active'));
        
        if (year < 2020) {
          const beforeButton = Array.from(buttons).find(btn => btn.getAttribute('data-target') === 'before-2020');
          if (beforeButton) {
            beforeButton.classList.add('active');
          }
        } else {
          const yearButton = Array.from(buttons).find(btn => btn.getAttribute('data-target') === id);
          if (yearButton) {
            yearButton.classList.add('active');
          }
        }
      }
    });
  }, observerOptions);

  // Observe all year sections
  sections.forEach(section => observer.observe(section));

  // Initial active state based on scroll position
  function updateActiveButton() {
    const scrollPosition = window.pageYOffset + SCROLL_OFFSET;
    let activeSection = null;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (scrollPosition >= sectionTop) {
        activeSection = section;
      }
    });

    if (activeSection) {
      const year = parseInt(activeSection.id);
      buttons.forEach(btn => btn.classList.remove('active'));
      
      if (year < 2020) {
        const beforeButton = Array.from(buttons).find(btn => btn.getAttribute('data-target') === 'before-2020');
        if (beforeButton) {
          beforeButton.classList.add('active');
        }
      } else {
        const yearButton = Array.from(buttons).find(btn => btn.getAttribute('data-target') === activeSection.id);
        if (yearButton) {
          yearButton.classList.add('active');
        }
      }
    }
  }

  // Update active button on scroll
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(function() {
      updateActiveButton();
    });
  });
  
  // Set initial active button
  updateActiveButton();
}); 