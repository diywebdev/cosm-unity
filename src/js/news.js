// API base URL
const API_BASE_URL = window.location.hostname === 'localhost' ? `/` : `/cosm-unity/`;

const preloader = document.querySelector('.news .preloader');

// console.log(flatpickr.l10ns);

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
        setTimeout(() => {
            preloader.classList.add('hidden');
            // if(!dateStr){
                instance.close();
            // }
        }, 2000);
    },
});