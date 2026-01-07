// ===== SISTEMA DE AUTENTICACIÓN =====
const AUTH_CONFIG = {
    adminUser: 'admin',
    adminPass: 'admin123',
    sessionKey: 'ladoc_admin_session',
    sessionTimeout: 8 * 60 * 60 * 1000 // 8 horas en milisegundos
};

// ===== ALMACENAMIENTO DE ARTÍCULOS =====
let articles = JSON.parse(localStorage.getItem('ladoc_articles')) || [
    {
        id: 1,
        title: 'El futuro del trabajo en el Noroeste Argentino',
        category: 'Catamarca',
        excerpt: 'Un análisis profundo sobre las oportunidades laborales y los desafíos económicos que enfrenta la región del Noroeste Argentino...',
        content: `El Noroeste Argentino (NOA) enfrenta desafíos y oportunidades únicas en el panorama laboral actual. En esta región, caracterizada por su diversidad cultural y económica, el futuro del trabajo se está redefiniendo bajo la influencia de la tecnología, las políticas públicas y los cambios sociales.

<h2>Transformación Digital en el NOA</h2>
<p>La digitalización ha llegado para quedarse, incluso en las provincias más alejadas de los grandes centros urbanos. En Catamarca, por ejemplo, se observa un crecimiento sostenido en el sector tecnológico, con empresas locales desarrollando soluciones adaptadas a las necesidades regionales.</p>

<blockquote>
"El trabajo remoto ha abierto oportunidades que antes eran impensables para los profesionales del interior del país"
</blockquote>

<h2>Sectores con Potencial de Crecimiento</h2>
<ul>
    <li><strong>Turismo sustentable:</strong> La riqueza cultural y natural del NOA representa una oportunidad única para desarrollar un turismo de calidad.</li>
    <li><strong>Agroindustria tecnificada:</strong> La aplicación de tecnología en la producción agrícola puede aumentar la competitividad regional.</li>
    <li><strong>Energías renovables:</strong> El potencial solar de la región es enorme y apenas comienza a explotarse.</li>
</ul>`,
        image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
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
        image: 'https://images.unsplash.com/photo-1551135049-8a33b2fb2f5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        date: '2023-05-12',
        published: true,
        author: 'María Gómez',
        views: 189
    }
];

// ===== FUNCIONES DE AUTENTICACIÓN =====

function initAuthSystem() {
    const session = getSession();
    
    if (session && isSessionValid(session)) {
        if (window.location.pathname.includes('admin.html')) {
            showAdminPanel();
        }
    } else {
        clearSession();
    }
}

function getSession() {
    const sessionStr = localStorage.getItem(AUTH_CONFIG.sessionKey);
    return sessionStr ? JSON.parse(sessionStr) : null;
}

function saveSession(username) {
    const session = {
        username: username,
        timestamp: Date.now(),
        expires: Date.now() + AUTH_CONFIG.sessionTimeout
    };
    localStorage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(session));
}

function isSessionValid(session) {
    if (!session || !session.timestamp) return false;
    return Date.now() < session.expires;
}

function clearSession() {
    localStorage.removeItem(AUTH_CONFIG.sessionKey);
    if (window.location.pathname.includes('admin.html')) {
        showLoginForm();
    }
}

function checkCredentials(username, password) {
    return username === AUTH_CONFIG.adminUser && password === AUTH_CONFIG.adminPass;
}

// ===== FUNCIONALIDAD DEL PANEL DE ADMINISTRACIÓN =====

function showLoginForm() {
    const loginContainer = document.getElementById('loginContainer');
    const adminPanel = document.getElementById('adminPanel');
    
    if (loginContainer) loginContainer.style.display = 'flex';
    if (adminPanel) adminPanel.style.display = 'none';
}

function showAdminPanel() {
    const loginContainer = document.getElementById('loginContainer');
    const adminPanel = document.getElementById('adminPanel');
    const adminName = document.getElementById('adminName');
    const session = getSession();
    
    if (loginContainer) loginContainer.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'block';
    if (adminName && session) adminName.textContent = session.username;
    
    // Cargar artículos en el panel
    loadArticlesInAdmin();
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    const loginMessage = document.getElementById('loginMessage');
    
    if (!username || !password) {
        showMessage('loginMessage', 'Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (checkCredentials(username, password)) {
        saveSession(username);
        showAdminPanel();
        showMessage('loginMessage', '¡Inicio de sesión exitoso!', 'success');
    } else {
        showMessage('loginMessage', 'Usuario o contraseña incorrectos', 'error');
        const passwordInput = document.getElementById('password');
        if (passwordInput) passwordInput.value = '';
        if (passwordInput) passwordInput.focus();
    }
}

function handleLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        clearSession();
        window.location.href = 'index.html';
    }
}

