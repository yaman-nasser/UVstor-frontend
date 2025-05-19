// تأكد من وجود SweetAlert2 في الصفحة
// <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

const API_BASE_URL = 'https://localhost:7259/api';

const usersTableBody = document.getElementById('users-table-body');
const usersTable = document.getElementById('users-table');
const loadingSpinner = document.getElementById('loading');
const totalUsersSpan = document.getElementById('total-users');
const searchInput = document.getElementById('search-input');

let users = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAdminInfo();
    fetchUsers();
    searchInput.addEventListener('keyup', filterUsers);

    const sidebarToggle = document.createElement('button');
    sidebarToggle.innerHTML = '<i class="bi bi-list"></i>';
    document.body.appendChild(sidebarToggle);

    sidebarToggle.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');

        const usersContainer = document.querySelector('.users-container');
        usersContainer.style.marginRight = sidebar.classList.contains('collapsed') ? '70px' : '250px';
    });
});

// Fetch Users
async function fetchUsers() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/User/All`);
        if (!response.ok) throw new Error(`فشل في جلب بيانات المستخدمين: ${response.status}`);

        users = await response.json();
        totalUsersSpan.textContent = users.length;
        renderUsers(users);

    } catch (error) {
        console.error('Error fetching users:', error);
        showErrorMessage('حدث خطأ أثناء جلب بيانات المستخدمين. يرجى المحاولة مرة أخرى لاحقًا.');
        renderDummyUsers();
    } finally {
        showLoading(false);
    }
}

// Delete User
async function deleteUser(userId) {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/User/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) throw new Error(`فشل في حذف المستخدم: ${response.status}`);

        users = users.filter(user => user.id !== parseInt(userId));
        totalUsersSpan.textContent = users.length;
        renderUsers(users);

        Swal.fire('تم الحذف!', 'تم حذف المستخدم بنجاح.', 'success');

    } catch (error) {
        console.error('Error deleting user:', error);
        Swal.fire('خطأ', 'حدث خطأ أثناء حذف المستخدم. حاول مرة أخرى لاحقًا.', 'error');
    } finally {
        showLoading(false);
    }
}

// Render Users
function renderUsers(users) {
    usersTableBody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.major}</td>
            <td>${user.postCount}</td>
            <td>
                <button class="delete-btn btn btn-danger" data-id="${user.id}">🗑 حذف</button>
            </td>
        `;
        usersTableBody.appendChild(tr);
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
            const userId = this.getAttribute('data-id');

            Swal.fire({
                title: 'هل أنت متأكد؟',
                text: 'لن تتمكن من التراجع عن هذا الإجراء!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذفه!',
                cancelButtonText: 'إلغاء',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteUser(userId);
                }
            });
        });
    });
}

// Filter Users
function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm) return renderUsers(users);

    const filteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm)) ||
        (user.major && user.major.toLowerCase().includes(searchTerm)) ||
        (user.phone && user.phone.includes(searchTerm))
    );

    renderUsers(filteredUsers);
}

function showLoading(isLoading) {
    loadingSpinner.style.display = isLoading ? 'flex' : 'none';
    usersTable.style.display = isLoading ? 'none' : 'table';
}

function showSuccessMessage(message) {
    alert(message);
}

function showErrorMessage(message) {
    alert(message);
}

function getAuthToken() {
    return localStorage.getItem('authToken') || '';
}

function loadAdminInfo() {
    const adminEmail = localStorage.getItem('adminEmail') || 'admin@example.com';
    const adminUsername = localStorage.getItem('adminUsername') || 'المسؤول';
    document.getElementById('p-email').textContent = adminEmail;
    document.getElementById('p-username').textContent = adminUsername;
}

function togglesubmenu(button) {
    const submenu = button.nextElementSibling;
    const allSubmenus = document.querySelectorAll(".sub-menu");
    const allButtons = document.querySelectorAll(".dropdown_btn");

    allSubmenus.forEach(sm => sm.style.display = "none");
    allButtons.forEach(btn => btn.classList.remove("active"));

    if (submenu.style.display !== "block") {
        submenu.style.display = "block";
        button.classList.add("active");
    }
}

function renderDummyUsers() {
    const dummy = [
        { id: 1, name: 'تجريبي', email: 'dummy@example.com', phone: '0771234567', major: 'حاسوب', postCount: 0 }
    ];
    renderUsers(dummy);
}
