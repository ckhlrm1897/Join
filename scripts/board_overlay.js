
let assignedDetailInput = "";
let profil_icon;

/**
 * Opens the overlay for adding a new task, or redirects to mobile page.
 */
function openTaskOverlay() {
    if (window.innerWidth < 1400) {
        window.location.href = "./addtask.html"
    } else {
        const overlay = document.getElementById("task-overlay");
        overlay.classList.remove("d_none");
        const addTaskEntry = document.getElementById("add-task-entry");
        addTaskEntry.innerHTML = addTaskTemplate();
        addTaskEntry.classList.remove("d_none");
        void addTaskEntry.offsetWidth;
        addTaskEntry.classList.add("show");
        setPriority("medium");
        prepareDropdownToggle();
    }
}

/**
 * Prepares closing the contact dropdown when clicking outside.
 */
function prepareDropdownToggle() {
    const contactList = document.getElementById("add-task-entry");
    contactList.addEventListener('click', (e) => {
        if (e.target.id != "add-task-contacts-list") {
            const list = document.getElementById("add-task-contacts-list");
            if (list) { list.classList.add('d_none') }
        }
    })

}

/**
 * Closes the task overlay and resets UI state.
 */
function closeTaskOverlay() {
    document.getElementById("task-overlay").classList.add("d_none");
    const entry = document.getElementById("add-task-entry");
    const task_detail_entry = document.getElementById("task-details");
    if (entry) {
        entry.classList.remove("show");
    }
    task_detail_entry.classList.remove("show");
    setTimeout(() => {
        entry.classList.add("d_none");
        task_detail_entry.classList.add("d_none");
    }, 300);
    const addTaskContainer = document.querySelector(".add_task_container");
    if (addTaskContainer) {
        addTaskContainer.remove();
    }
    refreshBoard();
    selectedContacts = [];
}

/**
 * Prepares contact rendering for the input field.
 */
function prepareRenderContacts() {
    let assignedInput = document.getElementById("assigned-to-dropdown");
    assignedDetailInput = assignedInput;
    if (assignedDetailInput) {
        assignedDetailInput.addEventListener("input", () => {

            const list = document.getElementById("add-task-contacts-list");
            if (!list.classList.contains("d_none")) {
                renderContacts();
            }
        });
    }
}

/**
 * Renders assigned contacts preview in the edit view.
 * @param {Object} data - Task data object.
 */
function renderContactsDetailEditView(data) {
    const assignedTo = document.getElementById("assigned-contacts-preview");
    if (data.taskAssignedTo) {
        data.taskAssignedTo.forEach((contact) => {
            assignedTo.innerHTML += `
        <div class="assigned_contact_edit_view"> 
        <div class="assigned_circle margin_0" id="${contact}"}></div>
        </div>`;
            const profileBadge = document.getElementById(contact);
            profileBadge.style.backgroundColor = stringToColor(contact);
            profileBadge.innerText = getUserCapitalInitials(contact);
        })
    }
}

/**
 * Toggles the contact selection dropdown.
 * @param {Event} e - Click event.
 */
function toggleAssignedToDropdown(e) {
    prepareRenderContacts();
    e.stopPropagation();
    const list = document.getElementById("add-task-contacts-list");
    const arrow = document.getElementById("arrow-drop-down-assign");
    if (list.classList.contains("d_none")) renderContacts();
    list.classList.toggle("d_none");
    arrow.classList.toggle("up");
};

/**
 * Renders selected contact circles in preview.
 */
function addSelectedCircles() {
    const preview = document.getElementById("assigned-contacts-preview");
    preview.innerHTML = "";
    if (selectedContacts > "")
        selectedContacts.forEach(name => {
            const c = allContacts.find(x => x.name === name);
            if (!c) return;
            const circle = document.createElement("div");
            circle.className = "assigned_circle";
            circle.textContent = getInitials(c.name);
            circle.style.backgroundColor = stringToColor(c.name);
            preview.appendChild(circle);
        });
}

/**
 * Opens the task detail view overlay with animation.
 */
function openTaskDetails() {
    document.getElementById("task-overlay").classList.remove("d_none");
    let task_detail_entry = document.getElementById("task-details");
    task_detail_entry.classList.remove("d_none");
    void task_detail_entry.offsetWidth;
    task_detail_entry.classList.add("show");
    profil_icon = document.querySelector(".profil_icon");
    loadContactDetailView()
}

