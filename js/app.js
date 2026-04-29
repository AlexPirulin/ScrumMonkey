// ==========================================
// APP.JS - Dashboard, Proyectos y Tareas
// ==========================================

const projectForm = document.getElementById('project-form');
const projectInput = document.getElementById('project-input');
const projectList = document.getElementById('project-list');
const dashboardSection = document.getElementById('dashboard-section');
const projectViewSection = document.getElementById('project-view-section');
const currentProjectTitle = document.getElementById('current-project-title');
const btnShowHome = document.getElementById('btn-show-home');

const taskForm = document.getElementById('task-form');
const btnListView = document.getElementById('btn-list-view');
const btnKanbanView = document.getElementById('btn-kanban-view');
const btnStatsView = document.getElementById('btn-stats-view');

const listViewEl = document.getElementById('list-view');
const kanbanViewEl = document.getElementById('kanban-view');
const statsViewEl = document.getElementById('stats-view');

// --- INICIALIZACIÓN ---
function initMainApp() {
    renderProjects();
    showDashboard();
    restrictDates();
}

function restrictDates() {
    const today = new Date().toISOString().split('T')[0];
    const addTaskDate = document.getElementById('task-due-date');
    const editTaskDate = document.getElementById('edit-task-date');
    if (addTaskDate) addTaskDate.setAttribute('min', today);
    if (editTaskDate) editTaskDate.setAttribute('min', today);
}

function getProjectRole(project) {
    if (!currentUser) return null;
    if (currentUser.role === 'admin') return 'admin'; 
    if (!project.members) return 'admin'; 
    const m = project.members.find(x => x.userId === currentUser.id);
    return m ? m.role : null;
}

// --- NAVEGACIÓN Y DASHBOARD ---
btnShowHome.addEventListener('click', showDashboard);

function showDashboard() {
    currentProjectId = null;
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    btnShowHome.classList.add('active');
    
    dashboardSection.classList.remove('hidden');
    projectViewSection.classList.add('hidden');
    document.getElementById('calendar-section')?.classList.add('hidden');
    
    document.getElementById('dashboard-greeting').textContent = `¡Hola, ${currentUser.name}!`;

    const visibleProjects = projects.filter(p => getProjectRole(p) !== null);
    
    let tTotal = 0, tPend = 0, tProg = 0, tComp = 0;
    visibleProjects.forEach(p => {
        p.tasks.forEach(t => {
            tTotal++;
            if (t.status === 'pendiente') tPend++;
            else if (t.status === 'en-progreso' || t.status === 'revision') tProg++;
            else if (t.status === 'completada') tComp++;
        });
    });

    document.getElementById('stat-total').textContent = tTotal;
    document.getElementById('stat-pending').textContent = tPend;
    document.getElementById('stat-progress').textContent = tProg;
    document.getElementById('stat-completed').textContent = tComp;

    const grid = document.getElementById('dashboard-projects-grid');
    grid.innerHTML = '';
    if (visibleProjects.length === 0) grid.innerHTML = '<p class="text-muted">Sin proyectos.</p>';
    
    visibleProjects.forEach(p => {
        const total = p.tasks.length;
        const comp = p.tasks.filter(t => t.status === 'completada').length;
        const percent = total === 0 ? 0 : Math.round((comp / total) * 100);
        grid.innerHTML += `
            <div class="dash-project-card" onclick="selectProject('${p.id}')">
                <h4>${p.name}</h4>
                <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted);">
                    <span>${total} tareas</span><span>${percent}%</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div>
            </div>`;
    });

    const actList = document.getElementById('dashboard-activity-list');
    actList.innerHTML = activityLog.length === 0 ? '<p class="text-muted">Sin actividad.</p>' : activityLog.map(log => `
        <div class="activity-item">
            <i class="fas ${log.icon} act-icon" style="color:var(--text-muted)"></i>
            <div><div class="act-text">${log.text}</div><span style="font-size:11px; color:var(--text-muted);">${log.date}</span></div>
        </div>`).join('');
}

// --- GESTIÓN DE PROYECTOS ---
projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = projectInput.value.trim();
    if (!name) return;
    
    const newProject = { 
        id: Date.now().toString(), name, tasks: [],
        members: [{ userId: currentUser.id, role: 'admin' }] 
    };
    projects.push(newProject); saveProjects();
    logAction(`creó el proyecto "${name}"`, 'fa-folder-plus');
    projectInput.value = ''; renderProjects(); selectProject(newProject.id);
});

