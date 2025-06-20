import React from 'react';
import { Task } from '../types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    onUpdateTask: (id: number, updates: { completed?: boolean; title?: string }) => Promise<void>;
    onDeleteTask: (id: number) => Promise<void>;
    onRefresh: () => Promise<void>;
}

export const TaskList: React.FC<TaskListProps> = ({
    tasks,
    loading,
    error,
    onUpdateTask,
    onDeleteTask,
    onRefresh
}) => {
    const completedTasks = tasks.filter(task => task.completed);
    const incompleteTasks = tasks.filter(task => !task.completed);
    
    if (loading) {
        return (
            <div className="task-list-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading tasks...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="task-list-container">
                <div className="error-container">
                    <h3>Error Loading Tasks</h3>
                    <p>{error}</p>
                    <button onClick={onRefresh} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="task-list-container">
            <div className="task-list-header">
                <h2>Your Tasks</h2>
                <div className="task-stats">
                    <span>Total: {tasks.length}</span>
                    <span>Completed: {completedTasks.length}</span>
                    <span>Remaining: {incompleteTasks.length}</span>
                </div>
                <button onClick={onRefresh} className="refresh-button">
                    Refresh
                </button>
            </div>
            
            {tasks.length === 0 ? (
                <div className="no-tasks">
                    <h3>No tasks yet!</h3>
                    <p>Add your first task above to get started.</p>
                </div>
            ) : (
                <div className="task-sections">
                    {incompleteTasks.length > 0 && (
                        <div className="task-section">
                            <h3>Incomplete Tasks ({incompleteTasks.length})</h3>
                            <div className="task-list">
                                {incompleteTasks.map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onUpdate={onUpdateTask}
                                        onDelete={onDeleteTask}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {completedTasks.length > 0 && (
                        <div className="task-section">
                            <h3>Completed Tasks ({completedTasks.length})</h3>
                            <div className="task-list">
                                {completedTasks.map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onUpdate={onUpdateTask}
                                        onDelete={onDeleteTask}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};