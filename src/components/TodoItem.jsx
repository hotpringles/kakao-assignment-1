import { useState } from "react";

function TodoItem() {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  function confirmEdit(id) {
    if (!editText.trim()) {
      setEditingId(null);
      return;
    }
    editTodo(id, editText.trim());
    setEditingId(null);
  }
}

export default TodoItem;
