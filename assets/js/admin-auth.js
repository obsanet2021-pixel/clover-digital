/**
 * CLOVER DIGITAL - Admin Authentication System
 * Manages admin login, session, and access control
 */

const AdminAuth = {
    // Session configuration
    SESSION_KEY: 'clover_admin_session',
    SESSION_EXPIRY_KEY: 'clover_admin_expiry',
    REMEMBER_ME_KEY: 'clover_admin_remember',
    SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    
    // Admin credentials (in production, this should be handled server-side)
    ADMIN_CREDENTIALS: {
        email: 'admin@cloverdigital.com',
        password: 'SecureAdmin123!' // Change this to a strong password
    },

    /**
     * Validate admin credentials
     * @param {string} email - Admin email
     * @param {string} password - Admin password
     * @returns {boolean} - True if credentials are valid
     */
    validateCredentials(email, password) {
        return email === this.ADMIN_CREDENTIALS.email && 
               password === this.ADMIN_CREDENTIALS.password;
    },

    /**
     * Set admin session after successful login
     * @param {string} email - Admin email
     * @param {boolean} rememberMe - Whether to persist session
     */
    setSession(email, rememberMe = false) {
        const sessionData = {
            email: email,
            loginTime: new Date().getTime(),
            isAuthenticated: true
        };

        // Store session in sessionStorage (cleared when browser closes)
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        
        // Set expiry time
        const expiryTime = new Date().getTime() + this.SESSION_TIMEOUT;
        sessionStorage.setItem(this.SESSION_EXPIRY_KEY, expiryTime.toString());

        // Store in localStorage if "Remember Me" is checked
        if (rememberMe) {
            localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
            localStorage.setItem(this.SESSION_EXPIRY_KEY, expiryTime.toString());
        } else {
            localStorage.removeItem(this.REMEMBER_ME_KEY);
            localStorage.removeItem(this.SESSION_KEY);
        }
    },

    /**
     * Check if admin is logged in and session is valid
     * @returns {boolean} - True if admin has valid session
     */
    isLoggedIn() {
        let sessionData = sessionStorage.getItem(this.SESSION_KEY);
        let expiryTime = sessionStorage.getItem(this.SESSION_EXPIRY_KEY);

        // Check localStorage if sessionStorage is empty (for "Remember Me")
        if (!sessionData) {
            sessionData = localStorage.getItem(this.SESSION_KEY);
            expiryTime = localStorage.getItem(this.SESSION_EXPIRY_KEY);
        }

        if (!sessionData || !expiryTime) {
            return false;
        }

        // Check if session has expired
        const currentTime = new Date().getTime();
        if (currentTime > parseInt(expiryTime)) {
            this.clearSession();
            return false;
        }

        return true;
    },

    /**
     * Get current admin email
     * @returns {string|null} - Admin email or null if not logged in
     */
    getAdminEmail() {
        let sessionData = sessionStorage.getItem(this.SESSION_KEY);
        if (!sessionData) {
            sessionData = localStorage.getItem(this.SESSION_KEY);
        }

        if (sessionData) {
            try {
                const data = JSON.parse(sessionData);
                return data.email;
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    /**
     * Clear admin session (logout)
     */
    clearSession() {
        sessionStorage.removeItem(this.SESSION_KEY);
        sessionStorage.removeItem(this.SESSION_EXPIRY_KEY);
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.SESSION_EXPIRY_KEY);
        localStorage.removeItem(this.REMEMBER_ME_KEY);
    },

    /**
     * Redirect to login if not authenticated
     * Used on admin pages to ensure access control
     */
    requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = 'admin-login.html';
        }
    },

    /**
     * Extend session timeout (refresh on activity)
     */
    extendSession() {
        if (this.isLoggedIn()) {
            const expiryTime = new Date().getTime() + this.SESSION_TIMEOUT;
            sessionStorage.setItem(this.SESSION_EXPIRY_KEY, expiryTime.toString());
            
            // Also update localStorage if "Remember Me" is enabled
            if (localStorage.getItem(this.REMEMBER_ME_KEY)) {
                localStorage.setItem(this.SESSION_EXPIRY_KEY, expiryTime.toString());
            }
        }
    }
};

/**
 * Auto-extend session on user activity
 */
let activityTimer = null;

function resetActivityTimer() {
    clearTimeout(activityTimer);
    
    // Extend session after 2 minutes of inactivity
    activityTimer = setTimeout(() => {
        AdminAuth.extendSession();
    }, 2 * 60 * 1000);
}

// Track user activity
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        document.addEventListener('mousemove', resetActivityTimer);
        document.addEventListener('keypress', resetActivityTimer);
        document.addEventListener('click', resetActivityTimer);
        resetActivityTimer();
    });
} else {
    document.addEventListener('mousemove', resetActivityTimer);
    document.addEventListener('keypress', resetActivityTimer);
    document.addEventListener('click', resetActivityTimer);
    resetActivityTimer();
}
