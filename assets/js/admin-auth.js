/**
 * CLOVER DIGITAL - Admin Authentication System
 * Multi-user admin login, session, and access control
 */

const AdminAuth = {
    SESSION_KEY: 'clover_admin_session',
    SESSION_EXPIRY_KEY: 'clover_admin_expiry',
    REMEMBER_ME_KEY: 'clover_admin_remember',
    SESSION_TIMEOUT: 8 * 60 * 60 * 1000,

    // Authorized admin users (in production, use server-side auth)
    ADMIN_USERS: [
        { name: 'Obsan',  email: 'obsan@cloverdigital.com',  password: 'CloverObsan2026!',  role: 'Admin' },
        { name: 'Ali',    email: 'ali@cloverdigital.com',    password: 'CloverAli2026!',    role: 'Admin' },
        { name: 'Zubair', email: 'zubair@cloverdigital.com', password: 'CloverZubair2026!', role: 'Admin' },
        { name: 'Musab',  email: 'musab@cloverdigital.com',  password: 'CloverMusab2026!',  role: 'Admin' }
    ],

    /**
     * Validate credentials against all admin users
     * @returns {object|null} matched user object or null
     */
    validateCredentials(email, password) {
        const user = this.ADMIN_USERS.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        return user || null;
    },

    /**
     * Set admin session after successful login
     */
    setSession(user, rememberMe = false) {
        const sessionData = {
            email: user.email,
            name: user.name,
            role: user.role,
            loginTime: new Date().getTime(),
            isAuthenticated: true
        };

        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));

        const expiryTime = new Date().getTime() + this.SESSION_TIMEOUT;
        sessionStorage.setItem(this.SESSION_EXPIRY_KEY, expiryTime.toString());

        if (rememberMe) {
            localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
            localStorage.setItem(this.SESSION_EXPIRY_KEY, expiryTime.toString());
        } else {
            localStorage.removeItem(this.REMEMBER_ME_KEY);
            localStorage.removeItem(this.SESSION_KEY);
        }
    },

    isLoggedIn() {
        let sessionData = sessionStorage.getItem(this.SESSION_KEY);
        let expiryTime = sessionStorage.getItem(this.SESSION_EXPIRY_KEY);

        if (!sessionData) {
            sessionData = localStorage.getItem(this.SESSION_KEY);
            expiryTime = localStorage.getItem(this.SESSION_EXPIRY_KEY);
        }

        if (!sessionData || !expiryTime) return false;

        if (new Date().getTime() > parseInt(expiryTime)) {
            this.clearSession();
            return false;
        }
        return true;
    },

    getAdminEmail() {
        let sessionData = sessionStorage.getItem(this.SESSION_KEY);
        if (!sessionData) sessionData = localStorage.getItem(this.SESSION_KEY);
        if (sessionData) {
            try { return JSON.parse(sessionData).email; } catch (e) { return null; }
        }
        return null;
    },

    getAdminName() {
        let sessionData = sessionStorage.getItem(this.SESSION_KEY);
        if (!sessionData) sessionData = localStorage.getItem(this.SESSION_KEY);
        if (sessionData) {
            try { return JSON.parse(sessionData).name; } catch (e) { return null; }
        }
        return null;
    },

    clearSession() {
        sessionStorage.removeItem(this.SESSION_KEY);
        sessionStorage.removeItem(this.SESSION_EXPIRY_KEY);
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.SESSION_EXPIRY_KEY);
        localStorage.removeItem(this.REMEMBER_ME_KEY);
    },

    requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = 'admin-login.html';
        }
    },

    extendSession() {
        if (this.isLoggedIn()) {
            const expiryTime = new Date().getTime() + this.SESSION_TIMEOUT;
            sessionStorage.setItem(this.SESSION_EXPIRY_KEY, expiryTime.toString());
            if (localStorage.getItem(this.REMEMBER_ME_KEY)) {
                localStorage.setItem(this.SESSION_EXPIRY_KEY, expiryTime.toString());
            }
        }
    }
};

let activityTimer = null;
function resetActivityTimer() {
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        AdminAuth.extendSession();
    }, 2 * 60 * 1000);
}

['mousemove', 'keypress', 'click', 'scroll'].forEach(evt => {
    document.addEventListener(evt, resetActivityTimer);
});
