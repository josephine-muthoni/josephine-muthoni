// Same as monolithic version, but exported differently
let tasks = [
    { id: 1, title: 'Learn React', completed: false, createdAt: new Date() },
    { id: 2, title: 'Build REST API', completed: true, createdAt: new Date() },
    { id: 3, title: 'Connect Frontend to Backend', completed: false, createdAt: new Date() }
];

let nextId = 4;

class TaskService {
    static getAllTasks() {
        return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    static createTask(title) {
        const newTask = {
            id: nextId++,
            title: title.trim(),
            completed: false,
            createdAt: new Date()
        };
        
        tasks.push(newTask);
        return newTask;
    }
    
    static updateTask(id, updates) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex === -1) {
            return null;
        }
        
        tasks[taskIndex] = { 
            ...tasks[taskIndex], 
            ...updates,
            updatedAt: new Date()
        };
        
        return tasks[taskIndex];
    }
    
    static deleteTask(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex === -1) {
            return false;
        }
        
        tasks.splice(taskIndex, 1);
        return true;
    }
    
    static getTaskById(id) {
        return tasks.find(task => task.id === id);
    }
}

module.exports = TaskService;