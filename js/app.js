// Carga inicial de datos — llama al módulo de storage
let appData = initStorage();

if (!appData) {
  // Mostrar mensaje al usuario si LocalStorage no está disponible
  alert('Tu navegador no soporta almacenamiento local. Algunas funciones no estarán disponibles.');
  appData = { projects: [], tasks: [], users: [], recentActivity: [] };
}
