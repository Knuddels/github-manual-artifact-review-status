import * as React from "react";
import { Model } from "../model";
import classnames = require("classnames");
import { observer } from "mobx-react";
import { hotComponent } from "../utils/hotComponent";

@hotComponent(module)
@observer
export class MainView extends React.Component<{ model: Model }, {}> {
	render() {
		const model = this.props.model;

		return (
			<div
				className="component-MainView"
				style={{ display: "flex", flexDirection: "column" }}
			>
				<div
					style={{
						margin: 0,
						padding: 10,
						borderBottom: "black solid 1px",
					}}
				>
					<div
						style={{
							display: "flex",
						}}
					>
						<button
							onClick={() => model.accept()}
							style={{ color: "green" }}
						>
							Accept
						</button>
						<div style={{ width: 10 }} />
						<button
							style={{ color: "red" }}
							onClick={() => model.reject()}
						>
							Reject
						</button>
						<div style={{ width: 10 }} />
						<div>{model.reviewMessage}</div>
					</div>
				</div>
				<div style={{ flex: 1 }} className="part-iframe-div">
					{/*
					<iframe className="part-iframe" src={model.subjectUrl} />
					*/}
				</div>
			</div>
		);
	}
}
