/**
 * Selects constant and variables that are used for workflow.
 * @type {NodeListOf<HTMLImageElement>}
 */

let rawTasksData = [];
let dataPool = [];
let cardPools = {
    dataToDo: [],
    dataInProgress: [],
    dataAwaitFeedback: [],
    dataDone: [],
}
let data = [];

const todoRef = document.getElementById('column-todo');
const todoEmptyRef = document.getElementById('no-tasks-to-do');
const inProgressRef = document.getElementById('column-in-progress');
const inProgressEmptyRef = document.getElementById('no-tasks-in-progress');
const awaitFeedbackRef = document.getElementById('column-await-feedback');
const awaitFeedbackEmptyRef = document.getElementById('no-tasks-awaiting-feedback');
const doneRef = document.getElementById('column-done');
const doneEmptyRef = document.getElementById('no-tasks-done');
const dragRef = document.querySelectorAll('.card_column');
const searchRef = document.getElementById('find-task');

const columnRefs = {
    dataToDo: todoRef,
    dataInProgress: inProgressRef,
    dataAwaitFeedback: awaitFeedbackRef,
    dataDone: doneRef,
}

const emptyRefs = {
    dataToDo: todoEmptyRef,
    dataInProgress: inProgressEmptyRef,
    dataAwaitFeedback: awaitFeedbackEmptyRef,
    dataDone: doneEmptyRef,
};

/**
 * Event listener for the DOM to be loaded to start the inital functions
 */
document.addEventListener('DOMContentLoaded', async () => {
    getUserLogState()
    await loadTasks()
    renderAllTasks()
    checkColumnContent()
    searchTaskOnBoard()
    taskDetailsRef()
    dragFunction()
})

/**
 * Retrieves tasks from the database and fills dataPool and rawTasksData.
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function loadTasks() {
    try {
        let dataFromDatabase = await getTasksFromDatabase();
        if (dataFromDatabase) {
            dataPool = [];
            rawTasksData = [];
            rawTasksData = Object.entries(dataFromDatabase);
        }
        if (rawTasksData) {
            rawTasksData.forEach((singleTask) => {
                let [key, data] = [...singleTask];
                dataPool.push(new TaskClass(key, data));
            });
        }
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}

/**
 * Renders all tasks intoBoard
 */
function renderAllTasks(htmlel) {
    dataPool.forEach((item) => {
        let htmlel = item.constructHTMLElements()
        htmlel.setAttribute("taskName", item.taskName)
        htmlel.setAttribute("taskStatus", item.taskStatus)
        htmlel.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.taskName);
        })
        pushCardsToCardsPool(item.taskStatus, htmlel)
        taskDetailsRef()
        setupMobileTaskMove()
        setupMobileNavbarMove()
        setupCardRotation()
    });
}

/**
 * Appends a task card to the appropriate column based on its status.
 * @param {string} taskStatus - Status of the task (todo, in progress, await feedback, done).
 * @param {HTMLElement} htmlel - HTML element representing the task card.
 */
function pushCardsToCardsPool(taskStatus, htmlel) {
    if (taskStatus === "todo") {
        todoRef.append(htmlel)
        cardPools.dataToDo.push(htmlel)
    } else if (taskStatus === "in progress") {
        inProgressRef.append(htmlel)
        cardPools.dataInProgress.push(htmlel)
    } else if (taskStatus === "await feedback") {
        awaitFeedbackRef.append(htmlel)
        cardPools.dataAwaitFeedback.push(htmlel)
    } else {
        doneRef.append(htmlel)
        cardPools.dataDone.push(htmlel)
    }
}

/**
 * Checks each column for content and shows/hides empty messages accordingly.
 */
function checkColumnContent() {
    Object.keys(cardPools).forEach((key) => {
        const pool = cardPools[key];
        const ref = emptyRefs[key];
        if (pool.length === 0) {
            ref.classList.remove('d_none');
        } else {
            ref.classList.add('d_none');
        }
    });
}

/**
 * Refreshes the board by clearing and re-rendering all task cards.
 */
function refreshBoard() {
    Object.keys(cardPools).forEach((key) => {
        const ref = columnRefs[key];
        let refTasks = ref.querySelectorAll('.task_card')
        if (refTasks.length > 0) {
            refTasks.forEach((item) => {
                ref.removeChild(item);
            })
        }
    });
    clearCardPools();
    renderAllTasks();
    checkColumnContent();
}

