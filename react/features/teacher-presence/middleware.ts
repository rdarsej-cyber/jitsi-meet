import { CONFERENCE_JOIN_IN_PROGRESS } from '../base/conference/actionTypes';
import { PARTICIPANT_LEFT } from '../base/participants/actionTypes';
import { getParticipantById, isLocalParticipantModerator } from '../base/participants/functions';
import MiddlewareRegistry from '../base/redux/MiddlewareRegistry';

import { SET_TEACHER_PRESENT } from './actionTypes';

const TEACHER_PRESENCE_COMMAND = 'teacher-presence';

MiddlewareRegistry.register(store => next => action => {
    switch (action.type) {
    case CONFERENCE_JOIN_IN_PROGRESS: {
        const { conference } = action;

        conference.addCommandListener(
            TEACHER_PRESENCE_COMMAND,
            ({ attributes }: any) => {
                const present = attributes.present === 'true';

                store.dispatch({ type: SET_TEACHER_PRESENT, present });

                if (!present && !isLocalParticipantModerator(store.getState())) {
                    conference.muteParticipant(undefined, 'audio');
                    conference.muteParticipant(undefined, 'video');
                }
            }
        );

        const state = store.getState();

        if (isLocalParticipantModerator(state)) {
            setTimeout(() => {
                conference.sendCommand(TEACHER_PRESENCE_COMMAND, {
                    attributes: { present: 'true' }
                });
                store.dispatch({ type: SET_TEACHER_PRESENT, present: true });
            }, 2000);
        }
        break;
    }
    case PARTICIPANT_LEFT: {
        const state = store.getState();
        const conference = state['features/base/conference']?.conference;

        if (!conference) {
            break;
        }

        const leftParticipant = getParticipantById(state, action.participant?.id);

        if (leftParticipant?.role === 'moderator') {
            const participants = state['features/base/participants'];
            let hasModeratorLeft = true;

            if (participants?.remote) {
                for (const [, p] of participants.remote) {
                    if (p.role === 'moderator') {
                        hasModeratorLeft = false;
                        break;
                    }
                }
            }

            if (hasModeratorLeft && participants?.local?.role === 'moderator') {
                hasModeratorLeft = false;
            }

            if (hasModeratorLeft) {
                store.dispatch({ type: SET_TEACHER_PRESENT, present: false });
                conference.sendCommand(TEACHER_PRESENCE_COMMAND, {
                    attributes: { present: 'false' }
                });
            }
        }
        break;
    }
    }

    return next(action);
});
