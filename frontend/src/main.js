const inputCreate$ = document.getElementById("create");
const createItemBtn$ = document.getElementById("create-item");
const searchInput$ = document.getElementById("filter-input");
const filterDropdown$ = document.getElementById("filter-dropdown");
const listOfTodo$ = document.getElementById("content");
const searchWord$ = document.getElementById("search-word");

const todos = [];

createItemBtn$.disabled = true;

inputCreate$.addEventListener("input", () => {
  const value = inputCreate$.value.trim();
  createItemBtn$.disabled = value.length < 5;
});

createItemBtn$.addEventListener("click", () => {
  const value = inputCreate$.value.trim();
  if (value.length < 5) return;
  listOfTodo$.innerHTML += createTodo(value);
  inputCreate$.value = "";
});

function createTodo(description) {
  const id = todos.length + 1;
  const todo = { id, description, checked: false };
  todos.push(todo);
  const html = createTodoTemplate(todo);
  return html;
}

searchWord$.addEventListener("click", () => {
  const searchValue = searchInput$.value.trim().toLowerCase();
  const filteredTodos = todos.filter((todo) =>
    todo.description.toLowerCase().includes(searchValue)
  );

  listOfTodo$.innerHTML = "";

  filteredTodos.forEach((todo) => {
    const todoElement = createTodoTemplate(todo);
    listOfTodo$.innerHTML += todoElement;
  });
});

searchInput$.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchWord$.click();
  }
});

filterDropdown$.addEventListener("change", () => {
  console.log(filterDropdown$.value);
});

listOfTodo$.addEventListener("click", (event) => {
  if (event.target.classList.contains("fa-trash")) {
    const todoItem = event.target.closest(".todo-item");
    todoItem.remove();
  }

  if (
    event.target.classList.contains("fa-pen") ||
    event.target.classList.contains("fa-check")
  ) {
    const todoItem = event.target.closest(".todo-item");
    const todoContent = todoItem.querySelector(".todo-item-content");
    const icon = event.target;

    if (icon.classList.contains("fa-pen")) {
      icon.classList.remove("fa-pen");
      icon.classList.add("fa-check");
      todoContent.contentEditable = true;
      todoContent.focus();
      todoContent.classList.add("editing");
    } else {
      const newValue = todoContent.textContent.trim();
      if (newValue.length >= 5) {
        icon.classList.remove("fa-check");
        icon.classList.add("fa-pen");
        todoContent.contentEditable = false;
        todoContent.classList.remove("editing");
      } else {
        alert("Todo must be at least 5 characters long!");
        todoContent.focus();
      }
    }
  }
});

listOfTodo$.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    event.target.classList.contains("todo-item-content")
  ) {
    event.preventDefault();
    const todoItem = event.target.closest(".todo-item");
    const icon = todoItem.querySelector(".fa-check");
    if (icon) {
      icon.click();
    }
  }
});

function createTodoTemplate(todo) {
  return `
    <li class="todo-item" data-id=${todo.id}>
    <div class="todo-item-group">
      <input type="checkbox" ${todo.checked ? "checked" : ""}>
      <span class="todo-item-content">${todo.description}</span>
    </div>
      <div>
        <i class="fa-solid fa-pen"></i>
        <i class="fa-solid fa-trash"></i>
      </div>
    </li>
  `;
}
