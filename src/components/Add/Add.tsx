import React from 'react';
import Input from './Input';
import Storage from '../../storage';
import { TimerData } from '../../types';

import './Add.scoped.scss';
import Icons from '../../assets/images/icons.svg';

interface AddProps {
    onBack: () => void;
    onRefresh: () => void;
    onMessage: (message: string) => void;
}

interface AddState {
    error: boolean;
}

/**
 * Add
 * 
 * Display form to save a new timer to localStorage.
 *
 * @export
 * @class Add
 * @extends {React.Component<AddProps, AddState>}
 * @version 1.0.0
 */
export default class Add extends React.Component<AddProps, AddState> {
    titleRef: React.RefObject<HTMLInputElement> = React.createRef(); // Ref to the title input.
    hoursRef: React.RefObject<Input> = React.createRef(); // Ref to the hours input.
    minutesRef: React.RefObject<Input> = React.createRef(); // Ref to the minutes input.
    secondsRef: React.RefObject<Input> = React.createRef(); // Ref to the seconds input.

    storage = new Storage('timer'); // localStorage wrapper to save the timer.

    state = { error: false };

    /**
     * generateUUID
     *
     * Generate unique id for our checklist.
     *
     * @memberof Add
     * @since 1.0.0
     */
    generateUUID = (): number => {
        // Set min and max values.
        const min = 0;
        const max = 8;

        // This will generate an Array holding different integers.
        const baseArray = window.crypto.getRandomValues(new Uint32Array(max));

        // We use this seed to pick a random number between the set min and the max range.
        const seed = Math.floor(Math.random() * (max - 1 - min) + min);

        // Select the UUID from the array.
        const uuid = baseArray[seed];

        // Return the UUID as an absolute value.
        return Math.abs(uuid + Date.now());
    };

    /**
     * calcTime
     * 
     * Calculate the total given time in seconds.
     *
     * @param {number} [h] Number of hours
     * @param {number} [m] Number of minutes
     * @param {number} [s] Number of seconds
     * @memberof Add
     * @since 1.0.0
     */
    calcTime = (h?: number, m?: number, s?: number): number => {
        let time: number;

        // Convert hours and minutes into seconds.
        const hours = h ? h * 3600 : 0;
        const minutes = m ? m * 60 : 0;

        // Keep the seconds untouched.
        const seconds = s ? s : 0;

        // Add up the total.
        time = hours + minutes + seconds;

        // Return it to our script.
        return time;
    }

    /**
     * saveTimer
     *
     * Save the timer to storage.
     *
     * @memberof Add
     * @since 1.0.0
     */
    saveTimer = () => {
        // Get the refs for our inputs.
        const title = this.titleRef.current?.value;
        const hours = parseInt(this.hoursRef.current?.inputRef.current?.value!);
        const minutes = parseInt(this.minutesRef.current?.inputRef.current?.value!);
        const seconds = parseInt(this.secondsRef.current?.inputRef.current?.value!);

        // Calculate the total time.
        const time = this.calcTime(hours, minutes, seconds);

        // We make sure we actually have more than 0 seconds for the timer.
        if (!isNaN(time) && time > 0) {
            // Generate a unique id.
            const id = this.generateUUID();

            // Prepare the data.
            const saveData: TimerData = {
                id: id,
                time: time,
                title: title ? title : '',
            };

            // Save it to localStorage.
            this.storage.set(id.toString(), saveData).then(() => {
                // Return to the Landing slide und refresh the data.
                this.props.onBack();
                this.props.onRefresh();

                // Show a Snackbar message to the user.
                this.props.onMessage('Timer successfully added');
            });
        } else {
            // If no time is entered, trigger the error state.
            this.setState({
                error: true,
            })
        }
    }

    /**
     * handleChange
     * 
     * Will remove the error state when any input changes into a positive value.
     *
     * @param {string} value The input value
     * @memberof Add
     * @since 1.0.0
     */
    handleChange = (value: string) => {
        if (parseInt(value) > 0) {
            this.setState({
                error: false,
            });
        }
    }

    render() {
        return (
            <div className="mdf-slide">
                <header className="mdf-slide__header">
                    <div className="mdf-slide__controls">
                        <button
                            id="show-options"
                            className="mdf-button mdf-button--icon"
                            aria-label="Return to the previous page"
                            onClick={this.props.onBack}
                        >
                            <svg className="mdf-icon mdf-rotate-180" viewBox="0 0 24 24" aria-hidden="true">
                                <use href={`${Icons}#arrow-keyboard`} />
                            </svg>
                        </button>
                    </div>

                    <h2 className="mdf-slide__title">
                        Add your <span> </span>
                        <strong>timer.</strong>
                    </h2>
                </header>

                <main className="mdf-slide__main">
                    <div className="mdf-slide__content">
                        <div className={`mdf-error ${this.state.error ? 'mdf-error--active' : ''}`} aria-hidden={this.state.error ? undefined : true}>
                            <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                                <use href={`${Icons}#error`}></use>
                            </svg>

                            <span className="mdf-error__message" aria-live="polite">
                                {this.state.error ? 'The timer needs a duration' : ''}
                            </span>
                        </div>

                        <input
                            ref={this.titleRef}
                            id="title-input"
                            type="text"
                            name="title"
                            placeholder="Enter timer title (optional)"
                        />

                        <div id="timer-inputs" className="mdf-group">
                            <Input ref={this.hoursRef} name={'hours'} min={0} max={24} onChange={this.handleChange} />
                            <Input ref={this.minutesRef} name={'minutes'} min={0} max={60} onChange={this.handleChange} />
                            <Input ref={this.secondsRef} name={'seconds'} min={0} max={60} required={true} onChange={this.handleChange} />
                        </div>
                    </div>
                </main>

                <footer className="mdf-slide__footer">
                    <button className="mdf-button mdf-button--filled mdf-button--large" onClick={this.saveTimer}>Save timer</button>
                </footer>
            </div>
        );
    }

    componentDidMount() {
        // Focus the title input after the slide is ready.
        setTimeout(() => {
            this.titleRef.current?.focus();
        }, 360);
    }
}
