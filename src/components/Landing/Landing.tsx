import React from 'react';
import Dialog from '../Dialog/Dialog';
import Storage from '../../storage';
import { TimerData } from '../../types';

import './Landing.scoped.scss';
import Icons from '../../assets/images/icons.svg';
import Timer from '../Timer/Timer';

interface LandingProps {
    data: TimerData[];
    receiveFocus?: boolean;
    onRefresh: () => void;
    onMessage: (message: string) => void;
    onSlideChange: (name: string) => void;
}

interface LandingState {
    dialogActive: boolean;
    dialogId: number;
    dialogUseKeyboard: boolean;
}

/**
 * Landing
 *
 * First slide visible when opening the app.
 * Shows either a welcome message or the currently available timers.
 *
 * @export
 * @class Landing
 * @extends {React.Component<LandingProps, LandingState>}
 * @version 1.0.0
 */
export default class Landing extends React.Component<LandingProps, LandingState> {
    storage = new Storage('timer'); // localStorage wrapper to handle timer data.
    title = 'Countdown.'; // Slide title.

    state = { dialogActive: false, dialogId: 0, dialogUseKeyboard: false };

    /**
     * openPreferences
     *
     * Request the Preferences slide.
     *
     * @memberof Landing
     * @since 1.0.0
     */
    openPreferences = () => {
        this.props.onSlideChange('preferences');
    };

    /**
     * openAdd
     *
     * Request the Add slide.
     *
     * @memberof Landing
     * @since 1.0.0
     */
    openAdd = () => {
        this.props.onSlideChange('add');
    };

    /**
     * openDialog
     *
     * Open the `Remove checklist` dialog window.
     *
     * @param {number} id The id of the checklist to remove
     * @memberof Landing
     * @since 1.0.0
     */
    openDialog = (id: number) => {
        this.setState({
            dialogActive: true,
            dialogId: id,
            dialogUseKeyboard: false
        });
    };

    /**
     * openKbDialog
     *
     * Open the `Remove checklist` dialog window with keyboard controls.
     *
     * @param {React.KeyboardEvent<HTMLButtonElement>} $event
     * @param {number} id The id of the checklist to remove
     * @memberof Landing
     * @since 1.0.0
     */
    openKbDialog = ($event: React.KeyboardEvent<HTMLButtonElement>, id: number) => {
        if ($event.key === 'Enter' || $event.key === ' ') {
            $event.preventDefault();

            this.setState({
                dialogActive: true,
                dialogId: id,
                dialogUseKeyboard: true
            });
        }
    };

    /**
     * showTimers
     *
     * Renders all available timers and the button to add more.
     *
     * @memberof Landing
     * @since 1.0.0
     */
    showTimers = () => {
        // Make sure we have data available.
        if (this.props.data) {
            // This array will hold our timers.
            const timers = [];

            // For each key in your data, we create a timer and add it to the array.
            for (const data of this.props.data) {
                timers.push(
                    <Timer
                        key={data.id}
                        time={data.time}
                        title={data.title}
                        onClick={() => this.openDialog(data.id)}
                        onKeydown={$event => this.openKbDialog($event, data.id)}
                    />
                );
            }

            // Finally render the timers and the `Add timer` button.
            return (
                <div id="timers">
                    {timers}

                    <button id="add-timer" onClick={this.openAdd}>
                        <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <use href={`${Icons}#add`} />
                        </svg>
                        Add another timer
                    </button>
                </div>
            );
        }
    };

    /**
     * cancelDialog
     *
     * Close the dialog window.
     *
     * @memberof Landing
     * @since 1.0.0
     */
    cancelDialog = () => {
        this.setState({
            dialogActive: false
        });
    };

    /**
     * deleteTimer
     *
     * Delete the requested timer from storage and refresh the Landing data.
     *
     * @memberof Landing
     * @since 1.0.0
     */
    deleteTimer = () => {
        // Delete the checklist from storage.
        this.storage.delete(this.state.dialogId.toString()).then(() => {
            // Hide the dialog.
            this.cancelDialog();

            // Refresh the Landing data.
            this.props.onRefresh();

            // Display a message to the user.
            this.props.onMessage('Timer successfully removed');
        });
    };

    /**
     * welcomeMessage
     *
     * Initial welcome message when no timers exist yet.
     *
     * @memberof Landing
     * @since 1.0.0
     */
    welcomeMessage = () => {
        return (
            <div id="landing">
                <p id="landing-heading">
                    Welcome to <strong>{this.title}</strong>
                    <br />
                    <span>A simple and elegant timer app that helps you manage your time.</span>
                </p>

                <button className="mdf-button mdf-button--filled mdf-button--large" onClick={this.openAdd}>
                    Get started now
                </button>
            </div>
        );
    };

    render() {
        const { receiveFocus } = this.props;

        return (
            <div className="mdf-slide" tabIndex={receiveFocus ? undefined : -1}>
                <header className="mdf-slide__header">
                    <h2 className="mdf-slide__title">{this.title}</h2>

                    <div className="mdf-slide__controls">
                        <button
                            id="show-options"
                            className="mdf-button mdf-button--icon"
                            aria-label="Show app options"
                            onClick={this.openPreferences}
                        >
                            <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                                <use href={`${Icons}#controls`} />
                            </svg>
                        </button>
                    </div>
                </header>

                <main className="mdf-slide__main">
                    <div className={`mdf-slide__content ${this.props.data.length ? 'mdf-slide__content--top' : ''}`}>
                        {this.props.data.length ? this.showTimers() : this.welcomeMessage()}
                    </div>
                </main>

                <footer className="mdf-slide__footer">
                    <span className="mdf-copyright">
                        App lovingly created by{' '}
                        <a href="https://miraidesigns.net/" target="_blank" rel="noreferrer">
                            Mirai Designs
                        </a>
                    </span>
                </footer>

                {this.state.dialogActive && (
                    <Dialog
                        title={'Remove timer'}
                        description={'Are you sure you want to remove this timer?'}
                        keyboard={this.state.dialogUseKeyboard}
                        onConfirm={this.deleteTimer}
                        onCancel={this.cancelDialog}
                    />
                )}
            </div>
        );
    }
}
