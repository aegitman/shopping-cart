const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const clearTodos = document.querySelector(".clear-todos");


document.addEventListener("DOMContentLoaded", getLocalTodos);
todoButton.addEventListener("click", addTodo);
todoList.addEventListener("click", deleteCheck);
clearTodos.addEventListener("click", removeCompletedLocalTodos);


/**
 * Adds a new todo item to the list and saves it to local storage.
 *
 * @param {Event} event - The event object triggered by the form submission.
 * @return {void} This function does not return a value.
 */
function addTodo(event) {
    // prevent form from submitting
    event.preventDefault();
    // todo div
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");
    // check if input is empty
    if (todoInput.value === "") {
        return;
    }
    // create li
    const newTodo = document.createElement("li");
    newTodo.innerText = todoInput.value;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);
    // add todo to local storage
    saveLocalTodos(todoInput.value);
    // check mark button
    const completedButton = document.createElement("button");
    completedButton.innerHTML = '<i class="fas fa-check-circle fa-lg"></i>';
    completedButton.classList.add("complete-btn");
    todoDiv.appendChild(completedButton);
    
    // append to list
    todoList.appendChild(todoDiv);

    // clear todo input value
    todoInput.value = "";
}


/**
 * A function that performs a check on a clicked item.
 *
 * @param {Event} e - The event object triggered by the click.
 * @return {void} This function does not return a value.
 */
function deleteCheck(e) {
    const item = e.target;
    // check mark
    if (item.classList[0] === "complete-btn") {
        const todo = item.parentElement;
        todo.classList.toggle("completed");
        toggleLocalTodoCompleted(todo);
    }
}

/**
 * Toggles the completion status of a todo item in local storage.
 *
 * @param {HTMLElement} todoParam - The HTML element representing the todo item.
 * @return {void} This function does not return a value.
 */
function toggleLocalTodoCompleted(todoParam) {
    let todos = loadTodosFromLocalStorage();
    todos.forEach(function(todo) {
        if (todo.name === todoParam.children[0].innerText) {
            todo.completed = !todo.completed;
        }
    });
    localStorage.setItem("todos", JSON.stringify(todos));
}


/**
 * A function that saves a new todo item to local storage.
 *
 * @param {string} todo - The new todo item to be saved.
 * @return {void} This function does not return a value.
 */
function saveLocalTodos(todo) {
    // check if i already have things in there
    let todos = loadTodosFromLocalStorage();
   
    todos.push({name: todo, completed: false});
    localStorage.setItem("todos", JSON.stringify(todos));
}

/**
 * Removes completed todos from local storage and reloads the todo list.
 *
 * @return {void} This function does not return a value.
 */
function removeCompletedLocalTodos() {
    let todos = loadTodosFromLocalStorage();
    todos = todos.filter(function(todo) {
        return !todo.completed;
    });
    localStorage.setItem("todos", JSON.stringify(todos));

    // reload from local storage
    todoList.innerHTML = "";
    getLocalTodos();
}


/**
 * Retrieves todos from local storage and dynamically creates HTML elements for each todo.
 */
function getLocalTodos() {
    let todos = loadTodosFromLocalStorage();
   
    todos.forEach(function(todo) {
        // todo div
        const todoDiv = document.createElement("div");
        todoDiv.classList.add("todo");
        // create li
        const newTodo = document.createElement("li");
        newTodo.innerText = todo.name;
        newTodo.classList.add("todo-item");
        if (todo.completed === true) {
            todoDiv.classList.add("completed");
        }
        todoDiv.appendChild(newTodo);
        // check mark button
        const completedButton = document.createElement("button");
        completedButton.innerHTML = '<i class="fas fa-check-circle fa-lg"></i>';
        completedButton.classList.add("complete-btn");
        todoDiv.appendChild(completedButton);
        
        // append to list
        todoList.appendChild(todoDiv);
    });
}

/**
 * Loads todos from local storage.
 *
 * @return {Array} An array of todos, or an empty array if no todos are found in local storage.
 */
function loadTodosFromLocalStorage() {
    let todos;
    if (localStorage.getItem("todos") === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem("todos"));
    }
    return todos;
}