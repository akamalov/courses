// Advanced n8n Course - Enterprise JavaScript Module
// Copyright 2024 Learning Platform - Enterprise Automation Mastery

class AdvancedN8nCourse {
    constructor() {
        this.courseId = 'n8n-advanced';
        this.totalModules = 4;
        this.totalProjects = 3;
        this.currentProgress = this.loadProgress();
        
        // Enterprise tracking
        this.enterpriseMetrics = {
            startTime: Date.now(),
            sessionId: this.generateSessionId(),
            interactions: [],
            completionPath: []
        };
        
        this.init();
    }
    
    init() {
        console.log('🏢 Initializing Advanced n8n Course - Enterprise Edition');
        this.updateProgressDisplay();
        this.bindEventListeners();
        this.setupEnterpriseAnalytics();
        this.initializeAdvancedFeatures();
        this.trackUserSession();
    }
    
    generateSessionId() {
        return 'enterprise_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    loadProgress() {
        const saved = localStorage.getItem(`course_progress_${this.courseId}`);
        return saved ? JSON.parse(saved) : {
            modulesCompleted: [],
            projectsCompleted: [],
            lastAccessed: Date.now(),
            timeSpent: 0,
            certificationsEarned: [],
            expertMentorshipSessions: 0
        };
    }
    
    saveProgress() {
        localStorage.setItem(`course_progress_${this.courseId}`, JSON.stringify(this.currentProgress));
        this.trackInteraction('progress_saved');
    }
    
    updateProgressDisplay() {
        const modulesCompleted = this.currentProgress.modulesCompleted.length;
        const projectsCompleted = this.currentProgress.projectsCompleted.length;
        const totalItems = this.totalModules + this.totalProjects;
        const completedItems = modulesCompleted + projectsCompleted;
        const percentage = Math.round((completedItems / totalItems) * 100);
        
        // Update DOM elements with enterprise animations
        this.animateCounter('modules-completed', modulesCompleted);
        this.animateCounter('projects-completed', projectsCompleted);
        this.animateCounter('completion-percentage', percentage, '%');
        
        // Update progress bar with enterprise styling
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            setTimeout(() => {
                progressFill.style.width = percentage + '%';
            }, 500);
        }
        
