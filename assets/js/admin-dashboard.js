/**
 * CLOVER DIGITAL - Admin Dashboard
 * Dashboard navigation, portfolio CRUD via Supabase, notifications
 */

AdminAuth.requireLogin();

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    updateAdminInfo();
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

const STORAGE_BUCKET = 'portfolio-images';
let uploadedImageUrl = '';

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

/* ═══════════════════════════════════════
   IMAGE UPLOAD
═══════════════════════════════════════ */

function initImageUpload() {
    const dropzone = document.getElementById('imageDropzone');
    const fileInput = document.getElementById('projectImageFile');
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.querySelector('.browse-link')?.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleImageFile(file);
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImageFile(file);
    });
}

function switchImageTab(tab) {
    document.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.upload-tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById('uploadTabContent').style.display = tab === 'upload' ? 'block' : 'none';
    document.getElementById('urlTabContent').style.display = tab === 'url' ? 'block' : 'none';
}

async function handleImageFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
        showNotification('Image must be under 5 MB', 'error');
        return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
        showNotification('Only JPG, PNG, and WebP files are supported', 'error');
        return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => showImagePreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    await uploadImageToStorage(file);
}

async function uploadImageToStorage(file) {
    const progressEl = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const statusText = document.getElementById('uploadStatusText');
    const dropzone = document.getElementById('imageDropzone');

    progressEl.style.display = 'flex';
    dropzone.style.display = 'none';
    progressFill.style.width = '30%';
    statusText.textContent = 'Uploading...';

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `projects/${fileName}`;

    try {
        progressFill.style.width = '60%';
        const { data, error } = await supabaseClient.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        progressFill.style.width = '90%';
        statusText.textContent = 'Getting public URL...';

        const { data: urlData } = supabaseClient.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filePath);

        uploadedImageUrl = urlData.publicUrl;
        progressFill.style.width = '100%';
        statusText.textContent = 'Upload complete!';

        setTimeout(() => {
            progressEl.style.display = 'none';
            dropzone.style.display = 'flex';
        }, 1000);

        showNotification('Image uploaded successfully', 'success');
    } catch (err) {
        console.error('Upload error:', err);
        progressEl.style.display = 'none';
        dropzone.style.display = 'flex';
        showNotification('Upload failed: ' + err.message, 'error');
        uploadedImageUrl = '';
    }
}

function showImagePreview(src) {
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('imagePreviewImg');
    if (preview && img) {
        img.src = src;
        preview.style.display = 'flex';
    }
}

function removeImagePreview() {
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('imagePreviewImg');
    const fileInput = document.getElementById('projectImageFile');
    if (preview) preview.style.display = 'none';
    if (img) img.src = '';
    if (fileInput) fileInput.value = '';
    uploadedImageUrl = '';
    document.getElementById('projectImage').value = '';
}

function openPortfolioModal(project) {
    const modal = document.getElementById('portfolioModal');
    const title = document.getElementById('portfolioModalTitle');
    document.getElementById('portfolioForm').reset();
    document.getElementById('projectId').value = '';
    uploadedImageUrl = '';
    removeImagePreview();
    switchImageTab('upload');

    if (project) {
        title.textContent = 'Edit Project';
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDesc').value = project.description;
        document.getElementById('projectCategory').value = project.category;
        document.getElementById('projectStatus').value = project.status;
        document.getElementById('projectPrice').value = project.price || '';
        document.getElementById('projectClient').value = project.client || '';
        if (project.image) {
            uploadedImageUrl = project.image;
            showImagePreview(project.image);
        }
    } else {
        title.textContent = 'Add New Project';
    }
    modal.style.display = 'flex';
    initImageUpload();
}

function closePortfolioModal() {
    document.getElementById('portfolioModal').style.display = 'none';
}

async function saveProject(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    const id = document.getElementById('projectId').value;
    const imageUrl = uploadedImageUrl || document.getElementById('projectImage').value.trim();

    const projectData = {
        title: document.getElementById('projectTitle').value.trim(),
        description: document.getElementById('projectDesc').value.trim(),
        category: document.getElementById('projectCategory').value,
        status: document.getElementById('projectStatus').value,
        image: imageUrl,
        price: document.getElementById('projectPrice').value.trim(),
        client: document.getElementById('projectClient').value.trim(),
        created_by: AdminAuth.getAdminName(),
        updated_at: new Date().toISOString()
    };

    try {
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
