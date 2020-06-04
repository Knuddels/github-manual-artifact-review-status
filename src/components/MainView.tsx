import {
	AnchorButton,
	Button,
	ControlGroup,
	IconName,
	InputGroup,
	Overlay,
} from "@blueprintjs/core";
import { observer } from "mobx-react";
import * as React from "react";
import { Model } from "../model";
import { hotComponent } from "../utils/hotComponent";
import { TokenInputView } from "./TokenInputView";

@hotComponent(module)
@observer
export class MainView extends React.Component<{ model: Model }, {}> {
	render() {
		const model = this.props.model;

		function getIcon(
			targetState: "pending" | "success" | "error" | "failure"
		): IconName {
			if (model.state.kind === "noData") {
				return "updated";
			} else if (model.state.kind === "loading") {
				return "updated";
			} else if (model.state.kind === "loaded") {
				if (model.state.state === targetState) {
					return "full-circle";
				} else {
					return "circle";
				}
			}
			throw new Error();
		}

		return (
			<div
				className="component-MainView"
				style={{ display: "flex", flexDirection: "column" }}
			>
				<Overlay isOpen={model.isTokenViewOpen}>
					<div
						style={{
							left: "calc(50vw - 200px)",
							margin: "10vh 0",
							top: 0,
							width: 400,
						}}
					>
						<TokenInputView model={model} />
					</div>
				</Overlay>
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
							alignItems: "center",
						}}
					>
						<Button
							intent="warning"
							icon={getIcon("pending")}
							onClick={model.markEnding}
						>
							Pending
						</Button>

						<div style={{ width: 10 }} />

						<Button
							intent="success"
							icon={getIcon("success")}
							onClick={model.markAccepted}
						>
							Accept
						</Button>

						<div style={{ width: 10 }} />

						<Button
							intent="danger"
							icon={getIcon("error")}
							onClick={model.markReject}
						>
							Reject
						</Button>

						<div style={{ width: 20 }} />

						<div>{model.reviewMessage}</div>

						<div style={{ width: 20 }} />

						<ControlGroup fill={true} vertical={false}>
							<Button>Message</Button>
							<InputGroup
								intent={
									model.isDecriptionModified
										? "primary"
										: "none"
								}
								value={model.description}
								onChange={
									((val) =>
										model.setDescription(
											val.currentTarget.value
										)) as React.FormEventHandler<
										HTMLInputElement
									>
								}
							/>
						</ControlGroup>
						<div style={{ flex: 1 }} />

						<AnchorButton
							icon={"share"}
							href={model.subjectUrlExternal}
							target="_blank"
						>
							Open External URL
						</AnchorButton>

						<div style={{ width: 10 }} />
						<Button
							minimal
							onClick={model.openTokenInputView}
							icon={"key"}
						/>
					</div>
				</div>
				<div style={{ flex: 1 }} className="part-iframe-div">
					<iframe className="part-iframe" src={model.subjectUrl} />
				</div>
			</div>
		);
	}
}
