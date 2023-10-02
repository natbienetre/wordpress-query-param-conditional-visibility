import React from 'react';
import { __ } from '@wordpress/i18n';
import { cancelCircleFilled, plusCircleFilled } from '@wordpress/icons';

import {
	BaseControl,
	Button,
	__experimentalGrid as Grid,
	__experimentalItemGroup as ItemGroup,
	__experimentalInputControl as InputControl,
	__experimentalItem as Item,
} from '@wordpress/components';

type Props = {
	attributes: {
		queryParamsConditionalVisibility: Record<string, string>;
	};
	setAttributes: (attributes: {
		queryParamsConditionalVisibility: Record<string, string>;
	}) => void;
};

class QueryParameterControl extends React.Component {
	onAdd: (queryKey: string, queryValue: string) => void;
	onDelete: (queryKey: string) => void;
	onChange: (queryKey: string, queryValue: string) => void;

	state: {
		queryKey: string;
		queryValue: string;
	};

	constructor({ queryKey, queryValue, onAdd, onDelete, onChange, ...props }) {
		super(props);
		this.state = {
			queryKey,
			queryValue,
		};
		this.onAdd = (...args) => {
			onAdd(...args);
			this.setState({ queryKey: '', queryValue: '' });
		};
		this.onDelete = onDelete;
		this.onChange = onChange || (() => null);
	}

	isNew() {
		return !this.onDelete;
	}

	render() {
		return (
			<Grid columns={3} templateColumns="auto auto max-content">
				<InputControl
					placeholder={__(
						'query',
						'query-params-conditional-visibility'
					)}
					value={this.state.queryKey}
					onChange={(queryKey) => {
						this.setState({ queryKey });
						this.onChange(
							this.state.queryKey,
							this.state.queryValue
						);
					}}
				/>
				<InputControl
					placeholder={__(
						'value',
						'query-params-conditional-visibility'
					)}
					value={this.state.queryValue}
					onChange={(queryValue) => {
						this.setState({ queryValue });
						this.onChange(
							this.state.queryKey,
							this.state.queryValue
						);
					}}
				/>
				{this.isNew() ? (
					<Button
						variant="link"
						icon={plusCircleFilled}
						onClick={() =>
							this.onAdd(
								this.state.queryKey,
								this.state.queryValue
							)
						}
					/>
				) : (
					<Button
						variant="link"
						icon={cancelCircleFilled}
						onClick={() => {
							if (this.onDelete) {
								this.onDelete(this.state.queryKey);
							}
						}}
					/>
				)}
			</Grid>
		);
	}
}

class QueryParameters extends React.Component {
	setAttributes: (attributes: {
		queryParamsConditionalVisibility: Record<string, string>;
	}) => void;

	state: {
		conditions: Record<string, string>;
	};

	constructor(props: Props) {
		super(props);

		const { attributes, setAttributes } = props;

		this.setAttributes = setAttributes;
		this.state = {
			conditions: attributes.queryParamsConditionalVisibility || {},
		};
	}

	setState(state: { conditions: Record<string, string> }) {
		super.setState(state);
		this.setAttributes({
			queryParamsConditionalVisibility: state.conditions,
		});
	}

	add(queryKey: string, queryValue: string) {
		const conditions = {
			...this.state.conditions,
			[queryKey]: queryValue,
		};

		this.setState({ conditions });
	}

	remove(queryKey: string) {
		const conditions = Object.fromEntries(
			Object.entries(this.state.conditions).filter(
				([key]) => key !== queryKey
			)
		);

		this.setState({ conditions });
	}

	update(oldKey: string, newKey: string, value: string) {
		this.remove(oldKey);
		this.add(newKey, value);
	}

	render() {
		return (
			<BaseControl
				__nextHasNoMarginBottom={true}
				label={__('Query Parameters', 'blocks-components')}
				id="query-params-conditional-visibility-query-params"
			>
				<ItemGroup>
					{Object.entries(this.state.conditions).map(
						([key, value]) => (
							<Item key={key}>
								<QueryParameterControl
									queryKey={key}
									queryValue={value}
									onChange={(queryKey, queryValue) => {
										this.update.bind(this)(
											key,
											queryKey,
											queryValue
										);
									}}
									onDelete={this.remove.bind(this)}
								/>
							</Item>
						)
					)}
					<Item>
						<QueryParameterControl onAdd={this.add.bind(this)} />
					</Item>
				</ItemGroup>
			</BaseControl>
		);
	}
}

export function edit(props: Props) {
	// const blockProps = useBlockProps();
	return <QueryParameters {...props} />;
}
