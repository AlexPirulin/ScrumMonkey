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
const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';
        // Solo el administrador ve el botón de borrar proyecto
        if (currentUser && currentUser.role === 'admin') {
            actionsDiv.innerHTML = `
                <button class="icon-btn" onclick="deleteProject('${project.id}', event)" title="Eliminar proyecto">
                    <i class="fas fa-trash"></i>
                </button>
            `;
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
    
    // Ahora el proyecto guarda un arreglo de miembros. El creador entra como admin por defecto.
    const newProject = { 
        id: Date.now().toString(), 
        name, 
        tasks: [],
        members: [{ userId: currentUser.id, role: 'admin' }] 
    };
    
    projects.push(newProject);
    saveProjects();
    projectInput.value = '';
    renderProjects();
    selectProject(newProject.id);
});

function renderProjects() {
    projectList.innerHTML = '';
    
    // Filtrar proyectos: Si es admin global ve todos, si es usuario solo ve donde es miembro
    const visibleProjects = projects.filter(p => {
        if (!currentUser) return false;
        if (currentUser.role === 'admin') return true;
        if (!p.members) return true; // Proyectos antiguos
        return p.members.some(m => m.userId === currentUser.id);
    });

    visibleProjects.forEach(project => {
        // ... (deja el resto del código de esta función igual, solo cambia projects.forEach por visibleProjects.forEach)
        const li = document.createElement('li');
        li.className = `sidebar-item ${currentProjectId === project.id ? 'active' : ''}`;
        
        const titleSpan = document.createElement('span');
        titleSpan.innerHTML = `<i class="fas fa-list-ul" style="margin-right: 10px; opacity: 0.7;"></i> ${project.name}`;
        titleSpan.style.flexGrow = '1';
        titleSpan.onclick = () => selectProject(project.id);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';
        // Solo el administrador GLOBAL puede borrar el proyecto entero
        if (currentUser && currentUser.role === 'admin') {
            actionsDiv.innerHTML = `
                <button class="icon-btn" onclick="deleteProject('${project.id}', event)"><i class="fas fa-trash"></i></button>
            `;
        }

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
    const btnManageMembers = document.getElementById('btn-manage-members');
    if (btnManageMembers) {
        btnManageMembers.classList.toggle('hidden', getProjectRole(project) !== 'admin');
    }
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
        assignedTo: currentUser ? currentUser.id : null,
        dueDate: document.getElementById('task-due-date').value || null
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
                ${task.dueDate ? `<span class="task-tag due-date"><i class="fas fa-calendar-alt"></i> ${formatDate(task.dueDate)}</span>` : ''}
            </div>
            <div class="task-row-right">
                <span class="status-pill ${task.status}" onclick="cycleStatus('${task.id}')" style="cursor:pointer;" title="Clic para cambiar estado">${task.status.replace('-', ' ')}</span>
                ${avatarHtml}
                <div class="task-actions">
                    ${getProjectRole(project) === 'admin' ? `
                        <button class="icon-btn" style="color: var(--accent-blue);" onclick="openEditModal('${task.id}')" title="Editar tarea">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn" style="color: var(--danger);" onclick="deleteTask('${task.id}')" title="Eliminar tarea">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
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

function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

// ==========================================
// MONKEY-22: CALENDARIO
// ==========================================
let calendarDate = new Date();

function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    document.getElementById('cal-month-title').textContent = `${monthNames[month]} ${year}`;

    // Recopilar todas las tareas con fecha de vencimiento
    const tasksByDate = {};
    projects.forEach(project => {
        project.tasks.forEach(task => {
            if (task.dueDate) {
                if (!tasksByDate[task.dueDate]) tasksByDate[task.dueDate] = [];
                tasksByDate[task.dueDate].push({ ...task, projectName: project.name });
            }
        });
    });

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().split('T')[0];

    // Celdas vacías antes del día 1
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-cell empty';
        grid.appendChild(empty);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const cell = document.createElement('div');
        cell.className = 'cal-cell';
        if (dateStr === today) cell.classList.add('today');

        const dayTasks = tasksByDate[dateStr] || [];
        if (dayTasks.length > 0) cell.classList.add('has-tasks');

        cell.innerHTML = `<span class="cal-day-number">${day}</span>`;

        dayTasks.forEach(task => {
            const pill = document.createElement('div');
            pill.className = `cal-task-pill ${task.status} ${task.priority}`;
            pill.textContent = task.title.length > 18 ? task.title.substring(0, 18) + '...' : task.title;
            pill.title = `${task.title} — ${task.projectName}`;
            cell.appendChild(pill);
        });

        grid.appendChild(cell);
    }
}

document.getElementById('cal-prev').addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
});
document.getElementById('cal-next').addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
});

// Navegación del navbar al calendario
document.getElementById('nav-calendar').addEventListener('click', (e) => {
    e.preventDefault();
    // Ocultar secciones principales
    document.getElementById('list-view').classList.add('hidden');
    document.getElementById('kanban-view').classList.add('hidden');
    document.getElementById('stats-section').classList.add('hidden');
    document.querySelector('.add-task-form').classList.add('hidden');
    document.querySelector('.list-headers').classList.add('hidden');
    document.querySelector('.view-toggle').classList.add('hidden');
    document.querySelector('.content-header h1').textContent = 'Calendario';

    // Mostrar calendario
    document.getElementById('calendar-section').classList.remove('hidden');
    renderCalendar();

    // Marcar activo en navbar
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    e.target.closest('.nav-link').classList.add('active');
});

// Al hacer clic en Tareas del navbar, volver a la vista normal
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.id !== 'nav-calendar') {
            document.getElementById('calendar-section').classList.add('hidden');
            document.querySelector('.list-headers').classList.remove('hidden');
            document.querySelector('.view-toggle').classList.remove('hidden');
            if (currentProjectId) {
                document.querySelector('.add-task-form').classList.remove('hidden');
                document.getElementById('current-project-title').textContent = 
                    projects.find(p => p.id === currentProjectId)?.name || 'Selecciona un proyecto';
                setView(currentView);
            }
        }
    });
});

document.getElementById('btn-clear-all').addEventListener('click', () => {
    if (confirm('¿Borrar TODO?')) { localStorage.clear(); location.reload(); }
});
// ==========================================
// RESPALDOS: EXPORTAR E IMPORTAR (JSON)
// ==========================================
const btnExport = document.getElementById('btn-export');
const btnImportTrigger = document.getElementById('btn-import-trigger');
const fileImport = document.getElementById('file-import');

// --- EXPORTAR DATOS ---
if (btnExport) {
    btnExport.addEventListener('click', () => {
        // Recopilar toda la información importante
        const dataToExport = {
            projects: projects,
            users: users,
            theme: localStorage.getItem('themePreference') || 'light',
            view: currentView
        };
        
        // Convertir a texto JSON
        const dataStr = JSON.stringify(dataToExport, null, 2);
        
        // Crear un Blob (archivo virtual)
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        // Crear un enlace temporal para forzar la descarga
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", url);
        
        // Generar nombre de archivo con fecha
        const date = new Date();
        const dateString = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        downloadAnchorNode.setAttribute("download", `tareas_respaldo_${dateString}.json`);
        
        // Ejecutar descarga y limpiar
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        URL.revokeObjectURL(url);
    });
}

// --- IMPORTAR DATOS ---
// 1. Al hacer clic en el botón visible, activamos el input de archivo oculto
if (btnImportTrigger && fileImport) {
    btnImportTrigger.addEventListener('click', () => {
        fileImport.click();
    });

    // 2. Cuando el usuario selecciona un archivo
    fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        
        // 3. Cuando se termine de leer el archivo
        reader.onload = function(event) {
            try {
                // Parsear el texto a un objeto JavaScript
                const importedData = JSON.parse(event.target.result);
                
                // Confirmación para evitar sobreescritura accidental
                if (confirm('¿Estás seguro de que deseas importar este respaldo? Esto sobrescribirá todos tus datos actuales.')) {
                    
                    // Guardar los nuevos datos en el LocalStorage
                    if (importedData.projects) {
                        localStorage.setItem('notionProjectsV5', JSON.stringify(importedData.projects));
                    }
                    if (importedData.users) {
                        localStorage.setItem('notionUsers', JSON.stringify(importedData.users));
                    }
                    if (importedData.theme) {
                        localStorage.setItem('themePreference', importedData.theme);
                    }
                    if (importedData.view) {
                        localStorage.setItem('viewPreference', importedData.view);
                    }
                    
                    alert('Datos importados correctamente. La página se recargará.');
                    // Recargar la página para aplicar los cambios en la interfaz
                    location.reload();
                }
            } catch (err) {
                alert('Error al leer el archivo. Asegúrate de que sea un archivo de respaldo (.json) válido.');
                console.error("Error importando JSON:", err);
            }
        };
        
        // Iniciar la lectura del archivo como texto
        reader.readAsText(file);
        
        // Limpiar el valor del input para permitir seleccionar el mismo archivo después
        e.target.value = '';
    });
}
// ==========================================
// EDICIÓN DE TAREAS Y RESTRICCIÓN DE FECHAS
// ==========================================

// 1. Restringir calendarios a la fecha actual
function setMinDateInputs() {
    const today = new Date().toISOString().split('T')[0]; // Obtiene la fecha de hoy en formato YYYY-MM-DD
    
    // Aplica el límite al formulario de crear y al de editar
    const addTaskDate = document.getElementById('task-due-date');
    const editTaskDate = document.getElementById('edit-task-date');
    
    if (addTaskDate) addTaskDate.setAttribute('min', today);
    if (editTaskDate) editTaskDate.setAttribute('min', today);
}

// Ejecutar la restricción al cargar
document.addEventListener('DOMContentLoaded', setMinDateInputs);

// 2. Elementos del Modal
const editModal = document.getElementById('edit-task-modal');
const editForm = document.getElementById('edit-task-form');
const editIdInput = document.getElementById('edit-task-id');
const editTitleInput = document.getElementById('edit-task-title');
const editPriorityInput = document.getElementById('edit-task-priority');
const editDateInput = document.getElementById('edit-task-date');
const btnCancelEdit = document.getElementById('btn-cancel-edit');

// 3. Función para abrir el modal (Invocada desde el botón)
window.openEditModal = function(taskId) {
    const project = projects.find(p => p.id === currentProjectId);
    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Rellenar los campos con los datos actuales de la tarea
    editIdInput.value = task.id;
    editTitleInput.value = task.title;
    editPriorityInput.value = task.priority;
    editDateInput.value = task.dueDate || '';
    
    // Asegurarnos de que el límite de fecha está aplicado antes de abrir
    setMinDateInputs(); 
    editModal.classList.remove('hidden');
};

// 4. Cerrar el modal
btnCancelEdit.addEventListener('click', () => {
    editModal.classList.add('hidden');
});

// 5. Guardar los cambios
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskId = editIdInput.value;
    const project = projects.find(p => p.id === currentProjectId);
    const task = project.tasks.find(t => t.id === taskId);
    
    if (task) {
        // Actualizar valores
        task.title = editTitleInput.value.trim();
        task.priority = editPriorityInput.value;
        task.dueDate = editDateInput.value;
        
        // Guardar y refrescar interfaz
        saveProjects();
        setView(currentView); // Actualiza la lista o el kanban
        if (typeof renderCalendar === 'function') renderCalendar(); // Actualiza el calendario
        
        editModal.classList.add('hidden');
    }
});
// Verifica el rol del usuario en el proyecto actual
function getProjectRole(project) {
    if (!currentUser) return null;
    if (currentUser.role === 'admin') return 'admin'; // El admin global siempre es admin
    if (!project.members) return 'admin'; // Compatibilidad con proyectos viejos sin miembros
    
    const memberInfo = project.members.find(m => m.userId === currentUser.id);
    return memberInfo ? memberInfo.role : null;
}
// ==========================================
// GESTIÓN DE MIEMBROS DE PROYECTO
// ==========================================
const membersModal = document.getElementById('members-modal');
const btnManageMembers = document.getElementById('btn-manage-members');
const btnCloseMembers = document.getElementById('btn-close-members');
const projectMembersList = document.getElementById('project-members-list');
const newMemberSelect = document.getElementById('new-member-select');
const addMemberForm = document.getElementById('add-member-form');

if (btnManageMembers) {
    btnManageMembers.addEventListener('click', () => {
        renderMembersModal();
        membersModal.classList.remove('hidden');
    });
}

if (btnCloseMembers) {
    btnCloseMembers.addEventListener('click', () => membersModal.classList.add('hidden'));
}

function renderMembersModal() {
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    // Migrar proyecto antiguo si no tiene miembros
    if (!project.members) {
        project.members = [{ userId: currentUser.id, role: 'admin' }];
        saveProjects();
    }
    
    // Pintar la lista de miembros actuales
    projectMembersList.innerHTML = '';
    project.members.forEach(m => {
        const u = users.find(user => user.id === m.userId);
        if(u) {
            const roleBadge = m.role === 'admin' 
                ? '<span style="background:#fee2e2; color:#dc2626; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">Admin</span>' 
                : '<span style="background:#dcfce7; color:#16a34a; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">Usuario</span>';
            
            projectMembersList.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--border-color);">
                    <span><strong>${u.name}</strong> ${roleBadge}</span>
                    ${m.userId !== currentUser.id ? `<button onclick="removeMember('${m.userId}')" style="color:var(--danger); background:none; border:none; cursor:pointer;" title="Expulsar"><i class="fas fa-user-times"></i></button>` : '<span style="font-size:11px; color:var(--text-muted);">Tú</span>'}
                </div>
            `;
        }
    });

    // Pintar el selector de usuarios disponibles (que no estén ya en el proyecto)
    newMemberSelect.innerHTML = '<option value="" disabled selected>Selecciona una persona...</option>';
    let availableUsers = 0;
    users.forEach(u => {
        if (!project.members.some(m => m.userId === u.id) && u.role !== 'admin') {
            newMemberSelect.innerHTML += `<option value="${u.id}">${u.name}</option>`;
            availableUsers++;
        }
    });

    if (availableUsers === 0) {
        newMemberSelect.innerHTML = '<option value="" disabled>No hay más usuarios disponibles</option>';
    }
}

if (addMemberForm) {
    addMemberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userId = newMemberSelect.value;
        const role = document.getElementById('new-member-role').value;
        if(!userId) return;

        const project = projects.find(p => p.id === currentProjectId);
        project.members.push({ userId, role });
        saveProjects();
        renderMembersModal(); // Refrescar la vista
    });
}

window.removeMember = function(userId) {
    if(confirm('¿Estás seguro de quitar a esta persona del proyecto?')) {
        const project = projects.find(p => p.id === currentProjectId);
        project.members = project.members.filter(m => m.userId !== userId);
        saveProjects();
        renderMembersModal();
    }
}