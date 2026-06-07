import { useState, useRef, useEffect } from "react";

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(date) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
}

function isToday(date) {
  return formatDateKey(date) === formatDateKey(new Date());
}

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState("");
  const [editingId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const savedNextId = localStorage.getItem("nextId");
  const nextId = useRef(savedNextId ? JSON.parse(savedNextId) : 1);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
    localStorage.setItem("nextId", JSON.stringify(nextId.current));
  }, [todos]);

  function addTodo(text) {
    if (!text.trim()) return;
    const newTodo = {
      id: nextId.current++,
      text: text.trim(),
      isDone: false,
      date: formatDateKey(currentDate),
    };
    setTodos((prev) => [...prev, newTodo]);
    setInputText("");
  }

  function toggleDone(id) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo,
      ),
    );
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  function editTodo(id, newText) {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo)),
    );
  }

  function confirmEdit(id) {
    if (!editText.trim()) {
      setEditId(null);
      return;
    }
    editTodo(id, editText.trim());
    setEditId(null);
  }

  const filteredTodos = todos
    .filter((todo) => todo.date === formatDateKey(currentDate))
    .filter((todo) => {
      if (currentFilter === "active") return !todo.isDone;
      if (currentFilter === "done") return todo.isDone;
      return true;
    });

  function goToPrevDate() {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  }

  function goToNextDate() {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  }

  return (
    <div className="w-full max-w-[560px]">
      <header className="mb-6">
        <h1 className="text-[28px] font-bold text-primary tracking-[-0.5px]">
          Todo
        </h1>
        <p className="mt-1 text-[15px] text-muted">오늘 할 일을 정리해보세요</p>
      </header>

      <section className="mb-2">
        <div className="flex gap-2.5 items-center">
          <input
            id="todoInput"
            className="flex-1 h-12 px-4 border-[1.5px] border-border rounded-xl bg-surface text-[15px] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(103,43,224,0.12)] placeholder:text-muted transition-all duration-[0.18s]"
            placeholder="새로운 할 일을 입력하세요"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo(inputText)}
          />
          <button
            className="w-12 h-12 rounded-xl bg-primary text-white text-2xl cursor-pointer flex items-center justify-center shrink-0 hover:bg-primary-dark active:scale-95 transition-all duration-[0.18s]"
            onClick={() => addTodo(inputText)}
          >
            +
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-1 mb-2">
          <button
            className="w-6 h-6 flex items-center justify-center text-[18px] text-muted rounded-lg hover:bg-[#e9e9e9] cursor-pointer transition-all duration-[0.18s]"
            onClick={goToPrevDate}
          >
            ‹
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-semibold text-[#1a1523] tracking-[-0.3px]">
              {formatDateDisplay(currentDate)}
            </span>
            {isToday(currentDate) && (
              <span className="text-[11px] font-semibold px-1.5 py-px rounded-full bg-primary text-white">
                오늘
              </span>
            )}
          </div>
          <button
            className="w-6 h-6 flex items-center justify-center text-[18px] text-muted rounded-lg hover:bg-[#e9e9e9] cursor-pointer transition-all duration-[0.18s]"
            onClick={goToNextDate}
          >
            ›
          </button>
        </div>

        <nav className="flex gap-1 mb-4 bg-surface border-[1.5px] border-border rounded-xl p-1">
          {["all", "active", "done"].map((filter) => (
            <button
              key={filter}
              className={`flex-1 h-[38px] rounded-lg text-[15px] cursor-pointer transition-all duration-[0.18s] ${
                currentFilter === filter
                  ? "bg-primary text-white font-semibold"
                  : "bg-transparent text-muted hover:bg-primary-light hover:text-primary"
              }`}
              onClick={() => setCurrentFilter(filter)}
            >
              {filter === "all"
                ? "전체"
                : filter === "active"
                  ? "진행 중"
                  : "완료"}
            </button>
          ))}
        </nav>

        <ul className="flex flex-col gap-2.5 list-none">
          {filteredTodos.map((todo) => (
            <li
              key={todo.id}
              className={`group flex items-center gap-3 px-4 py-[14px] border-[1.5px] rounded-[18px] shadow-[0_2px_12px_rgba(103,43,224,0.07)] animate-slide-in transition-all duration-[0.18s] ${
                todo.isDone
                  ? "bg-done-bg border-border hover:border-border"
                  : "bg-surface border-border hover:border-primary hover:-translate-y-px"
              }`}
            >
              <input
                type="checkbox"
                className="todo-checkbox w-5 h-5 rounded-full cursor-pointer shrink-0 border-2 border-border checked:bg-primary checked:border-primary transition-all duration-[0.18s]"
                checked={todo.isDone}
                onChange={() => toggleDone(todo.id)}
              />
              <div className="flex-1 min-w-0">
                {editingId === todo.id ? (
                  <input
                    className="w-full border-b-[1.5px] border-primary bg-transparent text-[15px] text-[#1a1523] outline-none py-0.5"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmEdit(todo.id);
                      if (e.key === "Escape") setEditId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    className={`text-[15px] leading-relaxed break-all transition-all duration-[0.18s] ${
                      todo.isDone
                        ? "line-through text-done-text"
                        : "text-[#1a1523]"
                    }`}
                  >
                    {todo.text}
                  </span>
                )}
              </div>
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[0.18s]">
                <button
                  className="w-8 h-8 rounded-lg bg-transparent cursor-pointer text-[15px] flex items-center justify-center text-muted hover:bg-primary-light hover:text-primary transition-all duration-[0.18s]"
                  onClick={
                    editingId === todo.id
                      ? () => confirmEdit(todo.id)
                      : () => {
                          setEditId(todo.id);
                          setEditText(todo.text);
                        }
                  }
                >
                  {editingId === todo.id ? "✓" : "✎"}
                </button>
                <button
                  className="w-8 h-8 rounded-lg bg-transparent cursor-pointer text-[15px] flex items-center justify-center text-muted hover:bg-[#fde8e8] hover:text-error transition-all duration-[0.18s]"
                  onClick={() => deleteTodo(todo.id)}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
