document.addEventListener('DOMContentLoaded', function() {
  function findSections() {
    // Try different selectors in order of preference
    const selectors = [
      '.publications-content h2[id]',  // First try sections with IDs in the content div
      '.publications h2[id]',          // Then try sections with IDs in the main div
      '.publications-content h2',      // Then any h2s in the content div
      '.publications h2',              // Then any h2s in the main div
      'h2[id]'                        // Finally, any h2 with an ID
    ];
    
    for (const selector of selectors) {
      const sections = document.querySelectorAll(selector);
      if (sections.length > 0) {
        console.log('Found sections using selector:', selector, sections.length);
        return sections;
      }
    }
    
    // If no sections found, try to fix the structure
    const h2s = document.querySelectorAll('h2');
    if (h2s.length > 0) {
      console.log('Found h2s without proper structure, attempting to fix...');
      h2s.forEach(h2 => {
        const yearMatch = h2.textContent.trim().match(/^(\d{4})/);
        if (yearMatch && !h2.id) {
          h2.id = yearMatch[1];
          console.log('Added ID to section:', yearMatch[1]);
        }
      });
      // Try one more time with the fixed structure
      return document.querySelectorAll('h2[id]');
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
          section = document.getElementById('2019') || 
                   Array.from(sections).find(s => s.textContent.trim().startsWith('2019'));
        } else {
          section = document.getElementById(target) || 
                   Array.from(sections).find(s => s.textContent.trim().startsWith(target));
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
            availableSections: Array.from(sections).map(s => ({
              id: s.id,
              text: s.textContent.trim()
            }))
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
  }, 200); // Increased timeout to ensure Jekyll processing is complete
}); 