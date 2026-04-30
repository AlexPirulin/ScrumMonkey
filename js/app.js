// ==========================================
// APP.JS - Dashboard, Proyectos y Tareas (OPTIMIZADO)
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
    if (addTaskDate) addTaskDate.setAttribute('min', today);
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
    
    let tTotal = 0, tPend = 0, tProg = 0, tStuck = 0, tComp = 0;
    visibleProjects.forEach(p => {
        p.tasks.forEach(t => {
            tTotal++;
            if (t.status === 'pendiente') tPend++;
            else if (t.status === 'en-progreso') tProg++;
            else if (t.status === 'atasco') tStuck++;
            else if (t.status === 'completada') tComp++;
        });
    });

    document.getElementById('stat-total').textContent = tTotal;
    document.getElementById('stat-pending').textContent = tPend;
    document.getElementById('stat-progress').textContent = tProg;
    document.getElementById('stat-stuck').textContent = tStuck;
    document.getElementById('stat-completed').textContent = tComp;

    // OPTIMIZACIÓN: DOM Batching para Proyectos en Dashboard
    const grid = document.getElementById('dashboard-projects-grid');
    let gridHtml = '';
    
    if (visibleProjects.length === 0) {
        gridHtml = '<p class="text-muted">Sin proyectos.</p>';
    } else {
        visibleProjects.forEach(p => {
            const total = p.tasks.length;
            const comp = p.tasks.filter(t => t.status === 'completada').length;
            const percent = total === 0 ? 0 : Math.round((comp / total) * 100);
            gridHtml += `
                <div class="dash-project-card pop-in" onclick="selectProject('${p.id}')">
                    <h4>${p.name}</h4>
                    <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted);">
                        <span>${total} tareas</span><span>${percent}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div>
                </div>`;
        });
    }
    grid.innerHTML = gridHtml;

    // OPTIMIZACIÓN: DOM Batching para Actividad
    const actList = document.getElementById('dashboard-activity-list');
    let actHtml = '';
    if (activityLog.length === 0) {
        actHtml = '<p class="text-muted">Sin actividad.</p>';
    } else {
        activityLog.forEach((log, i) => {
            // Límite de retraso de animación para que no tarde demasiado en pintar
            const animDelay = Math.min(i * 0.05, 0.5); 
            actHtml += `
            <div class="activity-item" style="animation-delay: ${animDelay}s;">
                <i class="fas ${log.icon} act-icon" style="color:var(--text-muted)"></i>
                <div><div class="act-text">${log.text}</div><span style="font-size:11px; color:var(--text-muted);">${log.date}</span></div>
            </div>`;
        });
    }
    actList.innerHTML = actHtml;
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
    const visibleProjects = projects.filter(p => getProjectRole(p) !== null);
    
    // OPTIMIZACIÓN: Document Fragment (No re-dibuja el sidebar hasta que está listo)
    const fragment = document.createDocumentFragment();

    visibleProjects.forEach(project => {
        const li = document.createElement('li');
        li.className = `sidebar-item ${currentProjectId === project.id ? 'active' : ''}`;
        li.innerHTML = `<span style="flex-grow:1; display:flex; align-items:center;" onclick="selectProject('${project.id}')"><i class="fas fa-layer-group" style="margin-right:10px;"></i> ${project.name}</span>`;
        
        if (currentUser.role === 'admin') {
            li.innerHTML += `<div class="actions"><button class="icon-btn" onclick="deleteProject('${project.id}', event)"><i class="fas fa-trash"></i></button></div>`;
        }
        fragment.appendChild(li);
    });
    
    projectList.innerHTML = '';
    projectList.appendChild(fragment);
}

