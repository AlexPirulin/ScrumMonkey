// ==========================================
// AUTH.JS - Autenticación y Usuarios
// ==========================================
// Lógica para el cambio de tema en la pantalla de Login
const loginThemeToggle = document.getElementById('login-theme-toggle');

if (loginThemeToggle) {
    loginThemeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        
        // Guardar preferencia
        localStorage.setItem('themePreference', isDark ? 'dark' : 'light');
        
        // Cambiar el icono
        const icon = loginThemeToggle.querySelector('i');
        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    });
}

// Aplicar tema guardado al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('themePreference') === 'dark') {
        document.body.classList.add('dark-theme');
        if (loginThemeToggle) {
            loginThemeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    }
});

const loginScreen = document.getElementById('login-screen');
const appContainer = document.querySelector('.app-container');

// Formularios
const loginForm = document.getElementById('login-form');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');

const registerForm = document.getElementById('register-form');
const regUsername = document.getElementById('reg-username');
const regPassword = document.getElementById('reg-password');
const regRole = document.getElementById('reg-role');

const profileAvatarBtn = document.getElementById('profile-avatar-btn');
const userDropdown = document.getElementById('user-dropdown');
const dropdownUserList = document.getElementById('dropdown-user-list');
const currentUserAvatar = document.getElementById('current-user-avatar');
const btnLogout = document.getElementById('btn-logout');

function checkAuth() {
    if (!currentUser) {
        loginScreen.classList.remove('hidden');
        appContainer.classList.add('hidden');
    } else {
        loginScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        currentUserAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        
        applyRolePermissions();
        
        if (typeof initMainApp === 'function') initMainApp();
    }
}

function applyRolePermissions() {
    // Busca la sección de crear proyectos (asegúrate de ponerle este id o clase en tu HTML)
    const newProjectSection = document.querySelector('.sidebar-section:nth-child(3)'); 
    
    if (currentUser.role === 'user') {
        // El usuario normal no puede crear proyectos
        if (newProjectSection) newProjectSection.style.display = 'none';
    } else {
        // El administrador sí puede
        if (newProjectSection) newProjectSection.style.display = 'block';
    }
}

function loginUser(user) {
    currentUser = user;
    saveCurrentUser();
    checkAuth();
}

function logoutUser() {
    currentUser = null;
    saveCurrentUser();
    userDropdown.classList.add('hidden');
    checkAuth();
}

// INICIO DE SESIÓN
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = loginUsername.value.trim();
    const pass = loginPassword.value.trim();

    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === pass);
    
    if (user) {
        loginUser(user);
        loginUsername.value = '';
        loginPassword.value = '';
    } else {
        alert('Usuario o contraseña incorrectos. Por favor intenta de nuevo.');
    }
});

// REGISTRO DE NUEVO USUARIO
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = regUsername.value.trim();
    const pass = regPassword.value.trim();
    const role = regRole.value;

    if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
        alert('Este nombre de usuario ya existe. Elige otro.');
        return;
    }

    const newUser = { id: Date.now().toString(), name: name, password: pass, role: role };
    users.push(newUser);
    saveUsers();
    loginUser(newUser);
    
    regUsername.value = '';
    regPassword.value = '';
});

// Dropdown Toggle
profileAvatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!profileAvatarBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.add('hidden');
    }
});

btnLogout.addEventListener('click', logoutUser);
checkAuth(); // Arranque