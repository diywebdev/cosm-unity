const popupLinks = document.querySelectorAll(".popup-link");
const closeModalBtns = document.querySelectorAll(".close-modal-btn");
const modalOverlays = document.querySelectorAll(".modal__overlay");

// API base URL
const API_BASE_URL = window.location.hostname === 'localhost' ? `/` : `/cosm-unity/`;

// Импортируем функцию работы с каталогом
import { setDataCatalogModal } from './catalog.js';

/**
 * Инициализация обработчиков для модальных окон
 */
function initModals() {
    if (popupLinks.length) {
        popupLinks.forEach(link => {
            link.addEventListener('click', handleModalOpen);
        });
    }

    // Обработчики закрытия модальных окон
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', handleModalClose);
    });

    // Обработчики для текстовых кнопок закрытия (делегирование событий)
    document.addEventListener('click', (e) => {
        if (e.target.matches('.news-modal__close-text, .book-modal__close-text')) {
            handleModalClose(e);
        }
    });

    // Закрытие по клику на overlay
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.is-active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });
}

/**
 * Обработчик открытия модального окна
 */
function handleModalOpen(e) {
    e.preventDefault();
    
    const link = e.currentTarget;
    const href = link.getAttribute("href");
    
    if (!href || href === "#") return;
    
    const modalId = href.replace("#", "");
    const targetModal = document.getElementById(modalId);
    if (!targetModal) return;

    const type = link.dataset.type;
    if (!type) return;

    const targetModalContent = targetModal.querySelector('.modal__content');
    if (!targetModalContent) return;

    // Показываем loader если нужно загружать данные
    const needsData = ['news', 'book', 'catalog'].includes(type);
    if (needsData) {
        showLoader(targetModalContent);
    }

    // Обработка разных типов модальных окон
    switch (type) {
        case 'catalog':
            setDataCatalogModal(targetModalContent);
            openModal(targetModal);
            break;

        case 'review':
            setDataReviewModal(link, targetModalContent);
            openModal(targetModal);
            break;
        
        case 'news':
            const newsId = link.dataset.id || '1';
            loadNewsData(newsId, targetModalContent).then(() => {
                openModal(targetModal);
            }).catch(error => {
                console.error('Error loading news:', error);
                showError(targetModalContent, 'Failed to load news');
            });
            break;
        
        case 'book':
            const bookId = link.dataset.id || '1';
            loadBookData(bookId, targetModalContent).then(() => {
                openModal(targetModal);
            }).catch(error => {
                console.error('Error loading book:', error);
                showError(targetModalContent, 'Failed to load book');
            });
            break;
    
        default:
            break;
    }
}

/**
 * Открытие модального окна
 */
function openModal(modal) {
    document.querySelectorAll('.modal.is-active').forEach(m => {
        closeModal(m);
    });
    modal.classList.add("is-active");
    document.documentElement.classList.add('is-lock');
}

/**
 * Обработчик закрытия модального окна
 */
function handleModalClose(e) {
    e.preventDefault();
    const targetModal = e.currentTarget.closest('.modal');
    if (!targetModal) return;
    closeModal(targetModal);
}

/**
 * Закрытие модального окна
 */
function closeModal(modal) {
    const modalContent = modal.querySelector('.modal__content');
    if (modalContent) {
        // Очищаем контент только для модальных окон с динамической загрузкой
        const modalType = modal.id;
        if (modalType === 'news-modal' || modalType === 'book-modal') {
            clearModalContent(modalContent);
        } else if (modalType === 'review-modal') {
            modalContent.innerHTML = '';
        }
    }
    modal.classList.remove('is-active');
    document.documentElement.classList.remove('is-lock');
}

/**
 * Установка данных для модального окна отзыва
 */
function setDataReviewModal(link, target) {
    const content = link.closest('.reviews__slide').querySelector('.reviews__slide--wrapper');
    if (!content) return;
    
    // Очищаем предыдущий контент
    target.innerHTML = '';
    target.insertAdjacentElement('afterbegin', content.cloneNode(true));
}

/**
 * Загрузка данных новости из API
 */