        if (progressText) {
            const statusMessages = [
                'Ready to begin your enterprise journey',
                'Building foundational enterprise skills',
                'Developing advanced automation expertise',
                'Mastering enterprise architecture patterns',
                'Implementing security and compliance frameworks',
                'Creating custom nodes and integrations',
                'Deploying enterprise-grade solutions',
                'Enterprise Automation Architect - Certified! 🏆'
            ];
            
            const messageIndex = Math.min(Math.floor(percentage / 12.5), statusMessages.length - 1);
            progressText.textContent = statusMessages[messageIndex];
            
            if (percentage === 100) {
                progressText.style.color = '#ffd700';
                progressText.style.fontWeight = '700';
                this.triggerCertificationModal();
            }
        }
    }
    
    animateCounter(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    bindEventListeners() {
        // Enterprise module and project interactions
        document.querySelectorAll('.module-card').forEach((card, index) => {
            card.addEventListener('click', () => this.handleModuleInteraction(index + 1));
            card.addEventListener('mouseenter', () => this.trackInteraction('module_hover', { module: index + 1 }));
        });
        
        document.querySelectorAll('.project-card').forEach((card, index) => {
            card.addEventListener('click', () => this.handleProjectInteraction(index + 1));
            card.addEventListener('mouseenter', () => this.trackInteraction('project_hover', { project: index + 1 }));
        });
        
        document.querySelectorAll('.tool-card').forEach((card, index) => {
            card.addEventListener('click', () => this.handleToolInteraction(index + 1));
        });
        
        // Advanced tracking for enterprise features
        document.addEventListener('scroll', this.throttle(() => {
            this.trackScrollProgress();
        }, 1000));
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseSession();
            } else {
                this.resumeSession();
            }
        });
    }
    
    handleModuleInteraction(moduleNumber) {
        this.trackInteraction('module_click', { module: moduleNumber });
        
        const isCompleted = this.currentProgress.modulesCompleted.includes(moduleNumber);
        
        if (!isCompleted) {
            this.showModuleModal(moduleNumber);
        } else {
            this.showModuleReviewModal(moduleNumber);
        }
    }
    
    handleProjectInteraction(projectNumber) {
        this.trackInteraction('project_click', { project: projectNumber });
        
        const requiredModules = this.getRequiredModulesForProject(projectNumber);
        const hasPrerequisites = requiredModules.every(module => 
            this.currentProgress.modulesCompleted.includes(module)
        );
        
        if (!hasPrerequisites) {
            this.showPrerequisiteWarning(projectNumber, requiredModules);
            return;
        }
        
        this.showProjectModal(projectNumber);
    }
    
    handleToolInteraction(toolNumber) {
        this.trackInteraction('tool_access', { tool: toolNumber });
        
        const tools = [
            'Development Environment Setup',
            'Monitoring & Analytics Dashboard',
            'Security Testing Suite',
            'Enterprise Documentation Hub',
            'Expert Mentorship Portal',
            'Certification Assessment'
        ];
        
        this.showEnterpriseNotification(
            `Accessing ${tools[toolNumber - 1]}`,
            'Enterprise tool activated successfully',
            'success'
        );
    }
    
    showModuleModal(moduleNumber) {
        const modules = [
            {
                title: 'Enterprise Architecture',
                description: 'Master microservices automation patterns and event-driven architectures',
                estimatedTime: '35 minutes',
                difficulty: 'Enterprise'
            },
            {
                title: 'Security & Compliance',
                description: 'Implement OAuth 2.0, encryption, and compliance frameworks',
                estimatedTime: '40 minutes', 
                difficulty: 'Security'
            },
            {
                title: 'Custom Node Development',
                description: 'Create TypeScript nodes and advanced integrations',
                estimatedTime: '45 minutes',
                difficulty: 'Development'
            },
            {
                title: 'Advanced Deployment',
                description: 'Master CI/CD, IaC, and high-availability patterns',
                estimatedTime: '30 minutes',
                difficulty: 'DevOps'
            }
        ];
        
        const module = modules[moduleNumber - 1];
        
        this.createEnterpriseModal(
            `🏢 Module ${moduleNumber}: ${module.title}`,
            `
            <div class="enterprise-modal-content">
                <div class="module-preview">
                    <p class="module-description">${module.description}</p>
                    <div class="module-meta">
                        <span class="time-estimate">⏱️ ${module.estimatedTime}</span>
                        <span class="difficulty-badge ${module.difficulty.toLowerCase()}">${module.difficulty}</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-enterprise" onclick="window.advancedCourse.startModule(${moduleNumber})">
                        Start Module
                    </button>
                    <button class="btn-secondary" onclick="window.advancedCourse.closeModal()">
                        Later
                    </button>
                </div>
            </div>
            `
        );
    }
    
    createEnterpriseModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'enterprise-modal-overlay';
        modal.innerHTML = `
            <div class="enterprise-modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="window.advancedCourse.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Enterprise animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Auto-remove after 30 seconds if no interaction
        setTimeout(() => {
            if (document.body.contains(modal)) {
                this.closeModal();
            }
        }, 30000);
    }
    
    closeModal() {
        const modal = document.querySelector('.enterprise-modal-overlay');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
            }, 300);
        }
    }
    
    startModule(moduleNumber) {
        this.trackInteraction('module_start', { module: moduleNumber });
        
        if (!this.currentProgress.modulesCompleted.includes(moduleNumber)) {
            this.currentProgress.modulesCompleted.push(moduleNumber);
            this.currentProgress.completionPath.push({
                type: 'module',
                number: moduleNumber,
                timestamp: Date.now()
            });
            this.saveProgress();
            this.updateProgressDisplay();
        }
        
        this.showEnterpriseNotification(
            `Module ${moduleNumber} Started!`,
            'Enterprise automation learning in progress...',
            'success'
        );
        
        this.closeModal();
        
        // Simulate module completion after a delay
        setTimeout(() => {
            this.completeModule(moduleNumber);
        }, 3000);
    }
    
    completeModule(moduleNumber) {
        this.showEnterpriseNotification(
            `Module ${moduleNumber} Completed! 🎉`,
            'Enterprise skills unlocked successfully',
            'achievement'
        );
        
        this.updateProgressDisplay();
        this.checkForCertificationEligibility();
    }
    
    showEnterpriseNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `enterprise-notification ${type}`;
        
        const icons = {
            success: '✅',
            achievement: '🏆',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icons[type]}</div>
                <div class="notification-text">
                    <strong>${title}</strong>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    checkForCertificationEligibility() {
        const modulesCompleted = this.currentProgress.modulesCompleted.length;
        const projectsCompleted = this.currentProgress.projectsCompleted.length;
        
        if (modulesCompleted >= this.totalModules && projectsCompleted >= this.totalProjects) {
            setTimeout(() => {
                this.triggerCertificationModal();
            }, 1000);
        }
    }
    
    triggerCertificationModal() {
        if (this.currentProgress.certificationsEarned.includes('enterprise-architect')) {
            return; // Already certified
        }
        
        this.createEnterpriseModal(
            '🏆 Certification Available!',
            `
            <div class="certification-content">
                <div class="cert-badge">
                    <div class="cert-icon">🎓</div>
                    <h4>n8n Enterprise Architect</h4>
                </div>
                <p>Congratulations! You've completed all modules and projects.</p>
                <p>You're now eligible for the prestigious <strong>n8n Enterprise Architect</strong> certification.</p>
                <div class="modal-actions">
                    <button class="btn-enterprise" onclick="window.advancedCourse.earnCertification()">
                        Claim Certification
                    </button>
                    <button class="btn-secondary" onclick="window.advancedCourse.closeModal()">
                        Later
                    </button>
                </div>
            </div>
            `
        );
    }
    
    earnCertification() {
        this.currentProgress.certificationsEarned.push('enterprise-architect');
        this.saveProgress();
        
        this.showEnterpriseNotification(
            '🎓 Certification Earned!',
            'n8n Enterprise Architect - Certified!',
            'achievement'
        );
        
        this.closeModal();
        this.updateProgressDisplay();
    }
    
    trackInteraction(action, details = {}) {
        this.enterpriseMetrics.interactions.push({
            action,
            details,
            timestamp: Date.now()
        });
    }
    
    trackScrollProgress() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        this.trackInteraction('scroll_progress', { percent: scrollPercent });
    }
    
    setupEnterpriseAnalytics() {
        // Enterprise-level analytics and tracking
        this.analytics = {
            pageViews: 0,
            timeSpent: 0,
            interactionCount: 0,
            lastActive: Date.now()
        };
        
        // Track page visibility
        setInterval(() => {
            if (!document.hidden) {
                this.analytics.timeSpent += 1000;
                this.currentProgress.timeSpent += 1000;
            }
        }, 1000);
    }
    
    initializeAdvancedFeatures() {
        // Enterprise keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.handleModuleInteraction(1);
                        break;
                    case '2':
                        e.preventDefault();
                        this.handleModuleInteraction(2);
                        break;
                    case '3':
                        e.preventDefault();
                        this.handleModuleInteraction(3);
                        break;
                    case '4':
                        e.preventDefault();
                        this.handleModuleInteraction(4);
                        break;
                }
            }
        });
    }
    
    trackUserSession() {
        // Track session start
        this.trackInteraction('session_start', {
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        });
    }
    
    pauseSession() {
        this.trackInteraction('session_pause');
    }
    
    resumeSession() {
        this.trackInteraction('session_resume');
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    getRequiredModulesForProject(projectNumber) {
        const requirements = {
            1: [1, 2], // Enterprise Integration requires Architecture + Security
            2: [2, 3], // Zero-Trust requires Security + Custom Development
            3: [1, 4]  // Multi-Cloud requires Architecture + Deployment
        };
        return requirements[projectNumber] || [];
    }
    
    showPrerequisiteWarning(projectNumber, requiredModules) {
        const moduleNames = ['Enterprise Architecture', 'Security & Compliance', 'Custom Node Development', 'Advanced Deployment'];
        const required = requiredModules.map(num => moduleNames[num - 1]).join(' and ');
        
        this.createEnterpriseModal(
            '⚠️ Prerequisites Required',
            `
            <div class="warning-content">
                <p>To start this enterprise project, you must first complete:</p>
                <div class="prerequisite-list">
                    <strong>${required}</strong>
                </div>
                <p>These modules provide essential foundation for enterprise-level implementation.</p>
                <div class="modal-actions">
                    <button class="btn-enterprise" onclick="window.advancedCourse.closeModal()">
                        Understood
                    </button>
                </div>
            </div>
            `
        );
    }
    
    showProjectModal(projectNumber) {
        const projects = [
            {
                title: 'Enterprise Integration Platform',
                description: 'Build a multi-system integration platform with audit trails',
                complexity: 'High',
                duration: '2-3 weeks'
            },
            {
                title: 'Zero-Trust Automation Hub',
                description: 'Implement zero-trust security with end-to-end encryption',
                complexity: 'High',
                duration: '3-4 weeks'
            },
            {
                title: 'Multi-Cloud Deployment System',
                description: 'Create intelligent multi-cloud orchestration system',
                complexity: 'Expert',
                duration: '4-6 weeks'
            }
        ];
        
        const project = projects[projectNumber - 1];
        
        this.createEnterpriseModal(
            `🚀 Project ${projectNumber}: ${project.title}`,
            `
            <div class="enterprise-modal-content">
                <div class="project-preview">
                    <p class="project-description">${project.description}</p>
                    <div class="project-meta">
                        <span class="complexity-badge">${project.complexity} Complexity</span>
                        <span class="duration-estimate">📅 ${project.duration}</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-enterprise" onclick="window.advancedCourse.startProject(${projectNumber})">
                        Start Project
                    </button>
                    <button class="btn-secondary" onclick="window.advancedCourse.closeModal()">
                        Review Later
                    </button>
                </div>
            </div>
            `
        );
    }
    
    startProject(projectNumber) {
        this.trackInteraction('project_start', { project: projectNumber });
        
        if (!this.currentProgress.projectsCompleted.includes(projectNumber)) {
            this.currentProgress.projectsCompleted.push(projectNumber);
            this.currentProgress.completionPath.push({
                type: 'project',
                number: projectNumber,
                timestamp: Date.now()
            });
            this.saveProgress();
            this.updateProgressDisplay();
        }
        
        this.showEnterpriseNotification(
            `Project ${projectNumber} Started!`,
            'Enterprise project development initiated...',
            'success'
        );
        
        this.closeModal();
        
        // Simulate project completion
        setTimeout(() => {
            this.completeProject(projectNumber);
        }, 5000);
    }
    
    completeProject(projectNumber) {
        this.showEnterpriseNotification(
            `Project ${projectNumber} Completed! 🚀`,
            'Enterprise solution deployed successfully',
            'achievement'
        );
        
        this.updateProgressDisplay();
        this.checkForCertificationEligibility();
    }
}

// Global functions for button interactions
function goHome() {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({type: 'navigate', path: '/'}, '*');
    } else {
        window.location.href = '../../index.html';
    }
}

function startModule(moduleNumber) {
    if (window.advancedCourse) {
        window.advancedCourse.startModule(moduleNumber);
    }
}

function downloadResources() {
    window.advancedCourse.showEnterpriseNotification(
        '📦 Enterprise Kit Downloading',
        'Advanced tools and resources package is being prepared...',
        'info'
    );
    
    setTimeout(() => {
        window.advancedCourse.showEnterpriseNotification(
            '✅ Download Complete',
            'Enterprise Development Kit ready for use!',
            'success'
        );
    }, 2000);
}

function accessMentorship() {
    window.advancedCourse.currentProgress.expertMentorshipSessions++;
    window.advancedCourse.saveProgress();
    
    window.advancedCourse.createEnterpriseModal(
        '🎯 Expert Mentorship Portal',
        `
        <div class="mentorship-content">
            <div class="mentor-info">
                <div class="mentor-avatar">👨‍💼</div>
                <h4>Enterprise Solution Architect</h4>
                <p>15+ years in automation & enterprise integration</p>
            </div>
            <div class="session-options">
                <div class="session-type">
                    <h5>1-on-1 Architecture Review</h5>
                    <p>Deep dive into your enterprise automation architecture</p>
                    <button class="btn-enterprise">Schedule Session</button>
                </div>
                <div class="session-type">
                    <h5>Security Assessment</h5>
                    <p>Comprehensive security and compliance review</p>
                    <button class="btn-enterprise">Book Assessment</button>
                </div>
                <div class="session-type">
                    <h5>Custom Node Workshop</h5>
                    <p>Hands-on custom node development session</p>
                    <button class="btn-enterprise">Join Workshop</button>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="window.advancedCourse.closeModal()">
                    Close
                </button>
            </div>
        </div>
        `
    );
}

// Initialize the course when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.advancedCourse = new AdvancedN8nCourse();
});

// Add enterprise styling for dynamic elements
const enterpriseStyles = `
    <style>
        .enterprise-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .enterprise-modal-overlay.active {
            opacity: 1;
        }
        
        .enterprise-modal {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 20px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
            transform: translateY(50px);
            transition: transform 0.3s ease;
        }
        
        .enterprise-modal-overlay.active .enterprise-modal {
            transform: translateY(0);
        }
        
        .modal-header {
            padding: 2rem 2rem 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            color: #ffd700;
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: #ffffff;
            font-size: 2rem;
            cursor: pointer;
            padding: 0;
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s ease;
        }
        
        .modal-close:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .modal-body {
            padding: 2rem;
        }
        
        .enterprise-modal-content {
            color: #ffffff;
        }
        
        .module-description, .project-description {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
            color: rgba(255, 255, 255, 0.9);
        }
        
        .module-meta, .project-meta {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }
        
        .time-estimate, .duration-estimate {
            background: rgba(102, 126, 234, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 12px;
            font-size: 0.9rem;
            border: 1px solid rgba(102, 126, 234, 0.4);
        }
        
        .difficulty-badge {
            padding: 0.5rem 1rem;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .difficulty-badge.enterprise {
            background: linear-gradient(135deg, #ffd700, #ffb347);
            color: #1a1a2e;
        }
        
        .difficulty-badge.security {
            background: linear-gradient(135deg, #ff4757, #c44569);
            color: white;
        }
        
        .difficulty-badge.development {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }
        
        .difficulty-badge.devops {
            background: linear-gradient(135deg, #2ed573, #17a2b8);
            color: white;
        }
        
        .complexity-badge {
            background: linear-gradient(135deg, #ff4757, #c44569);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 600;
        }
        
        .modal-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
            flex-wrap: wrap;
        }
        
        .btn-enterprise {
            background: linear-gradient(135deg, #ffd700, #ffb347);
            color: #1a1a2e;
            border: none;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .btn-enterprise:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
        }
        
        .enterprise-notification {
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            padding: 1.5rem;
            max-width: 400px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            transform: translateX(500px);
            transition: transform 0.3s ease;
        }
        
        .enterprise-notification.show {
            transform: translateX(0);
        }
        
        .enterprise-notification.success {
            border-color: #2ed573;
            box-shadow: 0 20px 40px rgba(46, 213, 115, 0.2);
        }
        
        .enterprise-notification.achievement {
            border-color: #ffd700;
            box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
        }
        
        .notification-content {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
        }
        
        .notification-icon {
            font-size: 1.5rem;
            min-width: 1.5rem;
        }
        
        .notification-text strong {
            color: #ffffff;
            display: block;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .notification-text p {
            color: rgba(255, 255, 255, 0.8);
            margin: 0;
            line-height: 1.4;
        }
        
        .certification-content {
            text-align: center;
        }
        
        .cert-badge {
            background: linear-gradient(135deg, #ffd700, #ffb347);
            color: #1a1a2e;
            padding: 2rem;
            border-radius: 20px;
            margin-bottom: 2rem;
        }
        
        .cert-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .cert-badge h4 {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0;
        }
        
        @media (max-width: 768px) {
            .enterprise-notification {
                top: 1rem;
                right: 1rem;
                left: 1rem;
                max-width: none;
            }
            
            .enterprise-modal {
                margin: 1rem;
                width: calc(100% - 2rem);
            }
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', enterpriseStyles); 