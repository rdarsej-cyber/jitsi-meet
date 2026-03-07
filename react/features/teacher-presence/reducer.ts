import ReducerRegistry from '../base/redux/ReducerRegistry';
import { SET_TEACHER_PRESENT } from './actionTypes';

export interface ITeacherPresenceState {
    present: boolean;
}

ReducerRegistry.register<ITeacherPresenceState>(
    'features/teacher-presence',
    (state = { present: true }, action): ITeacherPresenceState => {
        switch (action.type) {
        case SET_TEACHER_PRESENT:
            return { ...state, present: action.present };
        default:
            return state;
        }
    }
);
