import * as React from "react";
import { Model } from "./Model";
import classnames = require("classnames");
import { observer, disposeOnUnmount } from "mobx-react";

@observer
export class GUI extends React.Component<{ model: Model }, {}> {
    render() {
        return <div>test</div>;
    }
}
