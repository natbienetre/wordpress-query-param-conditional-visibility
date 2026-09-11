import React from 'react';

import { DataName } from './front';

/**
 * Adds the queryParamsConditionalVisibility attribute to every block's
 * settings, so any block can carry query-param visibility conditions.
 *
 * Kept in its own module (rather than inline in editor.tsx) so it can be
 * unit tested without pulling in the editor UI's heavier dependency tree
 * (@wordpress/components, @wordpress/block-editor, etc.).
 *
 * @param {Object} settings Block settings being registered.
 * @return {Object} Block settings with the attribute added.
 */
export function register(settings) {
	return {
		...settings,
		attributes: {
			...settings.attributes,
			queryParamsConditionalVisibility: {
				type: 'object',
				default: {},
			},
		},
	};
}

/**
 * Serializes a block's queryParamsConditionalVisibility attribute onto its
 * saved markup as a data attribute, so scripts/front.tsx can read it on the
 * front end. Leaves the element untouched when there are no conditions.
 *
 * @param {Object|null} element    The block's save element.
 * @param {Object}      _blockType The block's type (unused).
 * @param {Object}      attributes The block's attributes.
 * @return {Object|null} The element, cloned with the data attribute when conditions are set.
 */
export function save(element, _blockType, attributes) {
	if (!element || !attributes.queryParamsConditionalVisibility) {
		return element;
	}

	if (!Object.keys(attributes.queryParamsConditionalVisibility).length) {
		return element;
	}

	const newAttributes = {
		[`data-${DataName}`]: JSON.stringify(
			attributes.queryParamsConditionalVisibility
		),
	};

	return React.cloneElement(element, newAttributes);
}
