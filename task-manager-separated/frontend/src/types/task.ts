export interface Task {
    id: number;
    title: string;
    completed: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    count?: number;
}

export interface CreateTaskRequest {
    title: string;
}

export interface UpdateTaskRequest {
    title?: string;
    completed?: boolean;
}