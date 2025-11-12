import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.mjs';

const catalogSlider = new Swiper(".catalog__slider", {
    loop: false,
    breakpoints: {
    // when window width is >= 320px
    320: {
        grid: {
            rows: 1,
            fill: 'row'
        },
        slidesPerView: 1.4,
        spaceBetween: 20
    },
    480: {
        grid: {
            rows: 1,
            fill: 'row'
        },
        slidesPerView: 2.6,
        spaceBetween: 20
    },
    // when window width is >= 480px
    768: {
        grid: {
            rows: 4,
            fill: 'row'
        },
        slidesPerView: 3,
        spaceBetween: 40
    },
    1024: {
        grid: {
            rows: 3,
            fill: 'row'
        },
        slidesPerView: 4,
        spaceBetween: 40
    },
    // when window width is >= 640px
    1200: {
        grid: {
            rows: 2,
            fill: 'row'
        },
        slidesPerView: 5,
        spaceBetween: 40
    }
  }
});