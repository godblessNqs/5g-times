let token = localStorage.getItem('token') || '';
let currentCategory = localStorage.getItem('currentCategory') || 'home'; // Текущая категория

function showRegisterForm() {
    document.getElementById('register-modal').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('login-modal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                loginUser(username, password); // Логинимся после регистрации
                closeModal('register-modal');
            } else {
                alert(data.error);
            }
        });
}

function loginUser(username, password) {
    fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                token = data.token;
                localStorage.setItem('token', token);
                alert('Logged in successfully');
                showLogoutButton();
                closeModal('login-modal');
                toggleCommentForm(true);
                loadNews(currentCategory); // Загружаем текущую категорию новостей
            } else {
                alert(data.error);
            }
        });
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    loginUser(username, password);
}

function showLogoutButton() {
    document.getElementById('auth-buttons').style.display = 'none';
    document.getElementById('logout-button').style.display = 'block';
}

function logout() {
    token = '';
    localStorage.removeItem('token');
    document.getElementById('auth-buttons').style.display = 'flex';
    document.getElementById('logout-button').style.display = 'none';
    toggleCommentForm(false);
    alert('Logged out successfully');
    loadNews('home'); // После выхода возвращаемся на "Home"
}

function toggleCommentForm(isLoggedIn) {
    const commentForms = document.querySelectorAll('.comments-section');
    commentForms.forEach(form => {
        form.style.display = isLoggedIn ? 'block' : 'none';
    });
}

function loadNews(category = 'home') {
    const container = document.getElementById('news-container');
    container.innerHTML = '<p>Loading...</p>';

    currentCategory = category; // Сохраняем текущую категорию
    localStorage.setItem('currentCategory', category);

    const endpoint = category === 'home' ? 'all' : category;

    fetch(`http://localhost:3000/api/news/${endpoint}`, {
        headers: {
            ...(token ? { 'Authorization': token } : {})
        }
    })
        .then(response => response.json())
        .then(news => {
            container.innerHTML = ''; // Очищаем контейнер

            if (news.length > 0) {
                news.forEach(item => {
                    const newsDiv = document.createElement('div');
                    newsDiv.classList.add('news-item');
                    newsDiv.innerHTML = `
                        <img src="${item.image}" alt="News Image">
                        <h2>${item.title}</h2>
                        <p>${item.content}</p>
                        <p><strong>Category:</strong> ${item.category}</p>
                        <div class="comments-section" id="comments-${item._id}">
                            <h3>Comments:</h3>
                            <div class="comments-list" id="comments-list-${item._id}">
                                <!-- Комментарии загружаются сюда -->
                            </div>
                            ${token ? `
                            <textarea id="comment-input-${item._id}" placeholder="Write a comment..."></textarea>
                            <button onclick="addComment('${item._id}')">Add Comment</button>
                            ` : '<p>Login to add comments</p>'}
                        </div>
                    `;
                    container.appendChild(newsDiv);
                    loadComments(item._id); // Загрузка комментариев для каждой новости
                });
            } else {
                container.innerHTML = '<p>No news available for this category.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading news:', error);
            container.innerHTML = '<p>Error loading news. Please try again later.</p>';
        });
}

function loadComments(newsId) {
    fetch(`http://localhost:3000/api/comments/${newsId}`)
        .then(response => response.json())
        .then(comments => {
            const container = document.getElementById(`comments-list-${newsId}`);
            container.innerHTML = '';
            comments.forEach(comment => {
                const div = document.createElement('div');
                div.classList.add('comment');
                div.innerHTML = `<strong>${comment.userId.username}</strong>: ${comment.content}`;
                container.appendChild(div);
            });
        });
}

function addComment(newsId) {
    const content = document.getElementById(`comment-input-${newsId}`).value;
    if (!content.trim()) return alert("Комментарий не может быть пустым");

    fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({ newsId, content })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                loadComments(newsId); // Обновляем комментарии после добавления
                document.getElementById(`comment-input-${newsId}`).value = '';
            } else {
                alert(data.error);
            }
        });
}

document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showLogoutButton();
        toggleCommentForm(true);
    } else {
        toggleCommentForm(false);
    }
    loadNews(currentCategory); // Загружаем сохраненную категорию
});