async function loadNewsData(newsId, target) {
    try {
        // Используем JSONPlaceholder для тестирования
        // В реальном проекте замените на ваш WordPress API endpoint
        const response = await fetch(`${API_BASE_URL}/posts/${newsId}`);
        if (!response.ok) throw new Error('Failed to fetch news');
        
        const data = await response.json();
        
        // Получаем изображение из локальных ресурсов или API
        const newsItem = document.querySelector(`[data-type="news"][data-id="${newsId}"]`);
        const newsImage = newsItem?.closest('.news__item')?.querySelector('.news__item--image img')?.src || '';
        const newsDate = newsItem?.closest('.news__item')?.querySelector('time')?.getAttribute('datetime') || '';
        
        // Заполняем модальное окно данными
        fillNewsModal(target, {
            id: data.id,
            title: data.title,
            content: data.body,
            image: newsImage,
            date: newsDate || new Date().toISOString().split('T')[0]
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Заполнение модального окна новости данными
 */
function fillNewsModal(target, data) {
    const imageEl = target.querySelector('.news-modal__img');
    const dateEl = target.querySelector('.news-modal__date');
    const titleEl = target.querySelector('.news-modal__title');
    const contentEl = target.querySelector('.news-modal__content');
    
    if (imageEl && data.image) {
        imageEl.src = data.image;
        imageEl.alt = data.title;
    }
    
    if (dateEl) {
        dateEl.textContent = formatDate(data.date);
        dateEl.setAttribute('datetime', data.date);
    }
    
    if (titleEl) {
        titleEl.textContent = data.title;
    }
    
    if (contentEl) {
        // Преобразуем текст в параграфы для лучшей читаемости
        const paragraphs = data.content.split('\n').filter(p => p.trim());
        contentEl.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
    }
}

/**
 * Загрузка данных книги из API
 */
async function loadBookData(bookId, target) {
    try {
        const response = await fetch(`${API_BASE_URL}catalog.json`);
        
        if (!response.ok) throw new Error('Failed to fetch catalog');
        
        const data = await response.json();

        const bookData = data.find(item => item.id === parseInt(bookId));
        if (!bookData) throw new Error('Book not found in catalog');
        
        // Получаем данные из карточки каталога
        const bookImage = bookData.image || '';
        const bookTitle = bookData.title;
        const bookAuthor = 'by ' + bookData.author.map(a => a.name).join(' & ');
        const bookExcerpt = bookData.excerpt;
        
        // Заполняем модальное окно данными
        fillBookModal(target, {
            id: bookData.id,
            title: bookTitle,
            author: bookAuthor,
            excerpt: null,
            description: bookData.description,
            image: bookImage
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Заполнение модального окна книги данными
 */
function fillBookModal(target, data) {
    console.log(data);
    
    const imageEl = target.querySelector('.book-modal__img');
    const excerptEl = target.querySelector('.book-modal__excerpt');
    const descriptionEl = target.querySelector('.book-modal__description');
    const titleEl = target.querySelector('.book-modal__title');
    const authorEl = target.querySelector('.book-modal__author');
    
    if (imageEl && data.image) {
        imageEl.src = data.image;
        imageEl.alt = data.title;
    }
    
    if (excerptEl && data.excerpt) {
        excerptEl.textContent = data.excerpt;
    }
    
    if (titleEl) {
        titleEl.textContent = data.title;
    }
    
    if (authorEl) {
        authorEl.textContent = data.author;
    }
    
    if (descriptionEl) {
        // Преобразуем текст в параграфы
        const paragraphs = data.description.split('\n').filter(p => p.trim());
        descriptionEl.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
    }
    
    // if (buyBtn) {
    //     buyBtn.addEventListener('click', () => {
    //         // Здесь будет логика покупки
    //         console.log('Buy book:', data.id);
    //     });
    // }
}

/**
 * Показ загрузчика
 */
function showLoader(target) {
    // target.innerHTML = '<div class="modal-loader">Loading...</div>';
}

/**
 * Показ ошибки
 */
function showError(target, message) {
    target.innerHTML = `<div class="modal-error">${message}</div>`;
}

/**
 * Очистка контента модального окна
 */
function clearModalContent(target) {
    // Сохраняем структуру, но очищаем данные
    const imageEl = target.querySelector('img');
    const textEls = target.querySelectorAll('h2, h3, time, .book-modal__excerpt, .book-modal__author, .book-modal__description, .news-modal__content');
    
    if (imageEl) imageEl.src = '';
    textEls.forEach(el => {
        if (el.tagName === 'TIME') {
            el.textContent = '';
            el.removeAttribute('datetime');
        } else {
            el.textContent = '';
        }
    });
    
    const contentEl = target.querySelector('.book-modal__description, .news-modal__content');
    if (contentEl) contentEl.innerHTML = '';
}

/**
 * Форматирование даты
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
}

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModals);
} else {
    initModals();
}