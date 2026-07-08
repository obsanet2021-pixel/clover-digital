/**
 * CLOVER DIGITAL - Admin Dashboard
 * Dashboard navigation, portfolio CRUD via Supabase, notifications
 */

AdminAuth.requireLogin();

document.addEventListener('DOMContentLoaded', async () => {
    initializeDashboard();
    setupEventListeners();
    updateAdminInfo();
    await ensureStorageBucket();
    renderPortfolioTable();
});

function initializeDashboard() {
    const currentSection = window.location.hash?.replace('#', '') || 'dashboard';
    navigateToSection(currentSection);
}

function setupEventListeners() {
    document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            navigateToSection(section);
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            if (window.innerWidth <= 768) document.body.classList.remove('sidebar-open');
        });
    });

    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) sidebarToggle.addEventListener('click', () => document.body.classList.toggle('sidebar-open'));

    document.querySelectorAll('#logoutBtn, #logoutBtnTop').forEach(btn => {
        btn.addEventListener('click', logout);
    });

    setupProfileDropdown();
}

function navigateToSection(section) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    const el = document.getElementById(`${section}-section`);
    if (el) el.classList.add('active');

    const titleMap = {
        'dashboard': 'Dashboard',
        'portfolio': 'Portfolio Gallery',
        'services': 'Services Management',
        'team': 'Team Management',
        'content': 'Website Content',
        'analytics': 'Analytics & Reports',
        'settings': 'Settings'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle && titleMap[section]) pageTitle.textContent = titleMap[section];
    window.location.hash = section;
}

function updateAdminInfo() {
    const name = AdminAuth.getAdminName();
    const email = AdminAuth.getAdminEmail();
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl && name) adminNameEl.textContent = name;

    const settingsEmail = document.getElementById('settingsEmail');
    if (settingsEmail && email) settingsEmail.value = email;
    const settingsName = document.getElementById('settingsName');
    if (settingsName && name) settingsName.value = name;
}

/* ═══════════════════════════════════════
   PORTFOLIO CRUD (Supabase)
═══════════════════════════════════════ */

const CATEGORY_LABELS = {
    web: 'Web Development',
    design: 'UI Design',
    marketing: 'Digital Marketing',
    graphic: 'Graphic Design'
};

