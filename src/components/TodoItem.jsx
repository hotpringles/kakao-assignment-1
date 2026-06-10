import { useState } from "react";

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  function confirmEdit() {
    if (!editText.trim()) {
      setIsEditing(false);
      return;
    }
    onEdit(todo.id, editText.trim());
    setIsEditing(false);
  }

  return (
    <li
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
        onChange={() => onToggle(todo.id)}
      />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            className="w-full border-b-[1.5px] border-primary bg-transparent text-[15px] text-[#1a1523] outline-none py-0.5"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmEdit();
              if (e.key === "Escape") setIsEditing(false);
            }}
            autoFocus
          />
        ) : (
          <span
            className={`text-[15px] leading-relaxed break-all transition-all duration-[0.18s] ${
              todo.isDone ? "line-through text-done-text" : "text-[#1a1523]"
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
            isEditing
              ? confirmEdit
              : () => {
                  setIsEditing(true);
                  setEditText(todo.text);
                }
          }
        >
          {isEditing ? "✓" : "✎"}
        </button>
        <button
          className="w-8 h-8 rounded-lg bg-transparent cursor-pointer text-[15px] flex items-center justify-center text-muted hover:bg-[#fde8e8] hover:text-error transition-all duration-[0.18s]"
          onClick={() => onDelete(todo.id)}
        >
          ✕
        </button>
      </div>
    </li>
  );
}

export default TodoItem;
