import React, { useRef, useState, useEffect } from 'react';

import html2canvas from 'html2canvas';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import { PlayerFrame } from "../models/frame";

const useStyles = makeStyles((theme: Theme) => createStyles({
    button: {
        margin: theme.spacing(1),
    },
    input: {
        display: 'none',
    },
}));

export interface Props {
    frame: PlayerFrame;
}

export const Renderer = ({ frame }: Props) => {

    const classes = useStyles();
    const iframe = useRef<HTMLIFrameElement>(null);

    const [renderedFrame, setRenderedFrame] = useState<HTMLCanvasElement | null>(null);

    const render = () => {
        if (iframe.current) {
            iframe.current.addEventListener('load', async () => {
                setRenderedFrame(await html2canvas(iframe.current!.contentDocument!.body));
            });
            iframe.current.srcdoc = frame.content;
        }
    }

    useEffect(() => {
        render();
    }, [frame]);

    return (
        <div className="player-renderer-content">
            <iframe ref={iframe}></iframe>
            {renderedFrame}
        </div>
    );
}