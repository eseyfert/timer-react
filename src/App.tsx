import React from 'react';
import Slide from './Slide';
import Landing from './components/Landing/Landing';
import Snackbar from './components/Snackbar/Snackbar';
import SnackbarContext from './snackbar.provider';
import PreferencesManager from './preferences.manager';
import Storage from './storage';
import { debounce } from './helpers';
import { TimerData } from './types';

import './App.scss';

type AppState = {
    activeSlide: string | null;
    landingActive: boolean;
    landingData: TimerData[];
    messages: string[];
};

/**
 * App
 *
 * @export
 * @class App
 * @extends {React.Component<{}, AppState>}
 * @version 1.0.0
 */
export default class App extends React.Component<{}, AppState> {
    appContainer!: HTMLElement; // App container element.
    landingData: TimerData[] = []; // Timer data for the Landing slide.
    slidesContainer!: HTMLElement; // Slides container element.
    slideWidth: number = 0; // Holds the slide width for further calculations.
    storage: Storage = new Storage('timer'); // Manages localStorage.
    styles!: CSSStyleDeclaration; // Holds the slides CSS styles.

    state = { activeSlide: null, landingActive: true, landingData: [], messages: [] };

    /**
     * openSlide
     *
     * Open the given slide with the supplied data.
     *
     * @param {string} name Slide name
     * @memberof App
     * @since 1.0.0
     */
    openSlide = (name: string) => {
        // Update our state with the active slide and its data.
        this.setState({ activeSlide: name });

        // Show the newly created slide.
        this.goForward();
    };

    /**
     * getLandingData
     *
     * Retrieve the Landing data from localStorage.
     *
     * @memberof App
     * @since 1.0.0
     */
    getLandingData = () => {
        // We make sure to reset the array for each call.
        this.landingData = [];

        // Find all keys in storage.
        this.storage.keys().then(keys => {
            if (keys && keys.length) {
                // Loop over each available key.
                for (const key of keys) {
                    // Use each key to look up its value.
                    this.storage
                        .get(key)
                        .then(data => {
                            // Push the found checklist data to our array.
                            this.landingData.push(data as TimerData);
                        })
                        .then(() => {
                            // Update the state Landing data.
                            this.setState({
                                landingData: this.landingData
                            });
                        });
                }
            } else {
                // This simply resets the Landing data as the array will be empty.
                this.setState({
                    landingData: this.landingData
                });
            }
        });
    };

    /**
     * showMessage
     *
     * Add the given message to the messages call stack.
     * Each message is passed to the Snackbar.Provider which then shows the message through the Snackbar component.
     *
     * @param {string} message The message to display
     * @memberof App
     * @since 1.0.0
     */
    showMessage = (message: string) => {
        // Add the supplied message to the existing messages stack.
        const messages = this.state.messages as string[];
        messages.push(message);

        // Update the state.
        this.setState({
            messages: messages
        });
    };

    /**
     * removeMessage
     *
     * Remove the first message in order from the messages call stack.
     * Avoids the repeated showing of messages.
     *
     * @memberof App
     * @since 1.0.0
     */
    removeMessage = () => {
        // Remove the first message in order from the messages stack.
        const messages = this.state.messages as string[];
        messages.shift();

        // Update the state.
        this.setState({
            messages: messages
        });
    };

    /**
     * calcWidth
     *
     * Calculate the width of a Slide element.
     * This number is used to move the Slides later.
     *
     * @memberof App
     * @since 1.0.0
     */
    calcWidth = () => {
        if (this.slidesContainer) {
            // Get the CSS properties for the first slide.
            this.styles = window.getComputedStyle(this.slidesContainer.firstElementChild!);

            // Calculate the proper width.
            this.slideWidth = parseFloat(this.styles.width) + parseFloat(this.styles.marginRight);

            // Make sure to properly position the currently displayed slide.
            if (this.slidesContainer.style.transform.includes('-')) {
                this.slidesContainer.style.transform = `translateX(-${this.slideWidth}px)`;
            }
        }
    };

    /**
     * slideLeft
     *
     * Move all slides to the left.
     *
     * @memberof App
     * @since 1.0.0
     */
    slideLeft = () => {
        this.slidesContainer!.style.transform = `translateX(-${this.slideWidth}px)`;
    };

    /**
     * slideRight
     *
     * Move all slides to the right.
     *
     * @memberof App
     */
    slideRight = () => {
        this.slidesContainer!.style.transform = 'translateX(0px)';
    };

    /**
     * goForward
     *
     * Called to show the newly introduced Slide.
     *
     * @memberof App
     * @since 1.0.0
     */
    goForward = () => {
        // Move forward, away from the Landing slide.
        this.slideLeft();

        // Indicate that the Landing is not visible.
        this.setState({
            landingActive: false
        });
    };

    /**
     * goBack
     *
     * Called to return to the Landing slide.
     *
     * @memberof App
     * @since 1.0.0
     */
    goBack = () => {
        // Move back to the Landing slide.
        this.slideRight();

        // Indicate the Landing is visible.
        this.setState({
            landingActive: true
        });

        // Update the state after the slide transition is done.
        setTimeout(() => this.setState({ activeSlide: null }), 360);
    };

    render() {
        return (
            <div className="mdf-app">
                <div className="mdf-app-content">
                    <div className="mdf-slides">
                        <Landing
                            data={this.state.landingData}
                            receiveFocus={this.state.landingActive}
                            onMessage={this.showMessage}
                            onRefresh={this.getLandingData}
                            onSlideChange={this.openSlide}
                        />

                        <Slide
                            name={this.state.activeSlide}
                            onBack={this.goBack}
                            onMessage={this.showMessage}
                            onRefresh={this.getLandingData}
                        />

                        <SnackbarContext.Provider value={this.state.messages}>
                            <Snackbar onDispatch={this.removeMessage} />
                        </SnackbarContext.Provider>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        // Store references to the app and slides container elements.
        this.appContainer = document.querySelector('.mdf-app')!;
        this.slidesContainer = document.querySelector('.mdf-slides')!;

        // Apply user preferences.
        new PreferencesManager().applyPreferences();

        // Calculate the needed slides width.
        this.calcWidth();

        // Re-calculate slide width on window resize.
        window.onresize = debounce(() => this.calcWidth(), 60);

        // Get the initial data set for the Landing slide.
        this.getLandingData();
    }
}