/**
 * Clears all task card pools.
 */
function clearCardPools(){
    cardPools.dataToDo = [];
    cardPools.dataInProgress = [];
    cardPools.dataAwaitFeedback = [];
    cardPools.dataDone = [];
}

/**
 * Adds event listener to search input for filtering tasks by name or description.
 */
function searchTaskOnBoard() {
    searchRef.addEventListener('input', (e) => {
        let searchInput = e.target.value.toLowerCase().trim();
        Object.values(cardPools).forEach((cardList) => {
            cardList.forEach((card) => {
                let taskName = card.getAttribute('taskName').toLowerCase();
                let taskDescription = card.querySelector('#task-content').innerHTML.toLowerCase();
                searchTaskName(taskName, searchInput, card, taskDescription);

            })
        })
        checkColumnContent()
    })
};

/**
 * Filters tasks by name based on the search input.
 * @param {string} taskName - Name of the task.
 * @param {string} searchInput - User input to search.
 * @param {HTMLElement} card - Task card element.
 * @param {string} taskDescription - Description of the task.
 */
function searchTaskName(taskName, searchInput, card, taskDescription) {
    if (taskName.includes(searchInput)) {
        card.classList.remove('d_none');
    } else {
        searchTaskDescription(taskName, searchInput, card, taskDescription);
    }
}

/**
 * Filters tasks by description if name does not match the search input.
 * @param {string} taskName - Name of the task.
 * @param {string} searchInput - User input to search.
 * @param {HTMLElement} card - Task card element.
 * @param {string} taskDescription - Description of the task.
 */
function searchTaskDescription(taskName, searchInput, card, taskDescription) {
    if (taskDescription.includes(searchInput)) {
        card.classList.remove('d_none');
    } else {
        card.classList.add('d_none')
    }
}

/**
 * Initializes drag-and-drop functionality for all elements in dragRef.
 * Adds event listeners for dragover, dragleave, and drop events.
 */
function dragFunction() {
  dragRef.forEach(element => {
    addDragOverListener(element);
    addDragLeaveListener(element);
    addDropListener(element);
  });
}

/**
 * Adds a dragover event listener to show hover effect.
 * @param {HTMLElement} element - The element to add the listener to.
 */
function addDragOverListener(element) {
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    element.classList.add('hover_dragzone');
  });
}

/**
 * Adds a dragleave event listener to remove hover effect.
 * @param {HTMLElement} element - The element to add the listener to.
 */
function addDragLeaveListener(element) {
  element.addEventListener('dragleave', (e) => {
    e.preventDefault();
    element.classList.remove('hover_dragzone');
  });
}

/**
 * Adds a drop event listener to update task status and move the card.
 * @param {HTMLElement} element - The element to add the listener to.
 */
function addDropListener(element) {
  element.addEventListener('drop', async (e) => {
    e.preventDefault();
    element.classList.remove('hover_dragzone');
    const cardTaskName = e.dataTransfer.getData('text/plain');
    const card = document.querySelector(`.task_card[taskName="${cardTaskName}"]`);
    element.appendChild(card);
    const [cardIdentifyer] = dataPool.filter(item => item.taskName === cardTaskName);
    cardIdentifyer.taskStatus = element.getAttribute("name");
    await updateOnCardsStatus(cardIdentifyer);
    refreshBoard();
  });
}

/**
 * Updates the task status in the database after drag-and-drop.
 * @async
 * @param {Object} cardIdentifyer - Task object to update.
 */
const updateOnCardsStatus = async (cardIdentifyer) => {
    if (cardIdentifyer) {
        let taskFromDB = await loadCurrentTaskFromDatabase(cardIdentifyer.taskKey);
        taskFromDB.status = cardIdentifyer.taskStatus;
        await updateTasksOnDatabase(cardIdentifyer.taskKey, taskFromDB);
    }
}

/**
 * Loads the current task from the database.
 * @async
 * @param {string} taskKey - Task identifier key.
 * @returns {Promise<Object>} Task data object.
 */
async function loadCurrentTaskFromDatabase(taskKey) {
    try {
        let response = await fetch(FIREBASE_URL + "tasks/" + taskKey + ".json");
        let responseToJson = await response.json();
        return responseToJson
    } catch (error) {
        throw new Error("Failed to fetch firebase url", error)
    }
}

