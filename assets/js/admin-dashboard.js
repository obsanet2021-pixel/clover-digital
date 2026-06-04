/**
 * CLOVER DIGITAL - Admin Dashboard
 * Handles dashboard functionality and navigation
 */

// Ensure user is logged in
AdminAuth.requireLogin();

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    updateAdminInfo();
});

/**
 * Initialize dashboard components
 */
function initializeDashboard() {
    // Set active nav link based on URL hash or default to dashboard
    const currentSection = window.location.hash?.replace('#', '') || 'dashboard';
    navigateToSection(currentSection);
}

/**
 * Setup event listeners for dashboard interactions
 */
function setupEventListeners() {
    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            navigateToSection(section);
            
            // Update active state
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.body.classList.remove('sidebar-open');
            }
        });
    });

    // Sidebar toggle button (mobile)
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-open');
        });
    }

    // Logout buttons
    const logoutBtns = document.querySelectorAll('#logoutBtn, #logoutBtnTop');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            logout();
        });
    });

    // Add new buttons (portfolio, services, team)
    const addPortfolioBtn = document.getElementById('addPortfolioBtn');
    const addServiceBtn = document.getElementById('addServiceBtn');
    const addTeamBtn = document.getElementById('addTeamBtn');

    if (addPortfolioBtn) {
        addPortfolioBtn.addEventListener('click', () => {
            showModal('Add New Portfolio Item', 'portfolio-form');
        });
    }

    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', () => {
            showModal('Add New Service', 'service-form');
        });
    }

    if (addTeamBtn) {
        addTeamBtn.addEventListener('click', () => {
            showModal('Add Team Member', 'team-form');
        });
    }

    // Action buttons (edit/delete)
    setupTableActions();

    // Profile dropdown
    setupProfileDropdown();
}

/**
 * Navigate to a section and show/hide content
 * @param {string} section - Section name (dashboard, portfolio, services, etc.)
 */
function navigateToSection(section) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => sec.classList.remove('active'));

    // Show selected section
    const selectedSection = document.getElementById(`${section}-section`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    const titleMap = {
        'dashboard': 'Dashboard',
        'portfolio': 'Portfolio Management',
        'services': 'Services Management',
        'team': 'Team Management',
        'content': 'Website Content',
        'analytics': 'Analytics & Reports',
        'settings': 'Settings'
    };
    
    if (pageTitle && titleMap[section]) {
        pageTitle.textContent = titleMap[section];
    }

    // Update URL
    window.location.hash = section;
}

/**
 * Update admin information display
 */
function updateAdminInfo() {
    const email = AdminAuth.getAdminEmail();
    const adminNameElement = document.getElementById('adminName');
    
    if (adminNameElement && email) {
        // Extract name from email (before @)
        const name = email.split('@')[0];
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        adminNameElement.textContent = formattedName;
    }

    // Update settings form with current email
    const settingsEmail = document.getElementById('settingsEmail');
    if (settingsEmail && email) {
        settingsEmail.value = email;
    }
}

/**
 * Setup profile dropdown
 */
function setupProfileDropdown() {
    const profileInfo = document.querySelector('.profile-info');
    const profileMenu = document.querySelector('.profile-menu');

    if (profileInfo && profileMenu) {
        profileInfo.addEventListener('click', () => {
            profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.admin-profile')) {
                profileMenu.style.display = 'none';
            }
        });
    }
}

/**
 * Setup table action buttons (edit/delete)
 */
function setupTableActions() {
    // Edit buttons
    document.querySelectorAll('.btn-icon[title="Edit"]').forEach(btn => {
        btn.addEventListener('click', () => {
            showNotification('Edit functionality would be implemented here', 'info');
        });
    });

    // Delete buttons
    document.querySelectorAll('.btn-icon[title="Delete"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this item?')) {
                showNotification('Item deleted successfully', 'success');
            }
        });
    });
}

/**
 * Show a modal dialog
 * @param {string} title - Modal title
 * @param {string} formType - Type of form to show
 */
function showModal(title, formType) {
    // This would implement modal functionality
    showNotification(`${title} - Modal would open here`, 'info');
}

/**
 * Show notification/toast message
 * @param {string} message - Notification message
 * @param {string} type - Type: success, error, info, warning
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

/**
 * Logout admin user
 */
function logout() {
    // Confirm logout
    if (confirm('Are you sure you want to logout?')) {
        AdminAuth.clearSession();
        window.location.href = 'admin-login.html';
    }
}

/**
 * Handle window resize for responsive behavior
 */
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        document.body.classList.remove('sidebar-open');
    }
});