function renderProjects() {
    projectList.innerHTML = '';
    const visibleProjects = projects.filter(p => getProjectRole(p) !== null);

    visibleProjects.forEach(project => {
        const li = document.createElement('li');
        li.className = `sidebar-item ${currentProjectId === project.id ? 'active' : ''}`;
        li.innerHTML = `<span style="flex-grow:1; display:flex; align-items:center;" onclick="selectProject('${project.id}')"><i class="fas fa-layer-group" style="margin-right:10px;"></i> ${project.name}</span>`;
        
        if (currentUser.role === 'admin') {
            li.innerHTML += `<div class="actions"><button class="icon-btn" onclick="deleteProject('${project.id}', event)"><i class="fas fa-trash"></i></button></div>`;
        }
        projectList.appendChild(li);
    });
}

function selectProject(id) {
    currentProjectId = id; renderProjects();
    
    dashboardSection.classList.add('hidden');
    document.getElementById('calendar-section')?.classList.add('hidden');
    projectViewSection.classList.remove('hidden');
    
    const project = projects.find(p => p.id === id);
    currentProjectTitle.textContent = project.name;
    document.getElementById('btn-manage-members').classList.toggle('hidden', getProjectRole(project) !== 'admin');
    
    // Por defecto, mostrar vista Lista al entrar a un proyecto
    listViewEl.classList.remove('hidden'); kanbanViewEl.classList.add('hidden'); statsViewEl.classList.add('hidden');
    btnListView.classList.add('active'); btnKanbanView.classList.remove('active'); btnStatsView.classList.remove('active');
    
    renderTasks();
}

window.deleteProject = function(id, e) {
    e.stopPropagation();
    if (confirm('¿Eliminar proyecto y todas sus tareas?')) {
        const p = projects.find(x => x.id === id);
        logAction(`eliminó el proyecto "${p.name}"`, 'fa-trash');
        projects = projects.filter(p => p.id !== id);
        saveProjects(); renderProjects(); showDashboard();
    }
}

// --- VISTAS: LISTA, KANBAN, STATS ---
btnListView.addEventListener('click', () => {
    listViewEl.classList.remove('hidden'); kanbanViewEl.classList.add('hidden'); statsViewEl.classList.add('hidden');
    btnListView.classList.add('active'); btnKanbanView.classList.remove('active'); btnStatsView.classList.remove('active');
});

btnKanbanView.addEventListener('click', () => {
    listViewEl.classList.add('hidden'); kanbanViewEl.classList.remove('hidden'); statsViewEl.classList.add('hidden');
    btnListView.classList.remove('active'); btnKanbanView.classList.add('active'); btnStatsView.classList.remove('active');
    renderKanban();
});

btnStatsView.addEventListener('click', () => {
    listViewEl.classList.add('hidden'); kanbanViewEl.classList.add('hidden'); statsViewEl.classList.remove('hidden');
    btnListView.classList.remove('active'); btnKanbanView.classList.remove('active'); btnStatsView.classList.add('active');
    if (typeof renderStats === 'function') renderStats();
});

// --- TAREAS ---
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('task-input').value.trim();
    const priority = document.getElementById('task-priority').value;
    const dueDate = document.getElementById('task-due-date').value;
    
    const project = projects.find(p => p.id === currentProjectId);
    project.tasks.push({ id: Date.now().toString(), title, priority, status: 'pendiente', dueDate });
    
    saveProjects(); logAction(`añadió "${title}" en "${project.name}"`, 'fa-plus-circle');
    taskForm.reset(); renderTasks();
});

function renderTasks() {
    if (!currentProjectId) return;
    const project = projects.find(p => p.id === currentProjectId);
    const listEl = document.getElementById('task-list');
    listEl.innerHTML = '';

    project.tasks.forEach(task => {
        const role = getProjectRole(project);
        let actionBtns = `<select onchange="changeTaskStatus('${task.id}', this.value)" style="margin-right:10px; border-radius:6px; padding:5px; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);">
            <option value="pendiente" ${task.status==='pendiente'?'selected':''}>Pendiente</option>
            <option value="en-progreso" ${task.status==='en-progreso'?'selected':''}>En Progreso</option>
            <option value="completada" ${task.status==='completada'?'selected':''}>Completada</option>
        </select>`;

        if (role === 'admin') {
            actionBtns += `
                <button class="icon-btn" onclick="openEditModal('${task.id}')"><i class="fas fa-edit"></i></button>
                <button class="icon-btn" style="color:var(--danger);" onclick="deleteTask('${task.id}')"><i class="fas fa-trash"></i></button>`;
        }

        listEl.innerHTML += `
            <li class="task-item ${task.status}">
                <div style="display:flex; align-items:center;">
                    <span class="badge ${task.priority}">${task.priority}</span>
                    <strong class="task-title" style="margin-left:15px; font-size:15px;">${task.title}</strong>
                    ${task.dueDate ? `<span style="font-size:12px; color:var(--text-muted); margin-left:15px;"><i class="fas fa-calendar-day"></i> ${task.dueDate}</span>` : ''}
                </div>
                <div class="task-actions">${actionBtns}</div>
            </li>`;
    });

    if(!kanbanViewEl.classList.contains('hidden')) renderKanban();
    if(!statsViewEl.classList.contains('hidden') && typeof renderStats === 'function') renderStats();
}

