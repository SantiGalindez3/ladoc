// ===== FUNCIONALIDAD PARA LA VISTA PÚBLICA =====

function loadArticlesForPublic() {
    const articlesContainer = document.getElementById('articlesContainer');
    const featuredContainer = document.getElementById('featuredContainer');
    const articleCount = document.getElementById('articleCount');
    
    if (!articlesContainer) return;
    
    // Mostrar solo artículos publicados
    const publishedArticles = articles.filter(article => article.published);
    
    if (publishedArticles.length === 0) {
        articlesContainer.innerHTML = `
            <div class="no-articles" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-newspaper" style="font-size: 3rem; color: var(--medium-gray); margin-bottom: 15px;"></i>
                <h3 style="color: var(--dark-gray); margin-bottom: 10px;">No hay artículos publicados</h3>
                <p style="color: var(--dark-gray);">Próximamente estarán disponibles nuevos editoriales.</p>
            </div>
        `;
        return;
    }
    
    // Actualizar contador
    if (articleCount) {
        articleCount.textContent = `${publishedArticles.length} editoriales publicados`;
    }
    
    // Cargar artículos principales (últimos 6)
    const mainArticles = publishedArticles.slice(0, 6);
    articlesContainer.innerHTML = '';
    
    mainArticles.forEach(article => {
        const articleElement = createPublicArticleElement(article);
        articlesContainer.appendChild(articleElement);
    });
    
    // Cargar destacados (artículos con más vistas)
    if (featuredContainer) {
        const featuredArticles = [...publishedArticles]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 3);
        
        featuredContainer.innerHTML = '';
        
        featuredArticles.forEach(article => {
            const featuredElement = createFeaturedArticleElement(article);
            featuredContainer.appendChild(featuredElement);
        });
    }
}

function createPublicArticleElement(article) {
    const articleElement = document.createElement('article');
    articleElement.className = 'article-card';
    
    const imageHtml = article.image ? `
        <div class="article-cover">
            <img src="${article.image}" alt="${article.title}" onerror="this.onerror=null; this.style.display='none';">
            <div class="cover-overlay"></div>
            <div class="article-category">${article.category}</div>
        </div>
    ` : `
        <div class="article-cover" style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);">
            <div class="cover-overlay"></div>
            <div class="article-category">${article.category}</div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center; padding: 20px; width: 100%;">
                <i class="fas fa-newspaper" style="font-size: 3rem; margin-bottom: 10px; opacity: 0.8;"></i>
            </div>
        </div>
    `;
    
    articleElement.innerHTML = `
        ${imageHtml}
        <div class="article-title">
            <a href="article.html?id=${article.id}">${article.title}</a>
        </div>
        <div class="article-excerpt">${article.excerpt}</div>
        <div class="article-meta">
            <span class="article-date"><i class="far fa-calendar"></i> ${formatDate(article.date)}</span>
            <a href="article.html?id=${article.id}" class="read-more">
                Leer completo <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
    
    return articleElement;
}

function createFeaturedArticleElement(article) {
    const articleElement = document.createElement('article');
    articleElement.className = 'article-card featured-card';
    
    articleElement.innerHTML = `
        <div class="article-title">
            <a href="article.html?id=${article.id}">${article.title}</a>
        </div>
        <div class="article-excerpt">${article.excerpt}</div>
        <div class="article-meta">
            <span class="article-date"><i class="far fa-calendar"></i> ${formatDate(article.date)}</span>
            <span class="article-views"><i class="fas fa-eye"></i> ${article.views || 0}</span>
        </div>
    `;
    
    return articleElement;
}

// ===== INICIALIZACIÓN PARA VISTA PÚBLICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema LADO C - Vista Pública');
    
    // Cargar artículos en la página principal
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname.endsWith('.html') && !window.location.pathname.includes('admin.html') && !window.location.pathname.includes('article.html')) {
        
        loadArticlesForPublic();
        
        // Configurar navegación suave
        document.querySelectorAll('nav a').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                if (this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
    
    // Cargar artículo completo si estamos en article.html
    if (window.location.pathname.includes('article.html')) {
        loadArticleContent();
    }
});

// ===== FUNCIONES GLOBALES PARA USO EN HTML =====
window.editArticle = editArticle;
window.deleteArticle = deleteArticle;
window.previewArticle = previewArticle;
