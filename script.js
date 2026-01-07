// ===== SISTEMA DE AUTENTICACIÓN =====
const AUTH_CONFIG = {
    adminUser: 'admin',
    adminPass: 'admin123',
    sessionKey: 'ladoc_admin_session',
    sessionTimeout: 2 * 60 * 60 * 1000 // 2 horas en milisegundos
};

// ===== FUNCIONES DE AUTENTICACIÓN =====

// Inicializar sistema de autenticación
function initAuthSystem() {
    // Verificar si hay una sesión activa
    const session = getSession();
    
    if (session && isSessionValid(session)) {
        // Si estamos en la página de login, redirigir al panel
        if (window.location.pathname.includes('admin.html')) {
            showAdminPanel();
        }
    } else {
        // Si la sesión no es válida, limpiarla
        clearSession();
    }
}

// Obtener sesión actual
function getSession() {
    const sessionStr = localStorage.getItem(AUTH_CONFIG.sessionKey);
    return sessionStr ? JSON.parse(sessionStr) : null;
}

// Guardar sesión
function saveSession(username) {
    const session = {
        username: username,
        timestamp: new Date().getTime(),
        expires: new Date().getTime() + AUTH_CONFIG.sessionTimeout
    };
    localStorage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(session));
}

// Verificar si la sesión es válida
function isSessionValid(session) {
    if (!session || !session.timestamp) return false;
    const now = new Date().getTime();
    return now < session.expires;
}

// Limpiar sesión (logout)
function clearSession() {
    localStorage.removeItem(AUTH_CONFIG.sessionKey);
    
    // Si estamos en admin.html, mostrar login
    if (window.location.pathname.includes('admin.html')) {
        showLoginForm();
    }
}

// Verificar credenciales de login
function checkCredentials(username, password) {
    return username === AUTH_CONFIG.adminUser && 
           password === AUTH_CONFIG.adminPass;
}

// ===== FUNCIONALIDAD DEL PANEL DE ADMINISTRACIÓN =====

// Mostrar formulario de login
function showLoginForm() {
    const loginContainer = document.getElementById('loginContainer');
    const adminPanel = document.getElementById('adminPanel');
    
    if (loginContainer) loginContainer.style.display = 'flex';
    if (adminPanel) adminPanel.style.display = 'none';
}

// Mostrar panel de administración
function showAdminPanel() {
    const loginContainer = document.getElementById('loginContainer');
    const adminPanel = document.getElementById('adminPanel');
    const adminName = document.getElementById('adminName');
    const session = getSession();
    
    if (loginContainer) loginContainer.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'block';
    if (adminName && session) adminName.textContent = session.username;
}

// Manejar login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');
    
    if (checkCredentials(username, password)) {
        // Credenciales correctas
        saveSession(username);
        showAdminPanel();
        showMessage('loginMessage', '¡Inicio de sesión exitoso!', 'success');
    } else {
        // Credenciales incorrectas
        showMessage('loginMessage', 'Usuario o contraseña incorrectos', 'error');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
}

// Manejar logout
function handleLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        clearSession();
        window.location.href = 'index.html';
    }
}

// ===== FUNCIONALIDAD DE ARTÍCULOS =====

// Datos de ejemplo para artículos
let articles = [
    {
        id: 1,
        title: 'El futuro del trabajo en el Noroeste Argentino',
        category: 'Catamarca',
        excerpt: 'Un análisis profundo sobre las oportunidades laborales y los desafíos económicos que enfrenta la región del Noroeste Argentino...',
        content: `El Noroeste Argentino (NOA) enfrenta desafíos y oportunidades únicas en el panorama laboral actual. En esta región, caracterizada por su diversidad cultural y económica, el futuro del trabajo se está redefiniendo bajo la influencia de la tecnología, las políticas públicas y los cambios sociales.

<h2>Transformación Digital en el NOA</h2>
<p>La digitalización ha llegado para quedarse, incluso en las provincias más alejadas de los grandes centros urbanos.</p>

<h2>Sectores con Potencial de Crecimiento</h2>
<ul>
    <li><strong>Turismo sustentable:</strong> La riqueza cultural y natural del NOA representa una oportunidad única.</li>
    <li><strong>Agroindustria tecnificada:</strong> La aplicación de tecnología en la producción agrícola puede aumentar la competitividad.</li>
</ul>`,
        date: '2023-05-15',
        published: true,
        author: 'Redacción LADO C',
        views: 245
    },
    {
        id: 2,
        title: 'Juventud y participación política: más allá del voto',
        category: 'Sociedad',
        excerpt: 'Exploramos las distintas formas en que los jóvenes catamarqueños se involucran en la política local y nacional...',
        content: 'Contenido completo del artículo sobre participación política juvenil...',
        date: '2023-05-12',
        published: true,
        author: 'María Gómez',
        views: 189
    }
];

