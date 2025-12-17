/**
 * Generates the HTML template for displaying the detail view of a task.
 * @param {Object} data - The task data object to render.
 * @param {Object} data.taskData - The properties of the task (title, description, dueDate, priority, etc.).
 * @param {string} data.taskKey - The unique key or ID of the task.
 * @returns {string} - HTML string for the task detail view.
 */
function taskDetailViewTemplate(data, isCreator) {
  return `    <div class="taskd_detail_header d_flex_center_row justify_between margin_0 width_100">
      <div class="margin_0 category_detail" id="task-category">User Story</div>
      <div class="close_detail_field  close_add_task margin_0" onclick="closeTaskOverlay()"></div>
    </div>
    <div class="task_edit_view_container justify_none d_flex_center_column">
    <div class="margin_0 justify_start align_none d_flex margin_0 width_100">
      <h1 class="task_detail_title ">${data.taskData.title}</h1>
    </div>
    <div class="task_detail_description width_100">
      ${data.taskData.description}
    </div>
    <div class=" d_flex_center_row width_100 detail_head">
      <p class="task_detail">Creator:</p>
      <div class="width_100 detail_due_date">${renderCreator(data.taskData, isCreator)}</div>
    </div>
    <div class=" d_flex_center_row width_100 detail_head">
      <p class="task_detail">Due date:</p>
      <div class="width_100 detail_due_date">${data.taskData.dueDate}</div>
    </div>
    <div class="d_flex_center_row width_100 detail_head">
      <p class="task_detail">Priority:</p>
      <div class="d_flex_center_row width_100 margin_0 justify_start" id="priority"><p class="margin_0">${data.taskData.priority.charAt(0).toUpperCase()
    + data.taskData.priority.slice(1)}</p><img class="margin_0" src="./assets/icons/prio_${data.taskData.priority}.svg" alt=""></img></div>
    </div>
    <div class="d_flex_center_column width_100 align_none justify_start gap_8">
      <div class="margin_0">
        <p class="task_detail detail_head">Assigned To:</p>
    </div>
      <div id="assigned-contacts" class="d_flex_column margin_0"></div>
    </div>
    <div class="d_flex_center_column width_100 align_none justify_start gap_8">
        <div class="margin_0">
            <p class="task_detail margin_0 detail_head">Subtasks</p>
        </div>
        <div id="subTasks-detail-view" class=""></div>
    </div>
    </div>
    <div class="task_detail_view_footer">
    <div class="d_flex gap_8 margin_0 edit" id="deleteTask" taskname="${data.taskKey}"><div class="delete_wrapper"></div><p class="delete_size">Delete</p></div>
    <div class="vector_3"></div>
    <div class="d_flex gap_8 margin_0 edit" id="edit-Task" taskname="${data.taskKey}"><div class="edit_wrapper"></div><p class="edit_size">Edit</p></div>
     `
}

/**
 * Generates the HTML template for editing the details of a task.
 * @param {Object} data - The task data object to render.
 * @param {Object} data.taskData - The properties of the task (title, description, dueDate, priority, etc.).
 * @param {string} data.taskKey - The unique key or ID of the task.
 * @returns {string} - HTML string for the task detail edit view.
 */
