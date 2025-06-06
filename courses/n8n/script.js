// Global state management
class CourseState {
    constructor() {
        this.currentSection = 'overview';
        this.completedSections = new Set();
        this.points = 0;
        this.streak = 0;
        this.quizAnswers = {};
        this.currentQuizQuestion = 0;
        this.currentExample = 0;
        this.dragDropAnswers = {};
        this.startTime = Date.now();
        
        // Load saved state from localStorage
        this.loadState();
        this.updateUI();
    }
    
    saveState() {
        const state = {
            completedSections: Array.from(this.completedSections),
            points: this.points,
            streak: this.streak,
            currentSection: this.currentSection
        };
        localStorage.setItem('n8nCourseState', JSON.stringify(state));
    }
    
    loadState() {
        const saved = localStorage.getItem('n8nCourseState');
        if (saved) {
            const state = JSON.parse(saved);
            this.completedSections = new Set(state.completedSections || []);
            this.points = state.points || 0;
            this.streak = state.streak || 0;
            this.currentSection = state.currentSection || 'overview';
        }
    }
    
    addPoints(amount) {
        this.points += amount;
        this.saveState();
        this.updateUI();
        this.showAchievement(`+${amount} points earned!`);
    }
    
    incrementStreak() {
        this.streak++;
        this.saveState();
        this.updateUI();
        if (this.streak % 3 === 0) {
            this.showAchievement(`${this.streak} question streak! 🔥`);
        }
    }
    
    resetStreak() {
        this.streak = 0;
        this.saveState();
        this.updateUI();
    }
    
    completeSection(section) {
        this.completedSections.add(section);
        this.addPoints(10);
        this.saveState();
        this.updateCompletionBadges();
        this.updateProgress();
    }
    
    updateUI() {
        document.getElementById('pointsDisplay').textContent = this.points;
        document.getElementById('streakDisplay').textContent = this.streak;
    }
    
    updateProgress() {
        const totalSections = 7;
        const progress = (this.completedSections.size / totalSections) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }
    
    updateCompletionBadges() {
        document.querySelectorAll('.nav-item').forEach(item => {
            const section = item.dataset.section;
            const badge = item.querySelector('.completion-badge');
            if (this.completedSections.has(section)) {
                badge.classList.add('completed');
            }
        });
    }
    
    showAchievement(text) {
        const popup = document.getElementById('achievementPopup');
        const textElement = document.getElementById('achievementText');
        textElement.textContent = text;
        popup.classList.add('show');
        
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000);
    }
}

// Initialize global state
const courseState = new CourseState();

// Navigation functionality
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.dataset.section;
            navigateToSection(targetSection);
        });
    });
}

function navigateToSection(sectionId) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    
    // Update active content section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    courseState.currentSection = sectionId;
    courseState.saveState();
    
    // Trigger section-specific animations or interactions
    triggerSectionAnimations(sectionId);
}

function nextSection(targetSection) {
    // Mark current section as completed
    courseState.completeSection(courseState.currentSection);
    
    // Navigate to next section
    navigateToSection(targetSection);
}

function startCourse() {
    courseState.addPoints(5);
    nextSection('basics');
}

function restartCourse() {
    localStorage.removeItem('n8nCourseState');
    location.reload();
}

// Drag and Drop Quiz Functionality
function initializeDragAndDrop() {
    const termCards = document.querySelectorAll('.term-card');
    const definitionSlots = document.querySelectorAll('.definition-slot');
    
    termCards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    definitionSlots.forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
        slot.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.term);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const term = e.dataTransfer.getData('text/plain');
    const slot = e.currentTarget;
    const correctAnswer = slot.dataset.answer;
    
    slot.classList.remove('drag-over');
    
    if (term === correctAnswer) {
        slot.classList.add('correct');
        slot.innerHTML = `<div class="term-card" style="background: var(--success-color); margin: 0;">${term}</div>`;
        courseState.addPoints(5);
        courseState.incrementStreak();
        courseState.dragDropAnswers[term] = true;
    } else {
        slot.classList.add('incorrect');
        courseState.resetStreak();
        courseState.dragDropAnswers[term] = false;
        setTimeout(() => {
            slot.classList.remove('incorrect');
        }, 1000);
    }
    
    checkDragDropCompletion();
}

