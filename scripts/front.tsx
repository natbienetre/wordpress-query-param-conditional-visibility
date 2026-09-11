import domReady from '@wordpress/dom-ready';
import jQuery from 'jquery';

export const DataName = 'query-params-conditional-visibility';

/**
 * A block is shown if at least one of its stored conditions matches the
 * current URL's query string (OR semantics across conditions). It is
 * hidden only if none of its conditions match.
 *
 * @param {Object}          conditions   Map of query-param key to the value that shows the block.
 * @param {URLSearchParams} searchParams The current URL's query string.
 * @return {boolean} Whether the block should be hidden.
 */
export function shouldHideBlock(
	conditions: Record<string, unknown>,
	searchParams: URLSearchParams
): boolean {
	return Object.entries(conditions)
		.map(
			([key, value]: [string, unknown]): boolean =>
				searchParams.get(key) !== value
		)
		.reduce((a: boolean, b: boolean) => a && b, true);
}

/**
 * Whether an element still has meaningful, non-text content (for example an
 * image or embedded media) that should prevent it from being treated as
 * "empty" and removed during ancestor cleanup.
 *
 * @param {Object} $element Element to check.
 * @return {boolean} Whether the element has non-text content.
 */
function hasNonTextContent($element: JQuery): boolean {
	return (
		$element.find('img, svg, video, audio, iframe, canvas, embed, object')
			.length > 0
	);
}

domReady(applyVisibility);

export function applyVisibility() {
	const currentURL = new URL(window.location.href);

	jQuery('.site')
		.find(`[data-${DataName}]`)
		.map(function () {
			const $block = jQuery(this);
			const data = $block.data(DataName);
			const hide = shouldHideBlock(data, currentURL.searchParams);

			if (hide) {
				// Only consider ancestors below the site root for cleanup, and
				// never remove one that still has non-text content.
				const $parents = $block
					.parents()
					.filter(
						(_, el) =>
							!jQuery(el).is('.site') &&
							jQuery(el).parents('.site').length > 0
					)
					.get();
				$block.remove();
				return $parents;
			}

			$block.removeAttr(`data-${DataName}`);
			return null;
		})
		.filter(function () {
			const $el = jQuery(this);
			return $el.text().trim() === '' && !hasNonTextContent($el);
		})
		.remove();
}
