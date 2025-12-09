import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.mjs';

const catalogSlider = new Swiper(".catalog__slider", {
	loop: false,
	breakpoints: {
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

const reviewsSlider = new Swiper(".reviews__slider", {
	loop: false,
	pagination: {
		el: '.reviews__slider--pagination',
		clickable: true,
		type: 'fraction',
	},
	navigation: {
		nextEl: '.reviews__slider--next',
		prevEl: '.reviews__slider--prev',
	},
	breakpoints: {
		320: {
			slidesPerView: 1,
			spaceBetween: 20,
		},
		640: {
			slidesPerView: 2,
			spaceBetween: 20,
		},
		768: {
			slidesPerView: 1,
			spaceBetween: 20,
		}
	}
});

const authorsSlider = new Swiper(".authors__slider", {
	loop: false,
	autoHeight: false,
	pagination: {
		el: '.authors__slider--pagination',
		clickable: true,
		type: 'fraction',
	},
	navigation: {
		nextEl: '.authors__slider--next',
		prevEl: '.authors__slider--prev',
	},
	breakpoints: {
		320: {
			slidesPerView: 1,
			spaceBetween: 20,
		},
		1024: {
			slidesPerView: 1.11,
			spaceBetween: 50,
		}
	}
});