function checkDragDropCompletion() {
    const totalTerms = document.querySelectorAll('.term-card').length;
    const correctAnswers = Object.values(courseState.dragDropAnswers).filter(Boolean).length;
    
    if (correctAnswers === totalTerms) {
        const feedback = document.getElementById('basicsQuizFeedback');
        feedback.className = 'quiz-feedback success';
        feedback.textContent = '🎉 Perfect! You understand the basic concepts!';
        courseState.addPoints(10);
        courseState.showAchievement('Drag & Drop Master!');
    }
}

// Interactive Workflow Builder
function initializeWorkflowBuilder() {
    const nodeTypes = document.querySelectorAll('.node-type');
    const workflowNodes = document.querySelectorAll('.workflow-node');
    const infoPanel = document.getElementById('nodeInfoPanel');
    
    const nodeInfo = {
        trigger: {
            title: 'Trigger Nodes',
            description: 'Start your workflow when specific events happen (new email, webhook, schedule, etc.)',
            examples: [
                '📧 Email Trigger - New email received',
                '⏰ Cron Trigger - Schedule-based execution',
                '🔗 Webhook Trigger - HTTP requests',
                '📄 File Trigger - File system changes'
            ]
        },
        action: {
            title: 'Action Nodes',
            description: 'Perform specific tasks like sending emails, making API calls, or transforming data',
            examples: [
                '📨 Send Email - Gmail, Outlook, SMTP',
                '🌐 HTTP Request - Make API calls',
                '🗄️ Database - Read/write to databases',
                '📋 Spreadsheet - Google Sheets, Excel'
            ]
        },
        condition: {
            title: 'Logic Nodes',
            description: 'Add conditional logic, filters, and data transformations to your workflows',
            examples: [
                '🔀 IF Condition - Branch logic',
                '🔄 Switch - Multiple conditions',
                '🔍 Filter - Data filtering',
                '🔧 Function - Custom JavaScript'
            ]
        },
        final: {
            title: 'Output Nodes',
            description: 'Final destinations for your processed data',
            examples: [
                '💬 Slack - Send messages',
                '📊 Analytics - Track events',
                '☁️ Cloud Storage - Save files',
                '📱 Notifications - Push alerts'
            ]
        }
    };
    
    nodeTypes.forEach(nodeType => {
        nodeType.addEventListener('click', () => {
            const type = nodeType.dataset.type;
            updateNodeInfo(nodeInfo[type]);
            
            // Highlight corresponding workflow node
            workflowNodes.forEach(node => {
                node.classList.remove('active');
            });
            
            if (type === 'trigger') {
                document.querySelector('.trigger-node').classList.add('active');
            } else if (type === 'action' || type === 'condition') {
                document.querySelectorAll('.action-node').forEach(node => {
                    node.classList.add('active');
                });
            }
        });
    });
    
    workflowNodes.forEach(node => {
        node.addEventListener('click', () => {
            const infoType = node.dataset.info;
            if (nodeInfo[infoType]) {
                updateNodeInfo(nodeInfo[infoType]);
                
                // Remove active from all and add to clicked
                workflowNodes.forEach(n => n.classList.remove('active'));
                node.classList.add('active');
            }
        });
    });
    
    function updateNodeInfo(info) {
        infoPanel.innerHTML = `
            <h4>${info.title}</h4>
            <p>${info.description}</p>
            <ul>
                ${info.examples.map(example => `<li>${example}</li>`).join('')}
            </ul>
        `;
    }
}

// Action Playground Tabs
function initializeActionTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active tab pane
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(targetTab).classList.add('active');
            
            courseState.addPoints(2);
        });
    });
}

// Examples Carousel
function initializeExamplesCarousel() {
    courseState.currentExample = 0;
    showExample(0);
}

