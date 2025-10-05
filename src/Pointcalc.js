import { useState } from 'react';

import Sidebar from './Sidebar.js';
import Table from './Table.js';

import tiers from './tiers.json';
import challengeList from './challengelist.json';

function Pointometer() {
    //TOTAL HANDLERS
    const [total, setTotal] = useState(iniScore());

    function updateTotal(difference) {
        setTotal(total+difference);
    }

    //CHALLENGE BUTTON HANDLERS
    const [filteredChallenges, setFilteredChallenges] = useState(challengeList);

    const [pressed, setPressed] = useState(new Map(JSON.parse(localStorage.getItem("selection"))));

    const [dependencies, setDependencies] = useState(false);

    function handleClick(challenge) {
        var tmp = Array.from(pressed).slice();
        var nextPressed = new Map(tmp);

        var key = challenge.name;
        var amount = tiers.find(t => t.name === challenge.tier).points;

        var pointsDelta = 0;
        var state;

        if (pressed.get(key)) {
            nextPressed.set(key, false);
            pointsDelta = -amount;
            state = true;
        } else {
            nextPressed.set(key, true);
            pointsDelta = amount;
            state = false;
        }

        if (dependencies && challenge.sub.length > 0) {
            challenge.sub.map((s) => {
                var sub = challengeList.find(s2 => s2.name == s);

                pointsDelta += handleClickRecursive(nextPressed, state, sub.name, tiers.find(t => t.name === sub.tier).points)
            })
        }

        setPressed(nextPressed);
        setTotal(total + pointsDelta);

        localStorage.setItem("selection", JSON.stringify(Array.from(nextPressed)))
    }

    function handleClickRecursive(nextPressed, state, key, amount) {
        var subPoints = 0;
        var selfPoints = 0;
        
        if (state == nextPressed.get(key)) {
            if (state) {
                nextPressed.set(key, false);
                selfPoints = -amount;
            } else {
                nextPressed.set(key, true);
                selfPoints = amount;
            }
        }

        var challenge = challengeList.find(c => c.name === key);

        if (challenge.sub.length > 1) {
            challenge.sub.map((s) => {
                var sub = challengeList.find(s2 => s2.name == s);
                
                subPoints += handleClickRecursive(nextPressed, state, sub.name, tiers.find(t => t.name === sub.tier).points)
            })
        }
        
        return subPoints + selfPoints;
    }

    function clearSelection() {
        setTotal(0);

        setPressed(new Map());
    }

    return (
        <>
        <Sidebar updateChallenges={setFilteredChallenges} clearSelection={clearSelection} dependencySet={setDependencies}/>

        <Table onClick={handleClick} challenges={filteredChallenges} pressed={pressed}/>

        <div id="total">
            <h1>{total} points</h1>
        </div>
        </>
    );
}

function iniScore() {
    var score = 0;

    var selection = JSON.parse(localStorage.getItem("selection"));
    if (selection !== null) {
        selection.forEach((c) => {
            if (c[1]) {
                var challenge = challengeList.filter(ch => ch.name === c[0]);
                if (challenge.length === 1) {
                    var value = tiers.filter(t => t.name === challenge[0].tier);
                    score += value[0].points;
                }
            }
        });
    }

    return score;
}

export default function App() {
    return <Pointometer />
}