/**
 * shared.js - Utility functions dùng chung cho tất cả trang Agent Portal
 */

// ============================================================
// DB Skeleton - populated riêng trên mỗi trang qua Supabase sync
// ============================================================
window.DB = {
    user: null,
    tickets: [],
    templates: [],
    articles: []
};

// ============================================================
// Auth
// ============================================================
function checkAuth() {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
        window.location.replace('login.html');
        return null;
    }
    try {
        const user = JSON.parse(stored);
        window.DB.user = user;
        return user;
    } catch (e) {
        localStorage.removeItem('currentUser');
        window.location.replace('login.html');
        return null;
    }
}

function logout() {
    DB_Helper.logout();
    window.location.replace('login.html');
}

// ============================================================
// UI Init
// ============================================================
function initUserUI() {
    const user = window.DB.user || DB_Helper.getCurrentUser();
    if (!user) return;
    const nameEl = document.getElementById('sidebar-user-name');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl) nameEl.textContent = user.name || 'Agent';
    if (avatarEl && user.avatar) avatarEl.src = user.avatar;
}

function updateNavActive(pageId) {
    // pageId: 'dashboard' | 'ticket-list' | 'ticket-detail' | 'templates' | 'faqs'
    const navItems = document.querySelectorAll('.nav-link');
    navItems.forEach(item => {
        const isActive = item.dataset.page === pageId;
        item.classList.toggle('text-primary', isActive);
        item.classList.toggle('dark:text-[#b4c5ff]', isActive);
        item.classList.toggle('border-primary', isActive);
        item.classList.toggle('dark:border-[#b4c5ff]', isActive);
        item.classList.toggle('border-transparent', !isActive);
        item.classList.toggle('text-on-surface-variant', !isActive);
        item.classList.toggle('dark:text-[#a0b2c1]', !isActive);
    });
}

// ============================================================
// Toast Notification
// ============================================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast || !toastText) return;
    toastText.textContent = message;
    if (toastIcon) {
        toastIcon.textContent = type === 'error' ? 'error' : 'check_circle';
        toastIcon.className = `material-symbols-outlined ${type === 'error' ? 'text-red-400' : 'text-green-400'}`;
    }
    toast.classList.remove('translate-y-24', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-24', 'opacity-0');
    }, 3000);
}

// ============================================================
// Theme Toggle
// ============================================================
function toggleTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');
    const saved = localStorage.getItem('theme');
    if (html.classList.contains('light') || (!html.classList.contains('dark') && saved !== 'dark')) {
        html.classList.remove('light');
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) themeIcon.textContent = 'light_mode';
    } else {
        html.classList.remove('dark');
        html.classList.add('light');
        localStorage.setItem('theme', 'light');
        if (themeIcon) themeIcon.textContent = 'dark_mode';
    }
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    const html = document.documentElement;
    if (saved === 'dark') {
        html.classList.remove('light');
        html.classList.add('dark');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.textContent = 'light_mode';
    }
}

// ============================================================
// Common HTML Fragments
// ============================================================

/**
 * Build nav bar HTML string. activePageId is one of:
 * 'dashboard' | 'ticket-list' | 'ticket-detail' | 'templates' | 'faqs'
 */
function getNavHTML(activePageId) {
    const navItem = (pageId, href, label, extraContent = '') => {
        const isActive = pageId === activePageId;
        const activeClass = isActive
            ? 'text-primary dark:text-[#b4c5ff] border-primary dark:border-[#b4c5ff]'
            : 'text-on-surface-variant dark:text-[#a0b2c1] border-transparent hover:text-primary dark:hover:text-[#b4c5ff]';
        return `<a data-page="${pageId}" href="${href}" class="nav-link flex items-center px-xs sm:px-sm border-b-[3px] ${activeClass} text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-100 whitespace-nowrap">${label}${extraContent}</a>`;
    };

    return `
    <header class="fixed top-0 left-0 w-full h-[64px] bg-surface dark:bg-[#111a22] border-b border-outline-variant dark:border-[#344859] z-40 flex justify-between items-center px-md md:px-lg">
        <div class="flex items-center gap-xs sm:gap-sm shrink-0 h-full">
            <span class="material-symbols-outlined text-primary dark:text-[#b4c5ff] text-2xl" style="font-variation-settings: 'FILL' 1;">security</span>
            <span class="font-headline font-extrabold text-sm tracking-tight uppercase hidden md:block">GAME SUPPORT // AGENT PORTAL</span>
            <span class="font-headline font-extrabold text-sm tracking-tight uppercase md:hidden">GAME SUPPORT</span>
        </div>
        <nav class="flex h-full items-stretch mx-xs sm:mx-md overflow-x-auto no-scrollbar gap-xs sm:gap-sm shrink">
            ${navItem('dashboard', 'index.html', 'TICKET DASHBOARD')}
            ${navItem('ticket-list', 'ticket_list.html', 'TICKET LIST', '<span id="open-ticket-count-badge" class="ml-1.5 bg-error text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold hidden">0</span>')}
            ${navItem('templates', 'response_templates.html', 'RESPONSE TEMPLATES')}
            ${navItem('faqs', 'faq_management.html', 'FAQs')}
        </nav>
        <div class="flex items-center gap-xs sm:gap-sm shrink-0">
            <button class="material-symbols-outlined text-on-surface-variant hover:text-primary p-xs rounded-full hover:bg-surface-container transition-colors" onclick="toggleTheme()" title="Toggle Dark/Light Mode">
                <span id="theme-icon">dark_mode</span>
            </button>
            <div class="h-6 w-[1px] bg-outline-variant dark:bg-[#344859] hidden sm:block"></div>
            <div class="flex items-center gap-xs border border-outline-variant dark:border-[#344859] rounded-full p-1 bg-surface-container-low dark:bg-[#0d161d] hover:border-primary dark:hover:border-[#b4c5ff] transition-all">
                <img id="user-avatar" alt="Agent" class="w-7 h-7 rounded-full shadow-sm object-cover" src="">
                <span class="font-bold text-xs text-on-surface dark:text-[#f0f4f8] px-xs hidden sm:inline" id="sidebar-user-name">Agent</span>
                <button class="text-on-surface-variant hover:text-error transition-colors p-xs flex items-center justify-center" onclick="logout()" title="Logout">
                    <span class="material-symbols-outlined text-[18px]">logout</span>
                </button>
            </div>
        </div>
    </header>`;
}

function getToastHTML() {
    return `<div class="fixed bottom-lg right-lg bg-inverse-surface text-inverse-on-surface py-3 px-lg rounded-lg shadow-xl translate-y-24 opacity-0 transition-all duration-300 flex items-center gap-sm z-[60]" id="toast">
        <span class="material-symbols-outlined text-green-400" id="toast-icon">check_circle</span>
        <span class="text-xs" id="toast-text">Done.</span>
    </div>`;
}

// ============================================================
// Sync draft statuses from localStorage
// ============================================================
function syncDraftStatuses() {
    const drafts = JSON.parse(localStorage.getItem('ticketDrafts') || '{}');
    if (window.DB && window.DB.tickets) {
        window.DB.tickets.forEach(t => {
            if (drafts[t.id]) {
                if (t.status !== 'Resolved') t.status = 'Drafting';
            } else {
                if (t.status === 'Drafting') t.status = 'Open';
            }
        });
    }
}

// ============================================================
// Inject shared UI on DOMContentLoaded
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});
