/* ==========================================================================
   MORGAN THELESTE - SCRIPT PARTICLES, ANIMATIONS ET CARROUSEL INFINI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialisation des particules avec la palette marron
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 25, density: { enable: true, value_area: 900 } },
        color: { value: ['#3b2416', '#8b5a2b', '#1e130c'] },
        shape: { type: 'circle' },
        opacity: { value: 0.35, random: false },
        size: { value: 3.5, random: true },
        line_linked: {
          enable: true,
          distance: 130,
          color: '#8b5a2b',
          opacity: 0.25,
          width: 1
        },
        move: {
          enable: true,
          speed: 1.2,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out'
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          onclick: { enable: false }
        },
        modes: {
          grab: { distance: 140, line_linked: { opacity: 0.45 } }
        }
      },
      retina_detect: false
    });
  }

  // 2. Animations GSAP d'entrée et Animations au Défilement (Scroll Reveal)
  if (typeof gsap !== 'undefined') {
    // Animation d'entrée progressive de l'en-tête (Header)
    gsap.from('.page-header > *', {
      duration: 0.6,
      y: -20,
      opacity: 0,
      stagger: 0.1,
      ease: 'power3.out'
    });
  }

  // Implementation de l'Observer de Défilement (IntersectionObserver Scroll Reveal)
  const scrollTargets = document.querySelectorAll('.content-block, .ref-card-sharp, .carousel-wrapper, .contact-item, .status-box, footer');
  
  // Masquer initialement les éléments pour l'effet de défilement
  scrollTargets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0, 35px, 0)';
    el.style.transition = 'opacity 0.65s cubic-bezier(0.2, 0, 0, 1), transform 0.65s cubic-bezier(0.2, 0, 0, 1)';
    el.style.willChange = 'opacity, transform';
  });

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Révélation ultra-fluide de l'élément lors du scroll
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translate3d(0, 0, 0)';
        
        // Animation en cascade (stagger) des puces ou tags internes
        const innerTags = entry.target.querySelectorAll('.tag-item, .tag-sharp, ul.sharp-list li');
        if (innerTags.length > 0 && typeof gsap !== 'undefined') {
          gsap.from(innerTags, {
            duration: 0.4,
            y: 10,
            opacity: 0,
            stagger: 0.04,
            delay: 0.15,
            ease: 'power2.out'
          });
        }

        scrollObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  scrollTargets.forEach(target => scrollObserver.observe(target));

  // 3. Effet Dynamique sur la Barre de Navigation lors du Défilement
  const mainNavbar = document.querySelector('.main-navbar');
  if (mainNavbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        mainNavbar.style.padding = '4px 0';
        mainNavbar.style.boxShadow = '0 8px 25px rgba(30, 19, 12, 0.12)';
      } else {
        mainNavbar.style.padding = '0';
        mainNavbar.style.boxShadow = '0 4px 20px rgba(30, 19, 12, 0.05)';
      }
    }, { passive: true });
  }

  // 3. Logique du Carrousel Infiniment Bouclé (Boucle Continue)
  const carouselTrack = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');

  if (carouselTrack && prevBtn && nextBtn && dotsContainer) {
    const slides = carouselTrack.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    let currentIndex = 0;

    // Génération automatique des points de pagination (Dots)
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Aller à la rubrique ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }

    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    // Fonction de changement de diapositive avec BOUCLE INFINIE
    function goToSlide(index) {
      if (index < 0) {
        currentIndex = totalSlides - 1; // Si on va à gauche depuis la 1ère carte, on passe à la dernière
      } else if (index >= totalSlides) {
        currentIndex = 0;               // Si on va à droite depuis la dernière carte, on REVIENT A LA CARTE 1
      } else {
        currentIndex = index;
      }

      // Déplacement fluide de la piste
      carouselTrack.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

      // Mise à jour des points de pagination (Dots)
      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      // Les boutons sont toujours actifs pour permettre le défilement infini
      prevBtn.disabled = false;
      nextBtn.disabled = false;
    }

    // Événement Clic Bouton Suivant (→)
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
    });

    // Événement Clic Bouton Précédent (←)
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
    });

    // Support du Swipe Tactile et Glisser-Déposer
    let startX = 0;
    let isDragging = false;

    carouselTrack.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    carouselTrack.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      if (Math.abs(diffX) > 40) {
        if (diffX > 0) {
          goToSlide(currentIndex + 1); // Glisse vers la droite -> carte suivante ou boucle vers carte 1
        } else {
          goToSlide(currentIndex - 1); // Glisse vers la gauche -> carte précédente ou boucle vers dernière carte
        }
      }
      isDragging = false;
    }, { passive: true });

    // Initialisation
    goToSlide(0);
  }

  // 4. Logique du Pop-up Modal PDF (Lecture DIRECTE et fluide sur le site via PDF.js Canvas)
  const pdfModal = document.getElementById('pdf-modal');
  const pdfCloseBtn = document.getElementById('pdf-modal-close');
  const pdfModalTitle = document.getElementById('pdf-modal-title');
  const pdfDownloadLink = document.getElementById('pdf-modal-download');
  const pdfCards = document.querySelectorAll('.clickable-card[data-pdf]');
  const pdfCanvasContainer = document.getElementById('pdf-canvas-container');

  const pdfPrevBtn = document.getElementById('pdf-prev');
  const pdfNextBtn = document.getElementById('pdf-next');
  const pdfPageInputEl = document.getElementById('pdf-page-input');
  const pdfPageCountEl = document.getElementById('pdf-page-count');
  const pdfZoomInBtn = document.getElementById('pdf-zoom-in');
  const pdfZoomOutBtn = document.getElementById('pdf-zoom-out');
  const pdfZoomLevelEl = document.getElementById('pdf-zoom-level');

  let currentPdfDoc = null;
  let currentPdfScale = 1.25;
  let currentPdfNumPages = 0;
  let currentActivePage = 1;
  let isProgrammaticScroll = false;

  if (pdfModal && pdfCloseBtn && pdfCanvasContainer) {

    // Configuration du worker PDF.js
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    async function loadAndRenderPdf(pdfUrl) {
      if (!pdfCanvasContainer) return;
      pdfCanvasContainer.innerHTML = '<div class="pdf-loading-spinner"><i class="fas fa-spinner fa-spin"></i> Chargement du rapport PDF...</div>';
      
      currentActivePage = 1;
      if (pdfPageInputEl) {
        pdfPageInputEl.value = '1';
        pdfPageInputEl.min = '1';
      }

      try {
        if (typeof pdfjsLib === 'undefined') {
          throw new Error('PDF.js non disponible');
        }

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        currentPdfDoc = await loadingTask.promise;
        currentPdfNumPages = currentPdfDoc.numPages;

        if (pdfPageCountEl) pdfPageCountEl.textContent = currentPdfNumPages;
        if (pdfPageInputEl) pdfPageInputEl.max = currentPdfNumPages;
        if (pdfZoomLevelEl) pdfZoomLevelEl.textContent = Math.round(currentPdfScale * 100) + '%';

        await renderAllPdfPages();

      } catch (error) {
        console.warn('Rendu PDF.js direct indisponible, bascule sur la balise PDF native:', error);
        pdfCanvasContainer.innerHTML = `
          <object data="${pdfUrl}#toolbar=1&navpanes=0&view=FitH" type="application/pdf" class="pdf-fallback-element">
            <embed src="${pdfUrl}#toolbar=1&navpanes=0&view=FitH" type="application/pdf" class="pdf-fallback-element" />
          </object>`;
      }
    }

    async function renderAllPdfPages() {
      if (!currentPdfDoc || !pdfCanvasContainer) return;
      pdfCanvasContainer.innerHTML = '';

      for (let pageNum = 1; pageNum <= currentPdfNumPages; pageNum++) {
        const page = await currentPdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: currentPdfScale });

        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'pdf-page-wrapper';
        pageWrapper.id = `pdf-page-${pageNum}`;

        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-canvas-page';
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        pageWrapper.appendChild(canvas);
        pdfCanvasContainer.appendChild(pageWrapper);

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        await page.render(renderContext).promise;
      }
    }

    // Scroll interne propre vers la page ciblée (SANS décaler l'en-tête ni la page globale)
    function scrollToPage(pageNum) {
      if (pageNum < 1 || pageNum > currentPdfNumPages) return;
      const targetEl = document.getElementById(`pdf-page-${pageNum}`);
      if (targetEl && pdfCanvasContainer) {
        isProgrammaticScroll = true;
        const targetTop = targetEl.offsetTop - pdfCanvasContainer.offsetTop - 15;
        pdfCanvasContainer.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });

        setTimeout(() => {
          isProgrammaticScroll = false;
        }, 500);
      }
    }

    // Détection du scroll interne pour mettre à jour le numéro de page active dans le champ d'entrée
    pdfCanvasContainer.addEventListener('scroll', () => {
      if (isProgrammaticScroll) return;

      const pageElements = pdfCanvasContainer.querySelectorAll('.pdf-page-wrapper');
      let pageInView = 1;
      const containerTop = pdfCanvasContainer.scrollTop;

      pageElements.forEach((el, index) => {
        if (el.offsetTop - pdfCanvasContainer.offsetTop <= containerTop + 120) {
          pageInView = index + 1;
        }
      });

      currentActivePage = pageInView;
      if (pdfPageInputEl && document.activeElement !== pdfPageInputEl) {
        pdfPageInputEl.value = currentActivePage;
      }
    });

    // Saisie directe de numéro de page
    if (pdfPageInputEl) {
      const handlePageInput = () => {
        let pageNum = parseInt(pdfPageInputEl.value, 10);
        if (isNaN(pageNum)) return;
        if (pageNum < 1) pageNum = 1;
        if (pageNum > currentPdfNumPages) pageNum = currentPdfNumPages;
        pdfPageInputEl.value = pageNum;
        currentActivePage = pageNum;
        scrollToPage(pageNum);
      };

      pdfPageInputEl.addEventListener('change', handlePageInput);
      pdfPageInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handlePageInput();
          pdfPageInputEl.blur();
        }
      });
    }

    // Navigation boutons Précédent / Suivant
    if (pdfPrevBtn) {
      pdfPrevBtn.addEventListener('click', () => {
        if (currentActivePage > 1) {
          currentActivePage--;
          if (pdfPageInputEl) pdfPageInputEl.value = currentActivePage;
          scrollToPage(currentActivePage);
        }
      });
    }

    if (pdfNextBtn) {
      pdfNextBtn.addEventListener('click', () => {
        if (currentActivePage < currentPdfNumPages) {
          currentActivePage++;
          if (pdfPageInputEl) pdfPageInputEl.value = currentActivePage;
          scrollToPage(currentActivePage);
        }
      });
    }

    // Fonction de Zoom robuste avec verrouillage du défilement pour préserver la page active
    async function changeZoom(delta) {
      const newScale = Math.min(2.5, Math.max(0.6, currentPdfScale + delta));
      if (newScale === currentPdfScale) return;

      const pageToKeep = currentActivePage;
      isProgrammaticScroll = true; // Bloquer les événements scroll intempestifs pendant le rendu
      currentPdfScale = newScale;

      if (pdfZoomLevelEl) {
        pdfZoomLevelEl.textContent = Math.round(currentPdfScale * 100) + '%';
      }

      await renderAllPdfPages();

      // Repositionnement instantané sur la page conservée
      const targetEl = document.getElementById(`pdf-page-${pageToKeep}`);
      if (targetEl && pdfCanvasContainer) {
        const targetTop = targetEl.offsetTop - pdfCanvasContainer.offsetTop - 15;
        pdfCanvasContainer.scrollTop = Math.max(0, targetTop);
      }

      currentActivePage = pageToKeep;
      if (pdfPageInputEl) pdfPageInputEl.value = pageToKeep;

      setTimeout(() => {
        isProgrammaticScroll = false;
      }, 150);
    }

    // Événements Zoom avant / Zoom arrière
    if (pdfZoomInBtn) {
      pdfZoomInBtn.addEventListener('click', () => changeZoom(0.2));
    }

    if (pdfZoomOutBtn) {
      pdfZoomOutBtn.addEventListener('click', () => changeZoom(-0.2));
    }

    // Événement clic sur les cartes cliquables
    pdfCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'a') return;

        const pdfSrc = card.getAttribute('data-pdf');
        const cardTitle = card.querySelector('.block-title')?.textContent || 'Rapport PDF';

        if (pdfSrc) {
          if (pdfModalTitle) pdfModalTitle.textContent = cardTitle;
          if (pdfDownloadLink) pdfDownloadLink.href = pdfSrc;

          pdfModal.classList.add('active');
          pdfModal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';

          loadAndRenderPdf(pdfSrc);
        }
      });
    });

    // Fermeture de la modal
    const closeModal = () => {
      pdfModal.classList.remove('active');
      pdfModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (pdfCanvasContainer) pdfCanvasContainer.innerHTML = '';
        currentPdfDoc = null;
      }, 300);
    };

    pdfCloseBtn.addEventListener('click', closeModal);

    pdfModal.addEventListener('click', (e) => {
      if (e.target === pdfModal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && pdfModal.classList.contains('active')) {
        closeModal();
      }
    });
  }

});
