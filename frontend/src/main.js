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

function generateItem(value) {
  return `
 <li class="todo-item">
  <span class="todo-item-content">${value}</span>
  <div>
    <i id="update-todo-item" class="fa-solid fa-pen"></i>
    <i id="delete-todo-item" class="fa-solid fa-trash"></i>
  </div>
</li>

    `;
}
