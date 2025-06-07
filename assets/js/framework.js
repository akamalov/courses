/**
 * Learning Framework - Core JavaScript
 * Main framework for managing multiple learning modules
 */

class LearningFramework {
    constructor() {
        this.courses = new Map();
        this.currentUser = null;
        this.searchIndex = new Map();
        this.recommendations = new Map();
        this.analytics = {
            pageViews: new Map(),
            searchQueries: [],
            courseStarted: new Map(),
            courseCompleted: new Map()
        };
        
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadCourses();
        this.setupEventListeners();
        this.buildSearchIndex();
        this.calculateRecommendations();
        this.setupAuthIntegration();
    }

    // Authentication Integration
    setupAuthIntegration() {
        if (window.authManager) {
            // Listen for auth events
            window.authManager.on('login', (user) => {
                this.currentUser = user;
                this.updateUIForAuthenticatedUser();
                this.calculatePersonalizedRecommendations();
            });

            window.authManager.on('logout', () => {
                this.currentUser = null;
                this.updateUIForUnauthenticatedUser();
            });

            window.authManager.on('sessionRestored', (user) => {
                this.currentUser = user;
                this.updateUIForAuthenticatedUser();
                this.calculatePersonalizedRecommendations();
            });

            // Initial UI update based on auth state
            if (window.authManager.isAuthenticated()) {
                this.currentUser = window.authManager.getCurrentUser();
                this.updateUIForAuthenticatedUser();
                this.calculatePersonalizedRecommendations();
            } else {
                this.updateUIForUnauthenticatedUser();
            }
        }
    }

    updateUIForAuthenticatedUser() {
        const loginBtn = document.getElementById('login-btn');
        const userProfile = document.getElementById('user-profile');
        const personalizedDashboard = document.getElementById('personalized-dashboard');
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        if (personalizedDashboard) personalizedDashboard.style.display = 'block';
        
        this.updateUserProfileUI();
        this.renderPersonalizedDashboard();
    }

    updateUIForUnauthenticatedUser() {
        const loginBtn = document.getElementById('login-btn');
        const userProfile = document.getElementById('user-profile');
        const personalizedDashboard = document.getElementById('personalized-dashboard');
        
        if (loginBtn) loginBtn.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
        if (personalizedDashboard) personalizedDashboard.style.display = 'none';
    }

    updateUserProfileUI() {
        if (!this.currentUser) return;
        
        const userName = document.getElementById('user-name');
        const userPoints = document.getElementById('user-points');
        const userAvatar = document.getElementById('user-avatar');
        const dropdownName = document.getElementById('dropdown-name');
        const dropdownEmail = document.getElementById('dropdown-email');
        const dropdownAvatar = document.getElementById('dropdown-avatar');
        const statPoints = document.getElementById('stat-points');
        const statStreak = document.getElementById('stat-streak');
        const statCourses = document.getElementById('stat-courses');
        
        if (userName) userName.textContent = this.currentUser.firstName;
        if (userPoints) userPoints.textContent = `${this.currentUser.totalPoints} pts`;
        if (userAvatar) userAvatar.src = this.currentUser.avatar;
        if (dropdownName) dropdownName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        if (dropdownEmail) dropdownEmail.textContent = this.currentUser.email;
        if (dropdownAvatar) dropdownAvatar.src = this.currentUser.avatar;
        if (statPoints) statPoints.textContent = this.currentUser.totalPoints;
        if (statStreak) statStreak.textContent = this.currentUser.learningStreak;
        if (statCourses) statCourses.textContent = this.currentUser.coursesEnrolled.length;
    }

    renderPersonalizedDashboard() {
        if (!this.currentUser) return;
        
        console.log('Rendering personalized dashboard for user:', this.currentUser.firstName);
        
        this.renderWelcomeBanner();
        this.renderCurrentCourses();
        this.renderDashboardRecommendations();
        this.renderAchievements();
    }

