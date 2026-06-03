/* ===========================
   상태(State) 관리
=========================== */

// Todo 항목 배열 (각 항목: { id, text, isDone, date })
// date: 'YYYY-MM-DD' 형식의 문자열
let todos = [];

// 각 Todo를 고유하게 식별하기 위한 ID 카운터
// ex) 1번부터 -> id = 1, 2, 3, ...
let nextId = 1;

// 현재 선택된 필터 ('all' | 'active' | 'done')
let currentFilter = "all";

// 현재 선택된 날짜 (Date 객체) - 페이지 로드 시 오늘로 초기화
let currentDate = new Date();

// 주간 뷰의 기준 날짜: 이 날짜가 속한 주를 표시한다
// currentDate와 별도로 관리하여 주 이동과 날짜 선택을 독립적으로 처리
let weekBaseDate = new Date();

/* ===========================
   로컬스토리지 연동
=========================== */
// 로컬 스토리지 => key: value 형태로 저장

const STORAGE_KEY_TODOS = "todos";
const STORAGE_KEY_NEXTID = "nextId";

/**
 * 현재 todos 배열과 nextId를 로컬스토리지에 저장한다.
 */
// 데이터 JSON 형태로 변환: JSON.stringify(데이터)
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
  localStorage.setItem(STORAGE_KEY_NEXTID, JSON.stringify(nextId));
}

/**
 * 로컬스토리지에서 todos와 nextId를 불러와 상태를 복원한다.
 */
// JSON 데이터 파싱: JSON.parse()
function loadFromStorage() {
  const savedTodos = localStorage.getItem(STORAGE_KEY_TODOS);
  const savedNextId = localStorage.getItem(STORAGE_KEY_NEXTID);
  if (savedTodos) todos = JSON.parse(savedTodos);
  if (savedNextId) nextId = JSON.parse(savedNextId);
}

/* ===========================
   DOM 참조
=========================== */
const todoInput = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const errorMessage = document.getElementById("errorMessage");
const emptyState = document.getElementById("emptyState");
const emptyMessage = document.getElementById("emptyMessage");
const totalCount = document.getElementById("totalCount");
const doneCount = document.getElementById("doneCount");
const remainCount = document.getElementById("remainCount");
const filterTabs = document.querySelectorAll(".filter-tab");
const prevDateBtn = document.getElementById("prevDateBtn");
const nextDateBtn = document.getElementById("nextDateBtn");
const dateLabel = document.getElementById("dateLabel");
const todayBadge = document.getElementById("todayBadge");
const prevWeekBtn = document.getElementById("prevWeekBtn");
const nextWeekBtn = document.getElementById("nextWeekBtn");
const weekRangeLabel = document.getElementById("weekRangeLabel");
const weekDaysEl = document.getElementById("weekDays");

/* ===========================
   날짜 유틸리티
=========================== */

/**
 * Date 객체를 'YYYY-MM-DD' 문자열로 변환한다. (로컬 시간 기준)
 * @param {Date} date
 * @returns {string}
 */
// toISOString()은 날짜를 UTC 기준으로 변환한 뒤 문자열 생성 -> 날짜 바뀔 수도 있음
// function formatDateKey(date) {
//   return date.toISOString().split('T')[0];
// }
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Date 객체를 '2025년 6월 3일 (화)' 형식으로 변환한다.
 * @param {Date} date
 * @returns {string}
 */
