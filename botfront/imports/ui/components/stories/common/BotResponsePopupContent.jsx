import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown, Modal, Search,
} from 'semantic-ui-react';
import { ConversationOptionsContext } from '../../utils/Context';

const BotResponsePopupContent = (props) => {
    const {
        onSelect, onCreate, trigger, noButtonResponse, limitedSelection, defaultOpen, onClose,
    } = props;
    const { responses } = useContext(ConversationOptionsContext);
    const [modalOpen, setModalOpen] = useState(false);
    const [closeNext, setCloseNext] = useState(false);

    useEffect(() => {
        if (closeNext && !modalOpen) onClose();
    }, [closeNext]);

    return (
        <>
            <Modal
                size='tiny'
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <Modal.Header>Select from existing</Modal.Header>
                <Modal.Content className='bot-responses-modal'>
                    { responses.map(r => (
                        <button
                            type='button'
                            onClick={(e) => { e.preventDefault(); setModalOpen(false); onSelect(r); }}
                            key={r.name}
                        >
                            {r.name}
                        </button>
                    ))}
                </Modal.Content>
            </Modal>
            <Dropdown
                trigger={trigger}
                className='dropdown-button-trigger'
                defaultOpen={defaultOpen}
                tabIndex={0}
                onClose={() => setCloseNext(true)}
            >
                <Dropdown.Menu className='first-column'>
                    <Dropdown.Header>Select from existing</Dropdown.Header>
                    <Dropdown.Item>
                        <Search fluid placeholder='Search responses...' onClick={() => setModalOpen(true)} />
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Header>Or use a template</Dropdown.Header>
                    <Dropdown.Item onClick={() => onCreate('text')}>Text</Dropdown.Item>
                    <Dropdown.Item disabled={noButtonResponse} onClick={() => onCreate('qr')}>Text with buttons (Quick reply)</Dropdown.Item>
                    {!limitedSelection
                        && <>
                            <Dropdown.Item onClick={() => onCreate('image')}>Image</Dropdown.Item>
                            <Dropdown.Item onClick={() => onCreate('video')}>Video</Dropdown.Item>
                            <Dropdown.Item disabled={noButtonResponse} onClick={() => onCreate('carousel')}>Carousel</Dropdown.Item>
                            <Dropdown.Item disabled={noButtonResponse} onClick={() => onCreate('button')}>Button template</Dropdown.Item>
                        </>
                    }
                </Dropdown.Menu>
            </Dropdown>
        </>
    );
};

BotResponsePopupContent.propTypes = {
    value: PropTypes.string,
    onSelect: PropTypes.func,
    onCreate: PropTypes.func,
    trigger: PropTypes.element.isRequired,
    noButtonResponse: PropTypes.bool,
    limitedSelection: PropTypes.bool,
    defaultOpen: PropTypes.bool,
    onClose: PropTypes.func,
};

BotResponsePopupContent.defaultProps = {
    value: null,
    noButtonResponse: false,
    limitedSelection: false,
    defaultOpen: false,
    onSelect: () => {},
    onCreate: () => {},
    onClose: () => {},
};

export default BotResponsePopupContent;
