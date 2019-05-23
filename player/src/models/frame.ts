export interface PlayerFrame<TContent = string> {
    content: TContent;
    startTime: number;
    nextFrame: PlayerFrame<TContent> | null;
    prevFrame: PlayerFrame<TContent> | null;
}