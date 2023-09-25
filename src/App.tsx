/* eslint-disable react/jsx-wrap-multilines */
import 'easy-email-editor/lib/style.css';
import 'antd/dist/antd.css';
import 'easy-email-extensions/lib/style.css';
import '@arco-themes/react-easy-email-theme-purple/css/arco.css';
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/home/Home';
import Editor from './pages/editor/Editor';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/editor/:type" element={<Editor/>}/>
            </Routes>
        </Router>
    );
}
