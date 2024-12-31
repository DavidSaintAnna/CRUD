/******* CONSTANTES ***************************************************************************/

const inputCreate$ = document.getElementById("create");
const createItemBtn$ = document.getElementById("create-item");
const searchInput$ = document.getElementById("filter-input");
const filterDropdown$ = document.getElementById("filter-dropdown");
const listOfTodo$ = document.getElementById("content");
const searchWord$ = document.getElementById("search-word");
const todos = [];

/******* FUNÇÃO PARA HABILITAR CRIAÇÃO DO tODO ********************************************************************/

inputCreate$.addEventListener("input", () => {
  const value = inputCreate$.value.trim();
  createItemBtn$.disabled = value.length < 5;
});

/******* FUNÇÃO PARA CRIAR OS TODOS INICIO ***************************************************************************/

createItemBtn$.addEventListener("click", () => {
  const value = inputCreate$.value.trim();
  if (value.length < 5) return;
  const todoElement = createTodo(value);
  listOfTodo$.appendChild(todoElement);
  inputCreate$.value = "";
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
  const pen = document.createElement("i");
  pen.classList.add("fa-solid", "fa-pen");
  const trash = document.createElement("i");
  trash.classList.add("fa-solid", "fa-trash");
  divGroup.appendChild(input);
  divGroup.appendChild(spanDescription);
  divItems.appendChild(pen);
  divItems.appendChild(trash);
  li.appendChild(divGroup);
  li.appendChild(divItems);
  //sempre de dentro pra fora no append

  //input checkbox
  input.addEventListener("input", (event) => {
    const checked = event.target.checked;
    const id = event.target.parentElement.parentElement.id;
    updateTodoStatus(checked, id);
  });

  //icone lixeira
  trash.addEventListener("click", (event) => {
    const todoElement = event.target.parentElement.parentElement;
    todoElement.remove();
  });

  //icone edição
  pen.addEventListener("click", (event) => {
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
  const id = todos.length + 1;
  const todo = { id, description, checked: false };
  todos.push(todo);
  const liElement = createTodoTemplate(todo);
  return liElement;
}

/******* FUNÇÃO PARA FILTRAR TODOS (PELA PALAVRA)***********************************************************/

searchWord$.addEventListener("click", () => {
  const searchValue = searchInput$.value.trim().toLowerCase();
  const filteredTodos = todos.filter((todo) =>
    todo.description.toLowerCase().includes(searchValue)
  );

  listOfTodo$.innerHTML = "";

  filteredTodos.forEach((todo) => {
    const todoElement = createTodoTemplate(todo);
    listOfTodo$.appendChild(todoElement);
  });
});

searchInput$.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchWord$.click();
  }
});

/******* FUNÇÃO PARA FILTRAR TODOS (PELO STATUS)***********************************************************/
function createTodosinView(todo) {
  todo.forEach((todo) => {
    const todoElement = createTodoTemplate(todo);
    listOfTodo$.appendChild(todoElement);
  });
}

filterDropdown$.addEventListener("change", (event) => {
  const selectValue = event.target.value;
  let todosView = todos;
  listOfTodo$.innerHTML = "";

  if (selectValue === "completed") {
    todosView = todos.filter((todo) => todo.checked === true);
  }
  if (selectValue === "incomplete") {
    todosView = todos.filter((todo) => todo.checked === false);
  }

  createTodosinView(todosView);
});

/******* FUNÇÃO PARA ATUALIZAR TODOS***********************************************************/

function updateTodoStatus(checked, id) {
  todos.forEach((todo) => {
    if (todo.id == id) {
      todo.checked = checked;
    }
  });
}
