import "./index.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { UserExperienceViewer } from "./viewer/user-experience-viewer";


export function showRootComponent(component: React.ReactElement<any>) {
    ReactDOM.render(component, document.getElementById("app"));
}

showRootComponent(<UserExperienceViewer />);