import React, { useEffect, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import ReactJson from 'react-json-view';
import { Comment, Message } from 'semantic-ui-react';
import { generateTurns } from './utils';
import { ProjectContext } from '../../layouts/context';

import UserUtteredEventViewer from '../example_editor/UserUtteredEventViewer';

function BotResponse({
    type, text, data, key,
}) {
    if (!text && !data) {
        return null;
    }
    // remove empty attributes
    if (data) Object.keys(data).forEach(key => (data[key] == null) && delete data[key]);

    const dataEmpty = !data || !Object.keys(data).length;
    return (
        <div className='bot-response-message' key={key}>
            {text && <p className='bot-response-text'>{text}</p>}
            {!dataEmpty && <ReactJson className='bot-response-json' src={data} collapsed name={type} />}
        </div>
    );
}

BotResponse.propTypes = {
    type: PropTypes.string.isRequired,
    text: PropTypes.string,
    data: PropTypes.object,
    key: PropTypes.string,
};

BotResponse.defaultProps = {
    text: '',
    data: null,
    key: 'bot-response',
};

function Turn({
    userSays, userId, botResponses, key, userRef,
}) {
    if (!userSays && botResponses.length === 0) {
        return null;
    }

    return (
        <Comment key={key}>
            {userSays && ([
                <div ref={userRef} />,
                <Comment.Avatar src='/images/avatars/matt.jpg' />,
                <UserUtteredEventViewer
                    event={userSays}
                    author={userId}
                />,
                
            ])}
            <Comment.Group>
                <Comment>
                    <Comment.Avatar src='/images/avatars/mrbot.png' />
                    <Comment.Content>
                        <Comment.Author as='a'>Bot</Comment.Author>
                        <Comment.Metadata>
                        </Comment.Metadata>
                        <Comment.Text>
                            {botResponses.map((response, index) => (
                                <BotResponse {...response} key={`bot-response-${index}`} />
                            ))}
                        </Comment.Text>
                        <Comment.Actions>
                        </Comment.Actions>
                    </Comment.Content>
                </Comment>
            </Comment.Group>
        </Comment>
    );
}

Turn.propTypes = {
    userSays: PropTypes.object,
    userId: PropTypes.string,
    botResponses: PropTypes.arrayOf(PropTypes.object).isRequired,
    key: PropTypes.string,
    userRef: PropTypes.object,
};

Turn.defaultProps = {
    userSays: null,
    userId: null,
    key: 'dialogue-turn',
    userRef: null,
};

function ConversationDialogueViewer({
    conversation: { tracker, userId },
    mode,
    messageIdInView,
}) {
    const { timezoneOffset } = useContext(ProjectContext);
    const toScrollTo = React.createRef();
    
    const turns = useMemo(() => generateTurns(tracker, mode === 'debug', timezoneOffset), [tracker]);
    useEffect(() => {
        if (toScrollTo.current) {
            toScrollTo.current.scrollIntoView({ block: 'center' });
        }
    }, []);

    return (
        <Comment.Group>
            {turns.length > 0 ? (
                turns.map(({ userSays, botResponses, messageId }, index) => (
                    <Turn
                        userSays={userSays}
                        userId={userId}
                        botResponses={botResponses}
                        // eslint-disable-next-line camelcase
                        userRef={messageId === messageIdInView ? toScrollTo : null}
                        key={`dialogue-turn-${index}`}
                    />
                ))
            ) : (
                <Message
                    info
                    icon='warning'
                    header='No events to show'
                    content={(() => {
                        if (mode !== 'debug') {
                            return 'check debug mode for non-dialogue events.';
                        }

                        return 'check JSON mode to view the full tracker object.';
                    })()}
                />
            )}
        </Comment.Group>
    );
}

ConversationDialogueViewer.propTypes = {
    conversation: PropTypes.object.isRequired,
    mode: PropTypes.string,
    messageIdInView: PropTypes.string,
};

ConversationDialogueViewer.defaultProps = {
    mode: 'text',
    messageIdInView: '',
};

export default ConversationDialogueViewer;
