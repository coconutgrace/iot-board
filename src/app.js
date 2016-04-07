import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Redux from 'redux';
import {connect} from 'react-redux'
import {Provider} from 'react-redux'
import Layout from './layout'
import * as Counter from './exampleCounter'
import 'semantic-ui/dist/semantic.css';
import 'semantic-ui/dist/semantic.js';


let store = Redux.createStore(Counter.counterReducer, undefined);

ReactDOM.render(
	<Provider store={store}>
		<Layout/>
	</Provider>,
	document.getElementById('app'));