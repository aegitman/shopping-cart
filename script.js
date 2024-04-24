const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const clearTodos = document.querySelector(".clear-todos");
const clearTodosDiv = document.querySelector(".clear-todos-div");

document.addEventListener("DOMContentLoaded", initActions());
todoInput.addEventListener("keyup", addTodo);
todoList.addEventListener("click", deleteCheck);
clearTodos.addEventListener("click", removeCompletedLocalTodos);

var pages = [0];
var currentPage = 0;

/**
 * Adds a new todo item to the list and saves it to local storage.
 *
 * @param {Event} event - The event object triggered by the form submission.
 * @return {void} This function does not return a value.
 */
function addTodo(event) {
    // prevent form from submitting
    event.preventDefault();

    //if key is enter, add todo
    if (event.key === "Enter") {
        // console.log("Save TODO");
    } else {
        return;
    }

    // check if input is empty
    if (todoInput.value === "") {
        return;
    }

    // todo div
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");
    
    // create li
    const newTodo = document.createElement("li");
    newTodo.innerText = todoInput.value;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);
    // add todo to local storage
    let savedId = saveLocalTodos(todoInput.value);
    todoDiv.setAttribute("data-id", savedId);
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
        toggleLocalTodoCompleted(Number(todo.getAttribute("data-id")));
        checkClearActionAvailability();
    }
}

/**
 * Toggles the completion status of a todo item in local storage.
 *
 * @param {HTMLElement} todoParamId - The id of the todo item to be toggled.
 * @return {void} This function does not return a value.
 */
function toggleLocalTodoCompleted(todoParamId) {
    let todos = loadTodosFromLocalStorage(false);
    todos.forEach(function(todo) {
        if (todo.id === todoParamId) {
            todo.completed = !todo.completed;
        }
    });
    localStorage.setItem("todos", JSON.stringify(todos));
}


/**
 * A function that saves a new todo item to local storage.
 *
 * @param {string} todo - The new todo item to be saved.
 * @return {integer} Return the id of the element in local storage.
 */
function saveLocalTodos(todo) {
    // check if i already have things in there
    let todos = loadTodosFromLocalStorage(false);
    let nextId = computeNextId(todos);
   
    todos.push({name: todo, completed: false, id: nextId, page: currentPage});
    localStorage.setItem("todos", JSON.stringify(todos));

    return nextId;
}

/**
 * Removes completed todos from local storage and reloads the todo list.
 *
 * @return {void} This function does not return a value.
 */
function removeCompletedLocalTodos() {
    let todos = loadTodosFromLocalStorage(false);
    todos = todos.filter(function(todo) {
        return !todo.completed;
    });
    localStorage.setItem("todos", JSON.stringify(todos));

    // reload from local storage
    todoList.innerHTML = "";
    getLocalTodos(currentPage);
}

function checkClearActionAvailability() {
    let todos = loadTodosFromLocalStorage();
    let isAtLeastOneCompleted = false;
    todos.forEach(function(todo) {
        if (todo.completed === true) {
            isAtLeastOneCompleted = true;
        }
    });

    if (!isAtLeastOneCompleted) {
        clearTodosDiv.classList.add("hidden");
    } else {
        clearTodosDiv.classList.remove("hidden");
    }
}

function initActions() {
    // check force clean parameter
    checkForceClean();
    
    // configure hammer - swipe actions on container
    configureHammer();

    // load from local storage
    getLocalTodos();
}

/**
 * Retrieves todos from local storage and dynamically creates HTML elements for each todo.
 */
function getLocalTodos(pageId = 0) {
    currentPage = pageId;
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
        todoDiv.setAttribute("data-id", todo.id);
        // check mark button
        const completedButton = document.createElement("button");
        completedButton.innerHTML = '<i class="fas fa-check-circle fa-lg"></i>';
        completedButton.classList.add("complete-btn");
        todoDiv.appendChild(completedButton);
        
        // append to list
        todoList.appendChild(todoDiv);
    });

    checkClearActionAvailability();
}

function configureHammer() {
    var todoContainer = new Hammer.Manager(document.querySelector(".todo-container"), {
        recognizers: [
            // RecognizerClass, [options], [recognizeWith, ...], [requireFailure, ...]
            [Hammer.Swipe,{ direction: Hammer.DIRECTION_HORIZONTAL }],
        ]
    });

    var pageToggler = new Hammer.Manager(document.querySelector(".page-toggler"), {
        recognizers: [
            // RecognizerClass, [options], [recognizeWith, ...], [requireFailure, ...]
            [Hammer.Swipe,{ direction: Hammer.DIRECTION_HORIZONTAL }],
        ]
    });

    todoContainer.on("swipe", function(ev) {
        handleContainerSwipe(ev);
    })

    pageToggler.on("swipe", function(ev) {
        handleContainerSwipe(ev);
    })
}


function handleContainerSwipe(ev) {
    let dir = ev.direction === 4 ? -1 : 1;
    addPageIndications(dir);    
    todoList.innerHTML = "";
    currentPage += dir;
    getLocalTodos(currentPage);
}

function addPageIndications(dir) {
    let currPage = document.querySelector(".page-curr");

    let newCurr = document.createElement("span");
    newCurr.classList.add("page-curr");
        
    if(dir > 0) {
        if(currPage.nextElementSibling == null ) {
            // if there si no element in that direction add one and update the current
            currPage.after(newCurr);
        } else {
            let nextPage = currPage.nextElementSibling;
            nextPage.classList.remove("page-pass");
            nextPage.classList.add("page-curr");        
        }
            
    } else {
        if(currPage.previousElementSibling == null) {
            // if there si no element in that direction add one and update the current
            currPage.before(newCurr);
        } else {
            let prevPage = currPage.previousElementSibling;
            prevPage.classList.remove("page-pass");
            prevPage.classList.add("page-curr");       
        }
    }
    let currTodos = loadTodosFromLocalStorage();
    if(currTodos.length == 0) {
        currPage.remove();
    } else {
        currPage.classList.remove("page-curr");
        currPage.classList.add("page-pass");
    }    
}

/**
 * Loads todos from local storage.
 *
 * @return {Array} An array of todos, or an empty array if no todos are found in local storage.
 */
function loadTodosFromLocalStorage(page = true) {
    let todos;
    if (localStorage.getItem("todos") === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem("todos"));
        if(page) {
            // filter for todos in a certain page
            todos = todos.filter(function(todo) {
                return todo.page === currentPage || todo.page == undefined;
            });
        } else {
            return todos;
        }        
    }
    return todos;
}

function computeNextId(todos) {
    let nextId = 0;
    todos.forEach(function(todo) {
        if (todo.id > nextId) {
            nextId = todo.id;
        }
    });
    return nextId + 1;
}

function checkForceClean() {
    const queryString = window.location.search;

    if (queryString.includes("forceClean=true")) {
        localStorage.removeItem("todos");
    }
}

