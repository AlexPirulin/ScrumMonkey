// Clave única para LocalStorage
const STORAGE_KEY = "taskflow_data";

/**
 * Estructura base de la aplicación
 */
function getDefaultData() {
  return {
    projects: [],
    users: []
  };
}

/**
 * Guardar datos en LocalStorage (RF21)
 */
export function saveData(data) {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error("Error al guardar datos:", error);
  }
}

/**
 * Cargar datos automáticamente (RF22)
 */
export function loadData() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);

    if (!json) {
      return getDefaultData();
    }

    return JSON.parse(json);

  } catch (error) {
    console.error("Error al cargar datos:", error);
    return getDefaultData();
  }
}

/**
 * Eliminar todos los datos (RF23)
 */
export function clearData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error al eliminar datos:", error);
  }
}

/**
 * Validación básica antes de guardar (RNF9)
 */
export function validateData(data) {
  if (!data) return false;
  if (!Array.isArray(data.projects)) return false;
  if (!Array.isArray(data.users)) return false;

  return true;
}
