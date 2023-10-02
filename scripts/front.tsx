import domReady from '@wordpress/dom-ready';
import jQuery from 'jquery';

export const DataName = 'query-params-conditional-visibility';

const currentURL = new URL(window.location.href);

domReady(function () {
	jQuery('.site')
		.find(`[data-${DataName}]`)
		.map(function () {
			const $block = jQuery(this);
			const data = $block.data(DataName);
			const hide = Object.entries(data)
				.map(
					([key, value]: [string, unknown]): boolean =>
						currentURL.searchParams.get(key) !== value
				)
				.reduce((a: boolean, b: boolean) => a && b, true);

			if (hide) {
				const $parents = $block.parents().get();
				$block.remove();
				return $parents;
			} else {
				$block.removeAttr(`data-${DataName}`);
				return null;
			}
		})
		.filter(function () {
			return jQuery(this).text().trim() === '';
		})
		.remove();
});
