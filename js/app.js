// ==========================================
// ESTADO Y PERSISTENCIA (Proyectos y Tema)
// ==========================================
let projects = JSON.parse(localStorage.getItem('notionProjectsV4')) || [];
let currentProjectId = null;

function saveToLocalStorage() {
    localStorage.setItem('notionProjectsV4', JSON.stringify(projects));
}

// ==========================================
// SELECTORES DOM
// ==========================================
const projectForm = document.getElementById('project-form');
const projectInput = document.getElementById('project-input');
const projectList = document.getElementById('project-list');

const currentProjectTitle = document.getElementById('current-project-title');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskPriority = document.getElementById('task-priority');
const taskList = document.getElementById('task-list');
const navAddTaskBtn = document.getElementById('nav-add-task');
const themeToggle = document.getElementById('theme-toggle');

// ==========================================
// LÓGICA DEL MODO OSCURO
// ==========================================
const currentTheme = localStorage.getItem('themePreference');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    
    // Cambiar icono y guardar preferencia
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('themePreference', isDark ? 'dark' : 'light');
});

// Botón de Navbar "+ Tarea"
navAddTaskBtn.addEventListener('click', () => {
    if (!currentProjectId) {
        alert('Por favor, selecciona o crea un proyecto primero en la barra lateral.');
        projectInput.focus();
    } else {
        taskInput.focus();
    }
});

// ==========================================
// LÓGICA DE PROYECTOS
// ==========================================
projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const projectName = projectInput.value.trim();
    if (!projectName) return;

    const newProject = {
        id: Date.now().toString(),
        name: projectName,
        tasks: []
    };

    projects.push(newProject);
    saveToLocalStorage();
    projectInput.value = '';
    renderProjects();
    
    // Seleccionar automáticamente el proyecto recién creado
    selectProject(newProject.id);
});

function renderProjects() {
    projectList.innerHTML = '';
    
    // Estado vacío para proyectos
    if (projects.length === 0) {
        projectList.innerHTML = `<div class="empty-state">No tienes proyectos aún.<br>¡Crea uno arriba!</div>`;
        return;
    }

    projects.forEach(project => {
        const li = document.createElement('li');
        li.className = `sidebar-item ${currentProjectId === project.id ? 'active' : ''}`;
        
        const titleSpan = document.createElement('span');
        titleSpan.innerHTML = `<i class="fas fa-folder" style="margin-right: 8px;"></i> ${project.name}`;
        titleSpan.style.flexGrow = '1';
        titleSpan.onclick = () => selectProject(project.id);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn';
        editBtn.innerHTML = '<i class="fas fa-pen"></i>';
        editBtn.onclick = (e) => { e.stopPropagation(); editProject(project.id); };

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = (e) => { e.stopPropagation(); deleteProject(project.id); };

        actionsDiv.append(editBtn, deleteBtn);
        li.append(titleSpan, actionsDiv);
        projectList.appendChild(li);
    });
}

function selectProject(id) {
    currentProjectId = id;
    const project = projects.find(p => p.id === id);
    currentProjectTitle.innerHTML = `${project.name}`;
    taskForm.classList.remove('hidden');
    renderProjects();
    renderTasks();
}

function editProject(id) {
    const project = projects.find(p => p.id === id);
    const newName = prompt('Editar nombre del proyecto:', project.name);
    if (newName && newName.trim() !== '') {
        project.name = newName.trim();
        saveToLocalStorage();
        renderProjects();
        if (currentProjectId === id) selectProject(id);
    }
}

function deleteProject(id) {
    if (confirm(`¿Estás seguro de eliminar el proyecto y todas sus tareas?`)) {
        projects = projects.filter(p => p.id !== id);
        if (currentProjectId === id) {
            currentProjectId = null;
            taskForm.classList.add('hidden');
            currentProjectTitle.innerHTML = 'Selecciona un proyecto';
            taskList.innerHTML = '<div class="empty-state"><i class="fas fa-hand-pointer"></i>Selecciona un proyecto en la barra lateral para ver tus tareas.</div>';
        }
        saveToLocalStorage();
        renderProjects();
    }
}

// ==========================================
// LÓGICA DE TAREAS
// ==========================================
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentProjectId) return;

    const title = taskInput.value.trim();
    if (!title) return;

    const project = projects.find(p => p.id === currentProjectId);
    const newTask = {
        id: Date.now().toString(),
        title: title,
        priority: taskPriority.value,
        status: 'pendiente'
    };

    project.tasks.unshift(newTask); // Añade la nueva tarea al principio de la lista
    saveToLocalStorage();
    taskInput.value = '';
    renderTasks();
});

function renderTasks() {
    taskList.innerHTML = '';
    if (!currentProjectId) return;

    const project = projects.find(p => p.id === currentProjectId);
    
    // Estado vacío para tareas
    if (project.tasks.length === 0) {
        taskList.innerHTML = `<div class="empty-state"><i class="fas fa-clipboard-check"></i>No hay tareas en este proyecto.<br>Añade una usando el formulario de arriba.</div>`;
        return;
    }

    project.tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-item ${task.status === 'completada' ? 'task-completed' : ''}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.status === 'completada';
        checkbox.onchange = () => toggleTaskStatus(task.id);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.textContent = task.title;

        const priorityBadge = document.createElement('span');
        priorityBadge.className = `tag ${task.priority}`;
        priorityBadge.textContent = `Prioridad: ${task.priority}`;

        const leftContent = document.createElement('div');
        leftContent.style.display = 'flex';
        leftContent.style.alignItems = 'center';
        leftContent.style.gap = '15px';
        leftContent.append(titleSpan, priorityBadge);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn';
        editBtn.innerHTML = '<i class="fas fa-pen"></i>';
        editBtn.title = "Editar tarea";
        editBtn.onclick = () => editTask(task.id);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = "Eliminar tarea";
        deleteBtn.onclick = () => deleteTask(task.id);

        actionsDiv.append(editBtn, deleteBtn);
        
        contentDiv.append(leftContent, actionsDiv);
        div.append(checkbox, contentDiv);
        taskList.appendChild(div);
    });
}

function toggleTaskStatus(taskId) {
    const project = projects.find(p => p.id === currentProjectId);
    const task = project.tasks.find(t => t.id === taskId);
    task.status = task.status === 'pendiente' ? 'completada' : 'pendiente';
    saveToLocalStorage();
    renderTasks();
}

function editTask(taskId) {
    const project = projects.find(p => p.id === currentProjectId);
    const task = project.tasks.find(t => t.id === taskId);
    const newTitle = prompt('Editar tarea:', task.title);
    
    if (newTitle && newTitle.trim() !== '') {
        task.title = newTitle.trim();
        saveToLocalStorage();
        renderTasks();
    }
}

function deleteTask(taskId) {
    if(confirm('¿Seguro que deseas eliminar esta tarea?')) {
        const project = projects.find(p => p.id === currentProjectId);
        project.tasks = project.tasks.filter(t => t.id !== taskId);
        saveToLocalStorage();
        renderTasks();
    }
}

// Iniciar aplicación
renderProjects();
if (!currentProjectId) {
    taskList.innerHTML = '<div class="empty-state"><i class="fas fa-hand-pointer"></i>Selecciona o crea un proyecto en la barra lateral para comenzar.</div>';
}
