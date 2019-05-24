import React, { useEffect, useState, Fragment } from "react";

import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import { SessionData } from '@models/interfaces/session-data';
import { List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Checkbox, Avatar, createStyles, Theme, Divider } from "@material-ui/core";
import makeStyles from "@material-ui/styles/makeStyles";
import { SessionViewer } from "./session-viewer";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
    }),
);

export const UserExperienceViewer = () => {
    const classes = useStyles();
    const [sessions, setSessions] = useState<SessionData[]>([]);

    const loadSessions = async (): Promise<SessionData[]> => {
        return [];
    };

    const init = async () => {
        setSessions(await loadSessions());
    }

    useEffect(() => {
        init();
    }, [])

    return (
        <Router>
            <div>
                <List dense className={classes.root}>
                    {sessions.map((session, index) => (
                        <Fragment>
                            <ListItem key={session.id} button component={Link} to={`/sessions/${session.id}`}>
                                <ListItemText
                                    primary={`${session.url}`}
                                    secondary={session.startDate} />
                            </ListItem>
                            {index != sessions.length ? (<Divider variant="inset" component="li" />) : (<Fragment> </Fragment>)}
                        </Fragment>
                    ))}
                </List>
                <Route path="/sessions/:session" component={SessionViewer} />
            </div>
        </Router>
    );
}