// ===== FUNCIONALIDAD DE ARTÍCULOS =====

function saveArticlesToStorage() {
    try {
        localStorage.setItem('ladoc_articles', JSON.stringify(articles));
        console.log('Artículos guardados:', articles.length);
        return true;
    } catch (error) {
        console.error('Error al guardar artículos:', error);
        showMessage('adminMessage', 'Error al guardar los artículos', 'error');
        return false;
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function getNextArticleId() {
    if (articles.length === 0) return 1;
    return Math.max(...articles.map(a => a.id)) + 1;
}

function createArticle(articleData) {
    const newArticle = {
        id: getNextArticleId(),
        title: articleData.title,
        category: articleData.category,
        excerpt: articleData.excerpt || articleData.content.substring(0, 150) + '...',
        content: articleData.content,
        image: articleData.image || '',
        date: articleData.date || new Date().toISOString().split('T')[0],
        published: articleData.status === 'published',
        author: articleData.author || 'Redacción LADO C',
        views: 0,
        createdAt: new Date().toISOString()
    };
    
    articles.unshift(newArticle);
    if (saveArticlesToStorage()) {
        showMessage('adminMessage', '¡Artículo creado exitosamente!', 'success');
        return newArticle;
    }
    return null;
}

function updateArticle(id, articleData) {
    const index = articles.findIndex(article => article.id === id);
    if (index === -1) {
        showMessage('adminMessage', 'Artículo no encontrado', 'error');
        return null;
    }
    
    articles[index] = {
        ...articles[index],
        title: articleData.title || articles[index].title,
        category: articleData.category || articles[index].category,
        excerpt: articleData.excerpt || articles[index].excerpt,
        content: articleData.content || articles[index].content,
        image: articleData.image || articles[index].image,
        date: articleData.date || articles[index].date,
        published: articleData.status === 'published',
        author: articleData.author || articles[index].author,
        updatedAt: new Date().toISOString()
    };
    
    if (saveArticlesToStorage()) {
        showMessage('adminMessage', '¡Artículo actualizado exitosamente!', 'success');
        return articles[index];
    }
    return null;
}

function deleteArticle(id) {
    if (!confirm('¿Estás seguro de eliminar este artículo? Esta acción no se puede deshacer.')) {
        return;
    }
    
    const index = articles.findIndex(article => article.id === id);
    if (index === -1) {
        showMessage('adminMessage', 'Artículo no encontrado', 'error');
        return;
    }
    
    articles.splice(index, 1);
    if (saveArticlesToStorage()) {
        showMessage('adminMessage', 'Artículo eliminado correctamente', 'success');
        loadArticlesInAdmin();
    }
}

function editArticle(id) {
    const article = articles.find(a => a.id === id);
    if (!article) {
        showMessage('adminMessage', 'Artículo no encontrado', 'error');
        return;
    }
    
    document.getElementById('modalTitle').textContent = 'Editar Editorial';
    document.getElementById('modalTitleInput').value = article.title;
    document.getElementById('modalCategory').value = article.category;
    document.getElementById('modalExcerpt').value = article.excerpt;
    document.getElementById('modalContent').value = article.content;
    document.getElementById('modalImage').value = article.image || '';
    document.getElementById('modalDate').value = article.date;
    document.getElementById('modalStatus').value = article.published ? 'published' : 'draft';
    document.getElementById('modalAuthor').value = article.author || 'Redacción LADO C';
    
    document.getElementById('saveArticle').textContent = 'Actualizar Editorial';
    document.getElementById('saveArticle').dataset.action = 'update';
    document.getElementById('saveArticle').dataset.articleId = id;
    
    updateCoverPreview(article.image);
    
    document.getElementById('articleModal').style.display = 'flex';
}

function previewArticle(id) {
    const article = articles.find(a => a.id === id);
    if (article) {
        window.open(`article.html?id=${id}`, '_blank');
    }
}

// ===== FUNCIONALIDAD DEL MODAL =====

function openNewArticleModal() {
    document.getElementById('modalTitle').textContent = 'Nuevo Editorial';
    document.getElementById('articleForm').reset();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('modalDate').value = today;
    document.getElementById('modalStatus').value = 'published';
    document.getElementById('modalAuthor').value = 'Redacción LADO C';
    
    document.getElementById('saveArticle').textContent = 'Crear Editorial';
    document.getElementById('saveArticle').dataset.action = 'create';
    document.getElementById('saveArticle').removeAttribute('data-article-id');
    
    updateCoverPreview('');
    
    document.getElementById('articleModal').style.display = 'flex';
}

function updateCoverPreview(imageUrl) {
    const preview = document.getElementById('coverPreview');
    const placeholder = document.getElementById('coverPreviewPlaceholder');
    
    if (imageUrl && imageUrl.trim() !== '') {
        preview.innerHTML = `<img src="${imageUrl}" alt="Vista previa de portada" onerror="this.style.display='none'; document.getElementById('coverPreviewPlaceholder').style.display='block';">`;
        if (placeholder) placeholder.style.display = 'none';
    } else {
        if (placeholder) placeholder.style.display = 'block';
        preview.innerHTML = '';
    }
}

function saveArticleFromModal(event) {
    event.preventDefault();
    
    const title = document.getElementById('modalTitleInput').value;
    const category = document.getElementById('modalCategory').value;
    const excerpt = document.getElementById('modalExcerpt').value;
    const content = document.getElementById('modalContent').value;
    const image = document.getElementById('modalImage').value;
    const date = document.getElementById('modalDate').value;
    const status = document.getElementById('modalStatus').value;
    const author = document.getElementById('modalAuthor').value;
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
        image,
        date,
        status,
        author
    };
    
    let result;
    if (action === 'create') {
        result = createArticle(articleData);
        if (result) {
            setTimeout(() => {
                document.getElementById('articleModal').style.display = 'none';
                loadArticlesInAdmin();
            }, 1500);
        }
    } else if (action === 'update') {
        const id = parseInt(document.getElementById('saveArticle').dataset.articleId);
        result = updateArticle(id, articleData);
        if (result) {
            setTimeout(() => {
                document.getElementById('articleModal').style.display = 'none';
                loadArticlesInAdmin();
            }, 1500);
        }
    }
}

// ===== CARGA DE ARTÍCULOS EN DIFERENTES PÁGINAS =====

function loadArticlesInAdmin() {
    const container = document.querySelector('#editorialesSection .articles-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (articles.length === 0) {
        container.innerHTML = '<div class="no-articles"><p>No hay artículos creados aún.</p></div>';
        return;
    }
    
    articles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.className = 'admin-article-item';
        articleElement.dataset.id = article.id;
        
        articleElement.innerHTML = `
            <div class="article-info">
                <h3>${article.title}</h3>
                <div class="article-meta">
                    <span class="category-tag">${article.category}</span>
                    <span class="date">Publicado: ${formatDate(article.date)}</span>
                    <span class="views"><i class="fas fa-eye"></i> ${article.views} lecturas</span>
                </div>
                ${article.image ? `
                <div class="article-cover-preview">
                    <img src="${article.image}" alt="Portada">
                </div>
                ` : ''}
            </div>
            <div class="article-actions">
                <button class="btn-edit" onclick="editArticle(${article.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="deleteArticle(${article.id})">
                    <i class="fas fa-trash"></i> Borrar
                </button>
                <button class="btn-preview" onclick="previewArticle(${article.id})">
                    <i class="fas fa-eye"></i> Vista Previa
                </button>
            </div>
        `;
        
        container.appendChild(articleElement);
    });
}

