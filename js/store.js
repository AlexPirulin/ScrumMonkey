// ==========================================
// STORE.JS - Persistencia (LocalStorage)
// ==========================================

let projects = JSON.parse(localStorage.getItem('notionProjectsV5')) || [];
let currentProjectId = null;
let currentView = localStorage.getItem('viewPreference') || 'list';

let users = JSON.parse(localStorage.getItem('notionUsers')) || [];
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