function selectProject(id) {
    currentProjectId = id; renderProjects();
    
    dashboardSection.classList.add('hidden');
    document.getElementById('calendar-section')?.classList.add('hidden');
    projectViewSection.classList.remove('hidden');
    
    const project = projects.find(p => p.id === id);
    currentProjectTitle.textContent = project.name;
    document.getElementById('btn-manage-members').classList.toggle('hidden', getProjectRole(project) !== 'admin');
    
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

// --- VISTAS ---
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
    
    // OPTIMIZACIÓN: DOM Batching para la Lista
    let tasksHtml = '';
    const role = getProjectRole(project);

    project.tasks.forEach((task, index) => {
        let actionBtns = `<select onchange="changeTaskStatus('${task.id}', this.value)" style="margin-right:10px; border-radius:6px; padding:5px; border:1px solid var(--border-color); background:rgba(255,255,255,0.5); color:var(--text-main); outline:none; transition:0.2s;">
            <option value="pendiente" ${task.status==='pendiente'?'selected':''}>Pendiente</option>
            <option value="en-progreso" ${task.status==='en-progreso'?'selected':''}>En Progreso</option>
            <option value="atasco" ${task.status==='atasco'?'selected':''}>Atasco</option>
            <option value="completada" ${task.status==='completada'?'selected':''}>Completada</option>
        </select>`;

        if (role === 'admin') {
            actionBtns += `
                <button class="icon-btn" onclick="openEditModal('${task.id}')"><i class="fas fa-edit"></i></button>
                <button class="icon-btn" style="color:var(--danger);" onclick="deleteTask('${task.id}')"><i class="fas fa-trash"></i></button>`;
        }

        const animDelay = Math.min(index * 0.05, 0.4); // Evita retrasos de más de 0.4s en listas largas
        tasksHtml += `
            <li class="task-item ${task.status}" style="animation-delay: ${animDelay}s;">
                <div style="display:flex; align-items:center;">
                    <span class="badge ${task.priority}">${task.priority}</span>
                    <strong class="task-title" style="margin-left:15px; font-size:15px;">${task.title}</strong>
                    ${task.dueDate ? `<span style="font-size:12px; color:var(--text-muted); margin-left:15px;"><i class="fas fa-calendar-day"></i> ${task.dueDate}</span>` : ''}
                </div>
                <div class="task-actions">${actionBtns}</div>
            </li>`;
    });

    listEl.innerHTML = tasksHtml;

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

// --- KANBAN DRAG & DROP ---
function renderKanban() {
    const project = projects.find(p => p.id === currentProjectId);
    const board = document.getElementById('kanban-board');
    
    const colTitles = { 'pendiente': 'Pendiente', 'en-progreso': 'En Progreso', 'atasco': 'Atasco', 'completada': 'Completada' };
    const cols = ['pendiente', 'en-progreso', 'atasco', 'completada'];
    
    // 1. Dibujamos las columnas vacías una vez
    board.innerHTML = cols.map(c => `
        <div class="kanban-col pop-in" ondragover="allowDrop(event)" ondrop="dropTask(event, '${c}')">
            <h3>${colTitles[c]}</h3>
            <div id="col-${c}" style="min-height:200px; border-radius: 8px; padding-bottom: 20px;"></div>
        </div>`).join('');

    // 2. OPTIMIZACIÓN: Recolectar las tareas primero (Batching por columna)
    const columnsHtml = { 'pendiente': '', 'en-progreso': '', 'atasco': '', 'completada': '' };
    
    project.tasks.forEach(t => {
        if(columnsHtml[t.status] !== undefined) {
            columnsHtml[t.status] += `<div class="task-item kanban-card pop-in" draggable="true" ondragstart="dragStart(event, '${t.id}')" ondragend="dragEnd(event)" style="border-left: 4px solid ${t.priority==='alta'?'var(--danger)':t.priority==='media'?'var(--warning)':'var(--success)'};">
                <span class="badge ${t.priority}">${t.priority}</span>
                <strong style="margin-top:8px; display:block;">${t.title}</strong>
                ${t.dueDate ? `<span style="font-size:11px; color:var(--text-muted); display:block; margin-top:8px;"><i class="fas fa-calendar"></i> ${t.dueDate}</span>` : ''}
            </div>`;
        }
    });

    // 3. Pintar en cada columna
    cols.forEach(c => {
        const colEl = document.getElementById(`col-${c}`);
        if(colEl) colEl.innerHTML = columnsHtml[c];
    });
}

// --- MODALES (Edición y Miembros) ---
const editModal = document.getElementById('edit-task-modal');
const editForm = document.getElementById('edit-task-form');

window.openEditModal = function(taskId) {
    const task = projects.find(p => p.id === currentProjectId).tasks.find(t => t.id === taskId);
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-priority').value = task.priority;
    
    const dateInput = document.getElementById('edit-task-date');
    dateInput.value = task.dueDate || '';
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    
    editModal.classList.remove('hidden');
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

const membersModal = document.getElementById('members-modal');
document.getElementById('btn-manage-members').addEventListener('click', () => { renderMembersModal(); membersModal.classList.remove('hidden'); });
document.getElementById('btn-close-members').addEventListener('click', () => membersModal.classList.add('hidden'));

function renderMembersModal() {
    const project = projects.find(p => p.id === currentProjectId);
    if (!project.members) project.members = [{ userId: currentUser.id, role: 'admin' }];
    
    // OPTIMIZACIÓN: DOM Batching
    const list = document.getElementById('project-members-list');
    let memHtml = '';
    project.members.forEach(m => {
        const u = users.find(x => x.id === m.userId); 
        if(u) {
            const badge = m.role === 'admin' ? '<span class="role admin">Admin</span>' : '<span class="role user">Usuario</span>';
            const deleteBtn = m.userId !== currentUser.id ? `<button class="icon-btn" onclick="removeMember('${m.userId}')" style="color:var(--danger);"><i class="fas fa-times"></i></button>` : '';
            memHtml += `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--border-color);">
                <span><strong>${u.name}</strong> <span style="margin-left:10px;">${badge}</span></span>${deleteBtn}
            </div>`;
        }
    });
    list.innerHTML = memHtml;

    const select = document.getElementById('new-member-select');
    let selHtml = '<option value="" disabled selected>Selecciona una persona...</option>';
    users.forEach(u => {
        if (!project.members.some(m => m.userId === u.id) && u.role !== 'admin') {
            selHtml += `<option value="${u.id}">${u.name}</option>`;
        }
    });
    select.innerHTML = selHtml;
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

// ==========================================
// FUNCIONES DRAG AND DROP (KANBAN)
// ==========================================

window.dragStart = function(event, taskId) {
    event.dataTransfer.setData("taskId", taskId);
    event.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
        event.target.classList.add('dragging');
    }, 0);
};

window.dragEnd = function(event) {
    event.target.classList.remove('dragging');
};

window.allowDrop = function(event) {
    event.preventDefault(); 
};

window.dropTask = function(event, newStatus) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    if (!taskId) return;

    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;

    const task = project.tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
        task.status = newStatus;
        saveProjects();
        if (typeof logAction === 'function') logAction(`movió "${task.title}" a ${newStatus}`, 'fa-arrows-alt');
        renderTasks(); 
    }
};