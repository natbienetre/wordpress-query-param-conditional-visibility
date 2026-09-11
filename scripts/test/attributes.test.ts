import React from 'react';

import { DataName } from '../front';
import { register, save } from '../attributes';

describe('register', () => {
	it('adds the queryParamsConditionalVisibility attribute to every block, defaulting to an empty object', () => {
		const settings = {
			name: 'core/paragraph',
			attributes: { content: {} },
		};

		const result = register(settings);

		expect(result.attributes.content).toBe(settings.attributes.content);
		expect(result.attributes.queryParamsConditionalVisibility).toEqual({
			type: 'object',
			default: {},
		});
	});

	it('preserves any other settings passed through unchanged', () => {
		const settings = { name: 'core/paragraph', save: () => null };

		const result = register(settings);

		expect(result.name).toBe('core/paragraph');
		expect(result.save).toBe(settings.save);
	});
});

describe('save', () => {
	it('returns the element unchanged when there is no queryParamsConditionalVisibility attribute at all', () => {
		const element = React.createElement('div', { className: 'x' });

		const result = save(element, {}, {});

		expect(result).toBe(element);
	});

	it('returns the element unchanged when queryParamsConditionalVisibility is empty', () => {
		const element = React.createElement('div', { className: 'x' });

		const result = save(
			element,
			{},
			{ queryParamsConditionalVisibility: {} }
		);

		expect(result).toBe(element);
	});

	it('returns null unchanged when there is no element to attach attributes to', () => {
		const result = save(
			null,
			{},
			{
				queryParamsConditionalVisibility: { utm_source: 'ads' },
			}
		);

		expect(result).toBeNull();
	});

	it('serializes non-empty conditions into a data attribute on a cloned element', () => {
		const element = React.createElement('div', { className: 'x' });
		const conditions = { utm_source: 'ads', debug: '1' };

		const result = save(
			element,
			{},
			{
				queryParamsConditionalVisibility: conditions,
			}
		);

		expect(result).not.toBe(element);
		expect(result.props.className).toBe('x');
		expect(result.props[`data-${DataName}`]).toBe(
			JSON.stringify(conditions)
		);
	});
});
