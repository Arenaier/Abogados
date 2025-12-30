// ================================
// CONSORCIO LEGAL - MAIN SCRIPT
// ================================

// 🔧 CONFIGURACIÓN EMAILJS - REEMPLAZA ESTOS VALORES DESPUÉS DE SEGUIR EMAILJS_SETUP.md
const EMAILJS_PUBLIC_KEY = '0YY26X0JnLe3io3yI';      // Obtenlo en Account → General
const EMAILJS_SERVICE_ID = 'service_5ouchzj';      // Obtenlo al conectar Gmail
const EMAILJS_TEMPLATE_ID = 'template_mznujfj';    // Obtenlo al crear la plantilla

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initEmailJS();
    initMobileMenu();
    initFormValidation();
    initScrollAnimations();
    initSmoothScroll();
});

// ================================
// EMAILJS INITIALIZATION
// ================================
function initEmailJS() {
    // Check if EmailJS is configured
    if (EMAILJS_PUBLIC_KEY === 'TU_PUBLIC_KEY_AQUI') {
        console.warn('⚠️ EmailJS no configurado. Lee EMAILJS_SETUP.md para instrucciones.');
        return;
    }

    // Initialize EmailJS with public key
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('✅ EmailJS inicializado correctamente');
}

// ================================
// MOBILE MENU TOGGLE
// ================================
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav a');

    if (!menuToggle || !mainNav) return;

    // Toggle menu on button click
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
            if (mainNav.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

// ================================
// FORM VALIDATION
// ================================
function initFormValidation() {
    const form = document.getElementById('booking-form');
    if (!form) return;

    const inputs = {
        nombre: document.getElementById('nombre'),
        email: document.getElementById('email'),
        telefono: document.getElementById('telefono'),
        especialidad: document.getElementById('especialidad'),
        fecha: document.getElementById('fecha'),
        hora: document.getElementById('hora')
    };

    // Real-time validation
    Object.keys(inputs).forEach(key => {
        const input = inputs[key];
        if (!input) return;

        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('invalid')) {
                validateField(input);
            }
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        Object.values(inputs).forEach(input => {
            if (input && !validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            showToast('Por favor, corrija los errores en el formulario', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('.submit-button');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Send email via EmailJS
        await sendEmailViaEmailJS(inputs);

        // Show success message
        displaySuccessMessage(inputs);

        // Reset button state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Reset form
        form.reset();
        Object.values(inputs).forEach(input => {
            if (input) {
                input.classList.remove('invalid');
                const errorEl = document.getElementById(`${input.id}-error`);
                if (errorEl) errorEl.textContent = '';
            }
        });
    });
}

// ================================
// SEND EMAIL VIA EMAILJS
// ================================
async function sendEmailViaEmailJS(inputs) {
    // Check if EmailJS is configured
    if (EMAILJS_PUBLIC_KEY === 'TU_PUBLIC_KEY_AQUI') {
        console.warn('⚠️ EmailJS no está configurado. Simulando envío...');
        // Simulate delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 2000));
        return;
    }

    // Prepare email parameters matching the template
    const templateParams = {
        nombre: inputs.nombre.value,
        email: inputs.email.value,
        telefono: inputs.telefono.value,
        especialidad: inputs.especialidad.value,
        fecha: formatDate(inputs.fecha.value),
        hora: inputs.hora.value
    };

    // Send email using EmailJS
    console.log('📧 Enviando email con EmailJS...');
    const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
    );

    console.log('✅ Email enviado exitosamente:', response);
    return response;
}

// Validate individual field
function validateField(input) {
    const errorEl = document.getElementById(`${input.id}-error`);
    let isValid = true;
    let errorMessage = '';

    // Check if empty
    if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        errorMessage = 'Este campo es obligatorio';
    }
    // Email validation
    else if (input.type === 'email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
            isValid = false;
            errorMessage = 'Ingrese un correo electrónico válido';
        }
    }
    // Phone validation
    else if (input.type === 'tel' && input.value) {
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        if (!phoneRegex.test(input.value) || input.value.replace(/\D/g, '').length < 8) {
            isValid = false;
            errorMessage = 'Ingrese un número de teléfono válido';
        }
    }
    // Date validation
    else if (input.type === 'date' && input.value) {
        const selectedDate = new Date(input.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            isValid = false;
            errorMessage = 'La fecha debe ser hoy o posterior';
        }
    }

    // Update UI
    if (isValid) {
        input.classList.remove('invalid');
        if (errorEl) errorEl.textContent = '';
    } else {
        input.classList.add('invalid');
        if (errorEl) errorEl.textContent = errorMessage;
        input.setAttribute('aria-invalid', 'true');
    }

    return isValid;
}

// Display success message
function displaySuccessMessage(inputs) {
    const form = document.getElementById('booking-form');
    const successDiv = document.getElementById('success-message');
    const detailsList = document.getElementById('appointment-details');

    if (!form || !successDiv || !detailsList) return;

    // Build details list
    const details = [
        `<li><strong>Nombre:</strong> ${inputs.nombre.value}</li>`,
        `<li><strong>Email:</strong> ${inputs.email.value}</li>`,
        `<li><strong>Teléfono:</strong> ${inputs.telefono.value}</li>`,
        `<li><strong>Especialidad:</strong> ${inputs.especialidad.value}</li>`,
        `<li><strong>Fecha:</strong> ${formatDate(inputs.fecha.value)}</li>`,
        `<li><strong>Hora:</strong> ${inputs.hora.value}</li>`
    ];

    detailsList.innerHTML = details.join('');

    // Show success, hide form
    form.style.display = 'none';
    successDiv.style.display = 'block';

    // Show toast
    showToast('¡Cita agendada exitosamente! Nos contactaremos pronto.', 'success');

    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Reset after 10 seconds
    setTimeout(() => {
        form.style.display = 'grid';
        successDiv.style.display = 'none';
    }, 10000);
}

// Format date to readable Spanish format
function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-CL', options);
}

// ================================
// TOAST NOTIFICATIONS
// ================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ================================
// SCROLL ANIMATIONS
// ================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);

    // Observe all elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// ================================
// SMOOTH SCROLL
// ================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#" or "#main-content" (skip link)
            if (href === '#' || href === '#main-content') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ================================
// HEADER SCROLL EFFECT
// ================================
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('.sticky-header');
    if (!header) return;

    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }

    lastScroll = currentScroll;
});
