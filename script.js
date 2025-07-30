// Elements
const form = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const machineSelect = document.getElementById('machineSelect');
const taskTable = document.getElementById('taskTable');

const machineGroups = {
  "SPF Machines": ['SPF1', 'SPF2', 'SPF3'],
  "Braun Machines": [
    'Braun Tunnel','Braun Press', 'Braun Shuttle', 'Braun Dryer 1', 'Braun Dryer 2', 'Braun Dryer 3', 'Braun Dryer 4', 'Braun Dryer 5', 'Braun Dryer 6'
  ],
  "Lavatec Machines": [
    'Lavatec Tunnel', 'Lavatec Press', 'Lavatec Shuttle',
    'Lavatec Dryer 1', 'Lavatec Dryer 2', 'Lavatec Dryer 3', 'Lavatec Dryer 4', 'Lavatec Dryer 5'
  ]
};

const statuses = ['pending', 'progress', 'done', 'archive'];

function createGroupHeader(title) {
  const tr = document.createElement('tr');
  const th = document.createElement('th');
  th.colSpan = statuses.length + 1;
  th.className = 'bg-dark text-light text-center';
  th.innerText = title;
  tr.appendChild(th);
  taskTable.appendChild(tr);
}

function createMachineRow(machine) {
  const tr = document.createElement('tr');
  tr.dataset.machine = machine;

  const tdName = document.createElement('td');
  tdName.innerHTML = `<strong>${machine}</strong>`;
  tr.appendChild(tdName);

  statuses.forEach(status => {
    const td = document.createElement('td');
    td.classList.add('task-zone', 'align-top');
    td.dataset.status = status;
    tr.appendChild(td);
  });

  taskTable.appendChild(tr);
}

function createTaskElement(text, user = '🧑 User', currentStatus = 'pending') {
  const div = document.createElement('div');
  div.className = 'task text-truncate position-relative border rounded bg-light p-2 mt-1';
  div.setAttribute('contenteditable', 'true');
  div.style.maxWidth = '180px';
  div.style.overflow = 'hidden';
  div.style.whiteSpace = 'nowrap';
  div.title = text;
  div.dataset.status = currentStatus;


  const taskBody = document.createElement('div');
  taskBody.innerHTML = `${text}<br><small class="text-muted">👤 ${user}</small>`;
  div.appendChild(taskBody);


  const imagesContainer = document.createElement('div');
  imagesContainer.className = 'task-images mt-2 d-flex flex-wrap gap-1';
  div.appendChild(imagesContainer);


  const imgUpload = document.createElement('input');
  imgUpload.type = 'file';
  imgUpload.accept = 'image/*';
  imgUpload.multiple = true;
  imgUpload.className = 'form-control form-control-sm mt-2';
  div.appendChild(imgUpload);

  imgUpload.addEventListener('change', e => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'position-relative';

        const img = document.createElement('img');
        img.src = event.target.result;
        img.className = 'img-thumbnail';
        img.style.width = '50px';
        img.style.height = '50px';
        img.style.cursor = 'pointer';


        img.addEventListener('click', () => {
          const modalImg = document.createElement('img');
          modalImg.src = img.src;
          modalImg.style.maxWidth = '90vw';
          modalImg.style.maxHeight = '90vh';

          const modal = document.createElement('div');
          modal.className = 'modal d-flex align-items-center justify-content-center';
          modal.style.position = 'fixed';
          modal.style.top = 0;
          modal.style.left = 0;
          modal.style.width = '100vw';
          modal.style.height = '100vh';
          modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
          modal.style.zIndex = 9999;
          modal.appendChild(modalImg);
          modal.addEventListener('click', () => modal.remove());

          document.body.appendChild(modal);
        });


        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✖';
        removeBtn.className = 'btn btn-sm btn-danger position-absolute top-0 end-0 p-0';
        removeBtn.style.fontSize = '0.7rem';
        removeBtn.style.lineHeight = '1';
        removeBtn.style.borderRadius = '0 0.25rem 0.25rem 0';
        removeBtn.style.cursor = 'pointer';
        removeBtn.addEventListener('click', () => {
          imgWrapper.remove();
        });

        imgWrapper.style.position = 'relative';
        imgWrapper.appendChild(img);
        imgWrapper.appendChild(removeBtn);
        imagesContainer.appendChild(imgWrapper);
      };
      reader.readAsDataURL(file);
    });
    imgUpload.value = ''; 
  });


  const controlRow = document.createElement('div');
  controlRow.className = 'd-flex justify-content-between mt-1';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-sm btn-outline-success';
  nextBtn.textContent = 'Next →';
  nextBtn.addEventListener('click', () => moveTaskToNext(div));

  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-sm btn-outline-primary';
  backBtn.textContent = '← Back';
  backBtn.addEventListener('click', () => moveTaskBack(div));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-sm btn-outline-danger';
  deleteBtn.textContent = '✖';
  deleteBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this task?')) {
      div.remove();
    }
  });

  controlRow.appendChild(backBtn);
  controlRow.appendChild(nextBtn);
  controlRow.appendChild(deleteBtn);
  div.appendChild(controlRow);


  div.addEventListener('mouseenter', () => {
    div.style.whiteSpace = 'normal';
    div.style.overflow = 'visible';
  });

  div.addEventListener('mouseleave', () => {
    div.style.whiteSpace = 'nowrap';
    div.style.overflow = 'hidden';
  });

  return div;
}

function moveTaskToNext(taskElement) {
  const currentStatus = taskElement.dataset.status;
  const nextStatus = getNextStatus(currentStatus);
  if (!nextStatus) return;
  const row = taskElement.closest('tr');
  const nextZone = row.querySelector(`.task-zone[data-status='${nextStatus}']`);
  if (nextZone) {
    taskElement.dataset.status = nextStatus;
    nextZone.appendChild(taskElement);
  }
}

function moveTaskBack(taskElement) {
  const currentStatus = taskElement.dataset.status;
  const prevStatus = getPreviousStatus(currentStatus);
  if (!prevStatus) return;
  const row = taskElement.closest('tr');
  const prevZone = row.querySelector(`.task-zone[data-status='${prevStatus}']`);
  if (prevZone) {
    taskElement.dataset.status = prevStatus;
    prevZone.appendChild(taskElement);
  }
}

function getNextStatus(currentStatus) {
  const index = statuses.indexOf(currentStatus);
  if (index === -1 || index >= statuses.length - 1) return null;
  return statuses[index + 1];
}

function getPreviousStatus(currentStatus) {
  const index = statuses.indexOf(currentStatus);
  if (index <= 0) return null;
  return statuses[index - 1];
}


Object.entries(machineGroups).forEach(([groupName, machines]) => {
  createGroupHeader(groupName);
  machines.forEach(createMachineRow);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const machine = machineSelect.value;
  const taskText = taskInput.value.trim();
  if (!machine || !taskText) return;

  const user = prompt('Enter your name:', '🧑 User') || '🧑 User';
  const row = document.querySelector(`tr[data-machine='${machine}']`);
  const cell = row.querySelector(".task-zone[data-status='pending']");
  const taskDiv = createTaskElement(taskText, user, 'pending');
  cell.appendChild(taskDiv);
  taskInput.value = '';
  machineSelect.value = '';
});
