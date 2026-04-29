// ==========================================
// AUTH.JS - Autenticación, Login y Tema
// ==========================================

const loginThemeToggle = document.getElementById('login-theme-toggle');
const appThemeToggle = document.getElementById('theme-toggle');

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('themePreference', isDark ? 'dark' : 'light');
    
    [loginThemeToggle, appThemeToggle].forEach(btn => {
        if(btn) {
            const icon = btn.querySelector('i');
            if (isDark) icon.classList.replace('fa-moon', 'fa-sun');
            else icon.classList.replace('fa-sun', 'fa-moon');
        }
    });
    
    // Forzar actualización de gráficos si se está en la vista de estadísticas
    if (typeof renderStats === 'function' && currentProjectId) {
        renderStats();
    }
}

if (loginThemeToggle) loginThemeToggle.addEventListener('click', toggleTheme);
if (appThemeToggle) appThemeToggle.addEventListener('click', toggleTheme);

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('themePreference') === 'dark') {
        document.body.classList.add('dark-theme');
        [loginThemeToggle, appThemeToggle].forEach(btn => {
            if(btn) btn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        });
    }
});

const loginScreen = document.getElementById('login-screen');
const appContainer = document.querySelector('.app-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const btnLogout = document.getElementById('btn-logout');
const profileAvatarBtn = document.getElementById('profile-avatar-btn');
const userDropdown = document.getElementById('user-dropdown');

function checkAuth() {
    if (!currentUser) {
        if(loginScreen) loginScreen.classList.remove('hidden');
        if(appContainer) appContainer.classList.add('hidden');
    } else {
        if(loginScreen) loginScreen.classList.add('hidden');
        if(appContainer) appContainer.classList.remove('hidden');
        
        const avatar = document.getElementById('current-user-avatar');
        if(avatar) avatar.textContent = currentUser.name.charAt(0).toUpperCase();
        
        applyRolePermissions();
        if (typeof initMainApp === 'function') initMainApp();
    }
}

function applyRolePermissions() {
    const newProjectSection = document.getElementById('new-project-section'); 
    if (currentUser.role === 'user') {
        if (newProjectSection) newProjectSection.style.display = 'none';
    } else {
        if (newProjectSection) newProjectSection.style.display = 'block';
    }
}

function loginUser(user) {
    currentUser = user;
    saveCurrentUser();
    checkAuth();
}

if(loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const pass = document.getElementById('login-password').value.trim();
        
        const user = users.find(u => u.name.toLowerCase() === username.toLowerCase() && u.password === pass);
        if (user) { loginUser(user); loginForm.reset(); } 
        else { alert('Usuario o contraseña incorrectos.'); }
    });
}

if(registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-username').value.trim();
        const pass = document.getElementById('reg-password').value.trim();
        const role = document.getElementById('reg-role').value;

        if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
            alert('El usuario ya existe.'); return;
        }

        const newUser = { id: Date.now().toString(), name, password: pass, role };
        users.push(newUser); saveUsers(); loginUser(newUser); registerForm.reset();
    });
}

if(profileAvatarBtn) {
    profileAvatarBtn.addEventListener('click', (e) => {
        e.stopPropagation(); userDropdown.classList.toggle('hidden');
    });
}

document.addEventListener('click', (e) => {
    if (profileAvatarBtn && userDropdown && !profileAvatarBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.add('hidden');
    }
});

if(btnLogout) {
    btnLogout.addEventListener('click', () => {
        currentUser = null; saveCurrentUser();
        userDropdown.classList.add('hidden'); checkAuth();
    });
}

checkAuth();