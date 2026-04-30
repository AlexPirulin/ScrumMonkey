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
    
    // Contadores para Donut
    const completed = tasks.filter(t => t.status === 'completada').length;
    const pending = tasks.length - completed;

    // Contadores para Prioridad
    const pAlta = tasks.filter(t => t.priority === 'alta').length;
    const pMedia = tasks.filter(t => t.priority === 'media').length;
    const pBaja = tasks.filter(t => t.priority === 'baja').length;

    // Contadores para Estados (Ahora incluye ATASCO)
    const sPend = tasks.filter(t => t.status === 'pendiente').length;
    const sProg = tasks.filter(t => t.status === 'en-progreso').length;
    const sStuck = tasks.filter(t => t.status === 'atasco').length;
    const sComp = completed;

    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#edf2f7' : '#1a202c';

    const commonOptions = {
        responsive: true,
        animation: { duration: 1000, easing: 'easeOutQuart' }, // Animación de Chart.js fluida
        plugins: { legend: { labels: { color: textColor } } }
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
                backgroundColor: ['#10b981', isDark ? '#4a5568' : '#e2e8f0'],
                borderWidth: 0
            }]
        },
        options: { ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: 'Progreso', color: textColor, font: { size: 16 } } } }
    });

    // 2. Gráfico de Prioridad
    const ctxPriority = document.getElementById('chart-priority').getContext('2d');
    chartInstancePriority = new Chart(ctxPriority, {
        type: 'pie',
        data: {
            labels: ['Alta', 'Media', 'Baja'],
            datasets: [{
                data: [pAlta, pMedia, pBaja],
                backgroundColor: ['#e53e3e', '#f59e0b', '#3b82f6'],
                borderWidth: 0
            }]
        },
        options: { ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: 'Prioridades', color: textColor, font: { size: 16 } } } }
    });

    // 3. Gráfico de Estados (Con Atasco)
    const ctxStatus = document.getElementById('chart-status').getContext('2d');
    chartInstanceStatus = new Chart(ctxStatus, {
        type: 'bar',
        data: {
            labels: ['Pendiente', 'Progreso', 'Atasco', 'Completada'],
            datasets: [{
                label: 'Tareas',
                data: [sPend, sProg, sStuck, sComp],
                backgroundColor: ['#718096', '#3b82f6', '#ef4444', '#10b981'], // Agregado color rojo para Atasco
                borderRadius: 6
            }]
        },
        options: { 
            ...commonOptions, 
            scales: { 
                y: { ticks: { color: textColor, stepSize: 1, font: { size: 12 } }, grid: { color: isDark ? '#2d3748' : '#e2e8f0' } },
                x: { ticks: { color: textColor, font: { size: 12 } }, grid: { display: false } }
            },
            plugins: { ...commonOptions.plugins, title: { display: true, text: 'Estado Actual', color: textColor, font: { size: 16 } }, legend: { display: false } } 
        }
    });
}