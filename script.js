const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let current = 0;

function showSlide(index) {
	if (!slides.length || !dots.length) return;
	slides[current].classList.remove('active');
	dots[current].classList.remove('active');
	current = index;
	slides[current].classList.add('active');
	dots[current].classList.add('active');
}

dots.forEach((dot, index) => {
	dot.addEventListener('click', (event) => {
		event.preventDefault();
		showSlide(index);
	});
});

if (slides.length) setInterval(() => showSlide((current + 1) % slides.length), 4300);

const menu = document.querySelector('.menu');
const navLinks = document.querySelector('.nav-links');

if (menu && navLinks) {
	menu.addEventListener('click', () => {
		navLinks.classList.toggle('open');
		menu.setAttribute('aria-expanded', navLinks.classList.contains('open'));
	});
}

const dropdown = document.querySelector('.nav-dropdown');
const dropdownToggle = document.querySelector('.nav-dropdown-toggle');

if (dropdown && dropdownToggle) {
	dropdownToggle.addEventListener('click', () => {
		const isOpen = dropdown.classList.toggle('open');
		dropdownToggle.setAttribute('aria-expanded', isOpen);
	});
}




document.addEventListener('DOMContentLoaded', () => {
    const stats = document.querySelectorAll('.stats-strip strong');

    const animateValue = (element) => {
        const target = Number(element.dataset.target || 0);
        const suffix = element.dataset.suffix || '';
        const duration = 1200;
        const startTime = performance.now();

        const update = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(target * eased);
            element.textContent = `${currentValue}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = `${target}${suffix}`;
            }
        };

        requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateValue(entry.target);
                observerInstance.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    stats.forEach((stat) => observer.observe(stat));

    // Select all the cards specifically scoped to our new class
    const cards = document.querySelectorAll('.feature-card');
    
    // Apply initial animation classes for hiding elements
    cards.forEach(card => {
        card.classList.add('fade-in-up');
    });

    // Create the Intersection Observer
    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const cardArray = Array.from(cards);
                const index = cardArray.indexOf(entry.target);
                
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    setTimeout(() => {
                        entry.target.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
                    }, 600);
                }, index * 100);

                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1, 
        rootMargin: "0px 0px -50px 0px"
    });

    cards.forEach(card => cardObserver.observe(card));

    const portfolioTabs = document.querySelectorAll('.portfolio-tab');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    const setActivePortfolioTab = (filter) => {
        portfolioTabs.forEach((tab) => {
            const isActive = tab.dataset.filter === filter;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
            tab.tabIndex = isActive ? 0 : -1;
        });

        portfolioCards.forEach((card) => {
            const shouldShow = filter === 'all' || card.dataset.category === filter;
            card.hidden = !shouldShow;
        });
    };

    portfolioTabs.forEach((tab) => {
        tab.addEventListener('click', () => setActivePortfolioTab(tab.dataset.filter));
    });

    if (portfolioTabs.length) {
        setActivePortfolioTab('all');
    }

    const portfolioLightbox = document.querySelector('.portfolio-lightbox');

    if (portfolioLightbox instanceof HTMLDialogElement) {
        const lightboxImage = portfolioLightbox.querySelector('.lightbox-image');
        const lightboxTitle = portfolioLightbox.querySelector('#lightbox-title');
        const lightboxClient = portfolioLightbox.querySelector('.lightbox-client');
        const lightboxScope = portfolioLightbox.querySelector('.lightbox-scope');
        const lightboxProjectLink = portfolioLightbox.querySelector('.lightbox-project-link');
        const lightboxClose = portfolioLightbox.querySelector('.lightbox-close');

        portfolioCards.forEach((card) => {
            card.addEventListener('click', () => {
                const image = card.querySelector('img');
                if (!image || !lightboxImage || !lightboxTitle || !lightboxClient || !lightboxScope) return;

                lightboxImage.src = image.currentSrc || image.src;
                lightboxImage.alt = image.alt;
                lightboxTitle.textContent = card.querySelector('.portfolio-card-overlay strong')?.textContent?.trim() || image.alt;
                lightboxClient.textContent = card.dataset.client || '';
                lightboxScope.textContent = card.dataset.scope || '';

                if (lightboxProjectLink instanceof HTMLAnchorElement) {
                    const projectUrl = card.dataset.projectUrl;
                    lightboxProjectLink.hidden = !projectUrl;
                    if (projectUrl) lightboxProjectLink.href = projectUrl;
                }

                portfolioLightbox.showModal();
            });
        });

        lightboxClose?.addEventListener('click', () => portfolioLightbox.close());
        portfolioLightbox.addEventListener('click', (event) => {
            if (event.target === portfolioLightbox) portfolioLightbox.close();
        });
    }

    const marquee = document.querySelector('.client-marquee');
    const marqueeTrack = document.querySelector('.client-track');
    const marqueeButtons = document.querySelectorAll('.client-scroll-btn');

    if (marquee && marqueeTrack && marqueeButtons.length) {
        let marqueeOffset = 0;
        const step = marquee.clientWidth * 0.55;

        const updateMarqueePosition = () => {
            const maxOffset = Math.max(0, marqueeTrack.scrollWidth - marquee.clientWidth);
            marqueeOffset = Math.min(Math.max(marqueeOffset, 0), maxOffset);
            marqueeTrack.style.animation = 'none';
            marqueeTrack.style.transform = `translateX(-${marqueeOffset}px)`;
        };

        marqueeButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const direction = button.dataset.scroll === 'prev' ? -1 : 1;
                marqueeOffset += direction * step;
                updateMarqueePosition();
            });
        });

        window.addEventListener('resize', () => {
            updateMarqueePosition();
        });
    }

    document.querySelectorAll('.contact-form').forEach((form) => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const name = String(formData.get('name') || '').trim();
            const email = String(formData.get('email') || '').trim();
            const phone = String(formData.get('phone') || '').trim();
            const request = String(formData.get('request') || formData.get('message') || '').trim();

            const payload = {
                name,
                email,
                phone,
                message: request,
                form_type: formData.has('phone') ? 'callback' : 'contact'
            };

            const submitButton = form.querySelector('button[type="submit"]');
            const originalLabel = submitButton ? submitButton.textContent : '';

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
            }

            let status = form.querySelector('.form-status');
            if (!status) {
                status = document.createElement('p');
                status.className = 'form-status';
                status.setAttribute('role', 'status');
                status.setAttribute('aria-live', 'polite');
                form.appendChild(status);
            }

            try {
                const response = await fetch('send-email.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                let result;
                try {
                    result = await response.json();
                } catch (parseError) {
                    throw new Error('The PHP email endpoint was not found. Deploy the site to PHP-enabled hosting.');
                }

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'We could not send your message. Please try again later.');
                }

                form.reset();
                status.textContent = 'Your message has been sent successfully.';
                status.style.color = '#0d7a43';
            } catch (error) {
                status.textContent = error instanceof TypeError
                    ? 'The PHP email endpoint could not be reached. Deploy the site to PHP-enabled hosting.'
                    : error.message;
                status.style.color = '#b21f2d';
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalLabel;
                }
            }
        });
    });
});