async function getProjects() {
    try {
        const { data, error } = await supabaseClient
            .from('portfolio_projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.error('Error:', e);
        return [];
    }
}

async function renderPortfolioTable() {
    const tbody = document.getElementById('portfolioTableBody');
    const noMsg = document.getElementById('noPortfolioMsg');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#64748b;">Loading projects...</td></tr>';

    const projects = await getProjects();
    if (projects.length === 0) {
        tbody.innerHTML = '';
        if (noMsg) noMsg.style.display = 'block';
        return;
    }
    if (noMsg) noMsg.style.display = 'none';

    tbody.innerHTML = projects.map(p => `
        <tr>
            <td><strong>${escapeHtml(p.title)}</strong></td>
            <td>${CATEGORY_LABELS[p.category] || p.category}</td>
            <td>${p.price ? escapeHtml(p.price) + ' ETB' : '—'}</td>
            <td><span class="badge badge-${p.status === 'published' ? 'success' : 'warning'}">${p.status === 'published' ? 'Published' : 'Draft'}</span></td>
            <td>${new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            <td>
                <button class="btn-icon" title="Edit" onclick="editProject('${p.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" title="Delete" onclick="deleteProject('${p.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    const statEl = document.querySelector('.stat-number');
    if (statEl) statEl.textContent = projects.filter(p => p.status === 'published').length;
}

function previewProjectImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image too large. Maximum size is 5MB.', 'error');
        event.target.value = '';
        return;
    }

    const preview = document.getElementById('imagePreview');
    const previewImg = preview.querySelector('img');
    const reader = new FileReader();

    reader.onload = function(e) {
        previewImg.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function openPortfolioModal(project) {
    const modal = document.getElementById('portfolioModal');
    const title = document.getElementById('portfolioModalTitle');
    document.getElementById('portfolioForm').reset();
    document.getElementById('projectId').value = '';

    // Reset file upload and preview
    document.getElementById('projectImageUpload').value = '';
    const preview = document.getElementById('imagePreview');
    preview.style.display = 'none';
    preview.querySelector('img').src = '';

    if (project) {
        title.textContent = 'Edit Project';
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDesc').value = project.description;
        document.getElementById('projectCategory').value = project.category;
        document.getElementById('projectStatus').value = project.status;
        document.getElementById('projectImage').value = project.image || '';
        document.getElementById('projectPrice').value = project.price || '';
        document.getElementById('projectClient').value = project.client || '';

        // Show existing image preview if there's a URL
        if (project.image) {
            const preview = document.getElementById('imagePreview');
            const previewImg = preview.querySelector('img');
            previewImg.src = project.image;
            preview.style.display = 'block';
        }
    } else {
        title.textContent = 'Add New Project';
    }
    modal.style.display = 'flex';
}

function closePortfolioModal() {
    document.getElementById('portfolioModal').style.display = 'none';
}

const STORAGE_BUCKET = 'portfolio-images';

async function ensureStorageBucket() {
    try {
        const { error } = await supabaseClient.storage.createBucket(STORAGE_BUCKET, {
            public: true,
            fileSizeLimit: 5 * 1024 * 1024
        });
        // 'already exists' is fine — bucket is ready
        if (error && !error.message.includes('already exists')) {
            console.warn('Could not auto-create storage bucket:', error.message);
        }
    } catch (e) {
        console.warn('Storage bucket check skipped:', e.message);
    }
}

async function uploadImage(file) {
    const ext = file.name.split('.').pop();
    const fileName = `portfolio/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { data, error } = await supabaseClient.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        if (error.message.includes('Bucket not found') || error.statusCode === '404') {
            throw new Error(
                'Storage bucket "' + STORAGE_BUCKET + '" not found. '
                + 'Please create it in your Supabase dashboard under Storage, '
                + 'then enable public access.'
            );
        }
        throw error;
    }

    const { data: urlData } = supabaseClient.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

    return urlData.publicUrl;
}

async function saveProject(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

    const id = document.getElementById('projectId').value;
    const fileInput = document.getElementById('projectImageUpload');
    const file = fileInput.files[0];

    try {
        // If a new file was selected, upload it to Supabase Storage
        if (file) {
            try {
                const publicUrl = await uploadImage(file);
                document.getElementById('projectImage').value = publicUrl;
            } catch (uploadErr) {
                console.error('Image upload failed:', uploadErr);
                showNotification('Image upload failed: ' + uploadErr.message, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                return;
            }
        }

        const projectData = {
            title: document.getElementById('projectTitle').value.trim(),
            description: document.getElementById('projectDesc').value.trim(),
            category: document.getElementById('projectCategory').value,
            status: document.getElementById('projectStatus').value,
            image: document.getElementById('projectImage').value.trim(),
            price: document.getElementById('projectPrice').value.trim(),
            client: document.getElementById('projectClient').value.trim(),
            created_by: AdminAuth.getAdminName(),
            updated_at: new Date().toISOString()
        };

        if (id) {
            const { error } = await supabaseClient
                .from('portfolio_projects')
                .update(projectData)
                .eq('id', id);

            if (error) throw error;
            showNotification('Project updated successfully', 'success');
        } else {
            const { error } = await supabaseClient
                .from('portfolio_projects')
                .insert([projectData]);

            if (error) throw error;
            showNotification('Project added successfully', 'success');
        }

        await renderPortfolioTable();
        closePortfolioModal();
    } catch (err) {
        console.error('Save error:', err);
        showNotification('Error saving project: ' + err.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function editProject(id) {
    const { data: project, error } = await supabaseClient
        .from('portfolio_projects')
        .select('*')
        .eq('id', id)
        .single();

    if (project) openPortfolioModal(project);
}

async function deleteProject(id) {
    if (!confirm('Delete this project? This cannot be undone.')) return;

    try {
        const { error } = await supabaseClient
            .from('portfolio_projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await renderPortfolioTable();
        showNotification('Project deleted', 'success');
    } catch (err) {
        console.error('Delete error:', err);
        showNotification('Error deleting project: ' + err.message, 'error');
    }
}

async function exportPortfolio() {
    const projects = await getProjects();
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'clover-portfolio-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    showNotification('Portfolio exported as JSON', 'success');
}

/* ═══════════════════════════════════════
   UTILITIES
═══════════════════════════════════════ */

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function setupProfileDropdown() {
    const profileInfo = document.querySelector('.profile-info');
    const profileMenu = document.querySelector('.profile-menu');
    if (profileInfo && profileMenu) {
        profileInfo.addEventListener('click', () => {
            profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.admin-profile')) profileMenu.style.display = 'none';
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<div class="notification-content"><span>${message}</span><button class="notification-close">&times;</button></div>`;
    document.body.appendChild(notification);
    notification.querySelector('.notification-close').addEventListener('click', () => notification.remove());
    setTimeout(() => notification.remove(), 4000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        AdminAuth.clearSession();
        window.location.href = 'admin-login.html';
    }
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) document.body.classList.remove('sidebar-open');
});