function showExample(index) {
    const examples = document.querySelectorAll('.example-card');
    const dots = document.querySelectorAll('.dot');
    
    examples.forEach(example => example.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    examples[index].classList.add('active');
    dots[index].classList.add('active');
    
    courseState.currentExample = index;
}

function nextExample() {
    const examples = document.querySelectorAll('.example-card');
    const nextIndex = (courseState.currentExample + 1) % examples.length;
    showExample(nextIndex);
    courseState.addPoints(1);
}

function prevExample() {
    const examples = document.querySelectorAll('.example-card');
    const prevIndex = courseState.currentExample === 0 
        ? examples.length - 1 
        : courseState.currentExample - 1;
    showExample(prevIndex);
    courseState.addPoints(1);
}

// Final Quiz Functionality
function initializeFinalQuiz() {
    const quizOptions = document.querySelectorAll('.quiz-option');
    
    quizOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selection from siblings
            option.parentElement.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selection to clicked option
            option.classList.add('selected');
            
            // Store answer
            const questionIndex = parseInt(option.closest('.quiz-question').dataset.question);
            const isCorrect = option.dataset.answer === 'correct';
            courseState.quizAnswers[questionIndex] = isCorrect;
            
            // Show next button or process answer
            setTimeout(() => {
                if (isCorrect) {
                    option.classList.add('correct');
                    courseState.incrementStreak();
                    courseState.addPoints(10);
                } else {
                    option.classList.add('incorrect');
                    courseState.resetStreak();
                    // Show correct answer
                    option.parentElement.querySelectorAll('.quiz-option').forEach(opt => {
                        if (opt.dataset.answer === 'correct') {
                            opt.classList.add('correct');
                        }
                    });
                }
                
                // Auto-advance after 2 seconds
                setTimeout(() => {
                    if (questionIndex < 4) {
                        nextQuestion();
                    } else {
                        showQuizResults();
                    }
                }, 2000);
            }, 500);
        });
    });
}

function nextQuestion() {
    const currentQuestion = document.querySelector('.quiz-question.active');
    const nextQuestion = currentQuestion.nextElementSibling;
    
    if (nextQuestion && nextQuestion.classList.contains('quiz-question')) {
        currentQuestion.classList.remove('active');
        nextQuestion.classList.add('active');
        
        courseState.currentQuizQuestion++;
        updateQuizNavigation();
    } else {
        showQuizResults();
    }
}

function prevQuestion() {
    const currentQuestion = document.querySelector('.quiz-question.active');
    const prevQuestion = currentQuestion.previousElementSibling;
    
    if (prevQuestion && prevQuestion.classList.contains('quiz-question')) {
        currentQuestion.classList.remove('active');
        prevQuestion.classList.add('active');
        
        courseState.currentQuizQuestion--;
        updateQuizNavigation();
    }
}

function updateQuizNavigation() {
    const questionNumber = document.getElementById('questionNumber');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    questionNumber.textContent = courseState.currentQuizQuestion + 1;
    
    prevBtn.style.display = courseState.currentQuizQuestion > 0 ? 'block' : 'none';
    nextBtn.style.display = courseState.currentQuizQuestion < 4 ? 'block' : 'none';
}

function showQuizResults() {
    const quizContainer = document.getElementById('finalQuiz');
    const resultsContainer = document.getElementById('quizResults');
    const scoreElement = document.getElementById('finalScore');
    const titleElement = document.getElementById('resultsTitle');
    const messageElement = document.getElementById('resultsMessage');
    const perfectScoreBadge = document.getElementById('perfectScore');
    
    // Hide quiz questions and show results
    document.querySelectorAll('.quiz-question').forEach(q => q.style.display = 'none');
    document.querySelector('.quiz-navigation').style.display = 'none';
    resultsContainer.style.display = 'block';
    
    // Calculate score
    const correctAnswers = Object.values(courseState.quizAnswers).filter(Boolean).length;
    scoreElement.textContent = correctAnswers;
    
    // Update results based on score
    if (correctAnswers === 5) {
        titleElement.textContent = 'Perfect Score! 🏆';
        messageElement.textContent = 'You\'ve mastered n8n fundamentals!';
        perfectScoreBadge.style.display = 'flex';
        courseState.addPoints(50);
        courseState.showAchievement('n8n Expert Achieved!');
    } else if (correctAnswers >= 3) {
        titleElement.textContent = 'Great Job! 🎉';
        messageElement.textContent = 'You have a solid understanding of n8n!';
        courseState.addPoints(30);
    } else {
        titleElement.textContent = 'Keep Learning! 📚';
        messageElement.textContent = 'Review the course material and try again!';
        courseState.addPoints(10);
    }
    
    // Mark quiz section as completed
    courseState.completeSection('quiz');
    
    // Final achievement
    courseState.showAchievement('Course Completed! 🎓');
}

