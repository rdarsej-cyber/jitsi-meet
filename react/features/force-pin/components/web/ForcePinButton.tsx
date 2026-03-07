import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IReduxState } from '../../../app/types';
import { isLocalParticipantModerator } from '../../../base/participants/functions';
import { forcePinScreenshare } from '../../actions';

interface IProps {
    participantId: string;
    isHovered: boolean;
}

const ForcePinButton = ({ participantId, isHovered }: IProps) => {
    const dispatch = useDispatch();
    const isModerator = useSelector(isLocalParticipantModerator);
    const forcePinnedId = useSelector((state: IReduxState) => state['features/force-pin']?.participantId);
    const isPinned = forcePinnedId === participantId;

    const _onClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();

        if (isPinned) {
            dispatch(forcePinScreenshare(null));
        } else {
            dispatch(forcePinScreenshare(participantId));
        }
    }, [ dispatch, isPinned, participantId ]);

    if (!isModerator || !isHovered) {
        return null;
    }

    return (
        <div
            className = { `force-pin-button ${isPinned ? 'pinned' : ''}` }
            onClick = { _onClick }
            title = { isPinned ? 'Unpin for everyone' : 'Pin for everyone' }>
            <svg
                fill = 'currentColor'
                height = '20'
                viewBox = '0 0 24 24'
                width = '20'
                xmlns = 'http://www.w3.org/2000/svg'>
                <path d = 'M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z' />
            </svg>
        </div>
    );
};

export default ForcePinButton;
