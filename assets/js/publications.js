document.addEventListener('DOMContentLoaded', function() {
  // Wait a short moment for Jekyll to finish processing
  setTimeout(() => {
    const yearNav = document.getElementById('yearNav');
    if (!yearNav) {
      console.warn('Year navigation not found');
      return;
    }

    const buttons = yearNav.querySelectorAll('button');
    const sections = document.querySelectorAll('.publications h2[id]');
    const SCROLL_OFFSET = 100;
    
    // Debug log available sections
    console.log('Available sections:', Array.from(sections).map(s => ({id: s.id, text: s.textContent})));
    console.log('Available buttons:', Array.from(buttons).map(b => ({target: b.getAttribute('data-target'), text: b.textContent})));
    
    buttons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        buttons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const target = this.getAttribute('data-target');
        console.log('Clicked target:', target);
        
        if (target === 'all') {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          return;
        }
        
        // Try different ways to find the section
        let section = null;
        if (target === 'before-2020') {
          section = document.getElementById('2019');
        } else {
          // First try direct ID
          section = document.getElementById(target);
          
          // If not found, try finding h2 with matching text
          if (!section) {
            section = Array.from(document.querySelectorAll('.publications h2')).find(h2 => 
              h2.textContent.trim().startsWith(target)
            );
          }
          
          // If still not found, try finding any element containing the year
          if (!section) {
            section = document.querySelector(`[id="${target}"]`);
          }
        }
        
        console.log('Found section:', section);
        
        if (section) {
          const offset = section.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
          window.scrollTo({
            top: offset,
            behavior: 'smooth'
          });
        } else {
          console.warn('Section not found for target:', target);
        }
      });
    });

    // Create Intersection Observer for sections
    const observerOptions = {
      rootMargin: `-${SCROLL_OFFSET}px 0px -50% 0px`,
      threshold: [0, 0.1, 1]
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const year = parseInt(id);
          
          buttons.forEach(btn => btn.classList.remove('active'));
          
          if (year && year < 2020) {
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
        
        if (year && year < 2020) {
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

    // Update active button on scroll with debounce
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
  }, 100); // Small delay to ensure Jekyll has processed everything
}); 