// Intermediate n8n Course JavaScript

// Course progress tracking
let courseProgress = {
    currentModule: 1,
    completedModules: [],
    totalModules: 4,
    completionPercentage: 0
};

// Initialize course when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCourseProgress();
    updateProgressDisplay();
    setupModuleInteractions();
    console.log('Intermediate n8n Course initialized');
});

// Home navigation function
function goHome() {
    console.log('Navigating home from intermediate n8n course...');
    
    // Check if we're in an iframe (embedded in the main platform)
    if (window.parent !== window) {
        // We're in an iframe, send message to parent
        try {
            window.parent.postMessage({ action: 'navigate', target: 'home' }, '*');
        } catch (e) {
            console.log('Could not communicate with parent, using direct navigation');
            window.location.href = '../../index.html';
        }
    } else {
        // Direct navigation
        window.location.href = '../../index.html';
    }
}

// Load course progress from localStorage
function loadCourseProgress() {
    const savedProgress = localStorage.getItem('n8n-intermediate-progress');
    if (savedProgress) {
        try {
            courseProgress = JSON.parse(savedProgress);
        } catch (e) {
            console.error('Error loading course progress:', e);
            // Reset to default if corrupted
            saveCourseProgress();
        }
    }
}

// Save course progress to localStorage
function saveCourseProgress() {
    try {
        localStorage.setItem('n8n-intermediate-progress', JSON.stringify(courseProgress));
    } catch (e) {
        console.error('Error saving course progress:', e);
    }
}

// Update progress display
function updateProgressDisplay() {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    // Calculate completion percentage
    courseProgress.completionPercentage = Math.round(
        (courseProgress.completedModules.length / courseProgress.totalModules) * 100
    );
    
    if (progressFill) {
        progressFill.style.width = courseProgress.completionPercentage + '%';
    }
    
    if (progressText) {
        progressText.textContent = courseProgress.completionPercentage + '% Complete';
    }
    
    // Update start button text based on progress
    updateStartButton();
}

// Update start button based on progress
function updateStartButton() {
    const startButton = document.querySelector('.btn-primary');
    if (!startButton) return;
    
    if (courseProgress.completedModules.length === 0) {
        startButton.textContent = 'Start Module 1';
        startButton.onclick = () => startModule(1);
    } else if (courseProgress.completedModules.length < courseProgress.totalModules) {
        const nextModule = courseProgress.currentModule;
        startButton.textContent = `Continue Module ${nextModule}`;
        startButton.onclick = () => startModule(nextModule);
    } else {
        startButton.textContent = 'Review Course';
        startButton.onclick = () => reviewCourse();
    }
}

// Start a specific module
function startModule(moduleNumber) {
    console.log(`Starting Module ${moduleNumber}...`);
    
    // Update current module
    courseProgress.currentModule = moduleNumber;
    
    // Simulate module start (in a real implementation, this would navigate to module content)
    showModuleModal(moduleNumber);
    
    // Save progress
    saveCourseProgress();
}

// Show module modal (simulated module content)
function showModuleModal(moduleNumber) {
    const moduleNames = {
        1: 'Advanced Nodes & Expressions',
        2: 'Error Handling & Monitoring',
        3: 'Complex Workflow Patterns',
        4: 'Performance & Optimization'
    };
    
    const modal = document.createElement('div');
    modal.className = 'module-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Module ${moduleNumber}: ${moduleNames[moduleNumber]}</h3>
                <button class="close-btn" onclick="closeModuleModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p>🎯 Welcome to Module ${moduleNumber}!</p>
                <p>This module covers advanced concepts in n8n automation. In a full implementation, this would contain:</p>
                <ul>
                    <li>📹 Video lessons</li>
                    <li>💻 Interactive exercises</li>
                    <li>🔧 Hands-on projects</li>
                    <li>📝 Knowledge checks</li>
                </ul>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="completeModule(${moduleNumber})">
                        Mark Module as Complete
                    </button>
                    <button class="btn btn-secondary" onclick="closeModuleModal()">
                        Close
                    </button>
                </div>
            </div>
        </div>
        <div class="modal-overlay" onclick="closeModuleModal()"></div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    addModalStyles();
}

// Close module modal
function closeModuleModal() {
    const modal = document.querySelector('.module-modal');
    if (modal) {
        modal.remove();
    }
}

// Complete a module
function completeModule(moduleNumber) {
    // Add to completed modules if not already there
    if (!courseProgress.completedModules.includes(moduleNumber)) {
        courseProgress.completedModules.push(moduleNumber);
        courseProgress.completedModules.sort((a, b) => a - b);
    }
    
    // Move to next module
    if (moduleNumber < courseProgress.totalModules) {
        courseProgress.currentModule = moduleNumber + 1;
    }
    
    // Save progress and update display
    saveCourseProgress();
    updateProgressDisplay();
    
    // Show completion message
    showCompletionMessage(moduleNumber);
    
    // Close modal
    closeModuleModal();
    
    // Update module card visual state
    updateModuleCardState(moduleNumber);
}