    renderWelcomeBanner() {
        const welcomeMessage = document.getElementById('welcome-message');
        const welcomeSubtitle = document.getElementById('welcome-subtitle');
        
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome back, ${this.currentUser.firstName}!`;
        }
        
        if (welcomeSubtitle) {
            const messages = [
                "Ready to continue your learning journey? You're doing great!",
                "Let's make today another step forward in your learning!",
                "Your dedication to learning is inspiring. Keep it up!",
                "Time to unlock new skills and expand your knowledge!"
            ];
            welcomeSubtitle.textContent = messages[Math.floor(Math.random() * messages.length)];
        }
    }

    renderCurrentCourses() {
        const container = document.getElementById('current-courses-list');
        if (!container || !this.currentUser) return;
        
        const currentCourses = this.currentUser.coursesInProgress || [];
        
        if (currentCourses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <h4 class="empty-state-title">No courses in progress</h4>
                    <p class="empty-state-text">Browse our catalog and start learning something new!</p>
                    <button class="btn btn-primary" onclick="goToBrowseCourses()">
                        Explore Courses
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = currentCourses.map(courseId => {
            const course = this.getCourse(courseId);
            if (!course) return '';
            
            const progress = this.currentUser.courseProgress?.[courseId] || { completed: 0, total: 100 };
            const progressPercent = Math.round((progress.completed / progress.total) * 100);
            
            return `
                <a href="${course.path}" class="current-course">
                    <div class="course-thumbnail">${course.title.charAt(0)}</div>
                    <div class="course-details">
                        <h4>${course.title}</h4>
                        <div class="course-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <span class="progress-text">${progressPercent}%</span>
                        </div>
                        <div class="course-meta">${course.category} • ${this.formatDuration(course.duration)}</div>
                    </div>
                </a>
            `;
        }).join('');
    }

    renderDashboardRecommendations() {
        const container = document.getElementById('dashboard-recommended-courses');
        if (!container) return;
        
        console.log('Rendering dashboard recommendations...');
        
        // Get personalized recommendations if auth manager is available
        let recommendedCourses = [];
        if (window.authManager && this.currentUser) {
            recommendedCourses = window.authManager.getPersonalizedRecommendations(
                this.getAllCourses(), 
                4
            );
        }
        
        // Fallback to featured courses if no personalized recommendations
        if (recommendedCourses.length === 0) {
            recommendedCourses = this.getFeaturedCourses().slice(0, 4);
        }
        
        console.log('Found recommendations:', recommendedCourses.length);
        
        if (recommendedCourses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h4 class="empty-state-title">No recommendations yet</h4>
                    <p class="empty-state-text">Start taking courses to get personalized recommendations!</p>
                    <button class="btn btn-primary" onclick="goToBrowseCourses()">
                        Browse All Courses
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = recommendedCourses.map(course => this.renderCourseCard(course)).join('');
    }

    renderAchievements() {
        const container = document.getElementById('achievements-grid');
        if (!container || !this.currentUser) return;
        
        const achievements = {
            'first-course': { icon: '🎯', name: 'First Course' },
            'week-streak': { icon: '🔥', name: 'Week Streak' },
            'month-streak': { icon: '⚡', name: 'Month Streak' },
            'points-500': { icon: '💎', name: '500 Points' },
            'course-complete': { icon: '🏆', name: 'Course Master' }
        };
        
        const userAchievements = this.currentUser.achievements || [];
        
        if (userAchievements.length === 0) {
            container.innerHTML = `
                <div class="achievement-badge">
                    <span class="achievement-icon">🎯</span>
                    <p class="achievement-name">Start Learning</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = userAchievements.map(achievementId => {
            const achievement = achievements[achievementId];
            if (!achievement) return '';
            
            return `
                <div class="achievement-badge">
                    <span class="achievement-icon">${achievement.icon}</span>
                    <p class="achievement-name">${achievement.name}</p>
                </div>
            `;
        }).join('');
    }