// Trigger Showcase Interactivity
function initializeTriggerShowcase() {
    const triggerCards = document.querySelectorAll('.trigger-card');
    
    const triggerDetails = {
        webhook: {
            title: 'Webhook Trigger Deep Dive',
            details: 'Webhooks are HTTP callbacks that allow external services to trigger your workflows instantly. Perfect for real-time integrations!',
            useCases: ['Payment notifications', 'Form submissions', 'API events', 'Third-party app integrations']
        },
        schedule: {
            title: 'Schedule Trigger Deep Dive',
            details: 'Time-based triggers that run your workflows automatically. Use cron expressions for precise scheduling.',
            useCases: ['Daily reports', 'Backup tasks', 'Data synchronization', 'Maintenance jobs']
        },
        manual: {
            title: 'Manual Trigger Deep Dive',
            details: 'Perfect for testing workflows or one-time executions. Provides full control over when workflows run.',
            useCases: ['Testing workflows', 'On-demand processing', 'Manual data imports', 'Emergency procedures']
        }
    };
    
    triggerCards.forEach(card => {
        card.addEventListener('click', () => {
            const triggerType = card.dataset.trigger;
            const details = triggerDetails[triggerType];
            
            if (details) {
                courseState.showAchievement(`Learning about ${details.title}!`);
                courseState.addPoints(3);
                
                // Add visual feedback
                card.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 200);
            }
        });
    });
}

// Section-specific animations and interactions
function triggerSectionAnimations(sectionId) {
    switch (sectionId) {
        case 'overview':
            animateObjectives();
            break;
        case 'basics':
            animateConceptCards();
            break;
        case 'nodes':
            animateWorkflowNodes();
            break;
        case 'triggers':
            animateTriggerCards();
            break;
        case 'actions':
            animateActionTabs();
            break;
        case 'examples':
            animateExamples();
            break;
        case 'quiz':
            animateQuizStart();
            break;
    }
}

function animateObjectives() {
    const objectives = document.querySelectorAll('.objective');
    objectives.forEach((obj, index) => {
        setTimeout(() => {
            obj.style.transform = 'translateX(0)';
            obj.style.opacity = '1';
        }, index * 200);
    });
}

function animateConceptCards() {
    const cards = document.querySelectorAll('.concept-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'translateY(0)';
            card.style.opacity = '1';
        }, index * 300);
    });
}

function animateWorkflowNodes() {
    const nodes = document.querySelectorAll('.workflow-node');
    nodes.forEach((node, index) => {
        setTimeout(() => {
            node.style.transform = 'scale(1)';
            node.style.opacity = '1';
        }, index * 400);
    });
}

function animateTriggerCards() {
    const cards = document.querySelectorAll('.trigger-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'rotateY(0deg)';
            card.style.opacity = '1';
        }, index * 200);
    });
}

function animateActionTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach((tab, index) => {
        setTimeout(() => {
            tab.style.transform = 'translateY(0)';
            tab.style.opacity = '1';
        }, index * 100);
    });
}

function animateExamples() {
    const carousel = document.querySelector('.examples-carousel');
    carousel.style.transform = 'scale(1)';
    carousel.style.opacity = '1';
}

function animateQuizStart() {
    const quizContainer = document.querySelector('.quiz-container');
    quizContainer.style.transform = 'scale(1)';
    quizContainer.style.opacity = '1';
    
    // Add some excitement
    courseState.showAchievement('Final Challenge Time! 🎯');
}

// Keyboard navigation
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowRight':
                if (courseState.currentSection === 'examples') {
                    nextExample();
                }
                break;
            case 'ArrowLeft':
                if (courseState.currentSection === 'examples') {
                    prevExample();
                }
                break;
            case 'Space':
                if (courseState.currentSection === 'quiz') {
                    e.preventDefault();
                    // Handle space for quiz navigation
                }
                break;
        }
    });
}

// Progress tracking and analytics
function trackProgress() {
    const timeSpent = Date.now() - courseState.startTime;
    const progressData = {
        timeSpent: Math.floor(timeSpent / 1000), // in seconds
        sectionsCompleted: courseState.completedSections.size,
        totalPoints: courseState.points,
        currentStreak: courseState.streak,
        quizScore: Object.values(courseState.quizAnswers).filter(Boolean).length
    };
    
    // Store analytics data
    localStorage.setItem('n8nCourseAnalytics', JSON.stringify(progressData));
    
    return progressData;
}

