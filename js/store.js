// ==========================================
// STORE.JS - Persistencia (LocalStorage)
// ==========================================

let projects = JSON.parse(localStorage.getItem('notionProjectsV5')) || [];
let currentProjectId = null;
let currentView = localStorage.getItem('viewPreference') || 'list';

// Usuarios por defecto
const defaultUsers = [
    { id: 'admin_1', name: 'Labubu', password: '1234', role: 'admin' },
    { id: 'user_1', name: 'Alex', password: '1234', role: 'user' }
];

let storedUsers = JSON.parse(localStorage.getItem('notionUsers'));
if (!storedUsers || storedUsers.length === 0) {
    localStorage.setItem('notionUsers', JSON.stringify(defaultUsers));
    storedUsers = defaultUsers;
}

let users = storedUsers;
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

function saveProjects() {
    localStorage.setItem('notionProjectsV5', JSON.stringify(projects));
}

function saveUsers() {
    localStorage.setItem('notionUsers', JSON.stringify(users));
}

function saveCurrentUser() {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('currentUser');
    }
}