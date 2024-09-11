// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  nextId++;
  localStorage.setItem("nextId", JSON.stringify(nextId));
  return nextId;
}

// Function to create a task card
function createTaskCard(task) {
  let cardClass = '';
  const today = dayjs().startOf('day');
  const dueDate = dayjs(task.dueDate);

  if (dueDate.isBefore(today, 'day')) {
    cardClass = 'bg-danger'; // overdue tasks in red
  } else if (dueDate.diff(today, 'day') <= 3) {
    cardClass = 'bg-warning'; // near deadline tasks in yellow
  }

  return $(`
    <div class="card task-card mb-3 ${cardClass}" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
        <button class="btn btn-danger delete-task">Delete</button>
      </div>
    </div>
  `);
}

// Function to render the task list
function renderTaskList() {
  $("#todo-cards, #in-progress-cards, #done-cards").empty();

  taskList.forEach(task => {
    const card = createTaskCard(task);
    if (task.status === "To Do") {
      $("#todo-cards").append(card);
    } else if (task.status === "In Progress") {
      $("#in-progress-cards").append(card);
    } else if (task.status === "Done") {
      $("#done-cards").append(card);
    }

    // Make task draggable
    card.draggable({
      revert: "invalid",
      helper: "clone"
    });
  });
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const task = {
    id: generateTaskId(),
    title: $("#task-title").val().trim(),
    description: $("#task-desc").val().trim(),
    dueDate: $("#task-date").val(),
    status: "To Do"
  };

  taskList.push(task);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
  $('#formModal').modal('hide');
}

// Handle deleting a task
function handleDeleteTask(event) {
  const card = $(event.target).closest(".task-card");
  const taskId = card.data("id");
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskCard = ui.helper;
  const taskId = taskCard.data("id");
  const newStatus = $(this).attr("id").replace("-cards", "").replace("in-progress", "In Progress").replace("to-do", "To Do");

  taskList = taskList.map(task => {
    if (task.id === taskId) {
      task.status = newStatus;
    }
    return task;
  });

  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// On page load
$(document).ready(function () {
  renderTaskList();

  // Make lanes droppable
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop
  });

  // Add task form submission
  $("#task-form").on("submit", handleAddTask);

  // Delete task
  $(document).on("click", ".delete-task", handleDeleteTask);

  // Initialize date picker
  $("#task-date").datepicker();
});