// Accessibility enhancements
function initializeAccessibility() {
    // Add ARIA labels to interactive elements
    document.querySelectorAll('.nav-item').forEach(item => {
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
    });
    
    // Add keyboard support for drag and drop alternatives
    document.querySelectorAll('.term-card').forEach(card => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Implement keyboard-based drag and drop alternative
                handleKeyboardDragDrop(card);
            }
        });
    });
}

function handleKeyboardDragDrop(termCard) {
    // Create a more accessible version of drag and drop
    const term = termCard.dataset.term;
    const slots = document.querySelectorAll('.definition-slot');
    
    slots.forEach((slot, index) => {
        slot.style.border = '3px solid var(--primary-color)';
        slot.addEventListener('click', function handleSlotClick() {
            const correctAnswer = slot.dataset.answer;
            
            // Reset all slot borders
            slots.forEach(s => s.style.border = '');
            
            // Process the drop
            if (term === correctAnswer) {
                slot.classList.add('correct');
                slot.innerHTML = `<div class="term-card" style="background: var(--success-color); margin: 0;">${term}</div>`;
                courseState.addPoints(5);
                courseState.incrementStreak();
                courseState.dragDropAnswers[term] = true;
            } else {
                slot.classList.add('incorrect');
                courseState.resetStreak();
                courseState.dragDropAnswers[term] = false;
                setTimeout(() => {
                    slot.classList.remove('incorrect');
                }, 1000);
            }
            
            // Remove event listeners
            slots.forEach(s => s.removeEventListener('click', handleSlotClick));
            checkDragDropCompletion();
        });
    });
}

// Mobile responsiveness enhancements
function initializeMobileFeatures() {
    // Add mobile navigation toggle
    if (window.innerWidth <= 1024) {
        addMobileNavToggle();
    }
    
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            // Recalculate layouts after orientation change
            adjustLayoutsForOrientation();
        }, 100);
    });
    
    // Touch gesture support
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    });
    
    function handleSwipeGesture() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (courseState.currentSection === 'examples') {
                if (diff > 0) {
                    nextExample(); // Swipe left = next
                } else {
                    prevExample(); // Swipe right = previous
                }
            }
        }
    }
}

function addMobileNavToggle() {
    const header = document.querySelector('.header');
    const sidebar = document.querySelector('.sidebar');
    
    // Add hamburger menu
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.style.display = 'block';
    
    header.insertBefore(menuToggle, header.firstChild);
    
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

function adjustLayoutsForOrientation() {
    // Adjust specific layouts based on orientation
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isLandscape) {
        document.body.classList.add('landscape');
    } else {
        document.body.classList.remove('landscape');
    }
}

// Performance optimization
function initializePerformanceOptimizations() {
    // Lazy load heavy content
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                loadSectionContent(section);
            }
        });
    });
    
    document.querySelectorAll('.content-section').forEach(section => {
        observer.observe(section);
    });
    
    // Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
            handleScrollEffects();
        }, 16); // ~60fps
    });
}

function loadSectionContent(section) {
    // Load any heavy content when section becomes visible
    const images = section.querySelectorAll('img[data-src]');
    images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
    });
}

function handleScrollEffects() {
    // Add scroll-based animations or effects
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeDragAndDrop();
    initializeWorkflowBuilder();
    initializeActionTabs();
    initializeExamplesCarousel();
    initializeFinalQuiz();
    initializeTriggerShowcase();
    initializeKeyboardNavigation();
    initializeAccessibility();
    initializeMobileFeatures();
    initializePerformanceOptimizations();
    
    // Update UI with saved state
    courseState.updateCompletionBadges();
    courseState.updateProgress();
    
    // Navigate to saved section
    navigateToSection(courseState.currentSection);
    
    // Welcome message for new users
    if (courseState.completedSections.size === 0) {
        setTimeout(() => {
            courseState.showAchievement('Welcome to n8n Crash Course! 🚀');
        }, 1000);
    }
});

// Export functions for global access
window.courseState = courseState;
window.startCourse = startCourse;
window.nextSection = nextSection;
window.restartCourse = restartCourse;
window.nextExample = nextExample;
window.prevExample = prevExample;
window.showExample = showExample;
window.nextQuestion = nextQuestion;
window.prevQuestion = prevQuestion;