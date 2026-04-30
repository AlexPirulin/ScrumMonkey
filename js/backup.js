// ==========================================
// BACKUP.JS - Módulo de Importación y Exportación
// ==========================================

const btnExport = document.getElementById('btn-export-data');
const btnImport = document.getElementById('btn-import-data');
const fileImportInput = document.getElementById('file-import-data');

// --- 1. FUNCIÓN PARA EXPORTAR (Guardar Respaldo) ---
if (btnExport) {
    btnExport.addEventListener('click', () => {
        // Recopilamos todos los datos importantes de LocalStorage
        const dataToExport = {
            projects: JSON.parse(localStorage.getItem('notionProjectsV5')) || [],
            users: JSON.parse(localStorage.getItem('notionUsers')) || [],
            activityLog: JSON.parse(localStorage.getItem('notionActivityLog')) || [],
            theme: localStorage.getItem('themePreference') || 'light',
            view: localStorage.getItem('viewPreference') || 'list'
        };

        // Convertimos el objeto en una cadena JSON formateada
        const dataStr = JSON.stringify(dataToExport, null, 2);
        
        // Creamos un archivo Blob con la información
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        // Generamos un enlace temporal para forzar la descarga
        const a = document.createElement('a');
        a.href = url;
        
        // El nombre del archivo incluirá la fecha actual
        const today = new Date().toISOString().split('T')[0];
        a.download = `TaskMaster_Respaldo_${today}.json`;
        
        document.body.appendChild(a);
        a.click(); // Disparamos la descarga
        
        // Limpiamos el enlace temporal
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// --- 2. FUNCIÓN PARA IMPORTAR (Cargar Respaldo) ---
if (btnImport && fileImportInput) {
    
    // Al dar clic al botón, abrimos el explorador de archivos oculto
    btnImport.addEventListener('click', () => {
        fileImportInput.click(); 
    });

    // Cuando el usuario selecciona un archivo
    fileImportInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                // Parseamos el JSON leído
                const importedData = JSON.parse(event.target.result);
                
                if (confirm('⚠️ ¿Estás seguro de importar este respaldo? Esto sobrescribirá todos tus proyectos, tareas y usuarios actuales.')) {
                    
                    // Guardamos los datos nuevos en LocalStorage si existen en el archivo
                    if (importedData.projects) {
                        localStorage.setItem('notionProjectsV5', JSON.stringify(importedData.projects));
                    }
                    if (importedData.users) {
                        localStorage.setItem('notionUsers', JSON.stringify(importedData.users));
                    }
                    if (importedData.activityLog) {
                        localStorage.setItem('notionActivityLog', JSON.stringify(importedData.activityLog));
                    }
                    if (importedData.theme) {
                        localStorage.setItem('themePreference', importedData.theme);
                    }
                    if (importedData.view) {
                        localStorage.setItem('viewPreference', importedData.view);
                    }
                    
                    alert('✅ ¡Datos restaurados con éxito! La página se recargará para aplicar los cambios.');
                    
                    // Recargamos la página para que store.js y auth.js lean los nuevos datos
                    location.reload();
                }
            } catch (err) {
                alert('❌ Error al leer el archivo. Asegúrate de que sea un archivo de respaldo (.json) válido.');
                console.error("Error importando JSON:", err);
            }
        };
        
        // Ejecutamos la lectura del archivo como texto
        reader.readAsText(file);
        
        // Limpiamos el input para que nos deje importar el mismo archivo de nuevo si queremos
        e.target.value = '';
    });
}