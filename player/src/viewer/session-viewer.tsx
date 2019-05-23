import React, { Fragment } from "react";

import { SessionData } from '@models/interfaces/session-data';

import { Player } from "../player/player";
import { PlayerFrame } from "src/models/frame";
import { PageEventType } from "@models/interfaces/event";

export const SessionViewer = ({ session }: { session: SessionData }) => {

    const getFrames = () => {
        const events = session.events
            .filter(e =>
                e.eventType === PageEventType.Render ||
                e.eventType === PageEventType.User);

        const frames: PlayerFrame[] = [{
            content: session.initialHtml,
            startTime: 0,
            prevFrame: null,
            nextFrame: null
        }];

        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const prevFrame: PlayerFrame | null = frames[i - 1] || null;
            const frame: PlayerFrame = {
                content: '',
                startTime: event.date - session.startDate,
                prevFrame,
                nextFrame: null
            };
            if (prevFrame)
                prevFrame.nextFrame = frame;
            frames.push(frame);
        }

        return frames;
    };

    return (
        <Player frames={getFrames()}>

        </Player>
    );
};