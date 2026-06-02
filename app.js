/* ===========================
   상태(State) 관리
=========================== */

// Todo 항목 배열 (각 항목: { id, text, isDone, date })
// date: 'YYYY-MM-DD' 형식의 문자열
let todos = [];

// 각 Todo를 고유하게 식별하기 위한 ID 카운터
let nextId = 1;

/* ===========================
   로컬스토리지 연동
=========================== */

// 로컬스토리지에서 사용할 키 이름
const STORAGE_KEY_TODOS = "todos";
const STORAGE_KEY_NEXTID = "nextId";

/**
 * 현재 todos 배열과 nextId를 로컬스토리지에 저장한다.
 * JSON.stringify로 직렬화하여 문자열로 저장한다.
 */
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
  localStorage.setItem(STORAGE_KEY_NEXTID, JSON.stringify(nextId));
}

/**
 * 로컬스토리지에서 todos와 nextId를 불러와 상태를 복원한다.
 * 저장된 데이터가 없으면 기본값(빈 배열, nextId=1)을 유지한다.
 */
function loadFromStorage() {
  const savedTodos = localStorage.getItem(STORAGE_KEY_TODOS);
  const savedNextId = localStorage.getItem(STORAGE_KEY_NEXTID);

  // 저장된 값이 있을 때만 JSON.parse로 복원
  if (savedTodos) todos = JSON.parse(savedTodos);
  if (savedNextId) nextId = JSON.parse(savedNextId);
}

// 현재 선택된 필터 ('all' | 'active' | 'done')
let currentFilter = "all";

// 현재 선택된 날짜 (Date 객체)
// 페이지 로드 시 오늘 날짜로 초기화
let currentDate = new Date();

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

/* ===========================
   날짜 유틸리티
=========================== */

/**
 * Date 객체를 'YYYY-MM-DD' 형식의 문자열로 변환한다.
 * 로컬 시간 기준으로 변환하여 시간대 오류를 방지한다.
 * @param {Date} date
 * @returns {string} 'YYYY-MM-DD'
 */
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Date 객체를 화면에 표시할 형식으로 변환한다.
 * ex) 2025년 6월 3일 (화)
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
 * 주어진 Date가 오늘인지 여부를 반환한다.
 * @param {Date} date
 * @returns {boolean}
 */
function isToday(date) {
  return formatDateKey(date) === formatDateKey(new Date());
}

/* ===========================
   날짜 네비게이션
=========================== */

/**
 * currentDate를 하루 전으로 이동하고 화면을 갱신한다.
 */
function goToPrevDate() {
  currentDate.setDate(currentDate.getDate() - 1);
  render();
}

/**
 * currentDate를 하루 후로 이동하고 화면을 갱신한다.
 */
function goToNextDate() {
  currentDate.setDate(currentDate.getDate() + 1);
  render();
}

/**
 * 날짜 표시 영역(label, 오늘 뱃지)을 현재 날짜에 맞게 업데이트한다.
 */
function updateDateDisplay() {
  dateLabel.textContent = formatDateDisplay(currentDate);

  // 오늘 뱃지는 오늘 날짜일 때만 표시
  todayBadge.style.display = isToday(currentDate) ? "inline-block" : "none";
}

/* ===========================
   Todo 추가
=========================== */

/**
 * 입력창의 텍스트로 새 Todo를 생성한다.
 * 현재 선택된 날짜(currentDate)를 함께 저장한다.
 * 빈 값이면 에러 메시지를 표시하고 중단한다.
 */
function addTodo() {
  const text = todoInput.value.trim();

  if (!text) {
    showError("할 일을 입력해주세요.");
    todoInput.classList.add("is-error");
    todoInput.focus();
    return;
  }

  clearError();

  const newTodo = {
    id: nextId++,
    text,
    isDone: false,
    date: formatDateKey(currentDate), // 현재 선택된 날짜를 'YYYY-MM-DD'로 저장
  };

  todos.push(newTodo);
  todoInput.value = "";

  saveToStorage(); // 추가 후 저장
  render();
}

/* ===========================
   Todo 삭제
=========================== */

/**
 * 주어진 ID를 가진 Todo를 배열에서 제거한다.
 * @param {number} id - 삭제할 Todo의 ID
 */
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveToStorage(); // 삭제 후 저장
  render();
}