function loadContactDetailView() {
    profil_icon.addEventListener('click', function () {
        let taskCreator = data.taskData.creator
        localStorage.setItem("current_profil", JSON.stringify({taskCreator}));
        window.location.replace("contacts.html")
    })

}

/**
 * Marks a subtask as closed and updates the database.
 * @async
 * @param {number} index - Index of the subtask.
 */
async function checkSubTask(index) {
    data.taskData.subtasks[index].status = "closed";
    pushData = data.taskData;
    taskKey = data.taskKey;
    renderSubTasksDetailView(data);
    await updateOnDatabase("tasks/" + taskKey, pushData);
}

/**
 * Reopens a closed subtask and refreshes the board.
 * @param {number} index - Index of the subtask.
 */
async function unCheckSubTask(index) {
    data.taskData.subtasks[index].status = "open";
    pushData = data.taskData;
    taskKey = data.taskKey;
    renderSubTasksDetailView(data);
    await updateOnDatabase("tasks/" + taskKey, pushData);
}

/**
 * Prepares the delete functionality for a task in the detail view.
 */
function prepareDeleteTask() {
    const deleteTask = document.getElementById("deleteTask");
    deleteTask.addEventListener("click", async function () {
        let taskKey = this.getAttribute("taskname");
        await deleteFromDatabase("tasks/" + taskKey);
        document.getElementById("task-overlay").classList.add("d_none");
        document.getElementById("task-details").classList.add("d_none");
        await loadTasks();
        refreshBoard();
    })
}

/**
 * Prepares the edit functionality for a task in the detail view.
 */
function prepareEditTask() {
    const editTask = document.getElementById("edit-Task");
    editTask.addEventListener("click", function () {
        renderTaskDetailEdit();
        prepareUpdateTask();
    })
}

/**
 * Renders the editable form for task details.
 */
function renderTaskDetailEdit() {
    const taskDetail = document.getElementById('task-details');
    taskDetail.innerHTML = taskDetailEditTemplate(data);
    renderSubTasks();
    setPriority(data.taskPriority);
    selectedContacts = data.taskData.assignedTo;
    if (selectedContacts === undefined) {
        selectedContacts = [];
    }
    prepareRenderContacts();
    renderSelectedCircles();
}

/**
 * Adds listener to confirm and update edited task details.
 */
function prepareUpdateTask() {
    const checkEditTask = document.getElementById("check-edit-task");
    checkEditTask.addEventListener("click", function () {
        let taskKey = this.getAttribute("taskname");
        dataPool.forEach((task) => {
            if (task.taskKey === taskKey) {
                updateTask(task);
            }
        })
        refreshBoard()
    })
}

/**
 * Updates the task data from the edit form and sends it to the database.
 * @async
 * @param {Object} data - Task object to update.
 */
async function updateTask(data) {
    let rawPrio = Object.values(taskDetails)
    data.taskData.title = document.getElementById('title-input-overlay').value;
    data.taskData.description = document.getElementById('description-input-overlay').value;
    data.taskData.dueDate = document.getElementById('datepicker').value;
    data.taskData.assignedTo = selectedContacts;
    data.taskData.subtasks = subTasks;
    data.taskData.priority = rawPrio[0]
    pushData = data.taskData;
    taskKey = data.taskKey;
    await updateOnDatabase("tasks/" + taskKey, pushData);
    renderTaskDetailView(data);
    refreshBoard();
}

/**
 * Renders contact chips for assigned contacts in detail view.
 * @param {Object} data - Task data object.
 */
function renderSubTasksDetailView(data) {
    subTasks = [];
    subTasks = data.taskSubTasks;
    let subTasksRef = document.getElementById("subTasks-detail-view");
    subTasksRef.innerHTML = "";
    if (subTasks) {
        Object.values(subTasks).forEach((subTask, index) => {
            if (subTask.status === "open") {
                subTasksRef.innerHTML += `<div class="margin_0 subtask_detail_view">
                <div class="checkbox-wrapper" id="checkbox${index}"><img src="./assets/icons/checkbox.svg" alt="checkbox" onclick="checkSubTask(${index})"></div>${subTask.title}</div>`;
            } else {
                subTasksRef.innerHTML += `<div class="margin_0 subtask_detail_view">
                <div class="checkbox-wrapper" id="checkbox-active${index}"><img src="./assets/icons/checkbox_active.svg" alt="checkbox_active" onclick="unCheckSubTask(${index})"></div>${subTask.title}</div>`;
            }
        })
    }
}


