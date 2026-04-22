// ==========================================
// ESTADO Y PERSISTENCIA
// ==========================================
const STATUSES = [
  { id: 'backlog',     label: 'Backlog',      icon: '📋' },
  { id: 'todo',        label: 'Por Hacer',    icon: '🔵' },
  { id: 'inprogress',  label: 'En Progreso',  icon: '🟡' },
  { id: 'review',      label: 'Revisión',     icon: '🟣' },
  { id: 'done',        label: 'Completado',   icon: '✅' },
];

let projects = JSON.parse(localStorage.getItem('scrumMonkeyV4')) || [];
let currentProjectId = null;
let draggedTaskId = null;

function saveToLocalStorage() {
  localStorage.setItem('scrumMonkeyV4', JSON.stringify(projects));
}

function getCurrentProject() {
  return projects.find(p => p.id === currentProjectId) || null;
}

// ==========================================
// SELECTORES DOM
// ==========================================
const projectForm         = document.getElementById('project-form');
const projectInput        = document.getElementById('project-input');
const projectList         = document.getElementById('project-list');
const currentProjectTitle = document.getElementById('current-project-title');
const taskForm            = document.getElementById('task-form');
const kanbanBoard         = document.getElementById('kanban-board');
const navAddTaskBtn       = document.getElementById('nav-add-task');
const modal               = document.getElementById('task-modal');
const modalOverlay        = document.getElementById('modal-overlay');
const modalTitle          = document.getElementById('modal-title');
const modalInput          = document.getElementById('modal-input');
const modalPriority       = document.getElementById('modal-priority');
const modalStatus         = document.getElementById('modal-status');
const modalSaveBtn        = document.getElementById('modal-save');
const modalCancelBtn      = document.getElementById('modal-cancel');

let editingTaskId = null;

// ==========================================
// MODAL
// ==========================================
function openModal(task = null, defaultStatus = 'todo') {
  editingTaskId = task ? task.id : null;
  modalTitle.textContent = task ? 'Editar Tarea' : 'Nueva Tarea';
  modalInput.value       = task ? task.title    : '';
  modalPriority.value    = task ? task.priority : 'media';
  modalStatus.value      = task ? task.status   : defaultStatus;
  modal.classList.add('visible');
  modalOverlay.classList.add('visible');
  setTimeout(() => modalInput.focus(), 50);
}

function closeModal() {
  modal.classList.remove('visible');
  modalOverlay.classList.remove('visible');
  editingTaskId = null;
}

modalOverlay.addEventListener('click', closeModal);
modalCancelBtn.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

modalSaveBtn.addEventListener('click', () => {
  const title = modalInput.value.trim();
  if (!title) { modalInput.focus(); return; }
  const project = getCurrentProject();
  if (!project) return;

  if (editingTaskId) {
    const task = project.tasks.find(t => t.id === editingTaskId);
    if (task) {
      task.title    = title;
      task.priority = modalPriority.value;
      task.status   = modalStatus.value;
    }
  } else {
    project.tasks.push({
      id:        crypto.randomUUID(),
      title,
      priority:  modalPriority.value,
      status:    modalStatus.value,
      createdAt: Date.now(),
    });
  }

  saveToLocalStorage();
  closeModal();
  renderKanban();
  renderProjects();
});

// ==========================================
// NAV BOTÓN
// ==========================================
navAddTaskBtn.addEventListener('click', () => {
  if (!currentProjectId) {
    projectInput.focus();
    return;
  }
  openModal(null, 'todo');
});

// ==========================================
// PROYECTOS
// ==========================================
projectForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = projectInput.value.trim();
  if (!name) return;
  const newProject = { id: crypto.randomUUID(), name, tasks: [] };
  projects.push(newProject);
  saveToLocalStorage();
  projectInput.value = '';
  renderProjects();
  selectProject(newProject.id);
});

function renderProjects() {
  projectList.innerHTML = '';
  projects.forEach(project => {
    const total    = project.tasks.length;
    const done     = project.tasks.filter(t => t.status === 'done').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    const li = document.createElement('li');
    li.className = `sidebar-item ${currentProjectId === project.id ? 'active' : ''}`;

    const info = document.createElement('div');
    info.className = 'project-info';

    const nameRow = document.createElement('div');
    nameRow.className = 'project-name-row';
    nameRow.innerHTML = '<i class="fas fa-layer-group"></i>';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = project.name;
    nameRow.appendChild(nameSpan);

    const progressRow = document.createElement('div');
    progressRow.className = 'project-progress-row';
    progressRow.innerHTML = `
      <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
      <span class="progress-label">${done}/${total}</span>
    `;

    info.appendChild(nameRow);
    info.appendChild(progressRow);
    info.addEventListener('click', () => selectProject(project.id));

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn';
    editBtn.innerHTML = '<i class="fas fa-pen"></i>';
    editBtn.addEventListener('click', e => { e.stopPropagation(); editProject(project.id); });

    const delBtn = document.createElement('button');
    delBtn.className = 'action-btn delete';
    delBtn.innerHTML = '<i class="fas fa-trash"></i>';
    delBtn.addEventListener('click', e => { e.stopPropagation(); deleteProject(project.id); });

    actions.append(editBtn, delBtn);
    li.append(info, actions);
    projectList.appendChild(li);
  });
}

function selectProject(id) {
  currentProjectId = id;
  const project = getCurrentProject();
  currentProjectTitle.textContent = project.name;
  taskForm.classList.add('hidden');
  renderProjects();
  renderKanban();
}

