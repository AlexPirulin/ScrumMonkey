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

let proyectos = [];
let editando = -1;

window.guardarProyecto = function() {
    let input = document.getElementById("nombreProyecto");
    let nombre = input.value.trim();

    if(nombre === ""){
        alert("No puedes crear un proyecto sin nombre");
        return;
    }

    if(editando === -1){
        proyectos.push(nombre);
    }else{
        proyectos[editando] = nombre;
        editando = -1;
    }

    input.value = "";
    mostrarProyectos();
}

function mostrarProyectos(){
    let lista = document.getElementById("listaProyectos");
    lista.innerHTML = "";

    proyectos.forEach((proyecto,index)=>{
        lista.innerHTML += `
            <li>
                ${proyecto}
                <div class="acciones">
                    <button onclick="editarProyecto(${index})">Editar</button>
                    <button onclick="eliminarProyecto(${index})">Eliminar</button>
                </div>
            </li>
        `;
    });
}

function editarProyecto(index){
    document.getElementById("nombreProyecto").value = proyectos[index];
    editando = index;
}

function eliminarProyecto(index){
    proyectos.splice(index,1);
    mostrarProyectos();
}

window.addTask = function(){
    const name = document.getElementById("taskName").value;
    const priority = document.getElementById("priority").value;
    const status = document.getElementById("status").value;

    if(name === ""){
        alert("No puedes crear una tarea sin nombre");
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        name,
        priority,
        status
    };

    appData.tasks.push(newTask);
    saveData(appData);

    showTasks();
}

function showTasks(){
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    appData.tasks.forEach(task => {
        list.innerHTML += `
        <li>
            ${task.name} - ${task.priority} - ${task.status}
        </li>`;
    });
}

// Evento del botón
document.getElementById("btnAdd").addEventListener("click", addProject);
