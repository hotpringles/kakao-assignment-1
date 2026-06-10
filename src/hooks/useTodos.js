import { useState, useEffect } from "react";
import { formatDateKey } from "../utils/date";

function useTodos(currentDate, currentFilter) {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });
  const [nextId, setNextId] = useState(() => {
    const saved = localStorage.getItem("nextId");
    return saved ? JSON.parse(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
    localStorage.setItem("nextId", JSON.stringify(nextId));
  }, [todos, nextId]);

  const addTodo = (text) => {
    if (!text.trim()) return "할 일을 적어주세요.";
    const dateKey = formatDateKey(currentDate);
    const isDuplicate = todos.some(
      (todo) => todo.date === dateKey && todo.text === text.trim(),
    );
    if (isDuplicate) return "이미 할 일이 존재합니다.";
    setNextId((prev) => prev + 1);
    setTodos((prev) => [
      ...prev,
      { id: nextId, text: text.trim(), isDone: false, date: dateKey },
    ]);
  };

  const toggleDone = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo,
      ),
    );
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const editTodo = (id, newText) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo)),
    );
  };

  const todayTodos = todos
    .filter((todo) => todo.date === formatDateKey(currentDate))
    .filter((todo) => {
      if (currentFilter === "active") return !todo.isDone;
      if (currentFilter === "done") return todo.isDone;
      return true;
    });

  return { todos, todayTodos, addTodo, toggleDone, deleteTodo, editTodo };
}

export default useTodos;
