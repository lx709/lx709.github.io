document.addEventListener('DOMContentLoaded', function() {
  function findSections() {
    // Try different selectors in order of preference
    const selectors = [
      '.publications-content h2',      // Try h2s in the content div first
      '.publications h2',              // Then h2s in the main div
      'h2'                            // Finally, any h2
    ];
    
    for (const selector of selectors) {
      const sections = document.querySelectorAll(selector);
      if (sections.length > 0) {
        console.log('Found sections using selector:', selector, sections.length);
        return sections;
      }
    }
    
    console.warn('No sections found with any selector');
    return [];
  }

  // Wait for Jekyll processing
  setTimeout(() => {
    const yearNav = document.getElementById('yearNav');
    if (!yearNav) {
      console.warn('Year navigation not found');
      return;
    }

    const buttons = yearNav.querySelectorAll('button');
    const sections = findSections();
    const SCROLL_OFFSET = 100;
    
    // Debug log all sections
    console.log('All sections:', Array.from(sections).map(s => ({
      text: s.textContent.trim(),
      id: s.id
    })));
    
    buttons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        buttons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const target = this.getAttribute('data-target');
        console.log('Button clicked:', target);
        
        if (target === 'all') {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          return;
        }
        
        let section = null;
        
        if (target === 'before-2020') {
          // Find the first section from 2019 or earlier
          section = Array.from(sections).find(s => {
            const year = parseInt(s.textContent.trim());
            return !isNaN(year) && year <= 2019;
          });
        } else {
          // Find section by year
          section = Array.from(sections).find(s => 
            s.textContent.trim().startsWith(target)
          );
        }
        
        if (section) {
          console.log('Scrolling to section:', section.textContent.trim());
          const offset = section.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
          window.scrollTo({
            top: offset,
            behavior: 'smooth'
          });
        } else {
          console.warn('Section not found for year:', target);
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
          const year = parseInt(entry.target.textContent);
          
          buttons.forEach(btn => btn.classList.remove('active'));
          
          if (!isNaN(year) && year <= 2019) {
            const beforeButton = Array.from(buttons).find(btn => 
              btn.getAttribute('data-target') === 'before-2020'
            );
            if (beforeButton) {
              beforeButton.classList.add('active');
            }
          } else {
            const yearButton = Array.from(buttons).find(btn => 
              btn.getAttribute('data-target') === entry.target.textContent.trim()
            );
            if (yearButton) {
              yearButton.classList.add('active');
            }
          }
        }
      });
    }, observerOptions);

    // Observe all sections
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
        const year = parseInt(activeSection.textContent);
        buttons.forEach(btn => btn.classList.remove('active'));
        
        if (!isNaN(year) && year <= 2019) {
          const beforeButton = Array.from(buttons).find(btn => 
            btn.getAttribute('data-target') === 'before-2020'
          );
          if (beforeButton) {
            beforeButton.classList.add('active');
          }
        } else {
          const yearButton = Array.from(buttons).find(btn => 
            btn.getAttribute('data-target') === activeSection.textContent.trim()
          );
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
  }, 200);
}); 