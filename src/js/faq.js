const faqItems = document.querySelectorAll('.faq__item');

if(faqItems.length > 0) {
    faqItems.forEach((item) => {
        item.querySelector('.faq__item--head').addEventListener('click', () => {
            if(item.classList.contains('is-active')) {
                item.classList.remove('is-active');
            }else{
                faqItems.forEach((el) => {
                    el.classList.remove('is-active');
                });
                item.classList.add('is-active');
            }
        });
    });
}