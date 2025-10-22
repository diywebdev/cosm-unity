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

// window.addEventListener('resize', () => {
//     // this.open = false;
//     // hideHeaderPos = $siteHeader.querySelector('header').clientHeight;
// });


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

