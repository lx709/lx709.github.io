document.addEventListener('DOMContentLoaded', function() {
  // Wait a short moment for Jekyll to finish processing
  setTimeout(() => {
    const yearNav = document.getElementById('yearNav');
    if (!yearNav) {
      console.warn('Year navigation not found');
      return;
    }

    const buttons = yearNav.querySelectorAll('button');
    // More specific selector to ensure we're getting the right sections
    const sections = document.querySelectorAll('.publications h2');
    const SCROLL_OFFSET = 100;
    
    // Debug log all sections and their IDs
    console.log('All sections:', Array.from(sections).map(s => ({
      id: s.id,
      text: s.textContent.trim(),
      hasId: s.hasAttribute('id'),
      actualId: s.getAttribute('id')
    })));
    
    // Debug log all buttons and their targets
    console.log('All buttons:', Array.from(buttons).map(b => ({
      target: b.getAttribute('data-target'),
      text: b.textContent.trim()
    })));
    
    buttons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        buttons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const target = this.getAttribute('data-target');
        console.log('Button clicked:', {
          target: target,
          buttonText: this.textContent.trim()
        });
        
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
          console.log('Looking for before-2020 section:', section);
        } else {
          // First try direct ID
          section = document.getElementById(target);
          console.log('Found section by ID:', section);
          
          // If not found, try finding h2 with matching text
          if (!section) {
            section = Array.from(sections).find(h2 => {
              const match = h2.textContent.trim().startsWith(target);
              console.log('Checking section:', {
                text: h2.textContent.trim(),
                target: target,
                matches: match
              });
              return match;
            });
            console.log('Found section by text:', section);
          }
        }
        
        if (section) {
          console.log('Scrolling to section:', {
            id: section.id,
            text: section.textContent.trim(),
            offsetTop: section.offsetTop
          });
          
          const offset = section.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
          window.scrollTo({
            top: offset,
            behavior: 'smooth'
          });
        } else {
          console.warn('Section not found:', {
            target: target,
            availableSections: Array.from(sections).map(s => s.id)
          });
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