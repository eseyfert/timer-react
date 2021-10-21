import React from 'react';

import './Timer.scoped.scss';
import Icons from '../../assets/images/icons.svg';

interface TimerProps {
    time: number;
    title?: string;
    onClick?: () => void;
    onKeydown?: ($event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

interface TimerState {
    paused: boolean;
    stopped: boolean;
    time: number;
}

/**
 * Timer
 *
 * Displays the timer and its controls.
 * Allows the user to start, pause, stop and remove the timer.
 *
 * @export
 * @class Timer
 * @extends {React.Component<TimerProps, TimerState>}
 * @version 1.0.0
 */
export default class Timer extends React.Component<TimerProps, TimerState> {
    defaultTime: number = 0; // Saves the initial duration of the timer.
    domTitle: string; // Saves the original document title.
    elapsedTime: number = 0; // Amount of time left.
    interval: number = 0; // Interval instance.

    state = { paused: true, stopped: false, time: 0 };

    constructor(props: TimerProps) {
        super(props);

        // Save the default time so we can restore it later.
        this.defaultTime = this.props.time;

        // Save the original document tile so we can restore it later.
        this.domTitle = document.title;
    }

    /**
     * updateTitle
     *
     * Update the document title with the current timer title and progress.
     *
     * @memberof Timer
     * @since 1.0.0
     */
    updateTitle = () => {
        document.title = `${
            this.props.title ? this.props.title : 'Timer'
        } \u2013 ${`${this.getHours()}:${this.getMinutes()}:${this.getSeconds()}`}`;
    };

    /**
     * displayNumber
     *
     * Will add a leading zero to the given number if necessary.
     *
     * @param {number} value The number to check
     * @memberof Timer
     * @since 1.0.0
     */
    displayNumber = (value: number): string => {
        // Convert the number to a string.
        let number: string = value.toString();

        // Add a leading 0 if necessary.
        if (number.length < 2) {
            number = `0${number}`;
        }

        // Return the number as a string to display it later.
        return number;
    };

    /**
     * getHours
     *
     * Display the amount of hours left.
     *
     * @memberof Timer
     * @since 1.0.0
     */
    getHours = (): string => {
        const hours = Math.floor(this.state.time / 3600);
        return this.displayNumber(hours);
    };

    /**
     * getMinutes
     *
     * Display the amount of minutes left.
     *
     * @memberof Timer
     * @since 1.0.0
     */
    getMinutes = (): string => {
        const minutes = Math.floor((this.state.time % 3600) / 60);
        return this.displayNumber(minutes);
    };

    /**
     * getSeconds
     *
     * Display the amount of seconds left.
     *
     * @memberof Timer
     * @since 1.0.0
     */
    getSeconds = (): string => {
        const seconds = Math.floor((this.state.time % 3600) % 60);
        return this.displayNumber(seconds);
    };

    /**
     * countDown
     *
     * Count down the timer and update the saved time.
     *
     * @memberof Timer
     * @since 1.0.0
     */
    countDown = () => {
        // Get the currently elapsed time and subtract from it.
        this.elapsedTime = this.state.time;
        this.elapsedTime--;

        // Make sure the time can't go below 0.
        if (this.elapsedTime < 0) {
            this.elapsedTime = 0;
        }

        // Update the time in our state.
        this.setState({
            time: this.elapsedTime
        });

        // Update the document title.
        this.updateTitle();
    };

    /**
     * startTimer
     *
     * Start the countdown.
     *
     * @memberof Timer
     * @since 1.0.0
     */
    startTimer = () => {
        // Let the timer know its started.
        this.setState({
            paused: false,
            stopped: false
        });

        // Count down every second using a setInterval.
        this.interval = window.setInterval(() => {
            this.countDown();

            // If we reach 0, we stop the timer.
            if (this.state.time === 0) {
                // Wait a short amount before resetting the timer.
                setTimeout(() => {
                    this.stopTimer();
                }, 160);
            }
        }, 1000);
    };

    /**
     * pauseTimer
     *
     * Temporarily pause the countdown.
     *
     * @memberof Timer
     * @since 1.0.0
     */
    pauseTimer = () => {
        // Pause the timer by changing the state.
        this.setState({
            paused: true
        });

        // Clear the interval so it stops counting down.
        clearInterval(this.interval);
    };

    /**
     * stopTimer
     *
     * Pause the countdown and reset it to its original value.
     *
     * @memberof Timer
     * @since 1.0.0
     */
    stopTimer = () => {
        // Pause the timer and restore the original time.
        this.setState({
            stopped: true,
            time: this.defaultTime
        });

        // Clear the interval so it stops counting down.
        clearInterval(this.interval);

        // Restore the original page title.
        document.title = this.domTitle;
    };

    /**
     * handleClick
     *
     * Sets whether the play button needs to start or pause the countdown.
     *
     * @memberof Timer
     * @since 1.0.0
     */
    handleClick = () => {
        if (this.state.paused || this.state.stopped) {
            this.startTimer();
        } else {
            this.pauseTimer();
        }
    };

    /**
     * playPauseLabel
     *
     * Sets the correct `aria-label` text based on the timer state.
     *
     * @memberof Timer
     * @since 1.0.0
     */
    playPauseLabel = (): string => {
        let label: string;
        const { paused, stopped } = this.state;

        if (paused || stopped) {
            label = 'Start timer';
        } else {
            label = 'Pause timer';
        }

        return label;
    };

    /**
     * playPauseIcon
     *
     * Displays the correct play/pause icon based on the timer state.
     *
     * @memberof Timer
     * @since 1.0.0
     */
    playPauseIcon = (): JSX.Element => {
        let icon: string;
        const { paused, stopped } = this.state;

        if (paused || stopped) {
            icon = 'play';
        } else {
            icon = 'pause';
        }

        return <use href={`${Icons}#${icon}`} />;
    };

    render() {
        const { title, onClick, onKeydown } = this.props;
        const { paused, stopped } = this.state;

        return (
            <div className={`mdf-timer ${!paused && !stopped ? 'mdf-timer--active' : ''}`}>
                <div className="mdf-timer__header">
                    {title ? title : 'Untitled'}

                    <button
                        className="mdf-button mdf-button--icon"
                        onClick={onClick ? onClick : undefined}
                        onKeyDown={onKeydown ? $event => onKeydown($event) : undefined}
                    >
                        <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <use href={`${Icons}#delete`} />
                        </svg>
                    </button>
                </div>

                <div
                    className="mdf-timer__time"
                    role="timer"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={`Timer ${title ? title : 'Untitled'}`}
                >
                    <span>{`${this.getHours()} : ${this.getMinutes()} : ${this.getSeconds()}`}</span>
                </div>

                <div className="mdf-timer__actions">
                    <button
                        className="mdf-button mdf-button--icon"
                        aria-label={this.playPauseLabel()}
                        onClick={this.handleClick}
                    >
                        <svg className="mdf-icon" viewBox="0 0 24 24">
                            {this.playPauseIcon()}
                        </svg>
                    </button>

                    <button className="mdf-button mdf-button--icon" aria-label="Stop timer" onClick={this.stopTimer}>
                        <svg className="mdf-icon" viewBox="0 0 24 24">
                            <use href={`${Icons}#stop`} />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    componentDidMount() {
        // Set the start time on mount.
        this.setState({
            time: this.props.time
        });
    }
}
