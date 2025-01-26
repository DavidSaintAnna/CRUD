const $inputCreateTodo = document.getElementById("create");
const $createTodoButton = document.getElementById("create-item");
const $searchInput = document.getElementById("filter-input");
const $filterDropdown = document.getElementById("filter-dropdown");
const $todoList = document.getElementById("content");
const $modalContainer = document.getElementById("modal");
const $cancelDeleteButton = document.getElementById("cancel-delete");
const $confirmDeleteButton = document.getElementById("confirm-delete");
const $form = document.querySelector("form");

$form.addEventListener("submit", (event) => event.preventDefault());

const $formErrorMessage = document.createElement("span");
$formErrorMessage.classList.add("error-message");
$formErrorMessage.style.display = "none";

const $todosErrorMessage = document.createElement("span");
$todosErrorMessage.classList.add("error-message");
$todosErrorMessage.style.display = "none";

$inputCreateTodo.parentElement.parentElement.appendChild($formErrorMessage);

const todos = JSON.parse(localStorage.getItem("todos")) || [];

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
  todos.length = 0;
  todos.push(...(JSON.parse(localStorage.getItem("todos")) || []));
  renderTodos(todos);
}

function validateInput(value) {
  if (value.length < 5) {
    $formErrorMessage.textContent = "At least 5 characters required!";
    $formErrorMessage.style.display = "block";
    return false;
  }
  if (value.length > 19) {
    $formErrorMessage.textContent = "Maximum 19 characters allowed!";
    $formErrorMessage.style.display = "block";
    return false;
  }
  $formErrorMessage.style.display = "none";
  return true;
}

function handleTodoCreation() {
  const value = $inputCreateTodo.value.trim();
  if (!validateInput(value)) return;
  const newTodo = { id: todos.length + 1, description: value.slice(0, 19), checked: false };
  todos.push(newTodo);
  saveTodos();
  applyFilters(todos);
  $inputCreateTodo.value = "";
  $createTodoButton.disabled = true;
}

function updateTodoStatus(id, isChecked) {
  const todo = todos.find((todo) => todo.id == id);
  if (todo) {
    todo.checked = isChecked;
    saveTodos();
  }
}

function editTodoContent(todoElement) {
  const todoId = todoElement.id;
  const todoContent = todoElement.querySelector(".todo-item-content");
  const icon = todoElement.querySelector(".fa-pen, .fa-check");

  if (icon.classList.contains("fa-pen")) {
    icon.classList.replace("fa-pen", "fa-check");
    todoContent.contentEditable = true;
    todoContent.classList.add("editing");
    todoContent.focus();
  } else {
    const updatedContent = todoContent.textContent.trim();
    if (validateInput(updatedContent)) {
      const todo = todos.find((todo) => todo.id == todoId);
      if (todo) {
        todo.description = updatedContent;
        saveTodos();
      }
      icon.classList.replace("fa-check", "fa-pen");
      todoContent.contentEditable = false;
      todoContent.classList.remove("editing");
    } else {
      todoContent.focus();
    }
  }
}

function deleteTodo() {
  const todoId = $modalContainer.getAttribute("data-todo-id");
  const index = todos.findIndex((todo) => todo.id == todoId);
  if (index !== -1) {
    todos.splice(index, 1);
    saveTodos();
    applyFilters(todos);
  }
  closeModal();
}

function closeModal() {
  $modalContainer.style.display = "none";
  $modalContainer.removeAttribute("data-todo-id");
}

function showDeleteModal(todoElement) {
  $modalContainer.style.display = "flex";
  $modalContainer.setAttribute("data-todo-id", todoElement.id);
}

function applyFilters(todoList) {
  const searchValue = $searchInput.value.trim().toLowerCase();
  const filterValue = $filterDropdown.value;

  let filteredTodos = todoList instanceof Array ? todoList : todos;

  if (searchValue) {
    filteredTodos = filteredTodos.filter((todo) => todo.description.toLowerCase().includes(searchValue));
  }

  if (filterValue === "completed") {
    filteredTodos = filteredTodos.filter((todo) => todo.checked);
  }

  if (filterValue === "incomplete") {
    filteredTodos = filteredTodos.filter((todo) => !todo.checked);
  }

  renderTodos(filteredTodos);

  if (filteredTodos.length === 0) {
    $todosErrorMessage.textContent = "No todos found!";
    $todosErrorMessage.style.display = "block";
    $todoList.appendChild($todosErrorMessage);
  } else {
    $todosErrorMessage.style.display = "none";
  }
}

function createTodoElement(todo) {
  const todoElement = document.createElement("li");
  todoElement.classList.add("todo-item");
  todoElement.id = todo.id;

  const todoGroup = document.createElement("div");
  todoGroup.classList.add("todo-item-group");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.checked;
  checkbox.addEventListener("change", (event) => {
    updateTodoStatus(todo.id, event.target.checked);
    applyFilters();
  });

  const description = document.createElement("span");
  description.classList.add("todo-item-content");
  description.textContent = todo.description;

  const actions = document.createElement("div");
  const editIcon = document.createElement("i");
  editIcon.classList.add("fa-solid", "fa-pen");
  editIcon.addEventListener("click", () => editTodoContent(todoElement));

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fa-solid", "fa-trash");
  deleteIcon.addEventListener("click", () => showDeleteModal(todoElement));

  actions.append(editIcon, deleteIcon);
  todoGroup.append(checkbox, description);
  todoElement.append(todoGroup, actions);

  return todoElement;
}

function renderTodos(todoList) {
  $todoList.innerHTML = "";
  todoList.forEach((todo) => {
    const todoElement = createTodoElement(todo);
    $todoList.appendChild(todoElement);
  });
}

$inputCreateTodo.addEventListener("input", () => {
  $createTodoButton.disabled = !validateInput($inputCreateTodo.value.trim());
});

$inputCreateTodo.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !$createTodoButton.disabled) {
    handleTodoCreation();
  }
});

$createTodoButton.addEventListener("click", handleTodoCreation);

$searchInput.addEventListener("input", applyFilters);
$searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    applyFilters();
  }
});

$filterDropdown.addEventListener("change", applyFilters);

$cancelDeleteButton.addEventListener("click", closeModal);
$confirmDeleteButton.addEventListener("click", deleteTodo);

$modalContainer.addEventListener("click", (event) => {
  if (event.target === $modalContainer) {
    closeModal();
  }
});

loadTodos();
