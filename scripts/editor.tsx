import React from 'react';

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { PanelRow } from '@wordpress/components';
import { InspectorAdvancedControls } from '@wordpress/block-editor';

import { edit as QueryParametersEdit } from './query-params-editor';
import { DataName } from './front';

function register(settings) {
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
addFilter('blocks.registerBlockType', 'blocks-components/register', register);

const save = (element, _, attributes) => {
	if (!element || !attributes.queryParamsConditionalVisibility) {
		return element;
	}

	if (!Object.keys(attributes.queryParamsConditionalVisibility).length) {
		return element;
	}

	const newAttributes = {
		[`data-${DataName}`]: JSON.stringify(attributes.queryParamsConditionalVisibility),
	};


	return React.cloneElement(element, newAttributes);
};
addFilter('blocks.getSaveElement', 'blocks-components/save-element', save);

const edit = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		return (
			<>
				<BlockEdit {...props} />
				<InspectorAdvancedControls>
					<PanelRow>
						<QueryParametersEdit {...props} />
					</PanelRow>
				</InspectorAdvancedControls>
			</>
		);
	};
}, 'withInspectorControl');
addFilter('editor.BlockEdit', 'blocks-components/edit-element', edit);
