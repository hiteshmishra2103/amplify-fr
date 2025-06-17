import React, { useState, useEffect } from 'react';
import './App.css';

// Use the Lambda Function URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch todos from Lambda backend
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/todos`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      } else {
        throw new Error(`Failed to fetch todos: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to load todos. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      setError(null);
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTodo }),
      });

      if (response.ok) {
        const todo = await response.json();
        setTodos([todo, ...todos]);
        setNewTodo('');
      } else {
        throw new Error(`Failed to create todo: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Failed to add todo. Please try again.');
    }
  };

  const toggleTodo = async (id) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map(todo => 
          todo._id === id ? updatedTodo : todo
        ));
      } else {
        throw new Error(`Failed to update todo: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo. Please try again.');
    }
  };

  const deleteTodo = async (id) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTodos(todos.filter(todo => todo._id !== id));
      } else {
        throw new Error(`Failed to delete todo: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo. Please try again.');
    }
  };

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      alert(`Backend Status: ${data.message}\nDatabase: ${data.database.connection}\nTotal Todos: ${data.database.totalTodos}`);
    } catch (error) {
      alert('Backend health check failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <h1>Simple Todo App</h1>
        <p>Loading todos...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Simple Todo App</h1>
      <p className="backend-info">
        Backend: AWS Lambda Function
        <button onClick={checkBackendHealth} className="health-btn">
          Check Backend Health
        </button>
      </p>
      
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
      
      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter a new todo..."
          className="todo-input"
        />
        <button type="submit" className="add-btn">Add Todo</button>
      </form>

      <div className="todos-list">
        {todos.length === 0 ? (
          <p>No todos yet. Add one above!</p>
        ) : (
          todos.map(todo => (
            <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <span 
                onClick={() => toggleTodo(todo._id)}
                className="todo-text"
                title="Click to toggle completion"
              >
                {todo.text}
              </span>
              <div className="todo-actions">
                <span className="todo-status">
                  {todo.completed ? '✅' : '⭕'}
                </span>
                <button 
                  onClick={() => deleteTodo(todo._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="stats">
        <p>Total: {todos.length} | Completed: {todos.filter(t => t.completed).length} | Pending: {todos.filter(t => !t.completed).length}</p>
      </div>
    </div>
  );
}

export default App;