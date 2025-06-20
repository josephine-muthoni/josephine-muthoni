import React from 'react';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { useTasks } from './hooks/useTasks';
import './App.css';

function App() {
    const {
        tasks,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        refetchTasks
    } = useTasks();
    
    return (
        <div className="App">
            <header className="app-header">
                <h1>Task Manager</h1>
                <p>Manage your tasks efficiently</p>
            </header>
            
            <main className="app-main">
                <div className="container">
                    <TaskForm
                        onSubmit={createTask}
                        loading={loading}
                    />
                    
                    <TaskList
                        tasks={tasks}
                        loading={loading}
                        error={error}
                        onUpdateTask={updateTask}
                        onDeleteTask={deleteTask}
                        onRefresh={refetchTasks}
                    />
                </div>
            </main>
        </div>
    );
}

export default App;