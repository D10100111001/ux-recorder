import React, { useState, useEffect } from "react";

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';

import { PlayerFrame } from "../models/frame";
import { Renderer } from "./renderer";
import { PlayerState } from "../models/player-state";

const useStyles = makeStyles((theme: Theme) => createStyles({
    button: {
        margin: theme.spacing(1),
    },
    input: {
        display: 'none',
    },
}));

export interface Props {
    frames: PlayerFrame[];
}

export const Player = ({ frames }: Props) => {

    const classes = useStyles();
    const [state, setState] = useState(PlayerState.NotStarted);
    const [currentFrame, setCurrentFrame] = useState<PlayerFrame | null>(null);
    const [currentTimeSecs, setCurrentTimeSecs] = useState(0);

    let timeHandle: number | null = null;
    let frameHandle: number | null = null;

    useEffect(() => {
        if (state === PlayerState.Playing)
            timeHandle = window.setInterval(() => {
                setCurrentTimeSecs(currentTimeSecs + 1);
            }, 1000);
    }, [state]);

    const play = (fps: number) => {
        if (state === PlayerState.Playing) return;
        if (state === PlayerState.Stopped || state === PlayerState.Finished) {
            setCurrentTimeSecs(0);
        }
        setState(PlayerState.Playing);
        updateFrame();
        frameHandle = window.setInterval(() => {
            updateFrame();
        }, 1000 / fps);
    };

    const clearIntervals = () => {
        if (timeHandle)
            window.clearInterval(timeHandle);
        if (frameHandle)
            window.clearInterval(frameHandle);
    }

    const stop = () => {
        if (state === PlayerState.Stopped) return;
        setState(PlayerState.Stopped);
        clearIntervals();
    }

    const pause = () => {
        if (state === PlayerState.Paused) return;
        setState(PlayerState.Paused);
        clearIntervals();
    }

    const updateFrame = () => {
        if (currentTimeSecs === 0)
            setCurrentFrame(frames[0]);
        else if (currentFrame && currentFrame.nextFrame) {
            if (currentFrame.nextFrame.startTime >= currentTimeSecs)
                setCurrentFrame(currentFrame.nextFrame);
        }
    }

    return (
        <div>
            <div style={{ height: 500, width: 885 }}>
                {currentFrame ?
                    <Renderer frame={currentFrame} /> :
                    <div></div>
                }
            </div>
            <div>
                {state === PlayerState.Playing ?
                    <IconButton className={classes.button} aria-label="Pause" onClick={() => pause()}>
                        <PauseIcon />
                    </IconButton> :
                    <IconButton className={classes.button} aria-label="Play" onClick={() => play(60)}>
                        <PlayArrowIcon />
                    </IconButton>
                }
            </div>
        </div>
    );
}