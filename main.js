/******* CONSTANTES ***************************************************************************/

const inputCreate$ = document.getElementById("create");
const createItemBtn$ = document.getElementById("create-item");
const searchInput$ = document.getElementById("filter-input");
const filterDropdown$ = document.getElementById("filter-dropdown");
const listOfTodo$ = document.getElementById("content");
const searchWord$ = document.getElementById("search-word");
const modalContainer$ = document.getElementById("modal");
const cancelDelete$ = document.getElementById("cancel-delete");
const confirmDelete$ = document.getElementById("confirm-delete");
const form$ = document.querySelector("form");

form$.addEventListener("submit", (event) => {
  event.preventDefault();
});

const errorSpanCreate = document.createElement("span");
errorSpanCreate.classList.add("error-span");
inputCreate$.parentElement.appendChild(errorSpanCreate);
const errorSpanSearch = document.createElement("span");
errorSpanSearch.classList.add("error-span");
searchInput$.parentElement.parentElement.parentElement.appendChild(
  errorSpanSearch
);

const todos = JSON.parse(localStorage.getItem("todos")) || [];

function saveTodosToTheStorage() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodosFromStorage() {
  const storedTodos = JSON.parse(localStorage.getItem("todos")) || [];
  todos.length = 0;
  todos.push(...storedTodos);
  createTodosinView(todos);
}

/******* FUNÇÃO PARA HABILITAR CRIAÇÃO DO tODO ********************************************************************/
inputCreate$.addEventListener("input", () => {
  const value = inputCreate$.value.trim();
  createItemBtn$.disabled = value.length < 5;

  if (value.length < 5) {
    errorSpanCreate.textContent = "at least 5 characters long!";
    errorSpanCreate.classList.add("error-span-visible");
  } else if (value.length >= 19) {
    errorSpanCreate.textContent = "limit of characters reached!";
    errorSpanCreate.classList.add("error-span-visible");
  } else {
    errorSpanCreate.classList.remove("error-span-visible");
  }
});

inputCreate$.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const value = inputCreate$.value.trim();

    if (value.length >= 5) {
      createItemBtn$.click();
    }
  }
});

/******* FUNÇÃO PARA CRIAR OS TODOS INICIO ***************************************************************************/

createItemBtn$.addEventListener("click", () => {
  const value = inputCreate$.value.trim();
  if (value.length < 5) return;
  const todoElement = createTodo(value);
  listOfTodo$.appendChild(todoElement);
  inputCreate$.value = "";
  errorSpanCreate.style.display = "none";
});
function createTodoTemplate(todo) {
  const li = document.createElement("li");
  li.classList.add("todo-item");
  li.setAttribute("id", todo.id);
  const divGroup = document.createElement("div");
  divGroup.classList.add("todo-item-group");
  const input = document.createElement("input");
  input.setAttribute("type", "checkbox");
  if (todo.checked) input.setAttribute("checked", todo.checked);
  const spanDescription = document.createElement("span");
  spanDescription.classList.add("todo-item-content");
  spanDescription.appendChild(document.createTextNode(todo.description));
  const divItems = document.createElement("div");
  const penIcon = document.createElement("i");
  penIcon.classList.add("fa-solid", "fa-pen");
  const trashIcon = document.createElement("i");
  trashIcon.classList.add("fa-solid", "fa-trash");
  divGroup.appendChild(input);
  divGroup.appendChild(spanDescription);
  divItems.appendChild(penIcon);
  divItems.appendChild(trashIcon);
  li.appendChild(divGroup);
  li.appendChild(divItems);
  //sempre de dentro pra fora no append

  //input checkbox
  input.addEventListener("input", (event) => {
    const checked = event.target.checked;
    const id = event.target.parentElement.parentElement.id;
    updateTodoStatus(checked, id);
  });

  // //icone lixeira
  // trashIcon.addEventListener("click", (event) => {
  //   const todoElement = event.target.parentElement.parentElement;
  //   const todoId = todoElement.id;
  //   const index = todos.findIndex((todo) => todo.id == todoId);
  //   todos.splice(index, 1);
  //   saveTodosToTheStorage();
  //   todoElement.remove();
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
      saveTodosToTheStorage();
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
          saveTodosToTheStorage();
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

function createTodo(description) {
  const limitedDescription = description.slice(0, 19);
  const id = todos.length + 1;
  const todo = { id, description: limitedDescription, checked: false };
  todos.push(todo);
  saveTodosToTheStorage();
  const liElement = createTodoTemplate(todo);
  return liElement;
}

/******* FUNÇÃO PARA FILTRAR TODOS (PELA PALAVRA)***********************************************************/

// searchWord$.addEventListener("click", () => {
//   const searchValue = searchInput$.value.trim().toLowerCase();
//   const filteredTodos = todos.filter((todo) =>
//     todo.description.toLowerCase().includes(searchValue)
//   );

//   listOfTodo$.innerHTML = "";

//   filteredTodos.forEach((todo) => {
//     const todoElement = createTodoTemplate(todo);
//     listOfTodo$.appendChild(todoElement);
//   });
//   console.log(filteredTodos);
// });

// searchInput$.addEventListener("input", () => {
//   const searchValue = searchInput$.value.trim().toLowerCase();
//   const filteredTodos = todos.filter((todo) =>
//     todo.description.toLowerCase().includes(searchValue)
//   );

//   if (filteredTodos.length === 0) {
//     errorSpan.textContent = "No words found!";
//     errorSpan.style.display = "block";
//     errorSpan.style.marginTop = "90px";
//   } else {
//     errorSpan.style.display = "none";
//   }
// });

// searchInput$.addEventListener("keydown", (event) => {
//   if (event.key === "Enter") {
//     searchWord$.click();
//   }
// });

// /******* FUNÇÃO PARA FILTRAR TODOS (PELO STATUS)***********************************************************/
function createTodosinView(todo) {
  todo.forEach((todo) => {
    const todoElement = createTodoTemplate(todo);
    listOfTodo$.appendChild(todoElement);
  });
}

// filterDropdown$.addEventListener("change", (event) => {
//   const selectValue = event.target.value;
//   let todosView = todos;
//   listOfTodo$.innerHTML = "";

//   if (selectValue === "completed") {
//     todosView = todos.filter((todo) => todo.checked === true);
//   }
//   if (selectValue === "incomplete") {
//     todosView = todos.filter((todo) => todo.checked === false);
//   }

//   createTodosinView(todosView);
// });

function applyFilters() {
  const searchValue = searchInput$.value.trim().toLowerCase();
  const selectValue = filterDropdown$.value;
  let filteredTodos = todos;

  if (searchValue) {
    filteredTodos = filteredTodos.filter((todo) =>
      todo.description.toLowerCase().includes(searchValue)
    );
  }

  if (selectValue === "completed") {
    filteredTodos = filteredTodos.filter((todo) => todo.checked === true);
  } else if (selectValue === "incomplete") {
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

searchInput$.addEventListener("input", applyFilters);

filterDropdown$.addEventListener("change", applyFilters);

searchInput$.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    applyFilters();
  }
});

/******* FUNÇÃO PARA ATUALIZAR TODOS***********************************************************/

function updateTodoStatus(checked, id) {
  todos.forEach((todo) => {
    if (todo.id == id) {
      todo.checked = checked;
    }
  });
  saveTodosToTheStorage();
}

loadTodosFromStorage();
