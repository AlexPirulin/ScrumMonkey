// ==========================================
// STATS.JS - Módulo de Estadísticas (OPTIMIZADO)
// ==========================================

let chartInstanceDonut = null;
let chartInstancePriority = null;
let chartInstanceStatus = null;

function renderStats() {
    let tasksToProcess = [];
    let viewTitle = 'Global';

    if (currentProjectId) {
        const project = projects.find(p => p.id === currentProjectId);
        if (!project) return;
        tasksToProcess = project.tasks;
        viewTitle = project.name;
    } else {
        const visibleProjects = projects.filter(p => typeof getProjectRole === 'function' && getProjectRole(p) !== null);
        visibleProjects.forEach(p => { tasksToProcess = tasksToProcess.concat(p.tasks); });
    }
    
    const completed = tasksToProcess.filter(t => t.status === 'completada').length;
    const pending = tasksToProcess.length - completed;

    const pAlta = tasksToProcess.filter(t => t.priority === 'alta').length;
    const pMedia = tasksToProcess.filter(t => t.priority === 'media').length;
    const pBaja = tasksToProcess.filter(t => t.priority === 'baja').length;

    const sPend = tasksToProcess.filter(t => t.status === 'pendiente').length;
    const sProg = tasksToProcess.filter(t => t.status === 'en-progreso').length;
    const sStuck = tasksToProcess.filter(t => t.status === 'atasco').length;
    const sComp = completed;

    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#f8fafc' : '#1a202c';
    const colorSuccess = isDark ? '#00f58a' : '#10b981';
    const colorDanger = isDark ? '#ff2a5f' : '#e53e3e';
    const colorWarning = isDark ? '#ffd600' : '#f59e0b';
    const colorInfo = isDark ? '#00e5ff' : '#3b82f6';
    const colorMuted = isDark ? '#8b9bb4' : '#718096';
    const colorBg = isDark ? '#232e48' : '#e2e8f0';

    const commonOptions = {
        responsive: true,
        animation: { duration: 500, easing: 'easeOutQuart' }, // Animación más rápida para evitar lag
        plugins: { legend: { labels: { color: textColor, font: {family: 'system-ui'} } } }
    };

    // OPTIMIZACIÓN: Actualizar en lugar de Destruir
    if (chartInstanceDonut) {
        chartInstanceDonut.data.datasets[0].data = [completed, pending];
        chartInstanceDonut.data.datasets[0].backgroundColor = [colorSuccess, colorBg];
        chartInstanceDonut.options.plugins.title = { display: true, text: `Progreso (${viewTitle})`, color: textColor, font: { size: 16 } };
        chartInstanceDonut.options.plugins.legend.labels.color = textColor;
        chartInstanceDonut.update();
    } else {
        const ctxDonut = document.getElementById('chart-donut').getContext('2d');
        chartInstanceDonut = new Chart(ctxDonut, {
            type: 'doughnut',
            data: { labels: ['Completadas', 'Restantes'], datasets: [{ data: [completed, pending], backgroundColor: [colorSuccess, colorBg], borderWidth: 0, hoverOffset: 4 }] },
            options: { ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: `Progreso (${viewTitle})`, color: textColor, font: { size: 16 } } } }
        });
    }

    if (chartInstancePriority) {
        chartInstancePriority.data.datasets[0].data = [pAlta, pMedia, pBaja];
        chartInstancePriority.data.datasets[0].backgroundColor = [colorDanger, colorWarning, colorInfo];
        chartInstancePriority.options.plugins.title = { display: true, text: `Prioridades (${viewTitle})`, color: textColor, font: { size: 16 } };
        chartInstancePriority.options.plugins.legend.labels.color = textColor;
        chartInstancePriority.update();
    } else {
        const ctxPriority = document.getElementById('chart-priority').getContext('2d');
        chartInstancePriority = new Chart(ctxPriority, {
            type: 'pie',
            data: { labels: ['Alta', 'Media', 'Baja'], datasets: [{ data: [pAlta, pMedia, pBaja], backgroundColor: [colorDanger, colorWarning, colorInfo], borderWidth: 0, hoverOffset: 4 }] },
            options: { ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: `Prioridades (${viewTitle})`, color: textColor, font: { size: 16 } } } }
        });
    }

    if (chartInstanceStatus) {
        chartInstanceStatus.data.datasets[0].data = [sPend, sProg, sStuck, sComp];
        chartInstanceStatus.data.datasets[0].backgroundColor = [colorMuted, colorInfo, colorDanger, colorSuccess];
        chartInstanceStatus.options.plugins.title = { display: true, text: `Distribución (${viewTitle})`, color: textColor, font: { size: 16 } };
        chartInstanceStatus.options.scales.x.ticks.color = textColor;
        chartInstanceStatus.options.scales.y.ticks.color = textColor;
        chartInstanceStatus.options.scales.y.grid.color = isDark ? '#232e48' : '#e2e8f0';
        chartInstanceStatus.update();
    } else {
        const ctxStatus = document.getElementById('chart-status').getContext('2d');
        chartInstanceStatus = new Chart(ctxStatus, {
            type: 'bar',
            data: { labels: ['Pendiente', 'Progreso', 'Atasco', 'Completada'], datasets: [{ label: 'Tareas', data: [sPend, sProg, sStuck, sComp], backgroundColor: [colorMuted, colorInfo, colorDanger, colorSuccess], borderRadius: 6 }] },
            options: { ...commonOptions, scales: { y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: isDark ? '#232e48' : '#e2e8f0' } }, x: { ticks: { color: textColor }, grid: { display: false } } }, plugins: { ...commonOptions.plugins, title: { display: true, text: `Distribución (${viewTitle})`, color: textColor, font: { size: 16 } }, legend: { display: false } } }
        });
    }
}