    calculatePersonalizedRecommendations() {
        if (!this.currentUser || !window.authManager) return;
        
        const personalizedCourses = window.authManager.getPersonalizedRecommendations(
            this.getAllCourses(), 
            6
        );
        
        // Update recommendations section
        this.renderCourseGrid(personalizedCourses, 'recommended-courses');
    }

    renderCourseGrid(courses, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!courses || courses.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No courses found</p></div>';
            return;
        }
        
        container.innerHTML = courses.map(course => this.renderCourseCard(course)).join('');
    }

    // Course Management
    registerCourse(courseData) {
        const course = {
            id: courseData.id,
            title: courseData.title,
            description: courseData.description,
            category: courseData.category,
            difficulty: courseData.difficulty,
            duration: courseData.duration,
            tags: courseData.tags || [],
            prerequisites: courseData.prerequisites || [],
            learningObjectives: courseData.learningObjectives || [],
            instructor: courseData.instructor,
            rating: courseData.rating || 0,
            enrollments: courseData.enrollments || 0,
            thumbnail: courseData.thumbnail,
            path: courseData.path,
            isNew: courseData.isNew || false,
            isFeatured: courseData.isFeatured || false,
            createdAt: courseData.createdAt || new Date(),
            updatedAt: courseData.updatedAt || new Date()
        };

        this.courses.set(course.id, course);
        this.updateSearchIndex(course);
        return course;
    }

    getCourse(courseId) {
        return this.courses.get(courseId);
    }

    getAllCourses() {
        return Array.from(this.courses.values());
    }

    getCoursesByCategory(category) {
        return this.getAllCourses().filter(course => course.category === category);
    }

    getFeaturedCourses() {
        return this.getAllCourses().filter(course => course.isFeatured);
    }

    getNewCourses() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return this.getAllCourses().filter(course => 
            course.isNew || course.createdAt > thirtyDaysAgo
        );
    }

    // Search Functionality
    updateSearchIndex(course) {
        const searchableText = [
            course.title,
            course.description,
            course.category,
            ...course.tags,
            course.instructor
        ].join(' ').toLowerCase();

        // Create word-based index
        const words = searchableText.split(/\s+/);
        words.forEach(word => {
            if (word.length > 2) { // Skip very short words
                if (!this.searchIndex.has(word)) {
                    this.searchIndex.set(word, new Set());
                }
                this.searchIndex.get(word).add(course.id);
            }
        });
    }

    buildSearchIndex() {
        this.searchIndex.clear();
        this.getAllCourses().forEach(course => {
            this.updateSearchIndex(course);
        });
    }

    search(query, options = {}) {
        console.log('Search called with query:', query);
        console.log('Total courses available:', this.getAllCourses().length);
        console.log('Search index size:', this.searchIndex.size);
        
        if (!query || query.trim().length === 0) {
            return this.getAllCourses();
        }

        const {
            category = null,
            difficulty = null,
            minRating = 0,
            maxDuration = null
        } = options;

        // Normalize query
        const normalizedQuery = query.toLowerCase().trim();
        const queryWords = normalizedQuery.split(/\s+/);
        
        console.log('Normalized query:', normalizedQuery);
        console.log('Query words:', queryWords);

        // Find matching courses
        const courseScores = new Map();
        
        queryWords.forEach(word => {
            console.log('Looking for word:', word);
            console.log('Search index has word:', this.searchIndex.has(word));
            
            if (this.searchIndex.has(word)) {
                console.log('Found course IDs for word "' + word + '":', Array.from(this.searchIndex.get(word)));
                this.searchIndex.get(word).forEach(courseId => {
                    const course = this.getCourse(courseId);
                    if (!course) return;

                    let score = courseScores.get(courseId) || 0;
                    
                    // Score based on where the match occurs
                    if (course.title.toLowerCase().includes(word)) score += 10;
                    if (course.tags.some(tag => tag.toLowerCase().includes(word))) score += 5;
                    if (course.description.toLowerCase().includes(word)) score += 3;
                    if (course.category.toLowerCase().includes(word)) score += 2;
                    
                    courseScores.set(courseId, score);
                    console.log('Course "' + course.title + '" got score:', score);
                });
            } else {
                console.log('Word "' + word + '" not found in search index');
                console.log('Available words in index:', Array.from(this.searchIndex.keys()).slice(0, 20));
            }
        });

        // Get matching courses and apply filters
        let results = Array.from(courseScores.keys())
            .map(courseId => ({
                course: this.getCourse(courseId),
                score: courseScores.get(courseId)
            }))
            .filter(({ course }) => {
                if (category && course.category !== category) return false;
                if (difficulty && course.difficulty !== difficulty) return false;
                if (course.rating < minRating) return false;
                if (maxDuration && course.duration > maxDuration) return false;
                return true;
            })
            .sort((a, b) => b.score - a.score)
            .map(({ course }) => course);

        // Track search analytics
        this.analytics.searchQueries.push({
            query: normalizedQuery,
            timestamp: new Date(),
            resultsCount: results.length
        });

        console.log('Search results:', results.length, 'courses found');
        console.log('Result titles:', results.map(course => course.title));
        
        return results;
    }

    // Recommendation System
    calculateRecommendations() {
        const userHistory = this.getUserHistory();
        const allCourses = this.getAllCourses();
        
        allCourses.forEach(course => {
            let score = 0;
            
            // Base score from course popularity
            score += course.rating * 2;
            score += Math.log(course.enrollments + 1);
            
            // Bonus for new courses
            if (course.isNew) score += 5;
            
            // Category-based recommendations
            if (userHistory.categories.size > 0) {
                if (userHistory.categories.has(course.category)) {
                    score += 10;
                }
            }
            
            // Tag-based recommendations
            course.tags.forEach(tag => {
                if (userHistory.tags.has(tag)) {
                    score += 3;
                }
            });
            
            // Difficulty progression
            if (userHistory.difficulty) {
                if (course.difficulty === userHistory.difficulty) {
                    score += 5;
                } else if (this.isNextDifficultyLevel(userHistory.difficulty, course.difficulty)) {
                    score += 8;
                }
            }
            
            this.recommendations.set(course.id, score);
        });
    }

    getRecommendations(limit = 6) {
        return Array.from(this.recommendations.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([courseId]) => this.getCourse(courseId))
            .filter(course => course !== undefined);
    }

    // User Management
    loadUserData() {
        const userData = localStorage.getItem('learningFramework_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        } else {
            this.currentUser = {
                id: this.generateUserId(),
                completedCourses: [],
                inProgressCourses: [],
                preferences: {
                    categories: [],
                    difficulty: 'beginner'
                },
                createdAt: new Date()
            };
            this.saveUserData();
        }
    }

    saveUserData() {
        localStorage.setItem('learningFramework_user', JSON.stringify(this.currentUser));
    }

    getUserHistory() {
        const categories = new Set();
        const tags = new Set();
        let difficulty = null;
        
        // Check if user exists first
        if (!this.currentUser) {
            return { categories, tags, difficulty };
        }
        
        // Ensure arrays exist and normalize property names
        const completedCourses = this.currentUser.completedCourses || this.currentUser.coursesCompleted || [];
        const inProgressCourses = this.currentUser.inProgressCourses || this.currentUser.coursesInProgress || [];
        
        [...completedCourses, ...inProgressCourses]
            .forEach(courseId => {
                const course = this.getCourse(courseId);
                if (course) {
                    categories.add(course.category);
                    course.tags.forEach(tag => tags.add(tag));
                    difficulty = course.difficulty; // Latest difficulty
                }
            });

        return { categories, tags, difficulty };
    }

    // Course Interaction
    startCourse(courseId) {
        const course = this.getCourse(courseId);
        if (!course) {
            console.error('Course not found:', courseId);
            return;
        }

        // Handle coming soon courses
        if (course.path === '#coming-soon') {
            alert('This course is coming soon! Stay tuned for updates.');
            return;
        }

        // Update user progress if authenticated
        if (this.currentUser) {
            if (!this.currentUser.coursesInProgress) {
                this.currentUser.coursesInProgress = [];
            }
            if (!this.currentUser.coursesInProgress.includes(courseId)) {
                this.currentUser.coursesInProgress.push(courseId);
                this.analytics.courseStarted.set(courseId, new Date());
                this.saveUserData();
            }
        }
        
        // Navigate to course
        console.log('Navigating to course:', course.title, 'at', course.path);
        window.location.href = course.path;
    }

    completeCourse(courseId) {
        if (!this.currentUser) return;

        // Initialize arrays if they don't exist
        if (!this.currentUser.coursesInProgress) this.currentUser.coursesInProgress = [];
        if (!this.currentUser.coursesCompleted) this.currentUser.coursesCompleted = [];

        // Remove from in-progress
        this.currentUser.coursesInProgress = this.currentUser.coursesInProgress
            .filter(id => id !== courseId);
        
        // Add to completed
        if (!this.currentUser.coursesCompleted.includes(courseId)) {
            this.currentUser.coursesCompleted.push(courseId);
            this.analytics.courseCompleted.set(courseId, new Date());
        }
        
        this.saveUserData();
        this.calculateRecommendations(); // Recalculate based on new completion
    }

    getCourseProgress(courseId) {
        const progressKey = `course_progress_${courseId}`;
        const progress = localStorage.getItem(progressKey);
        return progress ? JSON.parse(progress) : { completed: 0, total: 1 };
    }

    // Utility Functions
    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    isNextDifficultyLevel(current, next) {
        const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
        const currentIndex = levels.indexOf(current);
        const nextIndex = levels.indexOf(next);
        return nextIndex === currentIndex + 1;
    }

    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        }
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    }

    // Event Handling
    setupEventListeners() {
        // Search functionality
        document.addEventListener('DOMContentLoaded', () => {
            this.setupSearchHandler();
            this.setupFilterHandlers();
            this.setupNavigationHandlers();
        });
    }

    setupSearchHandler() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const query = e.target.value;
                    const results = this.search(query);
                    this.renderSearchResults(results, searchResults);
                }, 300);
            });
        }
    }

    setupFilterHandlers() {
        const filterElements = document.querySelectorAll('[data-filter]');
        
        filterElements.forEach(element => {
            element.addEventListener('change', () => {
                this.applyFilters();
            });
        });
    }

    setupNavigationHandlers() {
        // Course card click handlers
        document.addEventListener('click', (e) => {
            const courseCard = e.target.closest('[data-course-id]');
            if (courseCard) {
                const courseId = courseCard.dataset.courseId;
                this.startCourse(courseId);
            }
        });
    }

    // Rendering Functions
    renderSearchResults(results, container) {
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-muted">No courses found. Try different keywords.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = results.map(course => this.renderCourseCard(course)).join('');
    }

    renderCourseCard(course) {
        const progress = this.getCourseProgress(course.id);
        const progressPercent = Math.round((progress.completed / progress.total) * 100);
        const user = this.currentUser || { coursesCompleted: [], coursesInProgress: [] };
        const isCompleted = user.coursesCompleted && user.coursesCompleted.includes(course.id);
        const isInProgress = user.coursesInProgress && user.coursesInProgress.includes(course.id);

        return `
            <div class="card course-card" data-course-id="${course.id}">
                <div class="card-header">
                    <img src="${course.thumbnail}" alt="${course.title}" class="course-thumbnail">
                    <div class="course-badges">
                        ${course.isNew ? '<span class="badge badge-info">New</span>' : ''}
                        ${course.isFeatured ? '<span class="badge badge-warning">Featured</span>' : ''}
                        ${isCompleted ? '<span class="badge badge-success">Completed</span>' : ''}
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description">${course.description}</p>
                    
                    <div class="course-meta">
                        <span class="course-category tag">${course.category}</span>
                        <span class="course-difficulty tag">${course.difficulty}</span>
                        <span class="course-duration text-muted">${this.formatDuration(course.duration)}</span>
                    </div>
                    
                    <div class="course-stats">
                        <div class="rating">
                            ${this.renderStarRating(course.rating)}
                            <span class="rating-value">${course.rating}</span>
                        </div>
                        <span class="enrollments">${course.enrollments} students</span>
                    </div>
                    
                    ${isInProgress ? `
                        <div class="progress-container">
                            <div class="progress">
                                <div class="progress-bar" style="width: ${progressPercent}%"></div>
                            </div>
                            <span class="progress-text">${progressPercent}% complete</span>
                        </div>
                    ` : ''}
                    
                    <div class="course-tags">
                        ${course.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary" onclick="window.learningFramework.startCourse('${course.id}')">
                        ${isCompleted ? 'Review' : isInProgress ? 'Continue Learning' : 'Start Course'}
                    </button>
                </div>
            </div>
        `;
    }

    renderStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return [
            '★'.repeat(fullStars),
            hasHalfStar ? '☆' : '',
            '☆'.repeat(emptyStars)
        ].join('');
    }

    // Default Course Data
    loadCourses() {
        console.log('Loading courses...');
        // Register the n8n courses
        this.registerCourse({
            id: 'n8n-crash-course',
            title: 'n8n Crash Course',
            description: 'Master workflow automation with n8n in this comprehensive crash course. Learn to build powerful integrations without code.',
            category: 'Automation',
            difficulty: 'beginner',
            duration: 45,
            tags: ['automation', 'no-code', 'workflows', 'integration', 'productivity'],
            learningObjectives: [
                'Understand n8n fundamentals and core concepts',
                'Build automated workflows with nodes and triggers',
                'Integrate different services and APIs',
                'Apply best practices for workflow design'
            ],
            instructor: 'AI Learning Assistant',
            rating: 4.8,
            enrollments: 1247,
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY3ZWVhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5uOG48L3RleHQ+PC9zdmc+',
            path: './courses/n8n/index.html',
            isFeatured: true,
            isNew: true
        });

        this.registerCourse({
            id: 'n8n-intermediate',
            title: 'Intermediate n8n Course',
            description: 'Take your n8n skills to the next level. Learn advanced automation patterns, error handling, and complex integrations.',
            category: 'Automation',
            difficulty: 'intermediate',
            duration: 90,
            tags: ['automation', 'no-code', 'advanced-workflows', 'error-handling', 'complex-integrations', 'n8n'],
            learningObjectives: [
                'Master advanced n8n nodes and expressions',
                'Implement robust error handling and monitoring',
                'Build complex multi-step automation workflows',
                'Optimize workflow performance and reliability',
                'Create reusable workflow templates and sub-workflows'
            ],
            instructor: 'AI Learning Assistant',
            rating: 4.9,
            enrollments: 743,
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NjdlZWE7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOWM0MWZmO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiLz48dGV4dCB4PSI1MCUiIHk9IjQwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPm44bjwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkludGVybWVkaWF0ZTwvdGV4dD48L3N2Zz4=',
            path: './courses/n8n-intermediate/index.html',
            isFeatured: true,
            isNew: true
        });

        this.registerCourse({
            id: 'n8n-advanced',
            title: 'Advanced n8n Course',
            description: 'Master enterprise-level n8n automation. Learn microservices integration, advanced security, custom nodes, and large-scale deployment strategies.',
            category: 'Automation',
            difficulty: 'advanced',
            duration: 150,
            tags: ['automation', 'enterprise', 'microservices', 'security', 'custom-nodes', 'deployment', 'n8n-expert'],
            learningObjectives: [
                'Build enterprise-grade automation architectures',
                'Create custom nodes and advanced integrations',
                'Implement security best practices and compliance',
                'Design scalable microservices automation patterns',
                'Master advanced deployment and DevOps strategies',
                'Optimize for high-availability and disaster recovery'
            ],
            instructor: 'AI Learning Assistant',
            rating: 4.95,
            enrollments: 389,
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImFkdmFuY2VkIiBjeD0iNTAlIiBjeT0iNTAlIiByPSI1MCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZjZiNmI7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIzMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NjdlZWE7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMWExYTJlO3N0b3Atb3BhY2l0eToxIiAvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYWR2YW5jZWQpIi8+PHRleHQgeD0iNTAlIiB5PSIzNSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtd2VpZ2h0PSJib2xkIj5uOG48L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFEVkFOQ0VEPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNzAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FbnRlcnByaXNlPC90ZXh0Pjwvc3ZnPg==',
            path: './courses/n8n-advanced/index.html',
            isFeatured: true,
            isNew: true
        });

        // Add some placeholder courses for demonstration
        this.registerCourse({
            id: 'zapier-automation',
            title: 'Zapier Automation Mastery',
            description: 'Learn to automate your workflow with Zapier. Connect apps and automate repetitive tasks.',
            category: 'Automation',
            difficulty: 'beginner',
            duration: 60,
            tags: ['automation', 'zapier', 'integration', 'productivity'],
            instructor: 'AI Learning Assistant',
            rating: 4.6,
            enrollments: 892,
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY2YjZiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5aYXBpZXI8L3RleHQ+PC9zdmc+',
            path: '#coming-soon'
        });

        this.registerCourse({
            id: 'python-basics',
            title: 'Python Programming Fundamentals',
            description: 'Start your coding journey with Python. Learn the basics of programming and build real projects.',
            category: 'Programming',
            difficulty: 'beginner',
            duration: 120,
            tags: ['python', 'programming', 'coding', 'fundamentals'],
            instructor: 'AI Learning Assistant',
            rating: 4.9,
            enrollments: 2341,
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc3NmFiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QeXRob248L3RleHQ+PC9zdmc+',
            path: '#coming-soon',
            isFeatured: true
        });

        this.registerCourse({
            id: 'react-fundamentals',
            title: 'React.js Fundamentals',
            description: 'Build modern web applications with React. Learn components, state management, and hooks.',
            category: 'Web Development',
            difficulty: 'intermediate',
            duration: 150,
            tags: ['react', 'javascript', 'web-development', 'frontend'],
            instructor: 'AI Learning Assistant',
            rating: 4.7,
            enrollments: 1876,
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjFkYWZiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMiIgZmlsbD0iIzIxMzU0NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlYWN0PC90ZXh0Pjwvc3ZnPg==',
            path: '#coming-soon'
        });

        this.registerCourse({
            id: 'data-analysis',
            title: 'Data Analysis with Excel',
            description: 'Master data analysis techniques using Microsoft Excel. From basics to advanced analytics.',
            category: 'Data Science',
            difficulty: 'beginner',
            duration: 90,
            tags: ['excel', 'data-analysis', 'spreadsheets', 'business'],
            instructor: 'AI Learning Assistant',
            rating: 4.5,
            enrollments: 1543,
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjE3MzQ2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FeGNlbDwvdGV4dD48L3N2Zz4=',
            path: '#coming-soon'
        });

        this.registerCourse({
            id: 'machine-learning',
            title: 'Introduction to Machine Learning',
            description: 'Discover the world of AI and machine learning. Build your first predictive models.',
            category: 'Data Science',
            difficulty: 'intermediate',
            duration: 180,
            tags: ['machine-learning', 'ai', 'python', 'data-science'],
            instructor: 'AI Learning Assistant',
            rating: 4.8,
            enrollments: 987,
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOWM0MWZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BSTwvdGV4dD48L3N2Zz4=',
            path: '#coming-soon',
            isFeatured: true
        });
        
        console.log('Courses loaded. Total:', this.getAllCourses().length);
        console.log('Search index built. Index size:', this.searchIndex.size);
        console.log('Course titles:', this.getAllCourses().map(c => c.title));
        
        // Rebuild search index to make sure it's current
        this.buildSearchIndex();
        console.log('Search index rebuilt. New size:', this.searchIndex.size);
    }
}

// Initialize the framework when DOM is loaded
window.learningFramework = new LearningFramework();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearningFramework;
}