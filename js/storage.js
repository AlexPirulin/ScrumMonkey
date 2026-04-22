// Clave única
const STORAGE_KEY = 'taskflow_data';

// Estructura base
const defaultData = {
  projects: [],
  tasks: [],
  users: [],
  recentActivity: []
};

// Cargar datos
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error al cargar datos:', error);
    return { ...defaultData };
  }
}

// Guardar datos
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error al guardar datos:', error);
    return false;
  }
}

// Limpiar datos
function clearData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error al limpiar datos:', error);
    return false;
  }
}

// Verificar disponibilidad
function isStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Inicializar
function initStorage() {
  if (!isStorageAvailable()) {
    console.warn('LocalStorage no disponible');
    return null;
  }
  return loadData();
}


