/**
 * Andrea Bravaccino Portfolio - JavaScript
 * Handles animations, smooth scrolling, and chatbot functionality
 */

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavbar();
    initSmoothScrolling();
    initAnimations();
    initChatbot();
    initPreloader();
});

// Navbar functionality
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Scroll down button in hero section
    const scrollDown = document.querySelector('.scroll-down');
    if (scrollDown) {
        scrollDown.addEventListener('click', function(e) {
            e.preventDefault();
            
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                const offsetTop = aboutSection.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// Intersection Observer for animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe skill cards with staggered animation
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px) scale(0.9)';
        card.style.transition = `all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${index * 0.15}s`;
        
        observer.observe(card);
    });
    
    // Observe project cards with different animations
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = index % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)';
        card.style.transition = `all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${index * 0.1}s`;
        
        observer.observe(card);
    });
    
    // Observe timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-80px)';
        item.style.transition = `all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${index * 0.2}s`;
        
        observer.observe(item);
    });
    
    // Observe section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach((title, index) => {
        title.style.opacity = '0';
        title.style.transform = 'translateY(30px)';
        title.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
        
        observer.observe(title);
    });
    
    // Add animate class styles
    const style = document.createElement('style');
    style.textContent = `
        .animate {
            opacity: 1 !important;
            transform: translate(0) scale(1) !important;
        }
        .skill-card.animate {
            transform: translateY(0) scale(1) !important;
        }
        .project-card.animate {
            transform: translateX(0) !important;
        }
        .timeline-item.animate {
            transform: translateX(0) !important;
        }
        .section-title.animate {
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Add parallax effect to floating shapes
    initParallaxEffect();
}

// Parallax effect for floating shapes
function initParallaxEffect() {
    const shapes = document.querySelectorAll('.shape');
    
    window.addEventListener('scroll', debounce(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.1;
            shape.style.transform = `translateY(${rate * speed}px)`;
        });
    }, 10));
}

// Chatbot functionality
function initChatbot() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotModal = document.getElementById('chatbot-modal');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotInput = document.getElementById('chatbot-input-field');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotMessages = document.getElementById('chatbot-messages');
    
    let isOpen = false;
    
    // Toggle chatbot
    chatbotToggle.addEventListener('click', function() {
        toggleChatbot();
    });
    
    // Close chatbot
    chatbotClose.addEventListener('click', function() {
        closeChatbot();
    });
    
    // Send message on button click
    chatbotSend.addEventListener('click', function() {
        sendMessage();
    });
    
    // Send message on Enter key
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function toggleChatbot() {
        if (isOpen) {
            closeChatbot();
        } else {
            openChatbot();
        }
    }
    
    function openChatbot() {
        chatbotModal.classList.add('active');
        isOpen = true;
        chatbotInput.focus();
    }
    
    function closeChatbot() {
        chatbotModal.classList.remove('active');
        isOpen = false;
    }
      async function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, 'user');
        chatbotInput.value = '';
        
        // Show typing indicator
        showTyping();
        
        try {
            // Call Gemini API through Cloudflare Function
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            hideTyping();
            addMessage(data.response, 'bot');
            
        } catch (error) {
            console.error('Error calling chatbot API:', error);
            hideTyping();
            addMessage('Mi dispiace, al momento non riesco a rispondere. Riprova più tardi o contatta Andrea direttamente!', 'bot');
        }
    }
      function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // If it's a bot message, parse markdown, otherwise keep text as is
        if (sender === 'bot') {
            // Configure marked options for security and styling
            marked.setOptions({
                breaks: true,      // Convert line breaks to <br>
                gfm: true,         // GitHub Flavored Markdown
                sanitize: false,   // We trust our own content
                smartypants: true  // Smart quotes and typography
            });
            
            // Parse markdown and set as innerHTML
            messageDiv.innerHTML = marked.parse(text);
        } else {
            // For user messages, keep as plain text
            messageDiv.textContent = text;
        }
        
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    function showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        typingDiv.id = 'typing-indicator';
        
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    function hideTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Preloader
function initPreloader() {
    const preloader = document.getElementById('page-loading-blocs-notifaction');
    
    // Hide preloader after 2 seconds
    setTimeout(() => {
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 2000);
}

// Utility function for smooth animations
function animateOnScroll() {
    const elements = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    });
    
    elements.forEach(el => {
        observer.observe(el);
    });
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll events
window.addEventListener('scroll', debounce(() => {
    // Handle scroll-based animations here if needed
}, 10));
