const $siteHeader = document.querySelector('.header');

if(document.body.getBoundingClientRect().top !== 0) {
    $siteHeader.classList.add('fixed');
}

document.addEventListener('scroll', () => {    
    if (window.scrollY > 10) {
        $siteHeader.classList.add('fixed');
    } else {
        $siteHeader.classList.remove('fixed');
    }
});

// MENU

const menuBtn = document.querySelector('.menu-btn');
const closeMenuBtn = document.querySelector('.close-menu-btn');
const menuWrapper = document.querySelector('.header__nav--wrapper');

menuBtn.addEventListener('click', () => {
    menuWrapper.classList.add('isActive');
    document.documentElement.classList.add('is-lock');
});

closeMenuBtn.addEventListener('click', () => {
    if(menuWrapper.classList.contains('isActive')) {
        menuWrapper.classList.remove('isActive');
        document.documentElement.classList.remove('is-lock');
    };
});

// SEARCH
const searchBtn = document.querySelector('.search-button');
const searchForm = document.querySelector('.search-form');

searchBtn.addEventListener('click', () => {
    searchForm.classList.toggle('isActive');
    setTimeout(() => {
        if(searchForm.classList.contains('isActive')) {
            searchForm.classList.add('open');
            searchForm.querySelector('input').focus();
        }else{
            searchForm.classList.remove('open');
            searchForm.reset();
        }
    }, 0);
});

document.addEventListener('click', (e) => {    
    if(!e.target.closest('.search-button') && !e.target.closest('.search-form')) {
        if(searchForm.classList.contains('isActive')) {
            searchForm.classList.remove('isActive');
            searchForm.classList.remove('open');
            searchForm.reset();
        };
    };
});

document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') {
        searchForm.classList.remove('open');
        searchForm.classList.remove('isActive');
    };
});

// About books

const hiddenAboutBooksItems = () => {
    const aboutBooksItems = document.querySelectorAll('.about-books__list ol li');
    if(aboutBooksItems.length > 5) {
        aboutBooksItems.forEach((item, index) => {
            if(index > 4 && window.innerWidth <= 767) {
                item.classList.add('hidden');
            }else{
                item.classList.remove('hidden');
            }
        });
    }
}

hiddenAboutBooksItems();

window.addEventListener('resize', hiddenAboutBooksItems);