// Cargar artículos desde localStorage o usar datos por defecto
function loadArticles() {
    const savedArticles = localStorage.getItem('ladoc_articles');
    if (savedArticles) {
        articles = JSON.parse(savedArticles);
    }
    return articles;
}

// Guardar artículos en localStorage
function saveArticles() {
    localStorage.setItem('ladoc_articles', JSON.stringify(articles));
}

// Formatear fecha
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Crear nuevo artículo
function createArticle(articleData) {
    const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
    const newArticle = {
        id: newId,
        title: articleData.title,
        category: articleData.category,
        excerpt: articleData.excerpt || articleData.content.substring(0, 150) + '...',
        content: articleData.content,
        date: articleData.date || new Date().toISOString().split('T')[0],
        published: articleData.status === 'published',
        author: articleData.author || 'Redacción LADO C',
        views: 0
    };
    
    articles.unshift(newArticle);
    saveArticles();
    return newArticle;
}

// Actualizar artículo existente
function updateArticle(id, articleData) {
    const index = articles.findIndex(article => article.id === id);
    if (index !== -1) {
        articles[index] = {
            ...articles[index],
            title: articleData.title || articles[index].title,
            category: articleData.category || articles[index].category,
            excerpt: articleData.excerpt || articles[index].excerpt,
            content: articleData.content || articles[index].content,
            date: articleData.date || articles[index].date,
            published: articleData.status === 'published' || articles[index].published,
            author: articleData.author || articles[index].author
        };
        saveArticles();
        return articles[index];
    }
    return null;
}

// Eliminar artículo
function deleteArticle(id) {
    if (confirm('¿Estás seguro de eliminar este artículo? Esta acción no se puede deshacer.')) {
        const index = articles.findIndex(article => article.id === id);
        if (index !== -1) {
            articles.splice(index, 1);
            saveArticles();
            
            // Actualizar la vista
            const articleElement = document.querySelector(`[data-id="${id}"]`);
            if (articleElement) {
                articleElement.remove();
            }
            
            showMessage('adminMessage', 'Artículo eliminado correctamente', 'success');
        }
    }
}

// Editar artículo
function editArticle(id) {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    
    // Llenar el modal con los datos del artículo
    document.getElementById('modalTitle').textContent = 'Editar Editorial';
    document.getElementById('modalTitleInput').value = article.title;
    document.getElementById('modalCategory').value = article.category;
    document.getElementById('modalExcerpt').value = article.excerpt;
    document.getElementById('modalContent').value = article.content;
    document.getElementById('modalDate').value = article.date;
    document.getElementById('modalStatus').value = article.published ? 'published' : 'draft';
    document.getElementById('saveArticle').textContent = 'Actualizar Editorial';
    document.getElementById('saveArticle').dataset.action = 'update';
    document.getElementById('saveArticle').dataset.articleId = id;
    
    // Mostrar modal
    document.getElementById('articleModal').style.display = 'flex';
}

// Vista previa de artículo
function previewArticle(id) {
    const article = articles.find(a => a.id === id);
    if (article) {
        window.open(`article.html?id=${id}`, '_blank');
    }
}

// ===== FUNCIONALIDAD DEL MODAL =====

