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

if (slides.length) setInterval(() => showSlide((current + 1) % slides.length), 5000);

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

    const web3FormsAccessKey = 'YOUR_WEB3FORMS_ACCESS_KEY';

    document.querySelectorAll('.contact-form').forEach((form) => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const name = String(formData.get('name') || '').trim();
            const email = String(formData.get('email') || '').trim();
            const phone = String(formData.get('phone') || '').trim();
            const request = String(formData.get('request') || formData.get('message') || '').trim();

            const payload = {
                access_key: web3FormsAccessKey,
                name,
                email,
                phone,
                message: request,
                subject: formData.has('phone') ? 'Website callback request' : 'Website contact enquiry'
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
                if (web3FormsAccessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
                    throw new Error('Email form setup is incomplete.');
                }

                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error('Email service rejected the request.');
                }

                form.reset();
                status.textContent = 'Your message has been sent successfully.';
                status.style.color = '#0d7a43';
            } catch (error) {
                status.textContent = error.message === 'Email form setup is incomplete.'
                    ? 'Email sending is not configured yet. Add your Web3Forms access key to script.js.'
                    : 'We could not send your message. Please try again later.';
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