document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const todoInput = document.getElementById('todoInput');
    const addTodoBtn = document.getElementById('addTodoBtn');
    const todoList = document.getElementById('todoList');
    const todoListContainer = document.getElementById('todoListContainer');
    const totalCount = document.getElementById('totalCount');
    const completedCount = document.getElementById('completedCount');
    const appBackground = document.getElementById('appBackground');
    const bgOptions = document.querySelectorAll('.bg-option');
    const randomBgBtn = document.getElementById('randomBgBtn');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const deleteDataBtn = document.getElementById('deleteDataBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');
    const deleteModal = document.getElementById('deleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // Sample backgrounds
    const backgrounds = [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600',
        'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1600',
        'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=1600',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600',
        'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1600',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600',
        'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1600'
    ];

    // Load todos from localStorage
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentBg = localStorage.getItem('currentBg') || backgrounds[0];

    // Set initial background
    appBackground.style.backgroundImage = `url('${currentBg}')`;

    // Mark the current background as selected
    bgOptions.forEach(option => {
        if (option.dataset.bg === currentBg) {
            option.classList.add('selected');
        }
    });

    // Render todos
    renderTodos();

    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tabId = this.dataset.tab;

            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}Tab`).classList.add('active');

            // Scroll to top when switching tabs
            document.querySelector('.main-content').scrollTo(0, 0);
        });
    });

    // Add todo event
    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addTodo();
    });

    // Background selection
    bgOptions.forEach(option => {
        option.addEventListener('click', function () {
            const bgUrl = this.dataset.bg;
            appBackground.style.backgroundImage = `url('${bgUrl}')`;
            currentBg = bgUrl;
            localStorage.setItem('currentBg', bgUrl);

            // Update selected state
            bgOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Random background button
    randomBgBtn.addEventListener('click', function () {
        const randomIndex = Math.floor(Math.random() * backgrounds.length);
        const randomBg = backgrounds[randomIndex];
        appBackground.style.backgroundImage = `url('${randomBg}')`;
        currentBg = randomBg;
        localStorage.setItem('currentBg', randomBg);

        // Update selected state
        bgOptions.forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.bg === randomBg) {
                opt.classList.add('selected');
            }
        });
    });

    // Enhanced Ripple Effect for all buttons
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add("ripple-effect");

        const ripple = button.getElementsByClassName("ripple-effect")[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    }

    // Add ripple effect to all buttons with ripple-container class
    const rippleButtons = document.querySelectorAll('.ripple-container');
    rippleButtons.forEach(button => {
        button.addEventListener('click', createRipple);
    });

    // Add todo function
    function addTodo() {
        const text = todoInput.value.trim();
        if (text) {
            const newTodo = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };

            todos.unshift(newTodo);
            saveTodos();
            renderTodos();
            todoInput.value = '';
            todoInput.focus();

            // Scroll to top to see the new todo
            todoListContainer.scrollTo(0, 0);
        }
    }

    // Render todos function
    function renderTodos() {
        if (todos.length === 0) {
            todoList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-clipboard-list text-4xl mb-3 opacity-30"></i>
                    <p>No tasks yet. Add one above!</p>
                </div>
            `;
        } else {
            todoList.innerHTML = todos.map(todo => `
                <div class="todo-item fade-in bg-white rounded-lg shadow p-4 flex items-center justify-between ${todo.completed ? 'opacity-70' : ''}">
                    <div class="flex items-center">
                        <input type="checkbox" ${todo.completed ? 'checked' : ''}
                                class="custom-checkbox h-5 w-5 text-blue-500 rounded focus:ring-blue-400 mr-3"
                                data-id="${todo.id}">
                        <span class="${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}">${todo.text}</span>
                    </div>
                    <button class="delete-btn ripple-container text-red-400 hover:text-red-600 transition" data-id="${todo.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');

            // Add event listeners to checkboxes and delete buttons
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', toggleTodo);
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', deleteTodo);
            });

            // Add ripple effect to delete buttons
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', createRipple);
            });
        }

        updateStats();
    }

    // Toggle todo completion
    function toggleTodo(e) {
        const id = parseInt(e.target.dataset.id);
        todos = todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        saveTodos();
        renderTodos();
    }

    // Delete todo
    function deleteTodo(e) {
        const id = parseInt(e.currentTarget.dataset.id);
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }

    // Save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Update stats
    function updateStats() {
        totalCount.textContent = todos.length;
        completedCount.textContent = todos.filter(todo => todo.completed).length;
    }

    // Delete all data
    deleteDataBtn.addEventListener('click', () => {
        deleteModal.style.display = 'flex';
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });

    confirmDeleteBtn.addEventListener('click', () => {
        todos = [];
        localStorage.removeItem('todos');
        localStorage.removeItem('currentBg');
        renderTodos();
        deleteModal.style.display = 'none';

        // Reset to default background
        currentBg = backgrounds[0];
        appBackground.style.backgroundImage = `url('${currentBg}')`;
        localStorage.setItem('currentBg', currentBg);

        // Update selected state
        bgOptions.forEach(opt => opt.classList.remove('selected'));
        bgOptions[0].classList.add('selected');
    });

    // Export data
    exportDataBtn.addEventListener('click', () => {
        const data = {
            todos: todos,
            background: currentBg
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todo-app-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success message
        alert('Data exported successfully!');
    });

    // Import data
    importDataBtn.addEventListener('click', () => {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (data.todos && Array.isArray(data.todos)) {
                    todos = data.todos;
                    saveTodos();

                    if (data.background) {
                        currentBg = data.background;
                        appBackground.style.backgroundImage = `url('${currentBg}')`;
                        localStorage.setItem('currentBg', currentBg);

                        // Update selected state
                        bgOptions.forEach(opt => {
                            opt.classList.remove('selected');
                            if (opt.dataset.bg === currentBg) {
                                opt.classList.add('selected');
                            }
                        });
                    }

                    renderTodos();
                    alert('Data imported successfully!');
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    });
});