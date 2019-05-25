import { SiteState } from "./site-state";
import { UserEventType } from "../user-event-type";
import { PagePoint } from "./page-point";
import { PageEvent } from "./event";

export interface UserEvent extends PageEvent {
    screenData?: PagePoint | Screen;
    type: UserEventType;
}