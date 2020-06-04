import {
	AnchorButton,
	Button,
	Card,
	Elevation,
	FormGroup,
	InputGroup,
} from "@blueprintjs/core";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import { Model } from "../model";

@observer
export class TokenInputView extends React.Component<{ model: Model }> {
	@observable currentEditedToken: string | undefined;

	get currentToken(): string {
		if (this.currentEditedToken !== undefined) {
			return this.currentEditedToken;
		}
		return this.props.model.githubAccessToken || "";
	}

	@action.bound
	private submitToken() {
		this.props.model.submitTokenInputView(this.currentToken);
		this.currentEditedToken = undefined;
	}

	render() {
		return (
			<Card elevation={Elevation.FOUR} interactive={false}>
				<h1>Github Token</h1>
				<FormGroup label="Please enter a personal access token">
					<InputGroup
						leftIcon="key"
						placeholder={"Your Github Token"}
						value={this.currentToken}
						onChange={
							((val) =>
								(this.currentEditedToken =
									val.currentTarget.value)) as React.FormEventHandler<
								HTMLInputElement
							>
						}
					/>
				</FormGroup>
				<div style={{ display: "flex" }}>
					<AnchorButton
						href="https://github.com/settings/tokens/new?scopes=repo:status&description=Manual%20Artifact%20Review%20Status"
						rightIcon="share"
						target="_blank"
					>
						Create a new Token
					</AnchorButton>
					<div style={{ flex: 1 }} />
					<Button
						intent="primary"
						rightIcon="log-in"
						onClick={this.submitToken}
					>
						Save
					</Button>
				</div>
			</Card>
		);
	}
}
