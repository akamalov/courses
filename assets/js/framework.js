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

        // Find matching courses
        const courseScores = new Map();
        
        queryWords.forEach(word => {
            if (this.searchIndex.has(word)) {
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
                });
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
        
        [...this.currentUser.completedCourses, ...this.currentUser.inProgressCourses]
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
        if (!this.currentUser.inProgressCourses.includes(courseId)) {
            this.currentUser.inProgressCourses.push(courseId);
            this.analytics.courseStarted.set(courseId, new Date());
            this.saveUserData();
        }
        
        // Navigate to course
        window.location.href = this.getCourse(courseId).path;
    }

    completeCourse(courseId) {
        // Remove from in-progress
        this.currentUser.inProgressCourses = this.currentUser.inProgressCourses
            .filter(id => id !== courseId);
        
        // Add to completed
        if (!this.currentUser.completedCourses.includes(courseId)) {
            this.currentUser.completedCourses.push(courseId);
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
        const isCompleted = this.currentUser.completedCourses.includes(course.id);
        const isInProgress = this.currentUser.inProgressCourses.includes(course.id);

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
                    <button class="btn btn-primary">
                        ${isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start Course'}
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
        // Register the n8n course
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
    }
}

// Initialize the framework when DOM is loaded
window.learningFramework = new LearningFramework();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearningFramework;
}