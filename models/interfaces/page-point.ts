import { GridPoint } from "./grid-point";

export interface PagePoint extends GridPoint {
    pageX: number;
    pageY: number;
}