const popupLinks = document.querySelectorAll(".popup-link");
const closeModalBtns = document.querySelectorAll(".close-modal-btn");
const modalOverlays = document.querySelectorAll(".modal__overlay");

// API base URL - будет заменено на реальный при интеграции с WordPress
const API_BASE_URL = window.location.hostname === 'localhost' ? `/` : `/cosm-unity/`;

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
 * Установка данных для модального окна каталога
 */
async function setDataCatalogModal(target) {
    try {

        const response = await fetch(`${API_BASE_URL}catalog.json`);
        
        if (!response.ok) throw new Error('Failed to fetch news');
        
        const data = await response.json();        

        target.innerHTML = '';

        let html = '<ul class="catalog__list">';

        data.forEach(item => {
            // Создаем массив ID авторов для фильтрации
            const authorIds = item.author.map(a => a.id).join(',');
            html += `
                <li 
                    class="catalog__card" 
                    data-lang="${item.lang}" 
                    data-series="${item.series}" 
                    data-author-ids="${authorIds}"
                ">
                    <article>
                        <a href="#book-modal" class="catalog__card--link popup-link" data-type="book" data-id="${item.id}">
                            <div class="catalog__card--lang">${item.lang}</div>
                            <div class="catalog__card--image">
                                <img src="${API_BASE_URL+item.image}" width="197" height="297" loading="lazy" alt="${item.title}">
                            </div>
                            <div class="catalog__card--excerpt">${item.series}</div>
                            <div class="catalog__card--content">
                                <h3 class="catalog__card--title">${item.title}</h3>
                                <div class="catalog__card--author">by ${item.author.map(a => a.name).join(' &amp; ')}</div>
                            </div>
                        </a>
                    </article>
                </li>
            `;
        });

        html += '</ul>';        

        target.insertAdjacentHTML('beforeend', html);

        // Собираем уникальные языки с count
        const langMap = new Map();
        data.forEach(item => {
            if (!langMap.has(item.lang)) {
                langMap.set(item.lang, 0);
            }
            langMap.set(item.lang, langMap.get(item.lang) + 1);
        });

        // Собираем уникальные серии с count
        const seriesMap = new Map();
        data.forEach(item => {
            if (!seriesMap.has(item.series)) {
                seriesMap.set(item.series, 0);
            }
            seriesMap.set(item.series, seriesMap.get(item.series) + 1);
        });

        // Собираем уникальные комбинации авторов (как они есть в книгах)
        const authorCombinations = new Map();
        data.forEach(item => {
            const authorIds = item.author.map(a => a.id).sort().join(',');
            const authorNames = item.author.map(a => a.name).join(', ');
            if (!authorCombinations.has(authorIds)) {
                authorCombinations.set(authorIds, { names: authorNames, count: 0 });
            }
            authorCombinations.get(authorIds).count++;
        });

        // Обновляем чекбоксы языков в фильтре
        const langFilterLabel = target.parentElement.querySelector('[data-filter-type="lang"]');
        if (langFilterLabel) {
            const langDropdown = langFilterLabel.querySelector('.catalog-filter__dropdown');
            if (langDropdown) {
                langDropdown.innerHTML = '';
                langMap.forEach((count, lang) => {
                    const label = document.createElement('label');
                    label.className = 'catalog-filter__item';
                    label.innerHTML = `
                        <span class="catalog-filter__item--row">
                            <input type="checkbox" class="visually-hidden catalog-checkbox" value="${lang}">
                            <span class="fake-checkbox"></span>
                            <span class="catalog-filter__item--label">${lang}</span>
                        </span>
                        <span class="catalog-filter__item--count">${count}</span>
                    `;
                    langDropdown.appendChild(label);
                });
            }
        }

        // Обновляем чекбоксы серий в фильтре
        const seriesFilterLabel = target.parentElement.querySelector('[data-filter-type="series"]');
        if (seriesFilterLabel) {
            const seriesDropdown = seriesFilterLabel.querySelector('.catalog-filter__dropdown');
            if (seriesDropdown) {
                seriesDropdown.innerHTML = '';
                seriesMap.forEach((count, series) => {
                    const label = document.createElement('label');
                    label.className = 'catalog-filter__item';
                    label.innerHTML = `
                        <span class="catalog-filter__item--row">
                            <input type="checkbox" class="visually-hidden catalog-checkbox" value="${series}">
                            <span class="fake-checkbox"></span>
                            <span class="catalog-filter__item--label">${series}</span>
                        </span>
                        <span class="catalog-filter__item--count">${count}</span>
                    `;
                    seriesDropdown.appendChild(label);
                });
            }
        }

        // Обновляем чекбоксы авторов в фильтре
        const authorFilterLabel = target.parentElement.querySelector('[data-filter-type="author"]');
        if (authorFilterLabel) {
            const authorDropdown = authorFilterLabel.querySelector('.catalog-filter__dropdown');
            if (authorDropdown) {
                authorDropdown.innerHTML = '';
                authorCombinations.forEach((authorData, authorIds) => {
                    const label = document.createElement('label');
                    label.className = 'catalog-filter__item';
                    label.innerHTML = `
                        <span class="catalog-filter__item--row">
                            <input type="checkbox" class="visually-hidden catalog-checkbox" value="${authorIds}">
                            <span class="fake-checkbox"></span>
                            <span class="catalog-filter__item--label">${authorData.names}</span>
                        </span>
                        <span class="catalog-filter__item--count">${authorData.count}</span>
                    `;
                    authorDropdown.appendChild(label);
                });
            }
            // Удаляем класс is-active у лейбла авторов
            authorFilterLabel.classList.remove('is-active');
        }

        const filterElements = document.querySelectorAll('.catalog-checkbox');
        const allFilterBtn = target.parentElement.querySelector('[data-filter-type="all"]');
        const group = {
            lang: [],
            series: [],
            author: [],
        };

        const cards = document.querySelectorAll('.catalog-modal .catalog__card');

        // Функция для применения фильтров
        function applyFilters() {
            let visibleCount = 0;
            
            cards.forEach(card => {
                const langMatch = group.lang.length === 0 || group.lang.includes(card.dataset.lang);
                const seriesMatch = group.series.length === 0 || group.series.includes(card.dataset.series);
                
                // Для авторов проверяем, совпадает ли комбинация ID авторов
                let authorMatch = true;
                if (group.author.length > 0) {
                    authorMatch = group.author.some(authorIds => {
                        return authorIds === card.dataset.authorIds;
                    });
                }

                // Карточка видна только если она соответствует всем активным фильтрам
                if (langMatch && seriesMatch && authorMatch) {
                    card.classList.remove('hidden');
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                }
            });

            // Проверяем наличие сообщения об отсутствии результатов
            let noResultsMsg = document.querySelector('.catalog__no-results');
            
            if (visibleCount === 0) {
                // Создаем сообщение, если его нет
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.className = 'catalog__no-results';
                    noResultsMsg.textContent = 'No books found matching your filters';
                    const catalogList = document.querySelector('.catalog__list');
                    if (catalogList) {
                        catalogList.parentElement.insertBefore(noResultsMsg, catalogList);
                    }
                }
                noResultsMsg.style.display = 'block';
            } else {
                // Скрываем сообщение, если есть результаты
                if (noResultsMsg) {
                    noResultsMsg.style.display = 'none';
                }
            }

            // Обновляем состояние кнопки "All"
            const hasActiveFilters = group.lang.length > 0 || group.series.length > 0 || group.author.length > 0;
            if (allFilterBtn) {
                if (hasActiveFilters) {
                    allFilterBtn.classList.remove('is-active');
                } else {
                    allFilterBtn.classList.add('is-active');
                }
            }

            // Обновляем класс is-active для лейблов фильтров
            const langLabel = target.parentElement.querySelector('[data-filter-type="lang"]');
            const seriesLabel = target.parentElement.querySelector('[data-filter-type="series"]');
            const authorLabelElem = target.parentElement.querySelector('[data-filter-type="author"]');

            if (langLabel) {
                if (group.lang.length > 0) {
                    langLabel.classList.add('is-active');
                } else {
                    langLabel.classList.remove('is-active');
                }
            }

            if (seriesLabel) {
                if (group.series.length > 0) {
                    seriesLabel.classList.add('is-active');
                } else {
                    seriesLabel.classList.remove('is-active');
                }
            }

            if (authorLabelElem) {
                if (group.author.length > 0) {
                    authorLabelElem.classList.add('is-active');
                } else {
                    authorLabelElem.classList.remove('is-active');
                }
            }
        }

        // Обработчик для кнопки "All"
        if (allFilterBtn) {
            allFilterBtn.addEventListener('click', () => {
                // Очищаем все фильтры
                group.lang = [];
                group.series = [];
                group.author = [];

                // Снимаем отметки со всех чекбоксов
                filterElements.forEach(checkbox => {
                    checkbox.checked = false;
                });

                // Показываем все карточки и обновляем кнопку
                applyFilters();
            });
        }

        if(filterElements.length > 0){
            filterElements.forEach((item) => {
                item.addEventListener('change', () => {
                    const type = item.closest('.catalog-filter__label').dataset.filterType || 'all';
                    const value = item.value;

                    if(item.checked){
                        // Добавляем значение в группу, если его там нет
                        if (!group[type].includes(value)) {
                            group[type].push(value);
                        }
                    } else {
                        // Удаляем значение из группы
                        group[type] = group[type].filter(v => v !== value);
                    }

                    // Применяем фильтры
                    applyFilters();
                });
            })
        }

        // Инициализируем кнопку "All" как активную
        applyFilters();

    } catch (error) {
        throw error;
    }
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
        // Используем JSONPlaceholder для тестирования
        // В реальном проекте замените на ваш WordPress API endpoint
        const response = await fetch(`${API_BASE_URL}/posts/${bookId}`);
        if (!response.ok) throw new Error('Failed to fetch book');
        
        const data = await response.json();
        
        // Получаем данные из карточки каталога
        const bookCard = document.querySelector(`[data-type="book"][data-id="${bookId}"]`);
        const bookImage = bookCard?.querySelector('.catalog__card--image img')?.src || '';
        const bookTitle = bookCard?.querySelector('.catalog__card--title')?.textContent || data.title;
        const bookAuthor = bookCard?.querySelector('.catalog__card--author')?.textContent || 'by Larisa Seklitova & Lyudmila Strelnikova';
        const bookExcerpt = bookCard?.querySelector('.catalog__card--excerpt')?.textContent || 'Beyond the Unknown';
        
        // Заполняем модальное окно данными
        fillBookModal(target, {
            id: data.id,
            title: bookTitle,
            author: bookAuthor,
            excerpt: bookExcerpt,
            description: data.body,
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
    const imageEl = target.querySelector('.book-modal__img');
    const excerptEl = target.querySelector('.book-modal__excerpt');
    const titleEl = target.querySelector('.book-modal__title');
    const authorEl = target.querySelector('.book-modal__author');
    const descriptionEl = target.querySelector('.book-modal__description');
    const buyBtn = target.querySelector('.book-modal__buy');
    
    if (imageEl && data.image) {
        imageEl.src = data.image;
        imageEl.alt = data.title;
    }
    
    if (excerptEl) {
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
    
    if (buyBtn) {
        buyBtn.addEventListener('click', () => {
            // Здесь будет логика покупки
            console.log('Buy book:', data.id);
        });
    }
}

/**
 * Показ загрузчика
 */
function showLoader(target) {
    target.innerHTML = '<div class="modal-loader">Loading...</div>';
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