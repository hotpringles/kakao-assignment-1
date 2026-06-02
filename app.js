/* ===========================
   상태(State) 관리
=========================== */

// Todo 항목 배열 (각 항목: { id, text, isDone })
let todos = [];

// 각 Todo를 고유하게 식별하기 위한 ID 카운터
let nextId = 1;

// 현재 선택된 필터 ('all' | 'active' | 'done')
let currentFilter = "all";

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

/* ===========================
   Todo 추가
=========================== */

/**
 * 입력창의 텍스트로 새 Todo를 생성하고 목록에 추가한다.
 * 빈 값이면 에러 메시지를 표시하고 중단한다.
 */
function addTodo() {
  const text = todoInput.value.trim();

  // 빈 입력값 유효성 검사
  if (!text) {
    showError("할 일을 입력해주세요.");
    todoInput.classList.add("is-error");
    todoInput.focus();
    return;
  }

  // 유효성 통과 → 에러 상태 초기화
  clearError();

  // 새 Todo 객체 생성
  const newTodo = {
    id: nextId++,
    text,
    isDone: false,
  };

  todos.push(newTodo);
  todoInput.value = "";

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
  render();
}

/* ===========================
   Todo 수정 (인라인 편집)
=========================== */

/**
 * 해당 아이템을 수정 모드로 전환한다.
 * 텍스트 span을 input으로 교체하고 포커스를 준다.
 * @param {number} id - 수정할 Todo의 ID
 */
function startEdit(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const listItem = document.querySelector(`[data-id="${id}"]`);
  if (!listItem) return;

  // 수정 모드 CSS 클래스 적용
  listItem.classList.add("is-editing");

  // 텍스트 span → input으로 교체
  const textSpan = listItem.querySelector(".todo-text");
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "todo-edit-input";
  editInput.value = todo.text;
  editInput.maxLength = 100;
  textSpan.replaceWith(editInput);
  editInput.focus();

  // 수정 버튼 → 확인 버튼으로 교체
  const editBtn = listItem.querySelector(".edit-btn");
  editBtn.textContent = "✓";
  editBtn.title = "수정 완료";
  editBtn.onclick = () => confirmEdit(id);

  // Enter 키로도 수정 완료 가능
  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") confirmEdit(id);
    if (e.key === "Escape") render(); // ESC로 취소
  });
}

/**
 * 수정 모드를 종료하고 변경된 텍스트를 저장한다.
 * 빈 값이면 수정을 취소하고 원래 텍스트를 유지한다.
 * @param {number} id - 수정 완료할 Todo의 ID
 */
function confirmEdit(id) {
  const listItem = document.querySelector(`[data-id="${id}"]`);
  if (!listItem) return;

  const editInput = listItem.querySelector(".todo-edit-input");
  const newText = editInput ? editInput.value.trim() : "";

  // 빈 값이면 수정 취소
  if (!newText) {
    render();
    return;
  }

  // 배열 내 해당 Todo 텍스트 갱신
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, text: newText } : todo,
  );
  render();
}

/* ===========================
   필터링
=========================== */

/**
 * 현재 필터 기준으로 todos 배열을 필터링하여 반환한다.
 * @returns {Array} 필터링된 Todo 배열
 */
function getFilteredTodos() {
  if (currentFilter === "active") {
    // 진행 중: 완료되지 않은 항목만
    return todos.filter((todo) => !todo.isDone);
  }
  if (currentFilter === "done") {
    // 완료: 완료된 항목만
    return todos.filter((todo) => todo.isDone);
  }
  // 전체: 모든 항목
  return todos;
}

/**
 * 필터 탭을 클릭했을 때 currentFilter를 변경하고 탭 스타일을 갱신한다.
 * @param {string} filter - 선택된 필터 값 ('all' | 'active' | 'done')
 */
function setFilter(filter) {
  currentFilter = filter;

  // 모든 탭에서 is-active 제거 후 선택된 탭에만 적용
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

/**
 * 에러 메시지를 표시한다.
 * @param {string} message - 표시할 에러 메시지
 */
function showError(message) {
  errorMessage.textContent = message;
}

/**
 * 에러 메시지와 입력창 에러 상태를 초기화한다.
 */
function clearError() {
  errorMessage.textContent = "";
  todoInput.classList.remove("is-error");
}

/* ===========================
   통계 업데이트
=========================== */

/**
 * 전체 / 완료 / 남은 할 일 수를 계산하여 UI에 반영한다.
 * 통계는 필터와 무관하게 todos 전체 기준으로 계산한다.
 */
function updateStats() {
  const total = todos.length;
  const done = todos.filter((t) => t.isDone).length;
  const remain = total - done;

  totalCount.innerHTML = `전체 <strong>${total}</strong>`;
  doneCount.innerHTML = `완료 <strong>${done}</strong>`;
  remainCount.innerHTML = `남은 일 <strong>${remain}</strong>`;
}

/* ===========================
   빈 상태 메시지 처리
=========================== */

/**
 * 현재 필터에 맞는 빈 상태 메시지를 반환한다.
 * @returns {string} 빈 상태 안내 메시지
 */
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
 * @param {Object} todo - { id, text, isDone }
 * @returns {HTMLElement} 생성된 <li> 엘리먼트
 */
function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = `todo-item${todo.isDone ? " is-done" : ""}`;
  li.setAttribute("data-id", todo.id);
  li.setAttribute("role", "listitem");

  // 완료 체크박스
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = todo.isDone;
  checkbox.setAttribute("aria-label", "완료 처리");
  checkbox.addEventListener("change", () => toggleDone(todo.id));

  // 텍스트 영역 래퍼
  const textWrapper = document.createElement("div");
  textWrapper.className = "todo-text-wrapper";

  // 텍스트 span
  const textSpan = document.createElement("span");
  textSpan.className = "todo-text";
  textSpan.textContent = todo.text;
  textWrapper.appendChild(textSpan);

  // 액션 버튼 영역
  const actions = document.createElement("div");
  actions.className = "todo-actions";

  // 수정 버튼
  const editBtn = document.createElement("button");
  editBtn.className = "action-btn edit-btn";
  editBtn.textContent = "✎";
  editBtn.title = "수정";
  editBtn.setAttribute("aria-label", "수정");
  editBtn.addEventListener("click", () => startEdit(todo.id));

  // 삭제 버튼
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
 * 현재 필터를 적용한 todos를 기반으로 화면 전체를 다시 그린다.
 */
function render() {
  // 목록 초기화
  todoList.innerHTML = "";

  // 현재 필터 기준으로 표시할 항목 추출
  const filteredTodos = getFilteredTodos();

  // 빈 상태 표시 여부 (필터 기준으로 판단)
  if (filteredTodos.length === 0) {
    emptyState.style.display = "block";
    emptyMessage.textContent = getEmptyMessage();
  } else {
    emptyState.style.display = "none";
  }

  // 필터링된 Todo 아이템 렌더링
  filteredTodos.forEach((todo) => {
    const todoEl = createTodoElement(todo);
    todoList.appendChild(todoEl);
  });

  // 통계는 전체 todos 기준으로 갱신
  updateStats();
}

/* ===========================
   이벤트 바인딩
=========================== */

// 추가 버튼 클릭
addBtn.addEventListener("click", addTodo);

// Enter 키로 추가
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

// 입력 중 에러 상태 해제
todoInput.addEventListener("input", () => {
  if (todoInput.value.trim()) clearError();
});

// 필터 탭 클릭
filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => setFilter(tab.dataset.filter));
});

/* ===========================
   초기화
=========================== */

// 페이지 로드 시 초기 렌더링
render();