/**
 * Updates task data in the database.
 * @async
 * @param {string} taskKey - Task identifier key.
 * @param {Object} data - Task data to update.
 * @returns {Promise<Object>} Response from database.
 */
async function updateTasksOnDatabase(taskKey, data) {
    let response = await fetch(FIREBASE_URL + "tasks/" + taskKey + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return (responseToJson = await response.json());
}

/**
 * Generates a color string based on a string input.
 * @param {string} str - Input string.
 * @returns {string} HSL color string.
 */
function stringToColor(str) {
    let hash = 0;
    for (const c of str) hash = (hash << 5) - hash + c.charCodeAt(0);
    return `hsl(${hash % 360}, 70%, 50%)`;
}

/**
 * Extracts and returns the capital initials from a name string.
 * @param {string} name - Full name of the user.
 * @returns {string} Initials.
 */
function getUserCapitalInitials(name) {
    if (!name || typeof name !== "string") return "";
    let userName = name.trim().split(" ");
    let firstInitial = userName[0][0]?.toUpperCase() || "";
    let lastInitial = userName[userName.length - 1][0]?.toUpperCase() || "";
    return firstInitial + lastInitial;
}

/**
 * Cuts the string at the next space after the given index.
 * @param {string} str - String to format.
 * @param {number} iterator - Index to start checking from.
 * @returns {string} Formatted string.
 */
function formatDescription(str, iterator) {
    const nextSpace = str.indexOf(" ", iterator);
    if (nextSpace === -1) {
        return str;
    }
    return str.slice(0, nextSpace);
}

/**
 * Adds click listeners to all task cards for showing details.
 */
function taskDetailsRef() {
    const taskCards = document.querySelectorAll(".task_card");
    taskCards.forEach(taskCard => {
        taskCard.addEventListener("click", function (e) {
            if (
                e.target.classList.contains('mobile_move_btn') ||
                e.target.closest('.mobile_navbar')
            ) return;
            handleTaskCardClick(this);
        });
    });
}

/**
 * Handles click event on a task card and displays task details.
 * @param {HTMLElement} cardElement - Clicked task card.
 */
function handleTaskCardClick(cardElement) {
    let taskname = cardElement.getAttribute("taskname");
    dataPool.forEach((task) => {
        if (task.taskName === taskname) {
            data = task;
            if (data.taskSubTasks === undefined) {
                subTasks = [];
                data.taskSubTasks = subTasks;
            }
            renderTaskDetailView(data);
        }
    });
}

/**
 * Renders the detailed view of a task in the overlay.
 * @param {Object} data - Task data object.
 */
async function renderTaskDetailView(data) {    
    const isCreator = await isCreatorUser(data.taskData)
    const taskDetail = document.getElementById('task-details');
    taskDetail.innerHTML = "";
    taskDetail.innerHTML = taskDetailViewTemplate(data, isCreator);

    const taskCategory = document.getElementById("task-category");
    if (data.taskCategory === "Technical Task") {
        taskCategory.style.backgroundColor = 'rgba(31, 215, 193, 1)';
    } else {
        taskCategory.style.backgroundColor = 'rgba(0, 56, 255, 1)'
    }
    taskCategory.innerHTML = data.taskCategory;
    renderContactsDetailView(data);
    renderSubTasksDetailView(data)
    openTaskDetails();
    prepareDeleteTask();
    prepareEditTask()
    setupMobileTaskMove()
}

/**
 * Renders contact chips for assigned contacts in detail view.
 * @param {Object} data - Task data object.
 */
function renderContactsDetailView(data) {
    const assignedTo = document.getElementById("assigned-contacts");
    if (data.taskData.assignedTo) {
        data.taskData.assignedTo.forEach((contact) => {
            assignedTo.innerHTML += `
        <div class="width_100 assigned_contact"> 
        <div class="assigned_circle margin_0" id="${contact}"}></div><div class="margin_0 ">${contact}</div>
        </div>`;
            const profileBadge = document.getElementById(contact);
            profileBadge.style.backgroundColor = stringToColor(contact);
            profileBadge.innerText = getUserCapitalInitials(contact);
        })
    }
}