function editProject(id) {
  const project = projects.find(p => p.id === id);
  const newName = prompt('Renombrar proyecto:', project.name);
  if (newName && newName.trim()) {
    project.name = newName.trim();
    saveToLocalStorage();
    renderProjects();
    if (currentProjectId === id) currentProjectTitle.textContent = project.name;
  }
}

function deleteProject(id) {
  if (!confirm('¿Eliminar este proyecto y todas sus tareas?')) return;
  projects = projects.filter(p => p.id !== id);
  if (currentProjectId === id) {
    currentProjectId = null;
    currentProjectTitle.textContent = 'Selecciona un proyecto';
    kanbanBoard.innerHTML = '';
  }
  saveToLocalStorage();
  renderProjects();
}

// ==========================================
// KANBAN BOARD
// ==========================================
function renderKanban() {
  kanbanBoard.innerHTML = '';
  const project = getCurrentProject();
  if (!project) return;

  STATUSES.forEach(status => {
    const tasks = project.tasks.filter(t => t.status === status.id);
    const col = document.createElement('div');
    col.className = 'kanban-col';
    col.dataset.status = status.id;

    const header = document.createElement('div');
    header.className = `col-header col-header-${status.id}`;
    header.innerHTML = `
      <div class="col-title">
        <span class="col-icon">${status.icon}</span>
        <span>${status.label}</span>
      </div>
      <span class="col-count">${tasks.length}</span>
    `;

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'col-cards';
    cardsContainer.dataset.status = status.id;

    tasks.forEach(task => cardsContainer.appendChild(buildCard(task)));

    // Drag over
    cardsContainer.addEventListener('dragover', e => {
      e.preventDefault();
      cardsContainer.classList.add('drag-over');
      const afterEl = getDragAfterElement(cardsContainer, e.clientY);
      const dragging = document.querySelector('.dragging');
      if (dragging) {
        if (!afterEl) cardsContainer.appendChild(dragging);
        else cardsContainer.insertBefore(dragging, afterEl);
      }
    });

    cardsContainer.addEventListener('dragleave', e => {
      if (!cardsContainer.contains(e.relatedTarget)) {
        cardsContainer.classList.remove('drag-over');
      }
    });

    cardsContainer.addEventListener('drop', e => {
      e.preventDefault();
      cardsContainer.classList.remove('drag-over');
      if (draggedTaskId) moveTask(draggedTaskId, status.id);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'col-add-btn';
    addBtn.innerHTML = '<i class="fas fa-plus"></i> Añadir tarea';
    addBtn.addEventListener('click', () => {
      if (!currentProjectId) return;
      openModal(null, status.id);
    });

    col.append(header, cardsContainer, addBtn);
    kanbanBoard.appendChild(col);
  });
}

function buildCard(task) {
  const card = document.createElement('div');
  card.className = `kanban-card priority-${task.priority}`;
  card.draggable = true;
  card.dataset.id = task.id;

  const priorityLabels = { alta: 'Alta', media: 'Media', baja: 'Baja' };
  const priorityIcons  = { alta: '🔴', media: '🟡', baja: '🟢' };

  const body = document.createElement('div');
  body.className = 'card-body';
  const titleP = document.createElement('p');
  titleP.className = 'card-title';
  titleP.textContent = task.title;
  body.appendChild(titleP);

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const badge = document.createElement('span');
  badge.className = `priority-badge ${task.priority}`;
  badge.textContent = `${priorityIcons[task.priority]} ${priorityLabels[task.priority]}`;

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'card-btn';
  editBtn.title = 'Editar';
  editBtn.innerHTML = '<i class="fas fa-pen"></i>';
  editBtn.addEventListener('click', e => { e.stopPropagation(); editTask(task.id); });

  const delBtn = document.createElement('button');
  delBtn.className = 'card-btn delete-card';
  delBtn.title = 'Eliminar';
  delBtn.innerHTML = '<i class="fas fa-trash"></i>';
  delBtn.addEventListener('click', e => { e.stopPropagation(); deleteTask(task.id); });

  actions.append(editBtn, delBtn);
  footer.append(badge, actions);
  card.append(body, footer);

  // Drag
  card.addEventListener('dragstart', () => {
    draggedTaskId = task.id;
    card.classList.add('dragging');
    setTimeout(() => card.style.opacity = '0.4', 0);
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    card.style.opacity = '';
    draggedTaskId = null;
    document.querySelectorAll('.col-cards').forEach(c => c.classList.remove('drag-over'));
  });

  return card;
}

function getDragAfterElement(container, y) {
  const els = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
  return els.reduce((closest, child) => {
    const box    = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function moveTask(taskId, newStatus) {
  const project = getCurrentProject();
  if (!project) return;
  const task = project.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
    saveToLocalStorage();
    renderKanban();
    renderProjects();
  }
}

// ==========================================
// CRUD TAREAS
// ==========================================
function editTask(taskId) {
  const task = getCurrentProject()?.tasks.find(t => t.id === taskId);
  if (task) openModal(task);
}

function deleteTask(taskId) {
  if (!confirm('¿Eliminar esta tarea?')) return;
  const project = getCurrentProject();
  if (!project) return;
  project.tasks = project.tasks.filter(t => t.id !== taskId);
  saveToLocalStorage();
  renderKanban();
  renderProjects();
}

// ==========================================
// INIT
// ==========================================
renderProjects();
