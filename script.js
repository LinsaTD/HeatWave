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

    const recipientEmail = 'tdlinsa@gmail.com';
    const directEmailEndpoint = 'https://formsubmit.co/ajax/' + recipientEmail;

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
                _subject: 'Website enquiry',
                _captcha: 'false'
            };

            const submitButton = form.querySelector('button[type="submit"]');
            const originalLabel = submitButton ? submitButton.textContent : '';

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
            }

            const status = form.querySelector('.form-status');

            try {
                const response = await fetch(directEmailEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    mode: 'cors',
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('Email service rejected the request');
                }

                form.reset();
                if (status) {
                    status.textContent = 'Your message has been sent successfully.';
                    status.style.color = '#0d7a43';
                }
            } catch (error) {
                const mailBody = [
                    name ? `Name: ${name}` : '',
                    email ? `Email: ${email}` : '',
                    phone ? `Phone: ${phone}` : '',
                    request ? `Message: ${request}` : ''
                ].filter(Boolean).join('\n\n');

                const mailSubject = encodeURIComponent('Website enquiry');
                const encodedBody = encodeURIComponent(mailBody || 'No details provided.');
                const fallbackUrl = `mailto:${recipientEmail}?subject=${mailSubject}&body=${encodedBody}`;

                if (status) {
                    status.textContent = 'The email service is unavailable right now. Your mail app is opening so you can send the message manually.';
                    status.style.color = '#b21f2d';
                }

                window.location.href = fallbackUrl;
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalLabel;
                }
            }
        });
    });
});