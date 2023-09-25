import React from "react";
import {Link} from "react-router-dom";
import './Home.scss';

export default function Home() {
    return (
        <div>
            <div className="header">
                <h1>Email templates for Newsletter</h1>
            </div>
            <div className="body">
                <div className="item-wrapper">
                    <Link className="item" to="/editor/new">
                        <div className="addNew">
                            <h2>Blank template</h2>
                            <h3>Start from scratch</h3>
                        </div>
                    </Link>
                    <Link className="item" to="/editor/1236">
                        <div className="addNew">
                            <h2>Template 1</h2>
                        </div>
                    </Link>
                    <Link className="item" to="/editor/1236">
                        <div className="addNew">
                            <h2>Template 2</h2>
                        </div>
                    </Link>
                    <Link className="item" to="/editor/1236">
                        <div className="addNew">
                            <h2>Template 3</h2>
                        </div>
                    </Link>
                </div>
            </div>
            <span>version 0.0.1</span>
        </div>
    );
}
