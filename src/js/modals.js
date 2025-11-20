const popupLinks = document.querySelectorAll(".popup-link");
const closeModalBtns = document.querySelectorAll(".close-modal-btn");

if(popupLinks.length){
    popupLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
			let id = link.getAttribute("href");
			if (id === "#" || !id) return;
			const targetModal = document.getElementById(id.replace("#", ""));
			if (!targetModal) return;

            const type = link.dataset.type;
            if(!type) return;

            const targetModalContent = targetModal.querySelector('.modal__content');
            if(!targetModalContent) return;

            switch (type) {
                case 'review':
                    setDataReviewModal(link, targetModalContent);
                    break;
            
                default:
                    break;
            }

            targetModal.classList.add("is-active");
            document.documentElement.classList.add('is-lock');
        };
    });
}

function setDataReviewModal(link, target){
    const content = link.closest('div').querySelector('.reviews__slide--wrapper');
    if(!content) return;
    target.insertAdjacentElement('afterbegin', content.cloneNode(true));   
}

closeModalBtns.forEach(btn => {
    btn.onclick = (e) => {
        e.preventDefault();
        const targetModal = btn.closest('.modal');
        if(!targetModal) return;
        targetModal.querySelector('.modal__content').innerHTML = '';
        targetModal.classList.remove('is-active');
        document.documentElement.classList.remove('is-lock');
    };
});