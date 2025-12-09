import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.mjs';

// API base URL
const API_BASE_URL = window.location.hostname === 'localhost' ? `/` : `/cosm-unity/`;

const preloader = document.querySelector('.news .preloader');

// console.log(flatpickr.l10ns);

const newsSlider = new Swiper(".news__slider", {
    loop: false,
    navigation: {
        nextEl: '.news__slider--next',
        prevEl: '.news__slider--prev',
    },
    breakpoints: {
        320: {
            slidesPerView: 1.3,
            spaceBetween: 20,
        },
        640: {
            slidesPerView: 2.2,
            spaceBetween: 30,
        },
        1024: {
            slidesPerView: 3,
            spaceBetween: 50,
        },
        1200: {
            slidesPerView: 3,
            spaceBetween: 110,
        }
    }
});


const modalNewsSlider = new Swiper(".news-modal__slider", {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
        el: '.news-modal__slider--pagination',
        clickable: true,
        type: 'fraction',
    },
    navigation: {
        nextEl: '.news-modal__slider--next',
        prevEl: '.news-modal__slider--prev',
    },
});

Object.keys(flatpickr.l10ns).forEach(localeKey => {
    flatpickr.l10ns[localeKey].firstDayOfWeek = 1;
});

const newsCalendar = flatpickr(".news__archive--link", {
    locale: calendarSettings.locale,
    mode: "multiple",
    enable: calendarSettings.enabledDates,
    maxDate: [...calendarSettings.enabledDates].sort().pop() || null,
    minDate: [...calendarSettings.enabledDates].sort()[0] || null,
    onChange: function(selectedDates, dateStr, instance) {        
        preloader.classList.remove('hidden');
        console.log(dateStr);
        
        setTimeout(() => {
            preloader.classList.add('hidden');
            // if(!dateStr){
                instance.close();
            // }
        }, 2000);
    },
});

function reRenderNewsSliders(target, data, template){
    if(!target || !data || !template) return;
}