// Abrir modal para nuevo artículo
function openNewArticleModal() {
    document.getElementById('modalTitle').textContent = 'Nuevo Editorial';
    document.getElementById('modalTitleInput').value = '';
    document.getElementById('modalCategory').value = 'Catamarca';
    document.getElementById('modalExcerpt').value = '';
    document.getElementById('modalContent').value = '';
    document.getElementById('modalDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('modalStatus').value = 'published';
    document.getElementById('saveArticle').textContent = 'Crear Editorial';
    document.getElementById('saveArticle').dataset.action = 'create';
    document.getElementById('saveArticle').removeAttribute('data-article-id');
    
    document.getElementById('articleModal').style.display = 'flex';
}

// Guardar artículo desde el modal
function saveArticleFromModal(event) {
    event.preventDefault();
    
    const title = document.getElementById('modalTitleInput').value;
    const category = document.getElementById('modalCategory').value;
    const excerpt = document.getElementById('modalExcerpt').value;
    const content = document.getElementById('modalContent').value;
    const date = document.getElementById('modalDate').value;
    const status = document.getElementById('modalStatus').value;
    const action = document.getElementById('saveArticle').dataset.action;
    
    if (!title || !content) {
        showMessage('adminMessage', 'El título y el contenido son obligatorios', 'error');
        return;
    }
    
    const articleData = {
        title,
        category,
        excerpt,
        content,
        date,
        status,
        author: 'Administrador'
    };
    
    if (action === 'create') {
        const newArticle = createArticle(articleData);
        showMessage('adminMessage', '¡Artículo creado exitosamente!', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } else if (action === 'update') {
        const id = parseInt(document.getElementById('saveArticle').dataset.articleId);
        updateArticle(id, articleData);
        showMessage('adminMessage', '¡Artículo actualizado exitosamente!', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
    
    // Cerrar modal
    document.getElementById('articleModal').style.display = 'none';
}

// ===== FUNCIONALIDAD DE NAVEGACIÓN =====

// Cambiar entre pestañas del panel de administración
function setupTabNavigation() {
    const tabLinks = document.querySelectorAll('.admin-nav-link');
    const tabSections = document.querySelectorAll('.admin-section');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabId = this.getAttribute('data-tab');
            
            // Actualizar enlaces activos
            tabLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            tabSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${tabId}Section`) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// ===== FUNCIONALIDAD DE MENSAJES =====

// Mostrar mensajes
function showMessage(elementId, text, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// ===== FUNCIONALIDAD DE CONTADOR DE CARACTERES =====

// Configurar contador de caracteres para textareas
function setupCharacterCounters() {
    const excerptTextarea = document.getElementById('modalExcerpt');
    if (excerptTextarea) {
        const charCount = excerptTextarea.parentElement.querySelector('.char-count');
        
        excerptTextarea.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = `${count}/200 caracteres`;
            
            if (count > 200) {
                charCount.style.color = '#dc3545';
            } else {
                charCount.style.color = '#666';
            }
        });
        
        // Contador inicial
        charCount.textContent = `${excerptTextarea.value.length}/200 caracteres`;
    }
}

// ===== INICIALIZACIÓN =====

// Configurar eventos cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar sistema de autenticación
    initAuthSystem();
    
    // Cargar artículos
    loadArticles();
    
    // ===== EVENT LISTENERS PARA ADMIN.HTML =====
    
    // Formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Mostrar/ocultar contraseña
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Botón para nuevo artículo
    const newArticleBtn = document.getElementById('newArticleBtn');
    if (newArticleBtn) {
        newArticleBtn.addEventListener('click', openNewArticleModal);
    }
    
    // Formulario de artículo (modal)
    const articleForm = document.getElementById('articleForm');
    if (articleForm) {
        articleForm.addEventListener('submit', saveArticleFromModal);
    }
    
    // Cerrar modal
    const closeModalBtn = document.getElementById('closeModal');
    const cancelModalBtn = document.getElementById('cancelModal');
    const modal = document.getElementById('articleModal');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Cerrar modal al hacer clic fuera
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Configurar navegación por pestañas
    setupTabNavigation();
    
    // Configurar contadores de caracteres
    setupCharacterCounters();
    
    // Configurar botones de borrar (si existen)
    document.querySelectorAll('.btn-delete').forEach(btn => {
        if (!btn.onclick) {
            btn.addEventListener('click', function() {
                const articleId = this.closest('.admin-article-item')?.dataset?.id;
                if (articleId) {
                    deleteArticle(parseInt(articleId));
                }
            });
        }
    });
    
    // Configurar botones de editar (si existen)
    document.querySelectorAll('.btn-edit').forEach(btn => {
        if (!btn.onclick) {
            btn.addEventListener('click', function() {
                const articleId = this.closest('.admin-article-item')?.dataset?.id;
                if (articleId) {
                    editArticle(parseInt(articleId));
                }
            });
        }
    });
    
    // Configurar botones de vista previa (si existen)
    document.querySelectorAll('.btn-preview').forEach(btn => {
        if (!btn.onclick) {
            btn.addEventListener('click', function() {
                const articleId = this.closest('.admin-article-item')?.dataset?.id;
                if (articleId) {
                    previewArticle(parseInt(articleId));
                }
            });
        }
    });
    
    // ===== CONFIGURACIÓN PARA INDEX.HTML =====
    
    // Simular datos para artículos en index.html
    const articleCards = document.querySelectorAll('.article-card');
    if (articleCards.length > 0 && articles.length > 0) {
        // Si hay artículos cargados, podríamos actualizar la vista
        // Esto es opcional, ya que los artículos están hardcodeados en el HTML
    }
    
    // ===== CONFIGURACIÓN PARA ARTICLE.HTML =====
    
    // Incrementar contador de vistas cuando se ve un artículo
    if (window.location.pathname.includes('article.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (articleId) {
            const article = articles.find(a => a.id === parseInt(articleId));
            if (article) {
                // Incrementar vistas
                article.views = (article.views || 0) + 1;
                saveArticles();
                
                // Actualizar contenido del artículo
                // (El contenido ya se actualiza con el script en article.html)
            }
        }
    }
    
    // ===== INFORMACIÓN DE DEBUG =====
    console.log('Sistema LADO C cargado correctamente');
    console.log('Artículos cargados:', articles.length);
    console.log('Credenciales de administrador:', AUTH_CONFIG.adminUser, '/', AUTH_CONFIG.adminPass);
});

// ===== FUNCIONES GLOBALES (para onclick en HTML) =====
// Estas funciones están disponibles globalmente para los onclick en los botones

window.deleteArticle = function(id) {
    if (confirm('¿Estás seguro de eliminar este artículo? Esta acción no se puede deshacer.')) {
        const index = articles.findIndex(article => article.id === id);
        if (index !== -1) {
            articles.splice(index, 1);
            saveArticles();
            
            // Actualizar la vista
            const articleElement = document.querySelector(`[data-id="${id}"]`);
            if (articleElement) {
                articleElement.remove();
            }
            
            showMessage('adminMessage', 'Artículo eliminado correctamente', 'success');
        }
    }
};

window.editArticle = function(id) {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    
    // Llenar el modal con los datos del artículo
    document.getElementById('modalTitle').textContent = 'Editar Editorial';
    document.getElementById('modalTitleInput').value = article.title;
    document.getElementById('modalCategory').value = article.category;
    document.getElementById('modalExcerpt').value = article.excerpt;
    document.getElementById('modalContent').value = article.content;
    document.getElementById('modalDate').value = article.date;
    document.getElementById('modalStatus').value = article.published ? 'published' : 'draft';
    document.getElementById('saveArticle').textContent = 'Actualizar Editorial';
    document.getElementById('saveArticle').dataset.action = 'update';
    document.getElementById('saveArticle').dataset.articleId = id;
    
    // Mostrar modal
    document.getElementById('articleModal').style.display = 'flex';
};

window.previewArticle = function(id) {
    window.open(`article.html?id=${id}`, '_blank');
};
