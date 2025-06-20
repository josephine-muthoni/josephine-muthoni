import React, { useState } from 'react';
import { Task } from '../types/task';

interface TaskItemProps {
    task: Task;
    onUpdate: (id: number, updates: { completed?: boolean; title?: string }) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setIsUpdating(true);
            await onUpdate(task.id, { completed: e.target.checked });
        } catch (error) {
            console.error('Failed to update task:', error);
            // Revert checkbox state on error
            e.target.checked = !e.target.checked;
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedTitle = editTitle.trim();
        
        if (!trimmedTitle) {
            setEditTitle(task.title); // Reset to original
            setIsEditing(false);
            return;
        }
        
        if (trimmedTitle === task.title) {
            setIsEditing(false);
            return;
        }
        
        try {
            setIsUpdating(true);
            await onUpdate(task.id, { title: trimmedTitle });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update task:', error);
            setEditTitle(task.title); // Reset to original
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleEditCancel = () => {
        setEditTitle(task.title);
        setIsEditing(false);
    };
    
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                setIsDeleting(true);
                await onDelete(task.id);
            } catch (error) {
                console.error('Failed to delete task:', error);
                setIsDeleting(false);
            }
        }
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    return (
        <div className={`task-item ${task.completed ? 'completed' : ''} ${isUpdating ? 'updating' : ''}`}>
            <div className="task-content">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={handleCheckboxChange}
                    disabled={isUpdating || isDeleting}
                    className="task-checkbox"
                />
                
                {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="edit-form">
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="edit-input"
                            disabled={isUpdating}
                            autoFocus
                            maxLength={200}
                        />
                        <div className="edit-buttons">
                            <button
                                type="submit"
                                disabled={isUpdating || !editTitle.trim()}
                                className="save-button"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={handleEditCancel}
                                disabled={isUpdating}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="task-info">
                        <span
                            className="task-title"
                            onDoubleClick={() => setIsEditing(true)}
                            title="Double-click to edit"
                        >
                            {task.title}
                        </span>
                        <span className="task-date">
                            Created: {formatDate(task.createdAt)}
                        </span>
                    </div>
                )}
            </div>
            
            <div className="task-actions">
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        disabled={isUpdating || isDeleting}
                        className="edit-button"
                    >
                        Edit
                    </button>
                )}
                
                <button
                    onClick={handleDelete}
                    disabled={isUpdating || isDeleting}
                    className="delete-button"
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    );
};