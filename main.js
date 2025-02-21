/******* CONSTANTES ***************************************************************************/
const API_URL = "https://delpe-todo.onrender.com/";
const token = localStorage.getItem("token");

const inputText$ = document.getElementById("input-text");
const createItemBtn$ = document.getElementById("create-item");
const searchWord$ = document.getElementById("search-word");
const listOfTodo$ = document.getElementById("content");
const modalContainer$ = document.getElementById("modal");
const cancelDelete$ = document.getElementById("cancel-delete");
const btnFilterAll$ = document.getElementById("all");
const btnFilterPending$ = document.getElementById("pending");
const btnFilterDone$ = document.getElementById("done");
const confirmDelete$ = document.getElementById("confirm-delete");
const errorSpan$ = document.getElementById("error-span");
const form$ = document.querySelector("form");

function getUserRole() {
  const userData = localStorage.getItem("userData");
  const user = JSON.parse(userData);
  return user.accessLevel;
}

function checkUserPermissions() {
  const userRole = getUserRole();
  if (userRole === "Cliente" || userRole === "Dev") {
    inputText$.disabled = true;
    inputText$.style.cursor = "not-allowed";
    createItemBtn$.disabled = true;
  }
}

form$.addEventListener("submit", (event) => {
  event.preventDefault();
});

errorSpan$.classList.add("error-span");

const errorSpanSearch = document.createElement("span");
errorSpanSearch.classList.add("error-span-content");
errorSpan$.parentElement.parentElement.appendChild(errorSpanSearch);

const todos = JSON.parse(localStorage.getItem("todos")) || [];

/******* FUNÇÃO PARA HABILITAR CRIAÇÃO DO tODO ********************************************************************/
inputText$.addEventListener("input", () => {
  const value = inputText$.value.trim();
  createItemBtn$.disabled = value.length < 5;
  searchWord$.disabled = todos.length === 0;

  if (value.length < 5) {
    errorSpan$.textContent = "this field must have at least 5 characters!";
    errorSpan$.classList.add("error-span-visible");
  } else if (value.length >= 19) {
    errorSpan$.textContent = "limit of characters reached!";
    errorSpan$.classList.add("error-span-visible");
  } else {
    errorSpan$.classList.remove("error-span-visible");
  }
});

inputText$.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const value = inputText$.value.trim();

    if (value.length >= 5) {
      createItemBtn$.click();
    }
  }
});

/******* FUNÇÃO PARA CRIAR OS TODOS INICIO ***************************************************************************/

createItemBtn$.addEventListener("click", () => {
  const userRole = getUserRole();

  if (userRole !== "Gerente") {
    return;
  }

  const value = inputText$.value.trim();
  if (value.length < 5) return;
  createTodo(value);
  inputText$.value = "";
  createItemBtn$.disabled = true;
  // errorSpan$.classList.remove("error-span--visible");
});

function createTodoTemplate(todo) {
  const userRole = getUserRole();
  const li = document.createElement("li");
  li.classList.add("todo-item");
  li.setAttribute("id", todo.id);
  if (todo.done) {
    li.classList.add("task-completed");
  }

  const divGroup = document.createElement("div");
  divGroup.classList.add("todo-item-group");

  const statusIcon = document.createElement("i");
  statusIcon.classList.add(
    "fa",
    todo.done ? "fa-circle-check" : "fa-stop-circle"
  );
  statusIcon.style.cursor = "pointer";

  const spanDescription = document.createElement("span");
  spanDescription.classList.add("todo-item-content");
  spanDescription.appendChild(document.createTextNode(todo.description));

  const divItems = document.createElement("div");
  const penIcon = document.createElement("i");
  penIcon.classList.add("fa-solid", "fa-pen");
  const trashIcon = document.createElement("i");
  trashIcon.classList.add("fa-solid", "fa-trash");

  divGroup.appendChild(statusIcon);
  divGroup.appendChild(spanDescription);
  divItems.appendChild(penIcon);
  divItems.appendChild(trashIcon);
  li.appendChild(divGroup);
  li.appendChild(divItems);

  if (userRole === "Cliente") {
    statusIcon.style.cursor = "not-allowed";
    statusIcon.style.opacity = "0.5";
  } else {
    statusIcon.style.cursor = "pointer";
    statusIcon.addEventListener("click", () => {
      const newCheckedState = !todo.done;
      updateStatusTodo(todo.id, newCheckedState);
    });
  }

  // statusIcon.addEventListener("click", () => {
  //   const newCheckedState = !todo.done;
  //   updateStatusTodo(todo.id, newCheckedState);
  // });

  let todoToDelete = null;

  /******* MODAL E DELETE DOS TODOS***************************************************************************/

  trashIcon.addEventListener("click", (event) => {
    todoToDelete = event.target.parentElement.parentElement;
    modalContainer$.style.display = "flex";
  });

  cancelDelete$.addEventListener("click", () => {
    modalContainer$.style.display = "none";
    todoToDelete = null;
  });

  confirmDelete$.addEventListener("click", () => {
    if (todoToDelete) {
      const todoId = todoToDelete.id;
      const index = todos.findIndex((todo) => todo.id == todoId);
      todos.splice(index, 1);
      todoToDelete.remove();
      modalContainer$.style.display = "none";
      todoToDelete = null;
    }
  });

  modalContainer$.addEventListener("click", (event) => {
    if (event.target === modalContainer$) {
      modalContainer$.style.display = "none";
      todoToDelete = null;
    }
  });

  //icone edição
  penIcon.addEventListener("click", (event) => {
    const todoElement = event.target.parentElement.parentElement;
    const iconPen = todoElement.querySelector(".fa-pen");
    const iconCheck = todoElement.querySelector(".fa-check");
    const todoContent = todoElement.querySelector(".todo-item-content");
    if (iconPen) {
      iconPen.classList.remove("fa-pen");
      iconPen.classList.add("fa-check");
      todoContent.contentEditable = true;
      todoContent.focus();
      todoContent.classList.add("editing");
    } else {
      const newValue = todoContent.textContent.trim();
      if (newValue.length >= 5) {
        const limitedValue = newValue.slice(0, 19);
        const todoId = todoElement.id;
        const todo = todos.find((arrayElement) => arrayElement.id == todoId);
        if (todo) {
          todo.description = limitedValue;
          todoContent.textContent = limitedValue;
          // saveTodosToTheStorage();
        }
        iconCheck.classList.remove("fa-check");
        iconCheck.classList.add("fa-pen");
        todoContent.contentEditable = false;
        todoContent.classList.remove("editing");
      } else {
        alert("Todo must be at least 5 characters long!");
        todoContent.focus();
      }
    }
  });
  return li;
}

