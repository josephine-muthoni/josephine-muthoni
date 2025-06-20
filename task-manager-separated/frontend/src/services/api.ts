import axios from 'axios';
import { Task, ApiResponse, CreateTaskRequest, UpdateTaskRequest } from '../types/task';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - runs before every request
api.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - runs after every response
api.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.data || error.message);
        
        // Handle different error types
        if (error.response?.status === 404) {
            console.error('Resource not found');
        } else if (error.response?.status === 500) {
            console.error('Server error');
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timeout');
        }
        
        return Promise.reject(error);
    }
);

// API service class
export class TaskService {
    
    // Get all tasks
    static async getAllTasks(): Promise<Task[]> {
        try {
            const response = await api.get<ApiResponse<Task[]>>('/tasks');
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw new Error('Failed to fetch tasks');
        }
    }
    
    // Get single task
    static async getTaskById(id: number): Promise<Task> {
        try {
            const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
            if (!response.data.data) {
                throw new Error('Task not found');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error fetching task:', error);
            throw new Error('Failed to fetch task');
        }
    }
    
    // Create new task
    static async createTask(taskData: CreateTaskRequest): Promise<Task> {
        try {
            const response = await api.post<ApiResponse<Task>>('/tasks', taskData);
            if (!response.data.data) {
                throw new Error('Failed to create task');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error creating task:', error);
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Failed to create task');
        }
    }
    
    // Update task
    static async updateTask(id: number, updates: UpdateTaskRequest): Promise<Task> {
        try {
            const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, updates);
            if (!response.data.data) {
                throw new Error('Failed to update task');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error updating task:', error);
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Failed to update task');
        }
    }
    
    // Delete task
    static async deleteTask(id: number): Promise<void> {
        try {
            await api.delete(`/tasks/${id}`);
        } catch (error) {
            console.error('Error deleting task:', error);
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Failed to delete task');
        }
    }
}