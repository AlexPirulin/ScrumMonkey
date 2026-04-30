// ==========================================
// RESET.JS - Módulo de Borrado de Datos
// ==========================================

const btnResetData = document.getElementById('btn-reset-data');

if (btnResetData) {
    btnResetData.addEventListener('click', () => {
        // Primera advertencia
        const confirmacion1 = confirm(
            "⚠️ ¡ADVERTENCIA PELIGROSA! ⚠️\n\n" +
            "Estás a punto de borrar TODOS los datos de la aplicación.\n" +
            "Esto incluye proyectos, tareas, historial de actividad y todos los usuarios creados.\n\n" +
            "¿Estás completamente seguro de continuar?"
        );
        
        // Segunda advertencia de seguridad (doble confirmación)
        if (confirmacion1) {
            const confirmacion2 = confirm(
                "🚨 ÚLTIMO AVISO 🚨\n\n" +
                "Esta acción NO se puede deshacer. Tu espacio de trabajo quedará completamente vacío como la primera vez que entraste.\n\n" +
                "¿Borrar todo definitivamente?"
            );

            if (confirmacion2) {
                // Borramos todo rastro de la aplicación en el LocalStorage
                localStorage.removeItem('notionProjectsV5');
                localStorage.removeItem('notionUsers');
                localStorage.removeItem('notionActivityLog');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('viewPreference');
                // Nota: Mantenemos el 'themePreference' para no deslumbrar al usuario si usa modo oscuro.
                
                alert("🗑️ Todos los datos han sido eliminados correctamente.\nLa aplicación se reiniciará ahora.");
                
                // Recargamos la ventana para devolverlo al login con la DB limpia
                window.location.reload();
            }
        }
    });
}