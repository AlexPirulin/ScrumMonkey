// ==========================================
// APP.JS - Lógica de Tareas, Proyectos y Vistas
// ==========================================

const projectForm = document.getElementById('project-form');
const projectInput = document.getElementById('project-input');
const projectList = document.getElementById('project-list');
const currentProjectTitle = document.getElementById('current-project-title');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskPriority = document.getElementById('task-priority');
const taskList = document.getElementById('task-list');

const listViewEl = document.getElementById('list-view');
const kanbanViewEl = document.getElementById('kanban-view');
const btnListView = document.getElementById('btn-list-view');
const btnKanbanView = document.getElementById('btn-kanban-view');
const themeToggle = document.getElementById('theme-toggle');

let chartDonut = null, chartPriority = null, chartStatus = null;

// --- INICIALIZACIÓN ---
function initMainApp() {
    renderProjects();
    setView(currentView);
    if (!currentProjectId) {
        taskList.innerHTML = '<div style="padding: 20px; color: var(--text-muted);">Selecciona o crea un proyecto en la barra lateral para comenzar.</div>';
        taskForm.classList.add('hidden');
    }
}

// --- TEMA OSCURO ---
if (localStorage.getItem('themePreference') === 'dark') {
    document.body.classList.add('dark-theme');
}
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('themePreference', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
});

// --- VISTAS ---
function setView(view) {
    currentView = view;
    localStorage.setItem('viewPreference', view);
    if (view === 'kanban') {
        listViewEl.classList.add('hidden');
        kanbanViewEl.classList.remove('hidden');
        btnListView.classList.remove('active');
        btnKanbanView.classList.add('active');
        renderKanban();
    } else {
        kanbanViewEl.classList.add('hidden');
        listViewEl.classList.remove('hidden');
        btnKanbanView.classList.remove('active');
        btnListView.classList.add('active');
        renderTasks();
    }
}
btnListView.addEventListener('click', () => setView('list'));
btnKanbanView.addEventListener('click', () => setView('kanban'));

// --- PROYECTOS ---
projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = projectInput.value.trim();
    if (!name) return;
    const newProject = { id: Date.now().toString(), name, tasks: [] };
    projects.push(newProject);
    saveProjects();
    projectInput.value = '';
    renderProjects();
    selectProject(newProject.id);
});

function renderProjects() {
    projectList.innerHTML = '';
    projects.forEach(project => {
        const li = document.createElement('li');
        li.className = `sidebar-item ${currentProjectId === project.id ? 'active' : ''}`;
        
        const titleSpan = document.createElement('span');
        titleSpan.innerHTML = `<i class="fas fa-list-ul" style="margin-right: 10px; opacity: 0.7;"></i> ${project.name}`;
        titleSpan.style.flexGrow = '1';
        titleSpan.onclick = () => selectProject(project.id);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';
        actionsDiv.innerHTML = `
            <button class="icon-btn" onclick="deleteProject('${project.id}', event)"><i class="fas fa-trash"></i></button>
        `;

        li.append(titleSpan, actionsDiv);
        projectList.appendChild(li);
    });
}

function selectProject(id) {
    currentProjectId = id;
    const project = projects.find(p => p.id === id);
    if (!project) return;
    currentProjectTitle.textContent = project.name;
    taskForm.classList.remove('hidden');
    document.getElementById('stats-section').classList.remove('hidden');
    renderProjects();
    setView(currentView);
    renderStats();
}

window.deleteProject = function(id, e) {
    e.stopPropagation();
    if (confirm('¿Eliminar proyecto?')) {
        projects = projects.filter(p => p.id !== id);
        if (currentProjectId === id) currentProjectId = null;
        saveProjects();
        renderProjects();
        initMainApp();
    }
}

// --- TAREAS (Lista visual estilo Asana/Flow) ---
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentProjectId) return;
    const title = taskInput.value.trim();
    if (!title) return;

    const project = projects.find(p => p.id === currentProjectId);
    project.tasks.unshift({
        id: Date.now().toString(),
        title,
        priority: taskPriority.value,
        status: 'pendiente',
        assignedTo: currentUser ? currentUser.id : null
    });
    saveProjects();
    taskInput.value = '';
    setView(currentView);
    renderStats();
});

