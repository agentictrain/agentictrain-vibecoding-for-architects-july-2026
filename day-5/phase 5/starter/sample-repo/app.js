var todos = [];

var form = document.getElementById('todo-form');
var input = document.getElementById('new-todo');
var list = document.getElementById('todo-list');

loadState();
render();

form.addEventListener('submit', function (event) {
  event.preventDefault();
  var text = input.value.trim();
  if (!text) return;
  todos.push({ id: Date.now(), text: text, done: false });
  input.value = '';
  saveState();
  render();
});

function toggle(id) {
  todos = todos.map(function (t) {
    if (t.id === id) t.done = !t.done;
    return t;
  });
  saveState();
  render();
}

function remove(id) {
  todos = todos.filter(function (t) { return t.id !== id; });
  saveState();
  render();
}

function render() {
  list.innerHTML = '';
  todos.forEach(function (t) {
    var li = document.createElement('li');
    if (t.done) li.className = 'done';
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = t.done;
    checkbox.addEventListener('change', function () { toggle(t.id); });
    var span = document.createElement('span');
    span.textContent = t.text;
    var del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', function () { remove(t.id); });
    li.append(checkbox, span, del);
    list.appendChild(li);
  });
}

function saveState() {
  try {
    localStorage.setItem('tiny-todo', JSON.stringify(todos));
  } catch (e) {
    // ignore write errors
  }
}

function loadState() {
  try {
    var raw = localStorage.getItem('tiny-todo');
    if (raw) todos = JSON.parse(raw);
  } catch (e) {
    // ignore parse errors
  }
}