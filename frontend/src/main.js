const inputCreate = document.getElementById("create");
const btn = document.getElementById("create-list");
const searchInput = document.getElementById("filter-input");
const filterDropdown = document.getElementById("filter-dropdown");
const listOfTodo = document.getElementById("content");

btn.disabled = true;

inputCreate.addEventListener("input", () => {
  const value = inputCreate.value.trim();

  btn.disabled = value.length < 5;
});

btn.addEventListener("click", () => {
  const value = inputCreate.value.trim();
  if (value.length < 5) return;
  listOfTodo.innerHTML += generateItem(value);
  inputCreate.value = "";
});
listOfTodo.addEventListener("click", (event) => {
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

listOfTodo.addEventListener("keydown", (event) => {
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

function generateItem(value) {
  return `
    <li class="todo-item">
      <span class="todo-item-content">${value}</span>
      <div>
        <i class="fa-solid fa-pen"></i>
        <i class="fa-solid fa-trash"></i>
      </div>
    </li>
  `;
}
