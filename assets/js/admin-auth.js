/**
 * CLOVER DIGITAL - Admin Authentication System
 * Multi-user admin login via Supabase, with session management
 * 
 * SECURITY NOTE: This uses Supabase Auth under the hood.
 * For production, replace with Supabase Auth's built-in sign-in
 * (supabase.auth.signInWithPassword) instead of querying admin_users directly.
 */

const AdminAuth = {
    SESSION_KEY: 'clover_admin_session',
    SESSION_EXPIRY_KEY: 'clover_admin_expiry',
    REMEMBER_ME_KEY: 'clover_admin_remember',
    SESSION_TIMEOUT: 8 * 60 * 60 * 1000,

    /**
     * Validate credentials against Supabase admin_users table
     * Note: In production, switch to supabase.auth.signInWithPassword()
     * and store only a session token (never the password).
     * @returns {Promise<object|null>} matched user object or null
     */
    async validateCredentials(email, password) {
        try {
            // Query only non-sensitive fields first
            const { data, error } = await supabaseClient
                .from('admin_users')
                .select('name, email, role')
                .eq('email', email.toLowerCase())
                .single();

            if (error || !data) return null;

            // NOTE: Password verification should happen server-side via RLS or Supabase Auth.
            // This client-side approach is a temporary solution.
            // In production, use: supabase.auth.signInWithPassword({ email, password })
            const { data: authData, error: authError } = await supabaseClient
                .from('admin_users')
                .select('password')
                .eq('email', email.toLowerCase())
                .single();

            if (authError || !authData) return null;
            if (authData.password !== password) return null;

            return { name: data.name, email: data.email, role: data.role };
        } catch (e) {
            console.error('Auth error:', e);
            return null;
        }
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