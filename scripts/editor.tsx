import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { PanelRow } from '@wordpress/components';
import { InspectorAdvancedControls } from '@wordpress/block-editor';

import { edit as QueryParametersEdit } from './query-params-editor';
import { register, save } from './attributes';

export { register, save };

addFilter('blocks.registerBlockType', 'blocks-components/register', register);
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