function renderTasks() {
    taskList.innerHTML = '';
    if (!currentProjectId) return;
    const project = projects.find(p => p.id === currentProjectId);
    
    if (project.tasks.length === 0) {
        taskList.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-muted);">El proyecto está vacío.</div>`;
        return;
    }

    project.tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-row ${task.status === 'completada' ? 'completed' : ''}`;
        
        const assignedUser = users.find(u => u.id === task.assignedTo);
        const avatarHtml = assignedUser ? `<div class="avatar-small" title="${assignedUser.name}">${assignedUser.name.charAt(0).toUpperCase()}</div>` : `<div class="avatar-small" style="background: transparent; border: 1px dashed var(--border-color); color: var(--text-muted);"><i class="fas fa-user"></i></div>`;

        div.innerHTML = `
            <div class="task-row-left">
                <input type="checkbox" class="custom-checkbox" onchange="toggleTask('${task.id}')" ${task.status === 'completada' ? 'checked' : ''}>
                <span class="task-title">${task.title}</span>
                <span class="task-tag"><i class="fas fa-tag"></i> ${task.priority}</span>
            </div>
            <div class="task-row-right">
                <span class="status-pill ${task.status}" onclick="cycleStatus('${task.id}')" style="cursor:pointer;" title="Clic para cambiar estado">${task.status.replace('-', ' ')}</span>
                ${avatarHtml}
                <div class="task-actions">
                    <button class="icon-btn" onclick="deleteTask('${task.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        taskList.appendChild(div);
    });
}

window.toggleTask = function(taskId) {
    const project = projects.find(p => p.id === currentProjectId);
    const task = project.tasks.find(t => t.id === taskId);
    task.status = task.status === 'completada' ? 'pendiente' : 'completada';
    saveProjects();
    renderTasks();
    renderStats();
}

window.cycleStatus = function(taskId) {
    const statuses = ['pendiente', 'en-progreso', 'revision', 'completada'];
    const project = projects.find(p => p.id === currentProjectId);
    const task = project.tasks.find(t => t.id === taskId);
    let idx = statuses.indexOf(task.status);
    task.status = statuses[(idx + 1) % statuses.length];
    saveProjects();
    setView(currentView);
    renderStats();
}

window.deleteTask = function(taskId) {
    const project = projects.find(p => p.id === currentProjectId);
    project.tasks = project.tasks.filter(t => t.id !== taskId);
    saveProjects();
    setView(currentView);
    renderStats();
}

// --- KANBAN BÁSICO ---
function renderKanban() {
    if (!currentProjectId) return;
    const project = projects.find(p => p.id === currentProjectId);
    const statuses = ['pendiente', 'en-progreso', 'revision', 'completada'];

    statuses.forEach(status => {
        const container = document.getElementById(`cards-${status}`);
        const tasks = project.tasks.filter(t => t.status === status);
        document.getElementById(`count-${status}`).textContent = tasks.length;
        container.innerHTML = '';
        
        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'kanban-card';
            card.innerHTML = `
                <div style="font-size: 14px; font-weight: 500; margin-bottom: 10px;">${task.title}</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="task-tag">${task.priority}</span>
                    <button class="icon-btn" style="font-size:12px;" onclick="cycleStatus('${task.id}')"><i class="fas fa-arrow-right"></i> Mover</button>
                </div>
            `;
            container.appendChild(card);
        });
    });
}

// --- ESTADÍSTICAS BÁSICAS ---
function renderStats() {
    if (!currentProjectId || typeof Chart === 'undefined') return;
    const tasks = projects.find(p => p.id === currentProjectId).tasks;
    
    // Gráfico simple para validación
    if(chartDonut) chartDonut.destroy();
    const completed = tasks.filter(t => t.status === 'completada').length;
    chartDonut = new Chart(document.getElementById('chart-donut'), {
        type: 'doughnut',
        data: { labels: ['Completadas', 'Pendientes'], datasets: [{ data: [completed, tasks.length - completed], backgroundColor: ['#10b981', '#eaeaea'] }] },
        options: { cutout: '75%', plugins: { legend: { position: 'bottom' } } }
    });
}

document.getElementById('btn-clear-all').addEventListener('click', () => {
    if (confirm('¿Borrar TODO?')) { localStorage.clear(); location.reload(); }
});