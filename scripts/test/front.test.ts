import { DataName, shouldHideBlock, applyVisibility } from '../front';

describe('shouldHideBlock', () => {
	it('shows the block when its single condition matches the current URL', () => {
		expect(
			shouldHideBlock(
				{ utm_source: 'ads' },
				new URLSearchParams('utm_source=ads')
			)
		).toBe(false);
	});

	it('hides the block when its single condition is present but does not match', () => {
		expect(
			shouldHideBlock(
				{ utm_source: 'ads' },
				new URLSearchParams('utm_source=organic')
			)
		).toBe(true);
	});

	it('hides the block when its single condition is absent from the URL entirely', () => {
		expect(
			shouldHideBlock({ utm_source: 'ads' }, new URLSearchParams(''))
		).toBe(true);
	});

	it('shows the block if any one of several conditions matches (OR semantics)', () => {
		expect(
			shouldHideBlock(
				{ utm_source: 'ads', debug: '1' },
				new URLSearchParams('debug=1')
			)
		).toBe(false);
	});

	it('hides the block when none of several conditions match', () => {
		expect(
			shouldHideBlock(
				{ utm_source: 'ads', debug: '1' },
				new URLSearchParams('other=1')
			)
		).toBe(true);
	});

	it('treats an empty conditions object as "hide" (dead path in practice: the editor never attaches the data attribute for empty conditions, see attributes.test.ts)', () => {
		expect(shouldHideBlock({}, new URLSearchParams(''))).toBe(true);
	});
});

describe('applyVisibility', () => {
	function setLocation(href: string) {
		window.history.pushState({}, '', href);
	}

	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('removes a block whose condition does not match the current URL', () => {
		setLocation('http://localhost/');
		document.body.innerHTML = `
			<div class="site">
				<div data-${DataName}='{"utm_source":"ads"}'>Hidden</div>
			</div>
		`;

		applyVisibility();

		expect(document.body.innerHTML).not.toContain('Hidden');
	});

	it('keeps a matching block visible and strips its data attribute', () => {
		setLocation('http://localhost/?utm_source=ads');
		document.body.innerHTML = `
			<div class="site">
				<div data-${DataName}='{"utm_source":"ads"}'>Visible</div>
			</div>
		`;

		applyVisibility();

		const block = document.querySelector('.site > div');
		expect(block?.textContent).toBe('Visible');
		expect(block?.hasAttribute(`data-${DataName}`)).toBe(false);
	});

	it('removes an ancestor wrapper left with no content after the block is removed', () => {
		setLocation('http://localhost/');
		document.body.innerHTML = `
			<div class="site">
				<div class="wrapper">
					<div data-${DataName}='{"utm_source":"ads"}'>Hidden</div>
				</div>
			</div>
		`;

		applyVisibility();

		expect(document.querySelector('.wrapper')).toBeNull();
	});

	it('does not remove an ancestor that still has non-text content (e.g. an image)', () => {
		setLocation('http://localhost/');
		document.body.innerHTML = `
			<div class="site">
				<div class="wrapper">
					<img src="kept.png" alt="kept" />
					<div data-${DataName}='{"utm_source":"ads"}'>Hidden</div>
				</div>
			</div>
		`;

		applyVisibility();

		expect(document.querySelector('.wrapper')).not.toBeNull();
		expect(document.querySelector('img[src="kept.png"]')).not.toBeNull();
	});

	it('never removes the site root or anything above it, even if everything below ends up empty', () => {
		setLocation('http://localhost/');
		document.body.innerHTML = `
			<div class="site">
				<div data-${DataName}='{"utm_source":"ads"}'>Hidden</div>
			</div>
		`;

		applyVisibility();

		expect(document.querySelector('.site')).not.toBeNull();
		expect(document.body).not.toBeNull();
		expect(document.documentElement).not.toBeNull();
	});
});
