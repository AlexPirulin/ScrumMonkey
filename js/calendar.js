// ==========================================
// CALENDAR.JS - Módulo de Calendario
// ==========================================

const calendarSection = document.getElementById('calendar-section');
const btnShowCalendar = document.getElementById('btn-show-calendar');
const calendarGrid = document.getElementById('calendar-grid');
let currentCalDate = new Date();

if (btnShowCalendar) btnShowCalendar.addEventListener('click', showCalendarView);
if (document.getElementById('btn-prev-month')) document.getElementById('btn-prev-month').addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() - 1); renderCalendar(); });
if (document.getElementById('btn-next-month')) document.getElementById('btn-next-month').addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() + 1); renderCalendar(); });

function showCalendarView() {
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById('project-view-section').classList.add('hidden');
    calendarSection.classList.remove('hidden');

    currentProjectId = null;
    if (typeof renderProjects === 'function') renderProjects();
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    btnShowCalendar.classList.add('active');

    renderCalendar();
}

function renderCalendar() {
    if (!calendarGrid) return;
    calendarGrid.innerHTML = '';
    
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    document.getElementById('calendar-month-title').innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthNames[month]} ${year}`;
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    const visibleProjects = projects.filter(p => typeof getProjectRole === 'function' && getProjectRole(p) !== null);
    let tasksWithDates = [];
    visibleProjects.forEach(p => { p.tasks.forEach(t => { if (t.dueDate) tasksWithDates.push({...t, projectName: p.name}); }); });

    for (let i = 0; i < firstDayIndex; i++) { calendarGrid.innerHTML += `<div class="calendar-day empty"></div>`; }

    for (let i = 1; i <= lastDay; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayTasks = tasksWithDates.filter(t => t.dueDate === dateStr);
        
        let tasksHtml = dayTasks.map(t => {
            let color = '#718096'; 
            if (t.status === 'completada') color = '#10b981'; 
            else if (t.status === 'atasco') color = '#ef4444'; // Color Rojo para Atasco
            else if (t.priority === 'alta') color = '#e53e3e'; 
            else if (t.priority === 'media') color = '#f59e0b'; 
            else if (t.priority === 'baja') color = '#3b82f6'; 
            
            return `<div class="cal-task" style="background: ${color};" title="Proyecto: ${t.projectName}">${t.status === 'completada' ? '<i class="fas fa-check"></i> ' : ''}${t.title}</div>`;
        }).join('');

        const isTodayClass = (isCurrentMonth && i === today.getDate()) ? 'today' : '';
        calendarGrid.innerHTML += `<div class="calendar-day ${isTodayClass}"><div class="day-number">${i}</div>${tasksHtml}</div>`;
    }
}