// js/storage.js
// Módulo de Persistencia — RF21, RF22, RNF9
// TaskFlow — Sprint 1

const STORAGE_KEY = 'taskflow_data';

// Estructura base vacía del sistema
const defaultData = {
  projects: [],
  tasks: [],
  users: [],
  recentActivity: []
};

// RF22 — Cargar datos al iniciar
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

// RF21 — Guardar datos completos
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error al guardar datos:', error);
    return false;
  }
}

// RF23 — Eliminar todos los datos almacenados
function clearData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error al limpiar datos:', error);
    return false;
  }
}

// RNF9 — Verificar si LocalStorage está disponible en el navegador
function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Inicialización automática — RF22
function initStorage() {
  if (!isStorageAvailable()) {
    console.warn('LocalStorage no disponible. Los datos no se guardarán.');
    return null;
  }
  return loadData();
}