function getTodos() {
  fetch(`${API_URL}task`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`Error ${resp.status}: ${resp.statusText}`);
      }
      return resp.json();
    })
    .then((json) => {
      console.log("API Response:", json);
      const getTodos = json;
      createTodosinView(getTodos);
    })
    .catch((error) => {
      console.log(error.message);
    });
}

function createTodo(description) {
  fetch(`${API_URL}task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      description,
    }),
  })
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`Error ${resp.status}: ${resp.statusText}`);
      }
      getTodos();
    })
    .catch((error) => {
      console.log(error.message);
    });
}

function updateStatusTodo(todoId, newStatus) {
  fetch(`${API_URL}task/${todoId}/done`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      done: newStatus,
    }),
  })
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`Error ${resp.status}:${resp.statusText}`);
      }
      return resp.json();
    })
    .then((updatedTodo) => {
      const todoElement = document.getElementById(todoId);
      if (todoElement) {
        const statusIcon = todoElement.querySelector(".fa");
        statusIcon.classList.remove("fa-circle-check", "fa-stop-circle");
        statusIcon.classList.add(
          updatedTodo.done ? "fa-circle-check" : "fa-stop-circle"
        );
        if (updatedTodo.done) {
          todoElement.classList.add("task-completed");
        } else {
          todoElement.classList.remove("task-completed");
        }
      }
      showToast();
    })
    .catch((error) => {
      console.log(error.message);
    });
}

// /******* FUNÇÃO PARA FILTRAR TODOS (PELO STATUS)***********************************************************/

function createTodosinView(todo) {
  listOfTodo$.innerHTML = "";
  todo.forEach((todo) => {
    const todoElement = createTodoTemplate(todo);
    listOfTodo$.appendChild(todoElement);
  });
}

let activeFilterBtn = btnFilterAll$;
let btnFilterValue = "all";

function toggleFilterButton(clickedBtn) {
  activeFilterBtn.classList.remove("btn-filter-active");

  clickedBtn.classList.add("btn-filter-active");

  activeFilterBtn = clickedBtn;
}

function applyFilters() {
  const searchValue = inputText$.value.trim().toLowerCase();
  let filteredTodos = todos;

  filteredTodos = filteredTodos.filter((todo) =>
    todo.description.toLowerCase().includes(searchValue)
  );

  if (btnFilterValue === "done") {
    filteredTodos = filteredTodos.filter((todo) => todo.checked === true);
  } else if (btnFilterValue === "pending") {
    filteredTodos = filteredTodos.filter((todo) => todo.checked === false);
  }

  listOfTodo$.innerHTML = "";
  createTodosinView(filteredTodos);

  if (filteredTodos.length === 0) {
    errorSpanSearch.textContent = "No todos found!";
    errorSpanSearch.classList.add("error-span-visible");
  } else {
    errorSpanSearch.classList.remove("error-span-visible");
  }
}
searchWord$.addEventListener("click", applyFilters);

btnFilterAll$.addEventListener("click", () => {
  btnFilterValue = "all";
  toggleFilterButton(btnFilterAll$);
  console.log(btnFilterValue);
});

btnFilterPending$.addEventListener("click", () => {
  btnFilterValue = "pending";
  toggleFilterButton(btnFilterPending$);
  console.log(btnFilterValue);
});

btnFilterDone$.addEventListener("click", () => {
  btnFilterValue = "done";
  toggleFilterButton(btnFilterDone$);
  console.log(btnFilterValue);
});

function showToast() {
  const toast = document.querySelector(".toast");

  toast.classList.add("show-toast");

  setTimeout(() => {
    toast.classList.remove("show-toast");
  }, 2000);
}

/******* FUNÇÃO PARA ATUALIZAR TODOS***********************************************************/

// function updateTodoStatus(checked, id) {
//   todos.forEach((todo) => {
//     if (todo.id == id) {
//       todo.checked = checked;
//       saveTodosToTheStorage();
//     }
//   });
//   applyFilters();
// }

getTodos();
checkUserPermissions();