function formatDateDisplay(date) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dow = days[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dow})`;
}

/**
 * 주어진 Date가 오늘인지 반환한다.
 * @param {Date} date
 * @returns {boolean}
 */
function isToday(date) {
  return formatDateKey(date) === formatDateKey(new Date());
}

/**
 * 주어진 Date가 속한 주의 월요일 Date를 반환한다.
 * 일요일(0)은 -6, 월요일(1)은 0, 화요일(2)은 -1 ... 처리
 * @param {Date} date
 * @returns {Date} 해당 주 월요일
 */
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=일, 1=월, ..., 6=토
  // 일요일이면 -6, 그 외엔 1-day
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 월요일 Date를 기준으로 해당 주 7일의 Date 배열을 반환한다.
 * @param {Date} monday
 * @returns {Date[]} 월~일 순서의 7개 Date
 */
function getWeekDates(monday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/* ===========================
   주간 뷰
=========================== */

/**
 * 주간 뷰 전체를 갱신한다.
 * 날짜 범위 레이블, 7개 요일 셀을 새로 그린다.
 */
// 월요일을 구하고 해당 주의 날짜들을 구함
function updateWeekView() {
  const monday = getMonday(weekBaseDate);
  const weekDates = getWeekDates(monday);
  const sunday = weekDates[6];

  // 주 범위 레이블: "이번주 월요일 ~ 일요일"
  const startLabel = `${monday.getFullYear()}. ${monday.getMonth() + 1}. ${monday.getDate()}`;
  const endLabel = `${sunday.getMonth() + 1}. ${sunday.getDate()}`;
  weekRangeLabel.textContent = `${startLabel} ~ ${endLabel}`;

  // 기존 셀 초기화
  weekDaysEl.innerHTML = "";

  const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

  weekDates.forEach((date, index) => {
    const dateKey = formatDateKey(date);
    const todosOnDay = todos.filter((t) => t.date === dateKey);
    const count = todosOnDay.length;
    const isSelected = dateKey === formatDateKey(currentDate);
    const isTodayCell = isToday(date);
    const isSunday = index === 6; // 마지막(7번째)이 일요일

    // 셀 div 생성
    const cell = document.createElement("div");
    cell.className = [
      "week-day-cell",
      isTodayCell ? "is-today" : "",
      isSelected ? "is-selected" : "",
      isSunday ? "is-sunday" : "",
    ]
      .filter(Boolean)
      .join(" ");
    cell.setAttribute("role", "listitem");
    cell.setAttribute(
      "aria-label",
      `${formatDateDisplay(date)}, 할 일 ${count}개`,
    );

    // 요일 이름 + 오늘 뱃지 래퍼
    const nameWrapper = document.createElement("div");
    nameWrapper.className = "week-day-name-wrapper";

    const nameEl = document.createElement("span");
    nameEl.className = "week-day-name";
    nameEl.textContent = DAY_NAMES[index];
    nameWrapper.appendChild(nameEl);

    // 오늘 날짜면 요일 옆에 '오늘' 뱃지 추가
    if (isTodayCell) {
      const todayBadgeEl = document.createElement("span");
      todayBadgeEl.className = "week-today-badge";
      todayBadgeEl.textContent = "오늘";
      nameWrapper.appendChild(todayBadgeEl);
    }

    // 날짜 숫자
    const numberEl = document.createElement("span");
    numberEl.className = "week-day-number";
    numberEl.textContent = date.getDate();

    // Todo 개수
    const countEl = document.createElement("span");
    countEl.className = `week-day-count${count > 0 ? " has-todos" : ""}`;
    countEl.textContent = count > 0 ? count : "";

    cell.appendChild(nameWrapper);
    cell.appendChild(numberEl);
    cell.appendChild(countEl);

    // 셀 클릭 시 해당 날짜로 이동
    cell.addEventListener("click", () => selectDate(date));

    weekDaysEl.appendChild(cell);
  });
}

/**
 * 주간 뷰에서 날짜 셀을 클릭했을 때 호출된다.
 * currentDate를 변경하고 전체 화면을 갱신한다.
 * @param {Date} date - 선택된 날짜
 */
function selectDate(date) {
  currentDate = new Date(date);
  render();
}

/**
 * 이전 주로 이동한다. weekBaseDate를 7일 앞으로 당긴다.
 */
function goToPrevWeek() {
  weekBaseDate.setDate(weekBaseDate.getDate() - 7);
  render();
}

/**
 * 다음 주로 이동한다. weekBaseDate를 7일 뒤로 민다.
 */
function goToNextWeek() {
  weekBaseDate.setDate(weekBaseDate.getDate() + 7);
  render();
}

/* ===========================
   일간 날짜 네비게이션
=========================== */

/**
 * currentDate를 하루 전으로 이동한다.
 * 선택 날짜가 현재 표시 주 밖으로 벗어나면 weekBaseDate도 함께 이동한다.
 */
function goToPrevDate() {
  currentDate.setDate(currentDate.getDate() - 1);
  syncWeekBaseDateToCurrentDate();
  render();
}

/**
 * currentDate를 하루 후로 이동한다.
 */
function goToNextDate() {
  currentDate.setDate(currentDate.getDate() + 1);
  syncWeekBaseDateToCurrentDate();
  render();
}

/**
 * currentDate가 weekBaseDate 기준 주 밖에 있으면
 * weekBaseDate를 currentDate에 맞게 동기화한다.
 */
/*
  월요일을 기준으로 동기화를 하는 것이 일관되다고 생각했으나
  굳이 getMonday 계산을 통해서 currentDate라는 원본 데이터를
  두 번 계산해서 사용할 이유는 없어 currentDate로 바로 계산.
*/
function syncWeekBaseDateToCurrentDate() {
  const monday = getMonday(weekBaseDate);
  const weekDates = getWeekDates(monday);
  const keys = weekDates.map(formatDateKey);
  if (!keys.includes(formatDateKey(currentDate))) {
    weekBaseDate = new Date(currentDate);
  }
}

/**
 * 일간 날짜 표시 영역(label, 오늘 뱃지)을 갱신한다.
 */
function updateDateDisplay() {
  dateLabel.textContent = formatDateDisplay(currentDate);
  todayBadge.style.display = isToday(currentDate) ? "inline-block" : "none";
}

/* ===========================
   Todo 추가
=========================== */

function addTodo() {
  const text = todoInput.value.trim();
  const filteredTodos = getFilteredTodos();

  // 중복처리 추가
  // let flag = false;

  // filteredTodos.forEach((todo) => {
  //   if (todo.text === text) flag = true;
  // });
  // some, every, includes 함수 생각 못함..
  let isDuplicate = filteredTodos.some((todo) => todo.text === text);
  if (!text || isDuplicate) {
    errorContent = isDuplicate
      ? "할 일이 이미 존재합니다."
      : "할 일을 입력해주세요.";
    showError(errorContent);
    todoInput.classList.add("is-error");
    todoInput.focus();
    return;
  }

  clearError();

  const newTodo = {
    id: nextId++,
    text,
    isDone: false,
    date: formatDateKey(currentDate),
  };

  todos.push(newTodo);
  todoInput.value = "";

  saveToStorage();
  render();
}

/* ===========================
   Todo 삭제
=========================== */

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveToStorage();
  render();
}

/* ===========================
   Todo 완료 토글
=========================== */

function toggleDone(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, isDone: !todo.isDone } : todo,
  );
  saveToStorage();
  render();
}

/* ===========================
   Todo 수정 (인라인 편집)
=========================== */

function startEdit(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const listItem = document.querySelector(`[data-id="${id}"]`);
  if (!listItem) return;

  listItem.classList.add("is-editing");

  const textSpan = listItem.querySelector(".todo-text");
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "todo-edit-input";
  editInput.value = todo.text;
  editInput.maxLength = 100;
  textSpan.replaceWith(editInput);
  editInput.focus();

  const editBtn = listItem.querySelector(".edit-btn");
  editBtn.textContent = "✓";
  editBtn.title = "수정 완료";
  editBtn.onclick = () => confirmEdit(id);
  // 화살표 함수를 사용해서 이벤트 핸들러의 참조가 어려움
  // editBtn.removeEventListener("click", );

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") confirmEdit(id);
    if (e.key === "Escape") render();
  });
}

function confirmEdit(id) {
  const listItem = document.querySelector(`[data-id="${id}"]`);
  if (!listItem) return;

  const editInput = listItem.querySelector(".todo-edit-input");
  const newText = editInput ? editInput.value.trim() : "";

  if (!newText) {
    render();
    return;
  }

  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, text: newText } : todo,
  );
  saveToStorage();
  render();
}

/* ===========================
   필터링
=========================== */

/**
 * 현재 날짜 + 상태 필터를 적용하여 표시할 Todo 배열을 반환한다.
 * @returns {Array}
 */
function getFilteredTodos() {
  const dateKey = formatDateKey(currentDate);
  const byDate = todos.filter((todo) => todo.date === dateKey);

  if (currentFilter === "active") return byDate.filter((todo) => !todo.isDone);
  if (currentFilter === "done") return byDate.filter((todo) => todo.isDone);
  return byDate;
}

function setFilter(filter) {
  currentFilter = filter;
  filterTabs.forEach((tab) => {
    const isSelected = tab.dataset.filter === filter;
    tab.classList.toggle("is-active", isSelected);
    tab.setAttribute("aria-selected", isSelected);
  });
  render();
}

/* ===========================
   에러 메시지 처리
=========================== */

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
  todoInput.classList.remove("is-error");
}

/* ===========================
   통계 업데이트
=========================== */

function updateStats() {
  const dateKey = formatDateKey(currentDate);
  const dateTodos = todos.filter((todo) => todo.date === dateKey);
  const total = dateTodos.length;
  const done = dateTodos.filter((t) => t.isDone).length;
  const remain = total - done;

  totalCount.innerHTML = `전체 <strong>${total}</strong>`;
  doneCount.innerHTML = `완료 <strong>${done}</strong>`;
  remainCount.innerHTML = `남은 일 <strong>${remain}</strong>`;
}

/* ===========================
   빈 상태 메시지
=========================== */

function getEmptyMessage() {
  if (currentFilter === "active") return "진행 중인 일이 없어요";
  if (currentFilter === "done") return "완료된 일이 없어요";
  return "아직 할 일이 없어요";
}

/* ===========================
   Todo 아이템 DOM 생성
=========================== */

function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = `todo-item${todo.isDone ? " is-done" : ""}`;
  li.setAttribute("data-id", todo.id);
  li.setAttribute("role", "listitem");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = todo.isDone;
  checkbox.setAttribute("aria-label", "완료 처리");
  checkbox.addEventListener("change", () => toggleDone(todo.id));

  const textWrapper = document.createElement("div");
  textWrapper.className = "todo-text-wrapper";

  const textSpan = document.createElement("span");
  textSpan.className = "todo-text";
  textSpan.textContent = todo.text;
  textWrapper.appendChild(textSpan);

  const actions = document.createElement("div");
  actions.className = "todo-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "action-btn edit-btn";
  editBtn.textContent = "✎";
  editBtn.title = "수정";
  editBtn.setAttribute("aria-label", "수정");
  editBtn.onclick = () => startEdit(todo.id);
  // editBtn.addEventListener("click", () => startEdit(todo.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "action-btn delete-btn";
  deleteBtn.textContent = "✕";
  deleteBtn.title = "삭제";
  deleteBtn.setAttribute("aria-label", "삭제");
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(textWrapper);
  li.appendChild(actions);

  return li;
}

/* ===========================
   전체 렌더링
=========================== */

/**
 * 주간 뷰, 일간 날짜, Todo 목록, 통계를 모두 갱신한다.
 */
function render() {
  updateWeekView(); // 주간 뷰 갱신
  updateDateDisplay(); // 일간 날짜 표시 갱신

  todoList.innerHTML = "";

  const filteredTodos = getFilteredTodos();

  if (filteredTodos.length === 0) {
    emptyState.style.display = "block";
    emptyMessage.textContent = getEmptyMessage();
  } else {
    emptyState.style.display = "none";
  }

  filteredTodos.forEach((todo) => {
    todoList.appendChild(createTodoElement(todo));
  });

  updateStats();
}

/* ===========================
   이벤트 바인딩
=========================== */

addBtn.addEventListener("click", addTodo);

todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

todoInput.addEventListener("input", () => {
  if (todoInput.value.trim()) clearError();
});

filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => setFilter(tab.dataset.filter));
});

// 일간 이전 / 다음
prevDateBtn.addEventListener("click", goToPrevDate);
nextDateBtn.addEventListener("click", goToNextDate);

// 주간 이전 / 다음
prevWeekBtn.addEventListener("click", goToPrevWeek);
nextWeekBtn.addEventListener("click", goToNextWeek);

/* ===========================
   초기화
=========================== */

loadFromStorage();
render();