function taskDetailEditTemplate(data) {
  return ` 
      <div class="taskd_detail_header d_flex_center_row justify_between margin_0 width_100">
      <div></div>
      <div class="close_detail_field  close_add_task margin_0" onclick="closeTaskOverlay()"></div>
    </div>   
      <div class="task_edit_view_container justify_none d_flex_center_column">
            <div class="title_input margin_0 gap_8 width_100">
          <div class="d_flex_center_row justify_start margin_0">
            <p class="margin_0">Title</p>
          </div>
          <div class="margin_0">
            <input class="input_task_detail" type="text" value="${data.taskData.title}" id="title-input-overlay" required />
            <div class="margin_0 input_error font_12">
              <p class="d_none" id="required-title">this field is required</p>
            </div>
          </div>
        </div>

              <div class="title_input margin_0 gap_8 width_100">
          <div class="d_flex_center_row justify_start margin_0">
            <p class="margin_0">Description</p>
          </div>
          <div class="textarea_wrapper margin_0">
            <textarea class="input_textarea_detail" id="description-input-overlay">${data.taskData.description}</textarea>
            <div class="resize_icon"></div>
          </div>
        </div>

          <div class="title_input margin_0 gap_8 width_100">
          <div class="d_flex_center_row justify_start margin_0">
            <p class="margin_0">Due Date</p>
          </div>
          <div class="margin_0">
            <input class="date" id="datepicker" type="date"  value="${data.taskData.dueDate}"/>
          </div>
        </div>

              <div class="title_input margin_0 gap_8 width_100">
          <div class="d_flex_center_row justify_start margin_0">
            <p class="margin_0">Priority</p>
          </div>
          <div class="priority_button_container d_flex_center_row justify_between">
            <div class="priority_button d_flex_center_row" id="urgent-button" onclick="setPriority('urgent')">
              <p class="margin_0">Urgent</p>
              <img class="" src="./assets/icons/prio_urgent.svg" alt="" id="prio-urgent-icon" />
              <img class="d_none" src="./assets/icons/prio_urgent_active.svg" alt="" id="prio-urgent-icon-active" />
            </div>
            <div class="priority_button d_flex_center_row" id="medium-button" onclick="setPriority('medium')">
              <p class="margin_0">Medium</p>
              <img class="" src="./assets/icons/prio_medium.svg" alt="" id="prio-medium-icon" />
              <img class="d_none" src="./assets/icons/prio_medium_active.svg" alt="" id="prio-medium-icon-active" />
            </div>
            <div class="priority_button d_flex_center_row" id="low-button" onclick="setPriority('low')">
              <p class="margin_0">Low</p>
              <img class="" src="./assets/icons/prio_low.svg" alt="" id="prio-low-icon" />
              <img class="d_none" src="./assets/icons/prio_low_active.svg" alt="" id="prio-low-icon-active" />
            </div>
          </div>
        </div>

                <div class="title_input margin_0 width_100 ">
          <div class="d_flex_center_column align_none gap_8">
            <div class="d_flex_center_row justify_start margin_0">
              <p class="margin_0">Assigned to</p>
            </div>

            

            <div class="input_assigned_to input_icon_wrapper width_100 d_flex_center margin_0"
              onclick="toggleAssignedToDropdown(event)">
              <input class="assigned_to_dropdown" type="text" placeholder="Select contacts to assing"
                id="assigned-to-dropdown" required />
              <div class="input_icon_container z_3 d_flex_center">
                <div class="arrow_drop up" id="arrow-drop-down-assign">
                  <img src="./assets/icons/arrow_drop_down.svg" alt="drop-down-arrow" />
                </div>
              </div>
            </div>
          </div>
          <div class="contact_dropdown" id="add-task-contacts-list">
            <div class="assign-contact-list d_none" id="assign-contact-list"></div>

          </div>
             <div id="assigned-contacts-preview" class="d_flex_row margin_t8"></div>
        </div>

                <div class="title_input margin_0 gap_8 width_100 ">
          <div class="d_flex_center_row justify_start margin_0">
            <p class="margin_0">Subtasks</p>
          </div>
          <div class="input_icon_wrapper d_flex_center margin_0">
            <div class="input_icon_container add d_flex_center" onclick="activateSubtask()">
              <div class="add_icon"></div>
            </div>
            <div class="add_or_remove d_flex_center_row gap_4 d_none">
              <div class="input_icon_container position_unset">
                <img src="./assets/icons/subtask_close.svg" alt="subtask_close" onclick="clearSubTaskValue()">
              </div>
              <img src="./assets/icons/vector_3.svg" alt="vector">
              <div class="input_icon_container position_unset">
                <img src="./assets/icons/subtask_check.svg" alt="subtask_check" onclick="addNewSubTask()">
              </div>
            </div>
            <input type="text" placeholder="Add new subtasks" id="add-subtasks" required onclick="activateSubtask()" />
          </div>
          <div class="added_subtask_list margin_0">
          </div>
        </div>


    </div>
        <div class="task_detail_view_footer">
            <button class="btn_dark margin_0 add_task_button" taskname="${data.taskKey}" id="check-edit-task">Ok <img
            src="./assets/icons/check.svg" alt="">
        </button>
    </div>
     `
}

function renderCreator(data, isCreator) {
  if (isCreator) {  
    return `
  <div class="creator_container d_flex_row gap_8 justify_between">
    <div class="d_flex_row gap_8">
      <img src="./assets/icons/member.svg" alt="member-svg">
      <p>${data.creator}</p>
    </div>
    <div class="profil_icon">
    </div>
  </div>`
  } else {
    return `
  <div class="creator_container d_flex_row gap_8 justify_between">
    <div class="d_flex_row gap_8">
      <img src="./assets/icons/extern.svg" alt="extern-svg">
      <p>${data.creator}</p>
    </div>
   <a href="mailto:${data.Mail}"><div class="email_icon"> </div></a>
  </div>`
  }

}

