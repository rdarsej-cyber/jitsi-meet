import { CONFERENCE_JOIN_IN_PROGRESS } from '../base/conference/actionTypes';
import { PARTICIPANT_LEFT } from '../base/participants/actionTypes';
import { getParticipantById } from '../base/participants/functions';
import { pinParticipant } from '../base/participants/actions';
import MiddlewareRegistry from '../base/redux/MiddlewareRegistry';

import { SET_FORCE_PIN } from './actionTypes';
import { FORCE_PIN_COMMAND } from './constants';

MiddlewareRegistry.register(store => next => action => {
    switch (action.type) {
    case CONFERENCE_JOIN_IN_PROGRESS: {
        const { conference } = action;

        conference.addCommandListener(
            FORCE_PIN_COMMAND, ({ attributes }: any, id: string) => {
                _onForcePinCommand(attributes, id, store);
            });
        break;
    }
    case PARTICIPANT_LEFT: {
        // If the force-pinned participant leaves, clear the force pin
        const state = store.getState();
        const forcePinId = state['features/force-pin']?.participantId;

        if (forcePinId && action.participant.id === forcePinId) {
            store.dispatch({ type: SET_FORCE_PIN, participantId: null });
            store.dispatch(pinParticipant(null));
        }
        break;
    }
    }

    return next(action);
});

/**
 * Handles incoming force-pin commands from moderators.
 */
function _onForcePinCommand(attributes: any, id: string, store: any) {
    const state = store.getState();

    // Verify the sender is a moderator
    const sender = getParticipantById(state, id);

    if (!sender || sender.role !== 'moderator') {
        return;
    }

    // Don't process own commands
    if (sender.local) {
        return;
    }

    if (attributes.off === 'true') {
        store.dispatch({ type: SET_FORCE_PIN, participantId: null });
        store.dispatch(pinParticipant(null));
    } else if (attributes.participantId) {
        store.dispatch({ type: SET_FORCE_PIN, participantId: attributes.participantId });
        store.dispatch(pinParticipant(attributes.participantId));
    }
}
