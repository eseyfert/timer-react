import React from 'react';
import Preferences from './components/Preferences/Preferences';
import Add from './components/Add/Add';

type SlideProps = {
    name: string | null;
    onBack: () => void;
    onMessage: (message: string) => void;
    onRefresh: () => void;
};

/**
 * Slide
 *
 * Handle creating the given Slide component and managing its data.
 *
 * @export
 * @class Slide
 * @extends {React.Component<SlideProps>}
 * @version 1.0.0
 */
export default class Slide extends React.Component<SlideProps> {
    // Holds the available Slide components.
    components: Record<string, React.ElementType> = {
        preferences: Preferences,
        add: Add
    };

    /**
     * goBack
     *
     * Return to the Landing slide.
     *
     * @memberof Slide
     * @since 1.0.0
     */
    goBack = () => {
        this.props.onBack();
    };

    /**
     * refresh
     *
     * Refresh the Landing slide data.
     *
     * @memberof Slide
     * @since 1.0.0
     */
    refresh = () => {
        this.props.onRefresh();
    };

    /**
     * catchMessage
     *
     * Catches message and forwards it to the Snackbar provider.
     *
     * @param {string} message The message to forward
     * @memberof Slide
     * @since 1.0.0
     */
    catchMessage = (message: string) => {
        this.props.onMessage(message);
    };

    render() {
        if (this.props.name && this.props.name.length) {
            const SlideComponent = this.components[this.props.name];
            return <SlideComponent onBack={this.goBack} onMessage={this.catchMessage} onRefresh={this.refresh} />;
        }
        return null;
    }
}
