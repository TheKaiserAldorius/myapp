
import React, { useState, useEffect } from 'react';

const Home = () => {
    const [cases, setCases] = useState([]);
    
    useEffect(() => {
        fetch("http://localhost:5000/api/cases")
            .then((res) => res.json())
            .then((data) => setCases(data));
    }, []);

    return (
        <div className="home">
            <h1>Выберите кейс</h1>
            <ul>
                {cases.map((caseItem) => (
                    <li key={caseItem.id}>
                        <button>{caseItem.name}</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
