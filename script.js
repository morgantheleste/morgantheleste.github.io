/* ==========================================================================
   MORGAN THELESTE - SCRIPT PARTICLES, ANIMATIONS ET CARROUSEL INFINI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Fond animé personnalisé : un léger "réseau de neurones" qui pulse,
  //    en clin d'oeil au deep learning plutôt qu'un fond de particules générique.
  //    (particles.js n'est plus nécessaire, tu peux retirer son <script> du HTML)
  const particlesContainer = document.getElementById('particles-js');
  if (particlesContainer) {
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    particlesContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width, height, nodes;
    const NODE_COUNT = 32;
    const LINK_DISTANCE = 160;
    const NODE_COLORS = ['#3b2416', '#8b5a2b', '#1e130c'];

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        pulse: Math.random() * Math.PI * 2, // phase de pulsation propre à chaque nœud
        color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)]
      }));
    }

    function stepAnimation() {
      ctx.clearRect(0, 0, width, height);

      // Liens entre nœuds proches, comme des connexions synaptiques
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DISTANCE) {
            const opacity = 0.18 * (1 - dist / LINK_DISTANCE);
            ctx.strokeStyle = `rgba(139, 90, 43, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nœuds avec une pulsation douce (comme une activation neuronale)
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        const radius = Math.max(2 + Math.sin(n.pulse) * 1.2, 0.5);
        const alpha = 0.35 + Math.sin(n.pulse) * 0.15;

        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      requestAnimationFrame(stepAnimation);
    }

    resizeCanvas();
    createNodes();
    window.addEventListener('resize', () => {
      resizeCanvas();
      createNodes();
    }, { passive: true });

    requestAnimationFrame(stepAnimation);
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
  // Volontairement limité aux GROS blocs structurants : trop d'animation sur chaque
  // petit élément (chips de contact, badge de statut, footer...) donne l'impression
  // d'un site généré automatiquement plutôt qu'un choix de mise en scène délibéré.
  const scrollTargets = document.querySelectorAll('.content-block, .ref-card-sharp, .carousel-wrapper');
  
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

  // NOUVEAU : état pour le rendu paresseux (lazy rendering)
  let pageViewports = [];           // dimensions de chaque page à l'échelle courante (calcul léger, sans rendu)
  let renderedPages = new Set();    // pages déjà dessinées en canvas
  const RENDER_WINDOW = 1;          // nb de pages à garder prêtes avant/après la page active

  if (pdfModal && pdfCloseBtn && pdfCanvasContainer) {

    // Configuration du worker PDF.js
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    async function loadAndRenderPdf(pdfUrl) {
      if (!pdfCanvasContainer) return;
      pdfCanvasContainer.innerHTML = '<div class="pdf-loading-spinner"><i class="fas fa-spinner fa-spin"></i> Chargement du rapport PDF...</div>';
      
      currentActivePage = 1;
      renderedPages.clear();
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

        // 1. On prépare juste les emplacements (tailles correctes) pour TOUTES les pages,
        //    sans les dessiner : ça garde un scroll cohérent sans payer le coût du rendu.
        await buildPageScaffold();
        // 2. On ne dessine réellement que la page 1 (+ sa fenêtre de pages voisines).
        await renderPagesAround(1);

      } catch (error) {
        console.warn('Rendu PDF.js direct indisponible, bascule sur la balise PDF native:', error);
        pdfCanvasContainer.innerHTML = `
          <object data="${pdfUrl}#toolbar=1&navpanes=0&view=FitH" type="application/pdf" class="pdf-fallback-element">
            <embed src="${pdfUrl}#toolbar=1&navpanes=0&view=FitH" type="application/pdf" class="pdf-fallback-element" />
          </object>`;
      }
    }

    // Crée un emplacement (div) à la bonne taille pour chaque page, SANS les rendre.
    // getViewport() est très léger (pas de dessin), donc ça reste rapide même sur un gros PDF.
    async function buildPageScaffold() {
      if (!currentPdfDoc || !pdfCanvasContainer) return;
      pdfCanvasContainer.innerHTML = '';
      pageViewports = [];

      for (let pageNum = 1; pageNum <= currentPdfNumPages; pageNum++) {
        const page = await currentPdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: currentPdfScale });
        pageViewports[pageNum] = viewport;

        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'pdf-page-wrapper';
        pageWrapper.id = `pdf-page-${pageNum}`;
        // On réserve déjà le bon espace : le scroll reste correct avant même le dessin
        pageWrapper.style.width = `${viewport.width}px`;
        pageWrapper.style.height = `${viewport.height}px`;

        pdfCanvasContainer.appendChild(pageWrapper);
      }
    }

    // Dessine UNE page dans son emplacement, seulement si ce n'est pas déjà fait.
    async function renderSinglePage(pageNum) {
      if (pageNum < 1 || pageNum > currentPdfNumPages) return;
      if (renderedPages.has(pageNum)) return;

      const pageWrapper = document.getElementById(`pdf-page-${pageNum}`);
      if (!pageWrapper || !currentPdfDoc) return;

      const page = await currentPdfDoc.getPage(pageNum);
      const viewport = pageViewports[pageNum] || page.getViewport({ scale: currentPdfScale });

      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-canvas-page';
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      pageWrapper.innerHTML = '';
      pageWrapper.appendChild(canvas);

      await page.render({ canvasContext: context, viewport }).promise;
      renderedPages.add(pageNum);
    }

    // Dessine la page demandée + une petite fenêtre de pages voisines (scroll fluide sans tout charger)
    async function renderPagesAround(centerPage) {
      const start = Math.max(1, centerPage - RENDER_WINDOW);
      const end = Math.min(currentPdfNumPages, centerPage + RENDER_WINDOW);
      for (let p = start; p <= end; p++) {
        await renderSinglePage(p);
      }
    }

    // Scroll interne propre vers la page ciblée (SANS décaler l'en-tête ni la page globale)
    function scrollToPage(pageNum) {
      if (pageNum < 1 || pageNum > currentPdfNumPages) return;
      renderPagesAround(pageNum); // s'assure que la page ciblée est bien dessinée
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

      // On dessine à la volée la page qui vient d'apparaître (+ ses voisines)
      renderPagesAround(pageInView);
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

      // Le zoom change la taille de chaque page : on refait les emplacements (léger)
      // puis on ne redessine que la fenêtre autour de la page conservée.
      renderedPages.clear();
      await buildPageScaffold();
      await renderPagesAround(pageToKeep);

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

    // Événement clic EXCLUSIF sur les boutons de badge PDF (.card-pdf-badge)
    const pdfBadges = document.querySelectorAll('.card-pdf-badge[data-pdf]');
    pdfBadges.forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();

        const pdfSrc = badge.getAttribute('data-pdf');
        const cardTitle = badge.getAttribute('data-title') || badge.closest('.content-block')?.querySelector('.block-title')?.textContent || 'Rapport PDF';

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

  // ==========================================================================
  // 5. TRADUCTION INSTANTANÉE FRANÇAIS / ANGLAIS (PERSISTANTE EN LOCALSTORAGE)
  // ==========================================================================
  const translations = {
    fr: {
      // Nav & Common
      nav_brand: "Morgan Theleste",
      nav_home: "Accueil",
      nav_experience: "Expérience",
      nav_projects: "Projets",
      nav_education: "Formation",
      nav_skills: "Compétences",
      nav_engagement: "Engagement",
      nav_references: "Références",
      footer_text: "&copy; Morgan Theleste — Élève-ingénieur IRIS @ SeaTech",
      footer_rights: "&copy; Morgan Theleste — Élève-ingénieur IRIS @ SeaTech",

      // index.html
      header_title_home: "Morgan Theleste",
      header_subtitle_home: "Élève-ingénieur en 3ème année • Département IRIS @ SeaTech",
      status_box: "<i class=\"fas fa-search\"></i> Recherche d'un stage de 6 mois à partir de Mars 2027",
      contact_location: "Toulon, 83200",
      contact_license: "Permis B",
      profile_title: "Profil & Objectif",
      profile_desc: "Élève-ingénieur en Sciences des Données et Systèmes d'Information au sein de SeaTech (membre du groupe INP), je suis rigoureux, curieux et animé par un fort esprit d'équipe. Fort d'un intérêt marqué pour le Machine/Deep Learning et les architectures Cloud Data, je recherche un stage de 6 mois à partir de Mars 2027. Mon ambition est de mettre mes compétences en développement, analyse et optimisation directement au profit de vos projets d'ingénierie.",
      explore_rubrics: "Explorez mes rubriques",
      card1_title: "01. Expérience Pro",
      card1_desc: "Stage KMUTT à Bangkok (Streamlit, cluster SLURM, GPU L40), bureau d'études IMET-BETP et Mairie de La Valette-du-Var.",
      consult_details: "Consulter les détails <i class=\"fas fa-arrow-right\"></i>",
      card2_title: "02. Projets & Recherche",
      card2_desc: "Développement de jeu de plateau (Lua / LÖVE), Projet TIPE (champs électriques sur eau hydrophobe), Portail IA & Supercalculateur.",
      card3_title: "03. Formation",
      card3_desc: "Diplôme d'ingénieur SeaTech (Spécialité Data & SI - IRIS) et Licence en Sciences pour l'Ingénieur à l'Université de Toulon.",
      card4_title: "04. Compétences",
      card4_desc: "C/C++, Python, MATLAB, Machine Learning, Lua, SQL, Streamlit, AutoCAD, Anglais C1 (TOEIC 900) et savoir-être.",
      card5_title: "05. Engagement & Passions",
      card5_desc: "Président du BDS SeaTech, passionné par la pratique du Skateboard.",
      card6_title: "06. Références & Contact",
      card6_desc: "Contacts académiques (Université de Toulon & KMUTT Bangkok) et coordonnées de contact direct.",

      // experience.html
      exp_header_title: "Expérience Professionnelle",
      exp_header_subtitle: "Parcours technique en ingénierie logicielle, data science et travaux publics",
      exp1_date: "Mai – Août 2025 • Bangkok, Thaïlande",
      exp1_title: "Stagiaire en Ingénierie Logicielle et Data Science",
      exp1_subtitle: "KMUTT (King Mongkut's University of Technology Thonburi) – Laboratoire CERSL",
      exp1_desc: "Au sein du laboratoire CERSL de l'université KMUTT à Bangkok, j'ai travaillé à rendre des modèles complexes d'Intelligence Artificielle de traitement d'images accessibles aux chercheurs et utilisateurs :",
      exp1_li1: "<strong>Développement d'un portail web (Python, Streamlit) :</strong> Conception d'une interface graphique réactive permettant d'appliquer des modèles de super-résolution (HAUNet) et de correction de brume.",
      exp1_li2: "<strong>Optimisation des performances & Cluster SLURM :</strong> Connexion de l'interface par SSH au supercalculateur de l'université (Cluster SLURM équipé de GPU NVIDIA L40) pour exécuter les calculs lourds à distance de manière transparente.",
      exp1_li3: "<strong>Résolution de saturation mémoire GPU (Tiling) :</strong> Conception et mise en œuvre d'un algorithme de découpage dynamique d'images (tiling) pour traiter des images très haute définition sans dépasser la mémoire de la carte graphique.",
      exp1_li4: "<strong>Débogage et fiabilisation Deep Learning :</strong> Analyse approfondie et correction des bugs du code des modèles pour éliminer les artefacts visuels sur les images produites.",
      exp2_date: "2025 • Toulon, France",
      exp2_title: "Stagiaire – Bureau d'études Travaux Publics & Génie Civil",
      exp2_subtitle: "IMET-BETP (Bureau d'études travaux publics et génie civil)",
      exp2_desc: "Stage technique en bureau d'études spécialisé dans le génie civil et les Voiries et Réseaux Divers (VRD) :",
      exp2_li1: "<strong>Élaboration et révision des plans techniques :</strong> Participation active aux études de réseaux, voiries et structures sous la supervision des ingénieurs d'études.",
      exp2_li2: "<strong>Processus documentaires & Gestion de projet :</strong> Découverte approfondie des phases d'un projet de BTP, du cahier des charges au dossier d'exécution.",
      exp2_li3: "<strong>Outils CAO & Analyse :</strong> Utilisation quotidienne d'AutoCAD pour le dessin technique et d'Excel pour le suivi quantitatif et l'analyse documentaire.",
      exp3_date: "2023 – 2024 • La Valette-du-Var, France",
      exp3_title: "Agent municipal",
      exp3_subtitle: "Mairie de La Valette-du-Var",
      exp3_desc: "Expérience de terrain au sein des services municipaux de la ville :",
      exp3_li1: "Entretien des espaces publics et des espaces verts de la commune.",
      exp3_li2: "Travail en équipe restreinte avec un accent fort sur les normes de sécurité et la qualité de service.",
      exp3_li3: "Développement d'une grande rigueur de travail, du sens du service public et des responsabilités professionnelles.",

      // projets.html
      proj_header_title: "Projets Tech & Recherche",
      proj_header_subtitle: "Développements logiciels, modélisation et projets d'expérimentation scientifique",
      proj2_date: "Mai – Août 2025",
      proj2_title: "Sandbox web pour modèles de deep learning en télédétection",
      proj2_subtitle: "Stage de recherche — CERSL, KMUTT (Bangkok, Thaïlande)",
      proj2_desc: "Conception et déploiement d'une plateforme web interactive rendant accessibles, sans expertise en calcul haute performance, des modèles de deep learning dédiés à la restauration d'images de télédétection :",
      proj2_li1: "<strong>Architecture full-stack et déploiement :</strong> conception du site Streamlit, API dédiée en FastAPI pour l'inférence, déploiement sur machine virtuelle via SSH et conteneurisation Docker.",
      proj2_li2: "<strong>Intégration de deux modèles de deep learning :</strong> HAUNet (super-résolution x4) et DA-Net (débrumisation), connectés au cluster HPC SLURM de l'université pour l'inférence sur GPU NVIDIA L40.",
      proj2_li3: "<strong>Optimisation mémoire et post-traitement :</strong> algorithme de découpage en tuiles (96x96 px) pour éviter les erreurs de saturation mémoire GPU, filtre bilatéral pour corriger les artefacts visuels résiduels.",
      proj_click_pdf: "<i class=\"fas fa-file-pdf\"></i> Cliquer pour consulter le rapport PDF <i class=\"fas fa-arrow-right\"></i>",
      proj3_date: "septembre 2025 – juin 2026",
      proj3_title: "PhishML — Détection de phishing par machine learning",
      proj3_subtitle: "Projet de machine learning appliqué à la cybersécurité",
      proj3_desc: "Conception d'un pipeline complet de détection de sites de phishing, sur un dataset équilibré de près de 18 000 URLs enrichi de caractéristiques forensiques :",
      proj3_li1: "<strong>Dataset et preprocessing :</strong> équilibrage 50/50, correction du data leakage, pipeline d'encodage robuste (OrdinalEncoder) conçu pour la mise en production.",
      proj3_li2: "<strong>Modélisation et sélection :</strong> comparaison de trois algorithmes selon la métrique prioritaire FPR — modèle Random Forest retenu, avec un FPR de 0.056% et un F1-score de 0.999 sur le jeu de test.",
      proj3_li3: "<strong>Explicabilité SHAP :</strong> identification des signaux forensiques discriminants (poids réseau, erreurs CORS, en-têtes de sécurité) caractéristiques d'une infrastructure de phishing.",
      proj1_date: "Mars 2026 – Aujourd'hui",
      proj1_title: "Développement de jeu de plateau 2D (Lua / Framework LÖVE)",
      proj1_subtitle: "Projet d'Architecture Logicielle et Programmation Orientée Événement",
      proj1_desc: "Conception et développement complet d'un jeu de plateau type échecs avec moteur de jeu sur mesure :",
      proj1_li1: "<strong>Programmation Lua & Framework LÖVE (Love2D) :</strong> Implémentation du moteur du jeu, de la gestion du plateau, du déplacement des pièces et de la détection d'état (échec, mat, pat).",
      proj1_li2: "<strong>Interface Graphique & Interactions :</strong> Création d'une interface utilisateur fluide et réactive avec gestion des clics, sélections et animations d'état.",
      proj4_date: "01/2022 – 06/2024",
      proj4_title: "Projet TIPE : Étude des charges à l'interface de l'eau en milieu hydrophobe",
      proj4_subtitle: "Projet de Recherche Expérimentale et Modélisation Physique",
      proj4_desc: "Travail d'initiative personnelle encadré (TIPE) de deux ans combinant expérimentation physique et analyse de données :",
      proj4_li1: "<strong>Capture de charges électriques :</strong> Étude théorique et expérimentale du transfert de charges par frottement entre une goutte d'eau et un matériau hydrophobe.",
      proj4_li2: "<strong>Expérimentations Haute Tension :</strong> Conception et montage d'un dispositif expérimental soumettant les gouttelettes d’eau à des champs électriques contrôlés de très haute tension.",
      proj4_li3: "<strong>Résultats & Démonstration :</strong> Démonstration physique du phénomène d'attraction d'une gouttelette d'eau initialement électriquement neutre sous l'effet d'un champ électrique intense.",
      pdf_download_text: "<i class=\"fas fa-download\"></i> Télécharger",

      // formation.html
      edu_header_title: "Formation & Diplômes",
      edu_header_subtitle: "Parcours d'ingénierie et formation scientifique académique",
      edu1_date: "2024 – 2027 • Toulon, France",
      edu1_title: "École d'ingénieurs SeaTech (Groupe INP)",
      edu1_subtitle: "Diplôme d'ingénieur (Grade de Master) — Spécialité Données et Systèmes d'Information (Département IRIS)",
      edu1_desc: "Formation d'ingénieur approfondie spécialisée dans l'ingénierie des données, la modélisation logicielle et les systèmes d'information :",
      edu1_li1: "<strong>Sciences des données & Machine Learning :</strong> Algorithmes d'apprentissage automatique, apprentissage profond, statistiques et modélisation de données complexes.",
      edu1_li2: "<strong>Traitement et Systèmes d'Information (IRIS) :</strong> Architecture logicielle, développement objet (C++, Python), bases de données relationnelles et SQL, traitement d'images et de signaux.",
      edu1_li3: "<strong>Sciences de l'ingénieur :</strong> Résolution de problèmes complexes, gestion de projets informatiques et méthodologies agiles.",
      edu2_date: "2022 – 2024 • Toulon, France",
      edu2_title: "Licence en Sciences pour l'Ingénieur",
      edu2_subtitle: "Université de Toulon",
      edu2_desc: "Formation universitaire fondamentale en sciences appliquées et ingénierie :",
      edu2_li1: "<strong>Bases scientifiques solides :</strong> Mathématiques appliquées, physique générale, informatique et outils numériques de calcul (MATLAB).",
      edu2_li2: "<strong>Projet de recherche de 2 ans :</strong> Conduite d'un travail de recherche approfondi en parallèle du cursus universitaire avec synthèse écrite et orale des résultats.",

      // competences.html
      skills_header_title: "Compétences & Langues",
      skills_header_subtitle: "Savoir-faire technique, environnement de développement et maîtrise linguistique",
      skills_sec1_title: "Langages de Programmation & Frameworks",
      skills_sec2_title: "Environnement Technique & Outils",
      skills_sec2_li1: "<strong>HPC & Calcul Distribué :</strong> Connexion et exécution de tâches sur Cluster SLURM avec GPU NVIDIA L40 via SSH.",
      skills_sec2_li2: "<strong>CAO & Génie Civil :</strong> AutoCAD (élaboration et révision de plans techniques VRD).",
      skills_sec2_li3: "<strong>Outils Bureautiques :</strong> Pack Office (Word, PowerPoint, Excel utilisation avancée).",
      skills_sec3_title: "Langues",
      skills_sec3_li1: "<strong>Français :</strong> Langue maternelle.",
      skills_sec3_li2: "<strong>Anglais :</strong> Niveau Avancé (C1) — Certification TOEIC : 900 (Aisance professionnelle à l'écrit et à l'oral).",
      skills_sec4_title: "Savoir-être Professionnel",
      skills_soft_tag1: "Esprit d'équipe & Adaptabilité",
      skills_soft_tag2: "Sens de l'organisation & Fiabilité",
      skills_soft_tag3: "Prise d'initiative & Créativité",
      skills_soft_tag4: "Communication interculturelle (Expérience Thaïlande)",

      // engagement.html
      eng_header_title: "Engagement Associatif & Passions",
      eng_header_subtitle: "Responsabilités associatives, centres d'intérêt et projets personnels",
      eng1_date: "02/2025 – Aujourd'hui • Toulon, France",
      eng1_title: "Président — SeaTech Sports Association (Bureau des Sports)",
      eng1_desc: "Direction de l'association sportive de l'école d'ingénieurs SeaTech :",
      eng1_li1: "<strong>Organisation d'événements :</strong> Planification et mise en œuvre de tournois sportifs, compétitions et rassemblements étudiants (plus de 400 étudiants) tout au long de l'année universitaire.",
      eng1_li2: "<strong>Management d'équipe & Bénévolat :</strong> Encadrement et coordination d'une équipe de bénévoles étudiants (25 personnes).",
      eng1_li3: "<strong>Gestion budgétaire & Leadership :</strong> Élaboration et suivi des budgets événementiels (+ de 20 000 euros de budget), négociation de partenariats et prise de décision stratégique.",
      eng1_li4: "<strong>Développement de compétences :</strong> Renforcement du leadership, de la gestion du stress, de la communication et de la résolution de problèmes en équipe.",
      eng2_title: "Skateboard",
      eng2_desc: "Skateur depuis mes 15 ans — une pratique qui a forgé ma persévérance et ma créativité, portée par un attachement profond à la culture skate et à la street culture au sens large.",

      // references.html
      ref_page_title: "Références Académiques & Contact",
      ref_page_subtitle: "Recommandations universitaires et coordonnées directes",
      ref_section_title: "Références Académiques & Professionnelles",
      ref_section_desc: "Vous pouvez contacter directement mes référents académiques pour toute demande d'appréciation sur mes travaux :",
      ref_1_role: "Enseignant-Chercheur",
      ref_1_lab: "LSIS - Laboratory of Information and Systems Sciences / Université de Toulon",
      ref_2_role: "Head of Computer Engineering Department",
      ref_2_lab: "Computer Engineering Department, Laboratoire CERSL (KMUTT Bangkok)",
      contact_section_title: "Me Contacter Directement",
      contact_section_desc: "Disponible pour un stage de 6 mois à partir de <strong>Mars 2027</strong> en Data Science, Ingénierie Logicielle ou Systèmes d'Information :",
      contact_license: "Permis B"
    },

    en: {
      // Nav & Common
      nav_brand: "Morgan Theleste",
      nav_home: "Home",
      nav_experience: "Experience",
      nav_projects: "Projects",
      nav_education: "Education",
      nav_skills: "Skills",
      nav_engagement: "Engagement",
      nav_references: "References",
      footer_text: "&copy; Morgan Theleste — IRIS Engineering Student @ SeaTech",
      footer_rights: "&copy; Morgan Theleste — IRIS Engineering Student @ SeaTech",

      // index.html
      header_title_home: "Morgan Theleste",
      header_subtitle_home: "3rd Year Engineering Student • IRIS Department @ SeaTech",
      status_box: "<i class=\"fas fa-search\"></i> Seeking a 6-month internship starting March 2027",
      contact_location: "Toulon, France",
      contact_license: "Driver's License (Class B)",
      profile_title: "Profile & Objective",
      profile_desc: "As a Data Science and Information Systems engineering student at SeaTech (member of INP group), I am rigorous, curious, and driven by strong teamwork skills. With a keen interest in Machine/Deep Learning and Cloud Data architectures, I am looking for a 6-month internship starting March 2027. My goal is to apply my software development, data analysis, and optimization skills directly to your engineering projects.",
      explore_rubrics: "Explore my sections",
      card1_title: "01. Work Experience",
      card1_desc: "KMUTT research internship in Bangkok (Streamlit, SLURM cluster, L40 GPU), IMET-BETP design office, and La Valette-du-Var City Council.",
      consult_details: "View details <i class=\"fas fa-arrow-right\"></i>",
      card2_title: "02. Projects & Research",
      card2_desc: "2D board game development (Lua / LÖVE), TIPE physics project (electric fields on hydrophobic water), AI & Supercomputing Portal.",
      card3_title: "03. Education",
      card3_desc: "SeaTech Engineering Degree (Data Science & IS Specialization - IRIS) and Bachelor's in Engineering Sciences at University of Toulon.",
      card4_title: "04. Skills",
      card4_desc: "C/C++, Python, MATLAB, Machine Learning, Lua, SQL, Streamlit, AutoCAD, English C1 (TOEIC 900), and soft skills.",
      card5_title: "05. Engagement & Passions",
      card5_desc: "President of SeaTech Sports Association (BDS), passionate skateboarder.",
      card6_title: "06. References & Contact",
      card6_desc: "Academic references (University of Toulon & KMUTT Bangkok) and direct contact details.",

      // experience.html
      exp_header_title: "Professional Experience",
      exp_header_subtitle: "Technical trajectory in software engineering, data science, and civil infrastructure",
      exp1_date: "May – August 2025 • Bangkok, Thailand",
      exp1_title: "Software Engineering & Data Science Intern",
      exp1_subtitle: "KMUTT (King Mongkut's University of Technology Thonburi) – CERSL Laboratory",
      exp1_desc: "At the CERSL laboratory at KMUTT University in Bangkok, I worked on making complex image processing AI models accessible to researchers and users:",
      exp1_li1: "<strong>Web Portal Development (Python, Streamlit):</strong> Design of a responsive GUI for executing super-resolution (HAUNet) and dehazing models.",
      exp1_li2: "<strong>Performance Optimization & SLURM Cluster:</strong> SSH integration with the university's supercomputer (SLURM cluster with NVIDIA L40 GPUs) for seamless remote heavy computing.",
      exp1_li3: "<strong>GPU Memory Saturation Fix (Tiling):</strong> Design and implementation of a dynamic image tiling algorithm to process ultra-high definition images without GPU memory overflow.",
      exp1_li4: "<strong>Deep Learning Debugging & Reliability:</strong> In-depth analysis and bug fixes in model code to eliminate visual artifacts in generated outputs.",
      exp2_date: "2025 • Toulon, France",
      exp2_title: "Intern – Civil Engineering & Infrastructure Design Office",
      exp2_subtitle: "IMET-BETP (Civil Engineering and Public Works Design Office)",
      exp2_desc: "Technical internship in a design office specializing in civil engineering and utility networks:",
      exp2_li1: "<strong>Technical Drafting & Revision:</strong> Active participation in utility network, road, and structural studies under the supervision of design engineers.",
      exp2_li2: "<strong>Documentation Processes & Project Management:</strong> Thorough discovery of civil engineering project phases, from specifications to execution files.",
      exp2_li3: "<strong>CAD Tools & Analytics:</strong> Daily usage of AutoCAD for technical drafting and Excel for quantitative tracking and document analysis.",
      exp3_date: "2023 – 2024 • La Valette-du-Var, France",
      exp3_title: "Municipal Staff Member",
      exp3_subtitle: "La Valette-du-Var City Council",
      exp3_desc: "Field experience within municipal public services:",
      exp3_li1: "Maintenance of public spaces and green areas of the municipality.",
      exp3_li2: "Teamwork in small units with strong focus on safety standards and service quality.",
      exp3_li3: "Development of work rigor, sense of public service, and professional responsibility.",

      // projets.html
      proj_header_title: "Tech Projects & Research",
      proj_header_subtitle: "Software engineering, modeling, and scientific experimentation projects",
      proj2_date: "May – August 2025",
      proj2_title: "Web Sandbox for Remote Sensing Deep Learning Models",
      proj2_subtitle: "Research Internship — CERSL, KMUTT (Bangkok, Thailand)",
      proj2_desc: "Design and deployment of an interactive web platform making deep learning models for remote sensing image restoration accessible without HPC expertise:",
      proj2_li1: "<strong>Full-stack Architecture & Deployment:</strong> Streamlit frontend design, dedicated FastAPI inference endpoint, SSH virtual machine deployment, and Docker containerization.",
      proj2_li2: "<strong>Integration of 2 Deep Learning Models:</strong> HAUNet (4x super-resolution) and DA-Net (dehazing), connected to the university's SLURM HPC cluster for NVIDIA L40 GPU inference.",
      proj2_li3: "<strong>Memory Optimization & Post-processing:</strong> Tiling algorithm (96x96 px) to prevent GPU out-of-memory errors, and bilateral filter to smooth residual visual artifacts.",
      proj_click_pdf: "<i class=\"fas fa-file-pdf\"></i> Click to view the PDF Report <i class=\"fas fa-arrow-right\"></i>",
      proj3_date: "September 2025 – June 2026",
      proj3_title: "PhishML — Phishing Detection via Machine Learning",
      proj3_subtitle: "Machine learning project applied to cybersecurity",
      proj3_desc: "Design of a complete phishing website detection pipeline on a balanced dataset of nearly 18,000 URLs enriched with forensic features:",
      proj3_li1: "<strong>Dataset & Preprocessing:</strong> 50/50 balancing, data leakage fix, and robust encoding pipeline (OrdinalEncoder) ready for production.",
      proj3_li2: "<strong>Modeling & Selection:</strong> Evaluation of 3 algorithms prioritizing FPR — Random Forest selected with 0.056% FPR and 0.999 F1-score on test set.",
      proj3_li3: "<strong>SHAP Explainability:</strong> Identification of key discriminant forensic signals (network weight, CORS errors, security headers) characteristic of phishing infrastructure.",
      proj1_date: "March 2026 – Present",
      proj1_title: "2D Board Game Development (Lua / LÖVE Framework)",
      proj1_subtitle: "Software Architecture & Event-Driven Programming Project",
      proj1_desc: "Full design and development of a chess-type board game with a custom game engine:",
      proj1_li1: "<strong>Lua & LÖVE Framework (Love2D):</strong> Implementation of core game engine, board state management, piece movement, and state detection (check, checkmate, stalemate).",
      proj1_li2: "<strong>GUI & Interactions:</strong> Creation of a fluid and responsive UI handling click interactions, selections, and state transitions.",
      proj4_date: "01/2022 – 06/2024",
      proj4_title: "TIPE Project: Study of Charges at Water-Hydrophobic Interface",
      proj4_subtitle: "Experimental Research & Physics Modeling Project",
      proj4_desc: "Two-year supervised personal research project combining experimental physics and data analysis:",
      proj4_li1: "<strong>Electric Charge Transfer:</strong> Theoretical and experimental study of charge transfer by friction between a water droplet and a hydrophobic surface.",
      proj4_li2: "<strong>High-Voltage Experimentation:</strong> Design and assembly of an experimental setup subjecting water droplets to controlled high-voltage electric fields.",
      proj4_li3: "<strong>Results & Demonstration:</strong> Physical demonstration of droplet attraction under intense electric field gradient.",
      pdf_download_text: "<i class=\"fas fa-download\"></i> Download",

      // formation.html
      edu_header_title: "Education & Degrees",
      edu_header_subtitle: "Engineering path and academic scientific education",
      edu1_date: "2024 – 2027 • Toulon, France",
      edu1_title: "SeaTech School of Engineering (INP Group)",
      edu1_subtitle: "Engineering Degree (Master's Grade) — Specialization in Data Science & Information Systems (IRIS Department)",
      edu1_desc: "In-depth engineering education specialized in data engineering, software modeling, and information systems:",
      edu1_li1: "<strong>Data Science & Machine Learning:</strong> Machine learning algorithms, deep learning, applied statistics, and complex data modeling.",
      edu1_li2: "<strong>Processing & Information Systems (IRIS):</strong> Software architecture, object-oriented development (C++, Python), relational databases & SQL, image and signal processing.",
      edu1_li3: "<strong>Engineering Sciences:</strong> Complex problem solving, IT project management, and agile methodologies.",
      edu2_date: "2022 – 2024 • Toulon, France",
      edu2_title: "Bachelor's Degree in Engineering Sciences",
      edu2_subtitle: "University of Toulon",
      edu2_desc: "Fundamental university curriculum in applied sciences and engineering:",
      edu2_li1: "<strong>Solid Scientific Foundations:</strong> Applied mathematics, general physics, computer science, and numerical computing tools (MATLAB).",
      edu2_li2: "<strong>2-Year Research Project:</strong> Conducting in-depth research work alongside university coursework with written and oral synthesis of results.",

      // competences.html
      skills_header_title: "Skills & Languages",
      skills_header_subtitle: "Technical expertise, development environment, and language proficiency",
      skills_sec1_title: "Programming Languages & Frameworks",
      skills_sec2_title: "Technical Environment & Tools",
      skills_sec2_li1: "<strong>HPC & Distributed Computing:</strong> Connection and task execution on SLURM Clusters with NVIDIA L40 GPUs via SSH.",
      skills_sec2_li2: "<strong>CAD & Civil Engineering:</strong> AutoCAD (drafting and reviewing civil technical plans).",
      skills_sec2_li3: "<strong>Office Tools:</strong> Office Suite (Word, PowerPoint, advanced Excel usage).",
      skills_sec3_title: "Languages",
      skills_sec3_li1: "<strong>French:</strong> Native language.",
      skills_sec3_li2: "<strong>English:</strong> Advanced level (C1) — TOEIC Certification: 900 (Professional fluency in speaking and writing).",
      skills_sec4_title: "Soft Skills & Professional Attributes",
      skills_soft_tag1: "Team Spirit & Adaptability",
      skills_soft_tag2: "Organizational Skills & Reliability",
      skills_soft_tag3: "Initiative & Creativity",
      skills_soft_tag4: "Intercultural Communication (Thailand Experience)",

      // engagement.html
      eng_header_title: "Associative Engagement & Hobbies",
      eng_header_subtitle: "Associative responsibilities, interests, and personal pursuits",
      eng1_date: "02/2025 – Present • Toulon, France",
      eng1_title: "President — SeaTech Sports Association (BDS)",
      eng1_desc: "Leadership of the sports association at SeaTech Engineering School:",
      eng1_li1: "<strong>Event Organization:</strong> Planning and execution of sports tournaments, competitions, and student gatherings (400+ students) throughout the academic year.",
      eng1_li2: "<strong>Team Management & Volunteering:</strong> Supervision and coordination of a team of 25 student volunteers.",
      eng1_li3: "<strong>Budget Management & Leadership:</strong> Preparation and monitoring of event budgets (€20,000+ budget), partnership negotiations, and strategic decision-making.",
      eng1_li4: "<strong>Skills Development:</strong> Strengthening leadership, stress management, communication, and team problem-solving.",
      eng2_title: "Skateboarding",
      eng2_desc: "Skateboarder since age 15 — a practice that shaped my perseverance and creativity, driven by a deep attachment to skate culture and street culture as a whole.",

      // references.html
      ref_page_title: "Academic References & Contact",
      ref_page_subtitle: "Academic recommendations and direct contact info",
      ref_section_title: "Academic & Professional References",
      ref_section_desc: "You can directly contact my academic referees for any recommendation or assessment of my work:",
      ref_1_role: "Associate Professor / Researcher",
      ref_1_lab: "LSIS - Laboratory of Information and Systems Sciences / University of Toulon",
      ref_2_role: "Head of Computer Engineering Department",
      ref_2_lab: "Computer Engineering Department, CERSL Laboratory (KMUTT Bangkok)",
      contact_section_title: "Contact Me Directly",
      contact_section_desc: "Available for a 6-month internship starting <strong>March 2027</strong> in Data Science, Software Engineering, or Information Systems:",
      contact_license: "Driver's License (Class B)"
    }
  };

  const langBtnText = document.getElementById('lang-btn-text');
  const langToggleBtn = document.getElementById('lang-toggle-btn');

  function setLanguage(lang) {
    const currentTrans = translations[lang] || translations.fr;
    document.documentElement.lang = lang;
    localStorage.setItem('user_lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (currentTrans[key]) {
        el.innerHTML = currentTrans[key];
      }
    });

    if (langBtnText) {
      langBtnText.textContent = lang === 'fr' ? 'EN' : 'FR';
    }

    if (langToggleBtn) {
      langToggleBtn.setAttribute('aria-label', lang === 'fr' ? 'Passer en anglais / Switch to English' : 'Switch to French / Passer en français');
    }
  }

  // Initialisation de la langue au chargement de la page
  const savedLang = localStorage.getItem('user_lang') || 'fr';
  setLanguage(savedLang);

  // Événement clic sur le bouton de langue
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const currentLang = localStorage.getItem('user_lang') || 'fr';
      const newLang = currentLang === 'fr' ? 'en' : 'fr';
      setLanguage(newLang);
    });
  }

});