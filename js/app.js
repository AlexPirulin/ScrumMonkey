import { initStorage, saveData } from "./storage.js";

// Cargar dato
let appData = initStorage();

if (!appData) {
  alert('Tu navegador no soporta almacenamiento local.');
  appData = { projects: [], tasks: [], users: [], recentActivity: [] };
}

console.log("Datos iniciales:", appData);

// Función para agregar proyecto
function addProject() {
  const newProject = {
    id: Date.now().toString(),
    name: "Proyecto " + (appData.projects.length + 1),
    tasks: []
  };

  appData.projects.push(newProject);

  // Guardar cambios
  saveData(appData);

  console.log("Proyecto agregado:", newProject);
}

// Evento del botón
document.getElementById("btnAdd").addEventListener("click", addProject);
