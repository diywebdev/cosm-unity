// API base URL
const API_BASE_URL = window.location.hostname === 'localhost' ? `/` : `/cosm-unity/`;

/**
 * Установка данных для модального окна каталога
 */
async function setDataCatalogModal(target) {
    try {
        const response = await fetch(`${API_BASE_URL}catalog.json`);
        
        if (!response.ok) throw new Error('Failed to fetch catalog');
        
        const data = await response.json();

        // Генерируем HTML карточек каталога
        renderCatalogCards(target, data);

        // Генерируем фильтры
        generateCatalogFilters(target, data);

        // Инициализируем логику фильтрации
        initCatalogFiltering(target, data);

    } catch (error) {
        throw error;
    }
}

/**
 * Рендеринг карточек каталога
 */
function renderCatalogCards(target, data) {
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
}

/**
 * Генерирование фильтров каталога
 */
function generateCatalogFilters(target, data) {
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

    // Собираем уникальные комбинации авторов
    const authorCombinations = new Map();
    data.forEach(item => {
        const authorIds = item.author.map(a => a.id).sort().join(',');
        const authorNames = item.author.map(a => a.name).join(', ');
        if (!authorCombinations.has(authorIds)) {
            authorCombinations.set(authorIds, { names: authorNames, count: 0 });
        }
        authorCombinations.get(authorIds).count++;
    });

    // Обновляем чекбоксы языков
    updateFilterDropdown(target, 'lang', langMap);

    // Обновляем чекбоксы серий
    updateFilterDropdown(target, 'series', seriesMap);

    // Обновляем чекбоксы авторов
    updateAuthorFilterDropdown(target, authorCombinations);
}

/**
 * Обновление выпадающего списка фильтра
 */
function updateFilterDropdown(target, filterType, itemsMap) {
    const filterLabel = target.parentElement.querySelector(`[data-filter-type="${filterType}"]`);
    if (!filterLabel) return;

    const dropdown = filterLabel.querySelector('.catalog-filter__dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '';

    itemsMap.forEach((count, value) => {
        const label = document.createElement('label');
        label.className = 'catalog-filter__item';
        label.innerHTML = `
            <span class="catalog-filter__item--row">
                <input type="checkbox" class="visually-hidden catalog-checkbox" value="${value}">
                <span class="fake-checkbox"></span>
                <span class="catalog-filter__item--label">${value}</span>
            </span>
            <span class="catalog-filter__item--count">${count}</span>
        `;
        dropdown.appendChild(label);
    });
}

/**
 * Обновление фильтра авторов
 */
function updateAuthorFilterDropdown(target, authorCombinations) {
    const filterLabel = target.parentElement.querySelector('[data-filter-type="author"]');
    if (!filterLabel) return;

    const dropdown = filterLabel.querySelector('.catalog-filter__dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '';

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
        dropdown.appendChild(label);
    });

    // Удаляем класс is-active
    filterLabel.classList.remove('is-active');
}

/**
 * Инициализация логики фильтрации
 */
function initCatalogFiltering(target, data) {
    const filterElements = document.querySelectorAll('.catalog-checkbox');
    const allFilterBtn = target.parentElement.querySelector('[data-filter-type="all"]');
    const cards = document.querySelectorAll('.catalog-modal .catalog__card');

    const group = {
        lang: [],
        series: [],
        author: [],
    };

    /**
     * Применение фильтров
     */
    function applyFilters() {
        let visibleCount = 0;
        
        cards.forEach(card => {
            const langMatch = group.lang.length === 0 || group.lang.includes(card.dataset.lang);
            const seriesMatch = group.series.length === 0 || group.series.includes(card.dataset.series);
            
            // Для авторов проверяем совпадение комбинации ID
            let authorMatch = true;
            if (group.author.length > 0) {
                authorMatch = group.author.some(authorIds => {
                    return authorIds === card.dataset.authorIds;
                });
            }

            // Карточка видна только если соответствует всем активным фильтрам
            if (langMatch && seriesMatch && authorMatch) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Обработка сообщения об отсутствии результатов
        handleNoResultsMessage(target, visibleCount);

        // Обновляем состояние кнопки "All"
        updateAllButton(allFilterBtn, group);

        // Обновляем класс is-active для лейблов
        updateFilterLabelsState(target, group);
    }

    // Обработчик для кнопки "All"
    if (allFilterBtn) {
        allFilterBtn.addEventListener('click', () => {
            group.lang = [];
            group.series = [];
            group.author = [];

            filterElements.forEach(checkbox => {
                checkbox.checked = false;
            });

            applyFilters();
        });
    }

    // Обработчики изменения фильтров
    if (filterElements.length > 0) {
        filterElements.forEach((item) => {
            item.addEventListener('change', () => {
                const type = item.closest('.catalog-filter__label').dataset.filterType || 'all';
                const value = item.value;

                if (item.checked) {
                    if (!group[type].includes(value)) {
                        group[type].push(value);
                    }
                } else {
                    group[type] = group[type].filter(v => v !== value);
                }

                applyFilters();
            });
        });
    }

    // Инициализируем
    applyFilters();
}

/**
 * Обработка сообщения об отсутствии результатов
 */
function handleNoResultsMessage(target, visibleCount) {
    let noResultsMsg = document.querySelector('.catalog__no-results');
    
    if (visibleCount === 0) {
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
        if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }
}

/**
 * Обновление состояния кнопки "All"
 */
function updateAllButton(allFilterBtn, group) {
    if (!allFilterBtn) return;

    const hasActiveFilters = group.lang.length > 0 || group.series.length > 0 || group.author.length > 0;
    
    if (hasActiveFilters) {
        allFilterBtn.classList.remove('is-active');
    } else {
        allFilterBtn.classList.add('is-active');
    }
}

/**
 * Обновление класса is-active для лейблов фильтров
 */
function updateFilterLabelsState(target, group) {
    const langLabel = target.parentElement.querySelector('[data-filter-type="lang"]');
    const seriesLabel = target.parentElement.querySelector('[data-filter-type="series"]');
    const authorLabel = target.parentElement.querySelector('[data-filter-type="author"]');

    updateLabelState(langLabel, group.lang.length > 0);
    updateLabelState(seriesLabel, group.series.length > 0);
    updateLabelState(authorLabel, group.author.length > 0);
}

/**
 * Обновление состояния одного лейбла
 */
function updateLabelState(label, isActive) {
    if (!label) return;

    if (isActive) {
        label.classList.add('is-active');
    } else {
        label.classList.remove('is-active');
    }
}

export { setDataCatalogModal };