/* ===========================
   Todo 완료 토글
=========================== */

/**
 * 주어진 ID를 가진 Todo의 완료 상태를 반전시킨다.
 * @param {number} id - 토글할 Todo의 ID
 */
function toggleDone(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, isDone: !todo.isDone } : todo,
  );
  saveToStorage(); // 완료 처리 후 저장
  render();
}

/* ===========================
   Todo 수정 (인라인 편집)
=========================== */

/**
 * 해당 아이템을 수정 모드로 전환한다.
 * @param {number} id - 수정할 Todo의 ID
 */
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

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") confirmEdit(id);
    if (e.key === "Escape") render();
  });
}

/**
 * 수정 모드를 종료하고 변경된 텍스트를 저장한다.
 * @param {number} id - 수정 완료할 Todo의 ID
 */
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
  saveToStorage(); // 수정 후 저장
  render();
}

/* ===========================
   필터링
=========================== */

/**
 * 현재 날짜 + 현재 필터를 동시에 적용하여 표시할 Todo 배열을 반환한다.
 * 날짜 필터링이 먼저 적용되고, 그 결과에 상태 필터가 적용된다.
 * @returns {Array} 최종 표시할 Todo 배열
 */
function getFilteredTodos() {
  // 1단계: 선택된 날짜에 해당하는 Todo만 추출
  const todayKey = formatDateKey(currentDate);
  const byDate = todos.filter((todo) => todo.date === todayKey);

  // 2단계: 상태 필터 적용
  if (currentFilter === "active") return byDate.filter((todo) => !todo.isDone);
  if (currentFilter === "done") return byDate.filter((todo) => todo.isDone);
  return byDate;
}

/**
 * 필터 탭 클릭 시 currentFilter를 변경하고 탭 스타일을 갱신한다.
 * @param {string} filter - 'all' | 'active' | 'done'
 */
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

/**
 * 통계는 현재 날짜 기준 전체 todos에서 계산한다.
 * (상태 필터와 무관하게 선택된 날짜의 전체 항목 기준)
 */
function updateStats() {
  const todayKey = formatDateKey(currentDate);
  const todayTodos = todos.filter((todo) => todo.date === todayKey);
  const total = todayTodos.length;
  const done = todayTodos.filter((t) => t.isDone).length;
  const remain = total - done;

  totalCount.innerHTML = `전체 <strong>${total}</strong>`;
  doneCount.innerHTML = `완료 <strong>${done}</strong>`;
  remainCount.innerHTML = `남은 일 <strong>${remain}</strong>`;
}

/* ===========================
   빈 상태 메시지
=========================== */

function getEmptyMessage() {
  if (currentFilter === "active") return "진행 중인 할 일이 없어요";
  if (currentFilter === "done") return "완료된 할 일이 없어요";
  return "아직 할 일이 없어요";
}

/* ===========================
   Todo 아이템 DOM 생성
=========================== */

/**
 * Todo 객체를 받아 <li> 엘리먼트를 생성하여 반환한다.
 * @param {Object} todo - { id, text, isDone, date }
 * @returns {HTMLElement}
 */
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
  editBtn.addEventListener("click", () => startEdit(todo.id));

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
 * 날짜 표시, 필터링된 목록, 통계를 모두 갱신한다.
 */
function render() {
  // 날짜 영역 갱신
  updateDateDisplay();

  // 목록 초기화
  todoList.innerHTML = "";

  // 날짜 + 상태 필터 적용
  const filteredTodos = getFilteredTodos();

  // 빈 상태 처리
  if (filteredTodos.length === 0) {
    emptyState.style.display = "block";
    emptyMessage.textContent = getEmptyMessage();
  } else {
    emptyState.style.display = "none";
  }

  // 목록 렌더링
  filteredTodos.forEach((todo) => {
    todoList.appendChild(createTodoElement(todo));
  });

  // 통계 갱신 (현재 날짜 기준)
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

// 날짜 이전 / 다음 버튼
prevDateBtn.addEventListener("click", goToPrevDate);
nextDateBtn.addEventListener("click", goToNextDate);

/* ===========================
   초기화
=========================== */

// 페이지 로드 시 로컬스토리지에서 데이터 복원 후 렌더링
loadFromStorage();
render();
