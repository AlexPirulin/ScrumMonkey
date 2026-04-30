// ==========================================
// STATS.JS - Módulo de Estadísticas de Proyecto
// ==========================================

let chartInstanceDonut = null;
let chartInstancePriority = null;
let chartInstanceStatus = null;

function renderStats() {
    if (!currentProjectId) return;
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;

    const tasks = project.tasks;
    
    const completed = tasks.filter(t => t.status === 'completada').length;
    const pending = tasks.length - completed;

    const pAlta = tasks.filter(t => t.priority === 'alta').length;
    const pMedia = tasks.filter(t => t.priority === 'media').length;
    const pBaja = tasks.filter(t => t.priority === 'baja').length;

    const sPend = tasks.filter(t => t.status === 'pendiente').length;
    const sProg = tasks.filter(t => t.status === 'en-progreso').length;
    const sStuck = tasks.filter(t => t.status === 'atasco').length;
    const sComp = completed;

    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#f8fafc' : '#1a202c';

    // Colores Adaptativos Neón/Estándar
    const colorSuccess = isDark ? '#00f58a' : '#10b981';
    const colorDanger = isDark ? '#ff2a5f' : '#e53e3e';
    const colorWarning = isDark ? '#ffd600' : '#f59e0b';
    const colorInfo = isDark ? '#00e5ff' : '#3b82f6';
    const colorMuted = isDark ? '#8b9bb4' : '#718096';
    const colorBg = isDark ? '#232e48' : '#e2e8f0';

    const commonOptions = {
        responsive: true,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: { legend: { labels: { color: textColor, font: {family: 'system-ui'} } } }
    };

    if (chartInstanceDonut) chartInstanceDonut.destroy();
    if (chartInstancePriority) chartInstancePriority.destroy();
    if (chartInstanceStatus) chartInstanceStatus.destroy();

    // 1. Gráfico de Progreso
    const ctxDonut = document.getElementById('chart-donut').getContext('2d');
    chartInstanceDonut = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
            labels: ['Completadas', 'Restantes'],
            datasets: [{
                data: [completed, pending],
                backgroundColor: [colorSuccess, colorBg],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: { ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: 'Progreso General', color: textColor, font: { size: 16 } } } }
    });

    // 2. Gráfico de Prioridad
    const ctxPriority = document.getElementById('chart-priority').getContext('2d');
    chartInstancePriority = new Chart(ctxPriority, {
        type: 'pie',
        data: {
            labels: ['Alta', 'Media', 'Baja'],
            datasets: [{
                data: [pAlta, pMedia, pBaja],
                backgroundColor: [colorDanger, colorWarning, colorInfo],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: { ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: 'Prioridad de Tareas', color: textColor, font: { size: 16 } } } }
    });

    // 3. Gráfico de Estados
    const ctxStatus = document.getElementById('chart-status').getContext('2d');
    chartInstanceStatus = new Chart(ctxStatus, {
        type: 'bar',
        data: {
            labels: ['Pendiente', 'Progreso', 'Atasco', 'Completada'],
            datasets: [{
                label: 'Tareas',
                data: [sPend, sProg, sStuck, sComp],
                backgroundColor: [colorMuted, colorInfo, colorDanger, colorSuccess],
                borderRadius: 6
            }]
        },
        options: { 
            ...commonOptions, 
            scales: { 
                y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: isDark ? '#232e48' : '#e2e8f0' } },
                x: { ticks: { color: textColor }, grid: { display: false } }
            },
            plugins: { ...commonOptions.plugins, title: { display: true, text: 'Distribución por Estado', color: textColor, font: { size: 16 } }, legend: { display: false } } 
        }
    });
}