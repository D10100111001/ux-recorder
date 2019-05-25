import { Point } from "./point";

export interface Screen {
    height: number;
    width: number;
}

export type GridScreen = Point & Screen;

export interface GridPoint extends GridScreen {

}