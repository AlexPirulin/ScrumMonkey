// ==========================================
// AUTH.JS - Autenticación y Usuarios
// ==========================================

const loginScreen = document.getElementById('login-screen');
const appContainer = document.querySelector('.app-container');
const loginUserList = document.getElementById('login-user-list');
const loginNewUserForm = document.getElementById('login-new-user-form');
const loginNewUserInput = document.getElementById('login-new-user-input');

const profileAvatarBtn = document.getElementById('profile-avatar-btn');
const userDropdown = document.getElementById('user-dropdown');
const dropdownUserList = document.getElementById('dropdown-user-list');
const currentUserAvatar = document.getElementById('current-user-avatar');
const btnLogout = document.getElementById('btn-logout');

function checkAuth() {
    if (!currentUser) {
        loginScreen.classList.remove('hidden');
        appContainer.classList.add('hidden');
        renderLoginUserList();
    } else {
        loginScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        currentUserAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        
        if (typeof initMainApp === 'function') initMainApp();
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

function renderLoginUserList() {
    loginUserList.innerHTML = '';
    if (users.length === 0) {
        loginUserList.innerHTML = '<li class="text-muted">Sin usuarios. Crea uno abajo.</li>';
        return;
    }
    users.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `<div class="avatar-small" style="background:var(--accent-blue)">${user.name.charAt(0).toUpperCase()}</div> ${user.name}`;
        li.onclick = () => loginUser(user);
        loginUserList.appendChild(li);
    });
}

loginNewUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = loginNewUserInput.value.trim();
    if (!name) return;

    let existingUser = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (existingUser) {
        loginUser(existingUser);
    } else {
        const newUser = { id: Date.now().toString(), name: name };
        users.push(newUser);
        saveUsers();
        loginUser(newUser);
    }
    loginNewUserInput.value = '';
});

// Dropdown Toggle
profileAvatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('hidden');
    renderDropdownUsers();
});

document.addEventListener('click', (e) => {
    if (!profileAvatarBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.add('hidden');
    }
});

function renderDropdownUsers() {
    dropdownUserList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = `dropdown-item`;
        btn.innerHTML = `<div class="avatar-small">${user.name.charAt(0).toUpperCase()}</div> ${user.name}`;
        btn.onclick = () => { loginUser(user); userDropdown.classList.add('hidden'); };
        li.appendChild(btn);
        dropdownUserList.appendChild(li);
    });
}

btnLogout.addEventListener('click', logoutUser);
checkAuth(); // Arranque