// Show completion message
function showCompletionMessage(moduleNumber) {
    const message = document.createElement('div');
    message.className = 'completion-message';
    message.innerHTML = `
        <div class="completion-content">
            <div class="completion-icon">🎉</div>
            <h3>Module ${moduleNumber} Complete!</h3>
            <p>Great job! You've successfully completed this module.</p>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Update module card visual state
function updateModuleCardState(moduleNumber) {
    const moduleCards = document.querySelectorAll('.module-card');
    if (moduleCards[moduleNumber - 1]) {
        const card = moduleCards[moduleNumber - 1];
        card.classList.add('completed');
        
        // Add completion indicator
        const header = card.querySelector('.module-header');
        if (header && !header.querySelector('.completion-badge')) {
            const badge = document.createElement('div');
            badge.className = 'completion-badge';
            badge.innerHTML = '✓';
            header.appendChild(badge);
        }
    }
}

// Setup module interactions
function setupModuleInteractions() {
    const moduleCards = document.querySelectorAll('.module-card');
    
    moduleCards.forEach((card, index) => {
        const moduleNumber = index + 1;
        
        // Add click handler
        card.addEventListener('click', () => {
            if (moduleNumber <= courseProgress.currentModule || 
                courseProgress.completedModules.includes(moduleNumber)) {
                startModule(moduleNumber);
            } else {
                showLockedModuleMessage(moduleNumber);
            }
        });
        
        // Update visual state based on progress
        if (courseProgress.completedModules.includes(moduleNumber)) {
            updateModuleCardState(moduleNumber);
        } else if (moduleNumber > courseProgress.currentModule) {
            card.classList.add('locked');
        }
    });
}

// Show locked module message
function showLockedModuleMessage(moduleNumber) {
    const message = document.createElement('div');
    message.className = 'locked-message';
    message.innerHTML = `
        <div class="locked-content">
            <div class="locked-icon">🔒</div>
            <h3>Module ${moduleNumber} Locked</h3>
            <p>Complete the previous modules to unlock this content.</p>
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
}

// Download resources
function downloadResources() {
    console.log('Downloading course resources...');
    
    // In a real implementation, this would trigger actual downloads
    const resources = [
        'n8n-intermediate-templates.json',
        'advanced-expressions-cheatsheet.pdf',
        'error-handling-patterns.pdf',
        'performance-optimization-guide.pdf'
    ];
    
    const message = document.createElement('div');
    message.className = 'download-message';
    message.innerHTML = `
        <div class="download-content">
            <div class="download-icon">📥</div>
            <h3>Resources Downloaded!</h3>
            <p>The following resources have been prepared for download:</p>
            <ul>
                ${resources.map(resource => `<li>${resource}</li>`).join('')}
            </ul>
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 4000);
}

// Review course (when all modules are complete)
function reviewCourse() {
    console.log('Starting course review...');
    
    const reviewModal = document.createElement('div');
    reviewModal.className = 'review-modal';
    reviewModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🎓 Course Review</h3>
                <button class="close-btn" onclick="closeReviewModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="review-stats">
                    <div class="stat-item">
                        <div class="stat-number">${courseProgress.completedModules.length}</div>
                        <div class="stat-label">Modules Completed</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${courseProgress.completionPercentage}%</div>
                        <div class="stat-label">Course Progress</div>
                    </div>
                </div>
                <p>Congratulations on completing the Intermediate n8n Course!</p>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="generateCertificate()">
                        Generate Certificate
                    </button>
                    <button class="btn btn-secondary" onclick="closeReviewModal()">
                        Close
                    </button>
                </div>
            </div>
        </div>
        <div class="modal-overlay" onclick="closeReviewModal()"></div>
    `;
    
    document.body.appendChild(reviewModal);
    addModalStyles();
}

// Close review modal
function closeReviewModal() {
    const modal = document.querySelector('.review-modal');
    if (modal) {
        modal.remove();
    }
}

// Generate certificate (placeholder)
function generateCertificate() {
    console.log('Generating certificate...');
    
    const message = document.createElement('div');
    message.className = 'certificate-message';
    message.innerHTML = `
        <div class="certificate-content">
            <div class="certificate-icon">🏆</div>
            <h3>Certificate Generated!</h3>
            <p>Your completion certificate has been generated and would be available for download.</p>
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
    
    closeReviewModal();
}

// Add modal styles dynamically
function addModalStyles() {
    if (document.querySelector('#modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        .module-modal, .review-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            background: white;
            border-radius: 16px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            z-index: 1001;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1.5rem;
            border-radius: 16px 16px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            margin: 0;
            font-size: 1.3rem;
        }
        
        .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s ease;
        }
        
        .close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .modal-body {
            padding: 2rem;
        }
        
        .modal-body ul {
            margin: 1rem 0;
            padding-left: 1.5rem;
        }
        
        .modal-body li {
            margin-bottom: 0.5rem;
        }
        
        .modal-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            justify-content: center;
        }
        
        .completion-message, .locked-message, .download-message, .certificate-message {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        }
        
        .completion-content, .locked-content, .download-content, .certificate-content {
            text-align: center;
        }
        
        .completion-icon, .locked-icon, .download-icon, .certificate-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .completion-content h3, .locked-content h3, .download-content h3, .certificate-content h3 {
            color: #333;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .completion-content p, .locked-content p, .download-content p, .certificate-content p {
            color: #666;
            margin: 0;
            font-size: 0.9rem;
        }
        
        .download-content ul {
            text-align: left;
            margin-top: 1rem;
            font-size: 0.85rem;
        }
        
        .review-stats {
            display: flex;
            justify-content: space-around;
            margin: 1.5rem 0;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #666;
        }
        
        .module-card.completed {
            border: 2px solid #4ecdc4;
        }
        
        .module-card.locked {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .completion-badge {
            background: #4ecdc4;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @media (max-width: 480px) {
            .modal-content {
                width: 95%;
                margin: 1rem;
            }
            
            .modal-actions {
                flex-direction: column;
            }
            
            .completion-message, .locked-message, .download-message, .certificate-message {
                top: 10px;
                right: 10px;
                left: 10px;
                max-width: none;
            }
        }
    `;
    
    document.head.appendChild(style);
} 