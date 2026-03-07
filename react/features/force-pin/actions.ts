import { IStore } from '../app/types';
import { getCurrentConference } from '../base/conference/functions';
import { isLocalParticipantModerator } from '../base/participants/functions';
import { pinParticipant } from '../base/participants/actions';

import { SET_FORCE_PIN } from './actionTypes';
import { FORCE_PIN_COMMAND } from './constants';

/**
 * Force-pins a screen share for all participants (moderator only).
 * Pass null/undefined to unpin.
 */
export function forcePinScreenshare(participantId?: string | null) {
    return (dispatch: IStore['dispatch'], getState: IStore['getState']) => {
        const state = getState();

        if (!isLocalParticipantModerator(state)) {
            return;
        }

        const conference = getCurrentConference(state);

        if (!conference) {
            return;
        }

        if (participantId) {
            conference.sendCommand(FORCE_PIN_COMMAND, {
                attributes: { participantId }
            });
            dispatch({ type: SET_FORCE_PIN, participantId });
            dispatch(pinParticipant(participantId));
        } else {
            (conference as any).removeCommand(FORCE_PIN_COMMAND);
            conference.sendCommandOnce(FORCE_PIN_COMMAND, {
                attributes: { off: 'true' }
            });
            dispatch({ type: SET_FORCE_PIN, participantId: null });
            dispatch(pinParticipant(null));
        }
    };
}
