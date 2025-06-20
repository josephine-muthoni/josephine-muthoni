import React, { useState } from 'react';
import { CreateTaskRequest } from '../types/task';

interface TaskFormProps {
    onSubmit: (taskData: CreateTaskRequest) => Promise<void>;
    loading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, loading = false }) => {
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const trimmedTitle = title.trim();
        
        if (!trimmedTitle) {
            setError('Task title is required');
            return;
        }
        
        if (trimmedTitle.length > 200) {
            setError('Task title must be less than 200 characters');
            return;
        }
        
        try {
            setIsSubmitting(true);
            setError(null);
            
            await onSubmit({ title: trimmedTitle });
            setTitle(''); // Clear form on success
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        if (error) setError(null); // Clear error when user starts typing
    };
    
    return (
        <div className="task-form-container">
            <h2>Add New Task</h2>
            
            <form onSubmit={handleSubmit} className="task-form">
                <div className="form-group">
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Enter task title..."
                        className={`task-input ${error ? 'error' : ''}`}
                        disabled={isSubmitting || loading}
                        maxLength={200}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || loading || !title.trim()}
                        className="submit-button"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Task'}
                    </button>
                </div>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <div className="form-info">
                    {title.length}/200 characters
                </div>
            </form>
        </div>
    );
};