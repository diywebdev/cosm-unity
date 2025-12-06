
class Tooltip {
	constructor(selector = '.tooltip', triggerSelector = '.catalog__card--link img'){
		this.el = document.querySelector(selector);
		this.triggers = Array.from(document.querySelectorAll(triggerSelector));
		this.offset = 12; // px
		this.delay = 300; // ms — bounce delay
		this.catalog = null;
		this.showTimer = null;
		this.lastX = 0;
		this.lastY = 0;

		if(!this.el || !this.triggers.length) return;

		this._boundOnEnter = this._onEnter.bind(this);
		this._boundOnMove = this._onMove.bind(this);
		this._boundOnLeave = this._onLeave.bind(this);

		this._enabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

		if(!this._enabled) return;

		this._loadCatalog();

		this.triggers.forEach(t => {
			t.addEventListener('mouseenter', this._boundOnEnter);
			t.addEventListener('mousemove', this._boundOnMove);
			t.addEventListener('mouseleave', this._boundOnLeave);
		});
	}

	async _loadCatalog(){
		try {
            const API_BASE_URL = window.location.hostname === 'localhost' ? `/` : `/cosm-unity/`;
			const response = await fetch(`${API_BASE_URL}catalog.json`);
			this.catalog = await response.json();
		} catch(err) {
			console.error('Failed to load catalog:', err);
		}
	}

	_getBookDataById(id){
		if(!this.catalog) return null;
		return this.catalog.find(item => item.id === parseInt(id));
	}

	_updateTooltipContent(bookData){
		if(!bookData) return;
		const contentEl = this.el.querySelector('.tooltip__content');
		if(contentEl){
			contentEl.innerHTML = bookData.exerpt || '';
		}
	}

	_onEnter(e){
		this.lastX = e.clientX;
		this.lastY = e.clientY;

		// clear any existing timer
		if(this.showTimer) clearTimeout(this.showTimer);

		// set delay before showing
		this.showTimer = setTimeout(() => {
			// get parent link and extract data-id
			const link = e.target.closest('.catalog__card--link');
			if(link){
				const bookId = link.getAttribute('data-id');
				const bookData = this._getBookDataById(bookId);
				this._updateTooltipContent(bookData);
			}
			this._positionOnce(e);
			this.showTimer = null;
		}, this.delay);
	}

	_onMove(e){
		const x = e.clientX;
		const y = e.clientY;

		// if mouse moved significantly, reset the timer
		const dx = x - this.lastX;
		const dy = y - this.lastY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if(distance > 2){
			this.lastX = x;
			this.lastY = y;

			// reset timer if tooltip not yet shown
			if(this.showTimer){
				clearTimeout(this.showTimer);
				this.showTimer = setTimeout(() => {
					const link = e.target.closest('.catalog__card--link');
					if(link){
						const bookId = link.getAttribute('data-id');
						const bookData = this._getBookDataById(bookId);
						this._updateTooltipContent(bookData);
					}
					this._positionOnce(e);
					this.showTimer = null;
				}, this.delay);
			}
		}
	}

	_positionOnce(e){
		const tooltip = this.el;
		const {clientX: x, clientY: y} = e;
		const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

		// ensure tooltip is visible to measure
		tooltip.style.visibility = 'hidden';
		tooltip.classList.add('is-active');
		const tw = tooltip.offsetWidth;
		const th = tooltip.offsetHeight;

		// available spaces
		const space = {
			top: y,
			bottom: vh - y,
			left: x,
			right: vw - x
		};

		// prefer a side that fits the tooltip, fallback to the largest space
		// decide vertical and horizontal sides separately
		let vertical = null;
		if (space.bottom >= th + this.offset) vertical = 'bottom';
		else if (space.top >= th + this.offset) vertical = 'top';
		else {
			// neither side fully fits — choose the one with minimal overflow
			const overflowBottom = (th + this.offset) - space.bottom; // >0
			const overflowTop = (th + this.offset) - space.top; // >0
			vertical = overflowBottom <= overflowTop ? 'bottom' : 'top';
		}

		let horizontal = null;
		if (space.right >= tw + this.offset) horizontal = 'right';
		else if (space.left >= tw + this.offset) horizontal = 'left';
		// else horizontal = space.right >= space.left ? 'right' : 'left';
		else {
			const overflowRight = (tw + this.offset) - space.right;
			const overflowLeft = (tw + this.offset) - space.left;
			horizontal = overflowRight <= overflowLeft ? 'right' : 'left';
		}

		// remove old side classes and add new (two classes: vertical + horizontal)
		tooltip.classList.remove('top','right','bottom','left');
		tooltip.classList.add(vertical);
		tooltip.classList.add(horizontal);

		// calculate position using corner anchoring (corner nearest cursor)
		let top = 0, left = 0;
		const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

		if(vertical === 'bottom' && horizontal === 'right'){
			left = x + this.offset; // anchor top-left corner
			top = y + this.offset;
		} else if(vertical === 'bottom' && horizontal === 'left'){
			left = x - tw - this.offset; // anchor top-right corner
			top = y + this.offset;
		} else if(vertical === 'top' && horizontal === 'right'){
			left = x + this.offset; // anchor bottom-left corner
			top = y - th - this.offset;
		} else { // top + left
			left = x - tw - this.offset; // anchor bottom-right corner
			top = y - th - this.offset;
		}

		// clamp to viewport
		left = clamp(left, 8, vw - tw - 8);
		top = clamp(top, 8, vh - th - 8);

		tooltip.style.left = Math.round(left) + 'px';
		tooltip.style.top = Math.round(top) + 'px';
		tooltip.style.visibility = '';
	}

	_onLeave(){
		// cancel pending timer
		if(this.showTimer){
			clearTimeout(this.showTimer);
			this.showTimer = null;
		}
		this.hide();
	}

	show(){
		this.el.classList.add('is-active');
	}

	hide(){
		this.el.classList.remove('is-active','top','right','bottom','left');
		this.el.style.left = '';
		this.el.style.top = '';
	}

	destroy(){
		this.triggers.forEach(t => {
			t.removeEventListener('mouseenter', this._boundOnEnter);
			t.removeEventListener('mousemove', this._boundOnMove);
			t.removeEventListener('mouseleave', this._boundOnLeave);
		});
	}
}

// Initialize when DOM ready
if(document.readyState === 'loading'){
	document.addEventListener('DOMContentLoaded', () => new Tooltip());
} else {
	new Tooltip();
}

