// Credenciales de ejemplo (en producción usar backend)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Estado de la aplicación
let currentUser = null;
let isAuthenticated = false;

// Elementos DOM
const loginContainer = document.getElementById('loginContainer');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const adminUsername = document.getElementById('adminUsername');
const newEditorialBtn = document.getElementById('newEditorialBtn');
const editorialModal = document.getElementById('editorialModal');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');
const editorialForm = document.getElementById('editorialForm');
const navButtons = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si ya hay sesión activa
    checkExistingSession();
    
    // Configurar eventos
    setupEventListeners();
    
    // Establecer fecha actual en el formulario
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('editorialDate').value = today;
});

// Verificar sesión existente
function checkExistingSession() {
    const savedUser = localStorage.getItem('adminUser');
    const savedToken = localStorage.getItem('adminToken');
    
    if (savedUser && savedToken) {
        // En producción, aquí verificarías el token con el backend
        currentUser = savedUser;
        isAuthenticated = true;
        showAdminPanel();
    }
}

// Configurar todos los event listeners
function setupEventListeners() {
    // Login
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navegación entre secciones
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;
            showSection(sectionId);
            
            // Actualizar botones activos
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Modal de editorial
    newEditorialBtn.addEventListener('click', () => {
        editorialModal.style.display = 'flex';
    });
    
    closeModal.addEventListener('click', closeEditorialModal);
    cancelModal.addEventListener('click', closeEditorialModal);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === editorialModal) {
            closeEditorialModal();
        }
    });
    
    // Enviar formulario de editorial
    editorialForm.addEventListener('submit', handleNewEditorial);
}

// Manejar login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Validación simple (en producción usar backend)
    if (username === ADMIN_CREDENTIALS.username && 
        password === ADMIN_CREDENTIALS.password) {
        
        // Simular autenticación exitosa
        currentUser = username;
        isAuthenticated = true;
        
        // Guardar en localStorage (en producción usar tokens JWT)
        localStorage.setItem('adminUser', username);
        localStorage.setItem('adminToken', 'simulated-token-' + Date.now());
        
        showAdminPanel();
        showMessage('¡Inicio de sesión exitoso!', 'success');
        
        // Limpiar formulario
        loginForm.reset();
    } else {
        showMessage('Usuario o contraseña incorrectos', 'error');
    }
}

// Manejar logout
function handleLogout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Limpiar datos de sesión
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
        
        currentUser = null;
        isAuthenticated = false;
        
        // Mostrar login
        loginContainer.style.display = 'flex';
        adminPanel.style.display = 'none';
        
        showMessage('Sesión cerrada correctamente', 'success');
    }
}

// Mostrar panel de administración
function showAdminPanel() {
    adminUsername.textContent = currentUser;
    loginContainer.style.display = 'none';
    adminPanel.style.display = 'block';
    
    // Mostrar primera sección por defecto
    showSection('editoriales');
}

// Mostrar sección específica
function showSection(sectionId) {
    // Ocultar todas las secciones
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Cerrar modal de editorial
function closeEditorialModal() {
    editorialModal.style.display = 'none';
    editorialForm.reset();
    
    // Restaurar fecha actual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('editorialDate').value = today;
}

// Manejar nuevo editorial
function handleNewEditorial(e) {
    e.preventDefault();
    
    const title = document.getElementById('editorialTitle').value;
    const category = document.getElementById('editorialCategory').value;
    const content = document.getElementById('editorialContent').value;
    const date = document.getElementById('editorialDate').value;
    
    // Formatear fecha
    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Crear nuevo elemento de editorial
    const editorialItem = document.createElement('div');
    editorialItem.className = 'editorial-item';
    editorialItem.innerHTML = `
        <h3>${title}</h3>
        <div class="editorial-meta">
            <span class="category">${category}</span>
            <span class="date">${formattedDate}</span>
        </div>
        <div class="editorial-actions">
            <button class="btn btn-small btn-edit">✏️ Editar</button>
            <button class="btn btn-small btn-delete">🗑️ Borrar</button>
        </div>
    `;
    
    // Agregar al inicio de la lista
    const editorialsList = document.querySelector('.editorials-list');
    editorialsList.insertBefore(editorialItem, editorialsList.firstChild);
    
    // Agregar eventos a los botones
    addEditorialEvents(editorialItem);
    
    // Cerrar modal y mostrar mensaje
    closeEditorialModal();
    showMessage('¡Editorial creado exitosamente!', 'success');
    
    // Simular guardado en backend
    saveEditorialToBackend({ title, category, content, date });
}

// Agregar eventos a los botones de editorial
function addEditorialEvents(editorialElement) {
    const editBtn = editorialElement.querySelector('.btn-edit');
    const deleteBtn = editorialElement.querySelector('.btn-delete');
    
    editBtn.addEventListener('click', () => {
        alert('Funcionalidad de edición en desarrollo...');
    });
    
    deleteBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de eliminar este editorial?')) {
            editorialElement.remove();
            showMessage('Editorial eliminado', 'success');
        }
    });
}

// Simular guardado en backend
function saveEditorialToBackend(data) {
    console.log('Guardando editorial en backend:', data);
    // Aquí iría la llamada real al backend
    // fetch('/api/editoriales', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data)
    // });
}

// Mostrar mensajes
function showMessage(text, type) {
    // Limpiar mensajes anteriores
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    
    // Agregar al contenedor apropiado
    if (isAuthenticated) {
        document.querySelector('.admin-content').prepend(messageDiv);
    } else {
        loginForm.parentNode.appendChild(messageDiv);
    }
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Agregar eventos a los editoriales existentes
document.querySelectorAll('.editorial-item').forEach(addEditorialEvents);

// Agregar funcionalidad a los botones de la tabla
document.querySelectorAll('.data-table .btn-small').forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.textContent.trim();
        const row = this.closest('tr');
        
        if (action === 'Eliminar' || this.classList.contains('btn-delete')) {
            if (confirm('¿Estás seguro de realizar esta acción?')) {
                row.remove();
                showMessage('Registro eliminado', 'success');
            }
        } else if (action === 'Enviar Email') {
            alert('Funcionalidad de envío de email en desarrollo...');
        } else {
            alert(`Acción: ${action} - En desarrollo...`);
        }
    });
});

// Manejar comentarios
document.querySelectorAll('.comment-actions .btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const comment = this.closest('.comment-item');
        
        if (this.classList.contains('btn-success')) {
            comment.style.opacity = '0.5';
            setTimeout(() => comment.remove(), 300);
            showMessage('Comentario aprobado', 'success');
        } else if (this.classList.contains('btn-delete')) {
            comment.style.opacity = '0.5';
            setTimeout(() => comment.remove(), 300);
            showMessage('Comentario rechazado', 'success');
        }
    });
});
