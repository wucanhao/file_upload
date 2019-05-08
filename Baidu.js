import React from 'react'
import { render } from 'react-dom'
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom';
import { Upload, Icon, message, Table ,Row,Col,Card,Button,Input,Modal} from 'antd';
const Dragger = Upload.Dragger;
const Search = Input.Search;
// import App from './App'
import './App.css'
import App from './test'

// class Baidu extends React.Component{
//     render(){
//         return (
//             <Router forceRefresh={true}>
//                 <div className="wrapper">
//                     <Route path='/' component={App}/>
//                 </div>
//
//             </Router>
//         )
//     }
// }
render(
    <App />,document.getElementById('index')
);