window.changeTaskStatus = function(taskId, newStatus) {
    const project = projects.find(p => p.id === currentProjectId);
    const task = project.tasks.find(t => t.id === taskId);
    task.status = newStatus; saveProjects();
    logAction(`movió "${task.title}" a ${newStatus}`, 'fa-exchange-alt');
    renderTasks();
}

window.deleteTask = function(taskId) {
    const project = projects.find(p => p.id === currentProjectId);
    project.tasks = project.tasks.filter(t => t.id !== taskId);
    saveProjects(); renderTasks();
}

function renderKanban() {
    const project = projects.find(p => p.id === currentProjectId);
    const board = document.getElementById('kanban-board');
    const cols = ['pendiente', 'en-progreso', 'completada'];
    board.innerHTML = cols.map(c => `
        <div class="kanban-col">
            <h3>${c.replace('-', ' ')}</h3>
            <div id="col-${c}" style="min-height:50px;"></div>
        </div>`).join('');

    project.tasks.forEach(t => {
        const col = document.getElementById(`col-${t.status}`);
        if(col) {
            col.innerHTML += `<div class="task-item" style="border-left: 4px solid ${t.priority==='alta'?'var(--danger)':t.priority==='media'?'#d97706':'var(--success)'};">
                <span class="badge ${t.priority}">${t.priority}</span>
                <strong style="margin-top:5px; display:block;">${t.title}</strong>
                ${t.dueDate ? `<span style="font-size:11px; color:var(--text-muted); display:block; margin-top:5px;"><i class="fas fa-calendar"></i> ${t.dueDate}</span>` : ''}
            </div>`;
        }
    });
}

// --- MODAL: EDITAR TAREA ---
const editModal = document.getElementById('edit-task-modal');
const editForm = document.getElementById('edit-task-form');

window.openEditModal = function(taskId) {
    const task = projects.find(p => p.id === currentProjectId).tasks.find(t => t.id === taskId);
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-priority').value = task.priority;
    document.getElementById('edit-task-date').value = task.dueDate || '';
    restrictDates(); editModal.classList.remove('hidden');
};

document.getElementById('btn-cancel-edit').addEventListener('click', () => editModal.classList.add('hidden'));
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const task = projects.find(p => p.id === currentProjectId).tasks.find(t => t.id === document.getElementById('edit-task-id').value);
    task.title = document.getElementById('edit-task-title').value.trim();
    task.priority = document.getElementById('edit-task-priority').value;
    task.dueDate = document.getElementById('edit-task-date').value;
    saveProjects(); renderTasks(); editModal.classList.add('hidden');
});

// --- MODAL: MIEMBROS ---
const membersModal = document.getElementById('members-modal');
document.getElementById('btn-manage-members').addEventListener('click', () => { renderMembersModal(); membersModal.classList.remove('hidden'); });
document.getElementById('btn-close-members').addEventListener('click', () => membersModal.classList.add('hidden'));

function renderMembersModal() {
    const project = projects.find(p => p.id === currentProjectId);
    if (!project.members) project.members = [{ userId: currentUser.id, role: 'admin' }];
    
    const list = document.getElementById('project-members-list');
    list.innerHTML = project.members.map(m => {
        const u = users.find(x => x.id === m.userId); if(!u) return '';
        const badge = m.role === 'admin' ? '<span class="role admin">Admin</span>' : '<span class="role user">Usuario</span>';
        const deleteBtn = m.userId !== currentUser.id ? `<button class="icon-btn" onclick="removeMember('${m.userId}')" style="color:var(--danger);"><i class="fas fa-times"></i></button>` : '';
        return `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--border-color);">
            <span><strong>${u.name}</strong> <span style="margin-left:10px;">${badge}</span></span>${deleteBtn}
        </div>`;
    }).join('');

    const select = document.getElementById('new-member-select');
    select.innerHTML = '<option value="" disabled selected>Selecciona una persona...</option>';
    users.forEach(u => {
        if (!project.members.some(m => m.userId === u.id) && u.role !== 'admin') {
            select.innerHTML += `<option value="${u.id}">${u.name}</option>`;
        }
    });
}

document.getElementById('add-member-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const userId = document.getElementById('new-member-select').value;
    const role = document.getElementById('new-member-role').value;
    if(!userId) return;
    projects.find(p => p.id === currentProjectId).members.push({ userId, role });
    saveProjects(); renderMembersModal();
});

window.removeMember = function(userId) {
    const p = projects.find(p => p.id === currentProjectId);
    p.members = p.members.filter(m => m.userId !== userId);
    saveProjects(); renderMembersModal();
}