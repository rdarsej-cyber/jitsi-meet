import ReducerRegistry from '../base/redux/ReducerRegistry';

import { SET_FORCE_PIN } from './actionTypes';

export interface IForcePinState {
    participantId?: string | null;
}

ReducerRegistry.register<IForcePinState>('features/force-pin', (state = {}, action): IForcePinState => {
    switch (action.type) {
    case SET_FORCE_PIN:
        return {
            ...state,
            participantId: action.participantId
        };
    default:
        return state;
    }
});
