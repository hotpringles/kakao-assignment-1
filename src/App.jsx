import { useState } from "react";
import useTodos from "./hooks/useTodos";
import useDateNavigation from "./hooks/useDateNavigation";
import TodoItem from "./components/TodoItem";
import WeeklyView from "./components/WeeklyView";
import { formatDateDisplay, isToday } from "./utils/date";

function App() {
  const [inputText, setInputText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");

  const {
    currentDate,
    selectDate,
    goToPrevDate,
    goToNextDate,
    weekDays,
    goToPrevWeek,
    goToNextWeek,
  } = useDateNavigation();

  const { todos, todayTodos, addTodo, toggleDone, deleteTodo, editTodo } =
    useTodos(currentDate, currentFilter);

  return (
    <div className="w-full max-w-[500px] mx-auto">
      <header className="mb-4">
        <h1 className="text-[28px] font-bold text-primary tracking-[-0.5px]">
          Todo
        </h1>
        <p className="mt-1 text-[15px] text-muted">오늘 할 일을 정리해보세요</p>
      </header>

      <WeeklyView
        weekDays={weekDays}
        todos={todos}
        currentFilter={currentFilter}
        currentDate={currentDate}
        onSelectDate={selectDate}
        onPrevWeek={goToPrevWeek}
        onNextWeek={goToNextWeek}
      />

      <section className="mb-2">
        <div className="flex gap-2.5 items-center">
          <input
            id="todoInput"
            className="flex-1 h-12 px-4 border-[1.5px] border-border rounded-xl bg-surface text-[15px] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(103,43,224,0.12)] placeholder:text-muted transition-all duration-[0.18s]"
            placeholder="새로운 할 일을 입력하세요"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setErrorMessage("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const error = addTodo(inputText);
                if (error) {
                  setErrorMessage(error);
                } else {
                  setInputText("");
                  setErrorMessage("");
                }
              }
            }}
          />
          <button
            className="w-12 h-12 rounded-xl bg-primary text-white text-2xl cursor-pointer flex items-center justify-center shrink-0 hover:bg-primary-dark active:scale-95 transition-all duration-[0.18s]"
            onClick={() => {
              const error = addTodo(inputText);
              if (error) {
                setErrorMessage(error);
              } else {
                setInputText("");
                setErrorMessage("");
              }
            }}
          >
            +
          </button>
        </div>
        {errorMessage && (
          <p className="mt-2 text-[13px] text-error">{errorMessage}</p>
        )}
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
          {todayTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleDone}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
