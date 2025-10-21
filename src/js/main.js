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

