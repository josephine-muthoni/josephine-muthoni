import { useState, useEffect, useCallback } from 'react';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import { TaskService } from '../services/api';

interface UseTasksReturn {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    createTask: (taskData: CreateTaskRequest) => Promise<void>;
    updateTask: (id: number, updates: UpdateTaskRequest) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
    refetchTasks: () => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Fetch tasks function
    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedTasks = await TaskService.getAllTasks();
            setTasks(fetchedTasks);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Create task
    const createTask = useCallback(async (taskData: CreateTaskRequest) => {
        try {
            setError(null);
            const newTask = await TaskService.createTask(taskData);
            setTasks(prevTasks => [newTask, ...prevTasks]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);
    
    // Update task
    const updateTask = useCallback(async (id: number, updates: UpdateTaskRequest) => {
        try {
            setError(null);
            const updatedTask = await TaskService.updateTask(id, updates);
            setTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === id ? updatedTask : task
                )
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);
    
    // Delete task
    const deleteTask = useCallback(async (id: number) => {
        try {
            setError(null);
            await TaskService.deleteTask(id);
            setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);
    
    // Refetch tasks (for manual refresh)
    const refetchTasks = useCallback(async () => {
        await fetchTasks();
    }, [fetchTasks]);
    
    // Fetch tasks on component mount
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);
    
    return {
        tasks,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        refetchTasks,
    };
};