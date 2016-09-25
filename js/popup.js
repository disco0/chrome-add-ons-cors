import React from 'react';
import { render } from 'react-dom';
import style from './popup.css';

const CorsView = React.createClass({
    displayName: 'CorsView',
    getInitialState() {
        return {
            buttonName : 'start'
        }
    },
    enableORdisableCors(){
        const {buttonName} = this.state;
        const that = this;
        chrome.storage.local.get({'active': false, 'urls': [], 'exposedHeaders': ''}, function(result) {
            if(buttonName === 'start') {
                that.setState({buttonName: 'stop'});
                chrome.storage.local.set({'active': true});
                chrome.extension.getBackgroundPage().cors.reload();
            } else {
                that.setState({buttonName: 'start'});
                chrome.storage.local.set({'active': false});
                chrome.extension.getBackgroundPage().cors.reload();
            }
        });

    },
    componentDidMount(){
        const that = this;
        chrome.storage.local.get({'active': false, 'urls': [], 'exposedHeaders': ''}, function(result) {
            if(result.active === true){
                that.setState({buttonName: 'stop'});
            } else {
                that.setState({buttonName: 'start'});
            }
        });
    },
    render() {
        const {buttonName} = this.state;
        return (
            <div>
                <div className={style.setting}>CORS SETTING</div>
                <button className={style.buttons} onClick={this.enableORdisableCors}>{buttonName}</button>
            </div>
        );
    }
});

const rootElement = document.getElementById('root');
render(<CorsView />, rootElement);