function loadArticlesInIndex() {
    const container = document.getElementById('articlesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const publishedArticles = articles.filter(article => article.published);
    
    if (publishedArticles.length === 0) {
        container.innerHTML = '<div class="no-articles"><p>No hay artículos publicados aún.</p></div>';
        return;
    }
    
    publishedArticles.forEach(article => {
        const articleElement = document.createElement('article');
        articleElement.className = 'article-card';
        
        articleElement.innerHTML = `
            ${article.image ? `
            <div class="article-cover">
                <img src="${article.image}" alt="${article.title}">
                <div class="cover-overlay"></div>
                <div class="article-category">${article.category}</div>
            </div>
            ` : `
            <div class="article-cover" style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);">
                <div class="cover-overlay"></div>
                <div class="article-category">${article.category}</div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center; padding: 20px; width: 100%;">
                    <i class="fas fa-newspaper" style="font-size: 3rem; margin-bottom: 10px; opacity: 0.8;"></i>
                    <h3 style="font-size: 1.2rem; margin: 0;">${article.title}</h3>
                </div>
            </div>
            `}
            <div class="article-title">
                <a href="article.html?id=${article.id}">${article.title}</a>
            </div>
            <div class="article-excerpt">${article.excerpt}</div>
            <div class="article-meta">
                <span class="article-date"><i class="far fa-calendar"></i> ${formatDate(article.date)}</span>
                <a href="article.html?id=${article.id}" class="read-more">Leer completo →</a>
            </div>
        `;
        
        container.appendChild(articleElement);
    });
}

