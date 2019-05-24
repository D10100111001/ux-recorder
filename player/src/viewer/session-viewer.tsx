import React, { Fragment, useEffect, useState } from "react";

import { match, Link } from 'react-router-dom';
import { SessionData } from '@models/interfaces/session-data';

import { Player } from "../player/player";
import { PlayerFrame } from "src/models/frame";
import { PageEventType } from "@models/interfaces/event";
import { List, ListItem, createStyles, Theme, ListItemText, Divider, Grid } from "@material-ui/core";
import makeStyles from "@material-ui/styles/makeStyles";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
    }),
);

export const SessionViewer = (match: match<{ sessionId: string }>) => {

    const classes = useStyles();
    const [session, setSession] = useState<SessionData | null>(null);

    useEffect(() => {
        const init = async () => {
            const sessionId = match.params.sessionId;
            //setSession();
        }

        init();
    }, [])

    const getFrames = (session: SessionData) => {
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
        <Fragment>
            {(session ?
                <Grid container spacing={0}>
                    <Grid item sm={12} md={4}>
                        <List dense className={classes.root}>
                            {session.events.map((event, index) => (
                                <Fragment>
                                    <ListItem key={event.id} button component={Link} to={`/sessions/${session.id}/events/${event.id}`}>
                                        <ListItemText
                                            primary={`${PageEventType[event.eventType]}`}
                                            secondary={event.date - session.startDate} />
                                    </ListItem>
                                    {index != session.events.length ? (<Divider variant="inset" component="li" />) : (<Fragment> </Fragment>)}
                                </Fragment>
                            ))}
                        </List>
                    </Grid>
                    <Grid item sm={12} md={8}>
                        <Player frames={getFrames(session)} />
                    </Grid>
                </Grid> :
                <div></div>
            )}
        </Fragment>

    );
};