/**
 * Authentication System for Learning Platform
 * Handles user login, logout, registration, and session management
 */

class AuthenticationManager {
    constructor() {
        this.currentUser = null;
        this.users = new Map();
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        this.eventListeners = new Map();
        
        this.init();
    }

    init() {
        this.loadUsers();
        this.checkSession();
        this.setupEventListeners();
        
        // Always update UI after initialization to reflect current auth state
        setTimeout(() => {
            this.updateUI();
        }, 100);
    }

    // Event System for Auth State Changes
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => callback(data));
        }
    }

    // User Management
    loadUsers() {
        const savedUsers = localStorage.getItem('learningPlatform_users');
        if (savedUsers) {
            const usersArray = JSON.parse(savedUsers);
            usersArray.forEach(user => {
                this.users.set(user.email, user);
            });
        } else {
            // Create some demo users for testing
            this.createDemoUsers();
        }
    }

    saveUsers() {
        const usersArray = Array.from(this.users.values());
        localStorage.setItem('learningPlatform_users', JSON.stringify(usersArray));
    }

    createDemoUsers() {
        const demoUsers = [
            {
                id: 'demo-001',
                email: 'demo@learningplatform.com',
                password: 'demo123', // In real app, this would be hashed
                firstName: 'Demo',
                lastName: 'User',
                avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=667eea&color=fff',
                joinDate: new Date('2024-01-15'),
                preferences: {
                    categories: ['Automation', 'Programming'],
                    difficulty: 'intermediate',
                    notifications: true,
                    theme: 'auto'
                },
                coursesEnrolled: ['n8n-crash-course', 'python-basics'],
                coursesCompleted: [],
                coursesInProgress: ['n8n-crash-course'],
                learningStreak: 5,
                totalPoints: 150,
                achievements: ['first-course', 'week-streak'],
                learningGoals: {
                    weekly: 3,
                    monthly: 12
                }
            }
        ];

        demoUsers.forEach(user => {
            this.users.set(user.email, user);
        });
        this.saveUsers();
    }

    // Authentication Methods
    async login(email, password) {
        try {
            const user = this.users.get(email.toLowerCase());
            
            if (!user) {
                throw new Error('User not found');
            }

            // In a real app, you'd hash the password and compare hashes
            if (user.password !== password) {
                throw new Error('Invalid password');
            }

            // Update last login
            user.lastLogin = new Date();
            user.loginCount = (user.loginCount || 0) + 1;
            
            this.currentUser = user;
            this.saveSession();
            this.saveUsers();
            
            this.emit('login', user);
            
            return {
                success: true,
                user: this.sanitizeUser(user),
                message: 'Login successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async register(userData) {
        try {
            const { email, password, firstName, lastName } = userData;
            
            // Validation
            if (!email || !password || !firstName || !lastName) {
                throw new Error('All fields are required');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            if (this.users.has(email.toLowerCase())) {
                throw new Error('User already exists');
            }

            // Create new user
            const newUser = {
                id: 'user-' + Date.now(),
                email: email.toLowerCase(),
                password, // In real app, hash this
                firstName,
                lastName,
                avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=667eea&color=fff`,
                joinDate: new Date(),
                preferences: {
                    categories: [],
                    difficulty: 'beginner',
                    notifications: true,
                    theme: 'auto'
                },
                coursesEnrolled: [],
                coursesCompleted: [],
                coursesInProgress: [],
                learningStreak: 0,
                totalPoints: 0,
                achievements: [],
                learningGoals: {
                    weekly: 2,
                    monthly: 8
                },
                loginCount: 1,
                lastLogin: new Date()
            };

            this.users.set(newUser.email, newUser);
            this.currentUser = newUser;
            this.saveSession();
            this.saveUsers();
            
            this.emit('register', newUser);
            
            return {
                success: true,
                user: this.sanitizeUser(newUser),
                message: 'Registration successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    logout() {
        if (this.currentUser) {
            const user = this.currentUser;
            this.currentUser = null;
            localStorage.removeItem('learningPlatform_session');
            this.emit('logout', user);
        }
    }

    // Session Management
    saveSession() {
        if (this.currentUser) {
            const session = {
                userId: this.currentUser.id,
                email: this.currentUser.email,
                timestamp: Date.now(),
                expiresAt: Date.now() + this.sessionTimeout
            };
            localStorage.setItem('learningPlatform_session', JSON.stringify(session));
        }
    }

    checkSession() {
        const sessionData = localStorage.getItem('learningPlatform_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                
                // Check if session is expired
                if (Date.now() > session.expiresAt) {
                    this.logout();
                    return false;
                }

                // Restore user session
                const user = this.users.get(session.email);
                if (user) {
                    this.currentUser = user;
                    this.emit('sessionRestored', user);
                    return true;
                }
            } catch (error) {
                console.error('Session restore error:', error);
                localStorage.removeItem('learningPlatform_session');
            }
        }
        return false;
    }

    // User Profile Management
    updateProfile(updates) {
        if (!this.currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            // Update user data
            Object.assign(this.currentUser, updates);
            this.users.set(this.currentUser.email, this.currentUser);
            this.saveUsers();
            this.saveSession();
            
            this.emit('profileUpdated', this.currentUser);
            
            return {
                success: true,
                user: this.sanitizeUser(this.currentUser)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    updatePreferences(preferences) {
        if (!this.currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
        this.users.set(this.currentUser.email, this.currentUser);
        this.saveUsers();
        
        this.emit('preferencesUpdated', this.currentUser.preferences);
        
        return { success: true };
    }

    // Course Interaction Methods
    enrollCourse(courseId) {
        if (!this.currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        if (!this.currentUser.coursesEnrolled.includes(courseId)) {
            this.currentUser.coursesEnrolled.push(courseId);
            this.currentUser.coursesInProgress.push(courseId);
            this.saveUserData();
            
            this.emit('courseEnrolled', { courseId, user: this.currentUser });
        }
        
        return { success: true };
    }

    updateCourseProgress(courseId, progress) {
        if (!this.currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        // Store course progress
        if (!this.currentUser.courseProgress) {
            this.currentUser.courseProgress = {};
        }
        
        this.currentUser.courseProgress[courseId] = {
            ...this.currentUser.courseProgress[courseId],
            ...progress,
            lastUpdated: new Date()
        };

        // Check if course is completed
        if (progress.completed === progress.total) {
            this.completeCourse(courseId);
        }

        this.saveUserData();
        this.emit('progressUpdated', { courseId, progress, user: this.currentUser });
        
        return { success: true };
    }

    completeCourse(courseId) {
        if (!this.currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        // Move from in-progress to completed
        this.currentUser.coursesInProgress = this.currentUser.coursesInProgress
            .filter(id => id !== courseId);
        
        if (!this.currentUser.coursesCompleted.includes(courseId)) {
            this.currentUser.coursesCompleted.push(courseId);
            this.addPoints(100); // Completion bonus
            this.checkAchievements();
        }

        this.saveUserData();
        this.emit('courseCompleted', { courseId, user: this.currentUser });
        
        return { success: true };
    }

    // Gamification
    addPoints(points) {
        if (this.currentUser) {
            this.currentUser.totalPoints += points;
            this.emit('pointsEarned', { points, total: this.currentUser.totalPoints });
        }
    }

    updateStreak() {
        if (this.currentUser) {
            const lastActivity = new Date(this.currentUser.lastActivity || 0);
            const today = new Date();
            const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Continue streak
                this.currentUser.learningStreak++;
            } else if (diffDays > 1) {
                // Streak broken
                this.currentUser.learningStreak = 1;
            }
            
            this.currentUser.lastActivity = today;
            this.checkAchievements();
            this.saveUserData();
        }
    }

    checkAchievements() {
        if (!this.currentUser) return;

        const achievements = this.currentUser.achievements || [];
        const newAchievements = [];

        // First course completion
        if (this.currentUser.coursesCompleted.length >= 1 && !achievements.includes('first-course')) {
            newAchievements.push('first-course');
        }

        // Week streak
        if (this.currentUser.learningStreak >= 7 && !achievements.includes('week-streak')) {
            newAchievements.push('week-streak');
        }

        // Month streak
        if (this.currentUser.learningStreak >= 30 && !achievements.includes('month-streak')) {
            newAchievements.push('month-streak');
        }

        // Points milestones
        if (this.currentUser.totalPoints >= 500 && !achievements.includes('points-500')) {
            newAchievements.push('points-500');
        }

        if (newAchievements.length > 0) {
            this.currentUser.achievements.push(...newAchievements);
            this.emit('achievementsUnlocked', newAchievements);
        }
    }

    // Utility Methods
    sanitizeUser(user) {
        const { password, ...sanitized } = user;
        return sanitized;
    }

    saveUserData() {
        this.users.set(this.currentUser.email, this.currentUser);
        this.saveUsers();
        this.saveSession();
    }

    getCurrentUser() {
        return this.currentUser ? this.sanitizeUser(this.currentUser) : null;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Personalized Recommendations
    getPersonalizedRecommendations(allCourses, limit = 6) {
        if (!this.currentUser) {
            return allCourses.slice(0, limit);
        }

        const user = this.currentUser;
        const recommendations = [];

        allCourses.forEach(course => {
            let score = 0;

            // Skip already enrolled courses
            if (user.coursesEnrolled.includes(course.id)) {
                return;
            }

            // Base score
            score += course.rating * 10;
            score += Math.log(course.enrollments + 1) * 2;

            // User preference matching
            if (user.preferences.categories.includes(course.category)) {
                score += 20;
            }

            if (course.difficulty === user.preferences.difficulty) {
                score += 15;
            }

            // Tag matching based on completed courses
            const userTags = new Set();
            user.coursesCompleted.forEach(completedId => {
                const completedCourse = allCourses.find(c => c.id === completedId);
                if (completedCourse) {
                    completedCourse.tags.forEach(tag => userTags.add(tag));
                }
            });

            course.tags.forEach(tag => {
                if (userTags.has(tag)) {
                    score += 5;
                }
            });

            // Difficulty progression
            if (user.coursesCompleted.length > 0) {
                const avgDifficulty = this.getUserAverageDifficulty(allCourses);
                if (this.isNextDifficultyLevel(avgDifficulty, course.difficulty)) {
                    score += 10;
                }
            }

            recommendations.push({ course, score });
        });

        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(r => r.course);
    }

    getUserAverageDifficulty(allCourses) {
        if (!this.currentUser || this.currentUser.coursesCompleted.length === 0) {
            return 'beginner';
        }

        const difficultyValues = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
        let totalDifficulty = 0;
        let count = 0;

        this.currentUser.coursesCompleted.forEach(courseId => {
            const course = allCourses.find(c => c.id === courseId);
            if (course) {
                totalDifficulty += difficultyValues[course.difficulty] || 1;
                count++;
            }
        });

        const avgValue = Math.round(totalDifficulty / count);
        const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
        return difficulties[avgValue - 1] || 'beginner';
    }

    isNextDifficultyLevel(current, next) {
        const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
        const currentIndex = levels.indexOf(current);
        const nextIndex = levels.indexOf(next);
        return nextIndex === currentIndex + 1;
    }





    updateUI() {
        console.log('Updating UI based on auth state');
        const loginBtn = document.getElementById('login-btn');
        const homeBtn = document.getElementById('home-btn');
        const userProfile = document.getElementById('user-profile');
        const personalizedDashboard = document.getElementById('personalized-dashboard');
        const heroSection = document.querySelector('.hero-section');
        const mainContent = document.querySelector('main');
        
        if (this.isAuthenticated()) {
            console.log('User is authenticated, updating UI');
            
            // Hide login button, show home button and user profile
            if (loginBtn) loginBtn.style.display = 'none';
            if (homeBtn) homeBtn.style.display = 'flex';
            if (userProfile) userProfile.style.display = 'flex';
            
            // Show personalized dashboard, hide hero section and main content
            if (personalizedDashboard) personalizedDashboard.style.display = 'block';
            if (heroSection) heroSection.style.display = 'none';
            if (mainContent) mainContent.style.display = 'none';
            
            // Update user info
            const user = this.getCurrentUser();
            const userName = document.getElementById('user-name');
            const userPoints = document.getElementById('user-points');
            const welcomeMessage = document.getElementById('welcome-message');
            
            if (userName) userName.textContent = user.firstName + ' ' + user.lastName;
            if (userPoints) userPoints.textContent = user.totalPoints + ' pts';
            if (welcomeMessage) welcomeMessage.textContent = `Welcome back, ${user.firstName}!`;
            
            // Trigger framework to update dashboard
            if (window.framework) {
                console.log('Calling framework.renderPersonalizedDashboard()');
                window.framework.currentUser = user;
                window.framework.renderPersonalizedDashboard();
            } else {
                console.warn('Framework not available to render dashboard');
            }
            
            console.log('UI updated for authenticated user:', user.email);
        } else {
            console.log('User is not authenticated, showing login UI');
            
            // Show login button, hide home button and user profile
            if (loginBtn) loginBtn.style.display = 'block';
            if (homeBtn) homeBtn.style.display = 'none';
            if (userProfile) userProfile.style.display = 'none';
            
            // Hide personalized dashboard, show hero section and main content
            if (personalizedDashboard) personalizedDashboard.style.display = 'none';
            if (heroSection) heroSection.style.display = 'block';
            if (mainContent) mainContent.style.display = 'block';
            
            console.log('UI updated for unauthenticated state');
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        console.log('Setting up authentication event listeners');
        
        // Listen for authentication events and update UI
        this.on('login', (user) => {
            console.log('Login event received, updating UI');
            this.updateUI();
        });

        this.on('register', (user) => {
            console.log('Register event received, updating UI');
            this.updateUI();
        });

        this.on('logout', () => {
            console.log('Logout event received, updating UI');
            this.updateUI();
        });

        this.on('sessionRestored', (user) => {
            console.log('Session restored event received, updating UI');
            this.updateUI();
        });

        // Listen for course interactions
        this.on('courseStarted', (data) => {
            this.enrollCourse(data.courseId);
            this.updateStreak();
        });

        this.on('lessonCompleted', (data) => {
            this.addPoints(data.points || 10);
            this.updateCourseProgress(data.courseId, data.progress);
        });
    }

    // Demo and Testing Methods
    getDemoCredentials() {
        return {
            email: 'demo@learningplatform.com',
            password: 'demo123'
        };
    }

    getAllUsers() {
        // For admin purposes only
        return Array.from(this.users.values()).map(user => this.sanitizeUser(user));
    }
}

// Initialize global auth manager
window.authManager = new AuthenticationManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthenticationManager;
} 