function loadArticleContent() {
    if (!window.location.pathname.includes('article.html')) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = parseInt(urlParams.get('id')) || 1;
    
    const article = articles.find(a => a.id === articleId) || articles[0];
    if (!article) return;
    
    // Incrementar vistas
    article.views = (article.views || 0) + 1;
    saveArticlesToStorage();
    
    // Actualizar contenido de la página
    document.getElementById('articleTitle').textContent = article.title;
    document.getElementById('articleCategory').textContent = article.category;
    document.getElementById('articleCategoryLink').textContent = article.category;
    document.getElementById('articleDate').innerHTML = `<i class="far fa-calendar"></i> ${formatDate(article.date)}`;
    document.getElementById('articleAuthor').innerHTML = `<i class="fas fa-user-edit"></i> Por: ${article.author}`;
    document.getElementById('articleContent').innerHTML = article.content;
    
    // Actualizar portada
    const articleImage = document.getElementById('articleImage');
    const imageCaption = document.getElementById('imageCaption');
    
    if (article.image && article.image.trim() !== '') {
        articleImage.src = article.image;
        articleImage.alt = article.title;
        articleImage.style.display = 'block';
        imageCaption.textContent = article.title;
        imageCaption.style.display = 'block';
    } else {
        articleImage.style.display = 'none';
        imageCaption.style.display = 'none';
    }
    
    // Calcular tiempo de lectura
    const wordCount = article.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    document.getElementById('readingTime').innerHTML = `<i class="far fa-clock"></i> ${readingTime} min de lectura`;
    
    // Actualizar título de la página
    document.title = `${article.title} - LADO C`;
    
    // Actualizar breadcrumb
    document.getElementById('articleTitleBreadcrumb').textContent = article.title;
}

// ===== FUNCIONALIDAD DE NAVEGACIÓN =====

function setupTabNavigation() {
    const tabLinks = document.querySelectorAll('.admin-nav-link');
    const tabSections = document.querySelectorAll('.admin-section');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabId = this.getAttribute('data-tab');
            
            tabLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
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

function showMessage(elementId, text, type) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Elemento ${elementId} no encontrado`);
        return;
    }
    
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// ===== FUNCIONALIDAD DE CONTADOR DE CARACTERES =====

function setupCharacterCounters() {
    const excerptTextarea = document.getElementById('modalExcerpt');
    if (excerptTextarea) {
        const charCount = excerptTextarea.parentElement.querySelector('.char-count');
        
        excerptTextarea.addEventListener('input', function() {
            const count = this.value.length;
            if (charCount) {
                charCount.textContent = `${count}/200 caracteres`;
                charCount.style.color = count > 200 ? 'var(--danger-color)' : 'var(--dark-gray)';
            }
        });
        
        if (charCount) {
            charCount.textContent = `${excerptTextarea.value.length}/200 caracteres`;
        }
    }
}

// ===== INICIALIZACIÓN =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema LADO C inicializado');
    
    // Inicializar sistema de autenticación
    initAuthSystem();
    
    // Cargar artículos en la página correspondiente
    if (window.location.pathname.includes('admin.html')) {
        // Configurar eventos específicos del panel de administración
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', function() {
                const passwordInput = document.getElementById('password');
                if (passwordInput) {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);
                    this.classList.toggle('fa-eye');
                    this.classList.toggle('fa-eye-slash');
                }
            });
        }
        
        const newArticleBtn = document.getElementById('newArticleBtn');
        if (newArticleBtn) {
            newArticleBtn.addEventListener('click', openNewArticleModal);
        }
        
        const articleForm = document.getElementById('articleForm');
        if (articleForm) {
            articleForm.addEventListener('submit', saveArticleFromModal);
        }
        
        const closeModalBtn = document.getElementById('closeModal');
        const cancelModalBtn = document.getElementById('cancelModal');
        const modal = document.getElementById('articleModal');
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                if (modal) modal.style.display = 'none';
            });
        }
        
        if (cancelModalBtn) {
            cancelModalBtn.addEventListener('click', function() {
                if (modal) modal.style.display = 'none';
            });
        }
        
        if (modal) {
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        // Configurar navegación por pestañas
        setupTabNavigation();
        
        // Configurar contador de caracteres
        setupCharacterCounters();
        
        // Configurar vista previa de imagen
        const imageInput = document.getElementById('modalImage');
        if (imageInput) {
            imageInput.addEventListener('input', function() {
                updateCoverPreview(this.value);
            });
        }
        
    } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('.html')) {
        // Cargar artículos en la página principal
        loadArticlesInIndex();
    }
    
    // Cargar artículo completo si estamos en article.html
    if (window.location.pathname.includes('article.html')) {
        loadArticleContent();
    }
    
    // Configurar botones de compartir
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.classList.contains('facebook') ? 'Facebook' :
                           this.classList.contains('twitter') ? 'Twitter' : 'WhatsApp';
            alert(`Compartir en ${platform} (funcionalidad en desarrollo)`);
        });
    });
});

// ===== FUNCIONES GLOBALES PARA USO EN HTML =====
window.editArticle = editArticle;
window.deleteArticle = deleteArticle;
window.previewArticle = previewArticle;
