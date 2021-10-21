import React from 'react';

import './Input.scoped.scss';

interface InputProps {
    max: number;
    min: number;
    name: string;
    required?: boolean;
    onChange: (value: string) => void;
}

/**
 * Input
 *
 * Display the timer number input for hours, minutes or seconds.
 *
 * @export
 * @class Input
 * @extends {React.Component<InputProps>}
 * @version 1.0.0
 */
export default class Input extends React.Component<InputProps> {
    inputRef: React.RefObject<HTMLInputElement> = React.createRef(); // Ref to the number input element

    /**
     * handleKeyPress
     *
     * Block key inputs outside of numbers.
     *
     * @param {React.KeyboardEvent<HTMLInputElement>} $event
     * @memberof Input
     * @since 1.0.0
     */
    handleKeyPress = ($event: React.KeyboardEvent<HTMLInputElement>) => {
        if (isNaN(+$event.key)) {
            $event.preventDefault();
        }
    };

    /**
     * handleChange
     *
     * Make sure the input value meets the requirements whenever the input changes.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} $event
     * @memberof Input
     * @since 1.0.0
     */
    handleChange = ($event: React.ChangeEvent<HTMLInputElement>) => {
        // Get the current input value.
        const input = $event.target;
        const value = input.value;

        // Parse the value as a number.
        const numValue = parseInt(value);

        // Get the min and max for our input.
        const { max, min } = this.props;

        if (numValue > max) {
            // Make sure the value does not exceed the max.
            input.value = max.toString();
        } else if (numValue < min) {
            // Make sure the value does not drop below the min.
            input.value = min.toString();
        }

        // Let the parent know that the value changed.
        this.props.onChange(value);
    };

    render() {
        const { max, min, name, required } = this.props;

        return (
            <div className="mdf-timer-input">
                <input
                    ref={this.inputRef}
                    id={name}
                    className="mdf-timer-input__number"
                    type="number"
                    name={name}
                    min={min}
                    max={max}
                    step="1"
                    placeholder="00"
                    onKeyPress={$event => this.handleKeyPress($event)}
                    onChange={$event => this.handleChange($event)}
                    required={required}
                />
                <label htmlFor="hours" className="mdf-timer-input__label">
                    {name}
                </label>
            </div>
        );
    }
}
