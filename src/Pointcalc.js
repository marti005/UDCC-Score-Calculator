import { useState } from 'react';

import Sidebar from './Sidebar.js';
import Table from './Table.js';

import tiers from './tiers.json';
import challengeList from './challengelist.json';

export const States = {
    Incomplete: 0,
    Completed: 1,
    Bucket_List: 2
}

function Pointometer() {
    var selection = JSON.parse(localStorage.getItem("selection"));

    //TOTAL HANDLERS
    const [total, setTotal] = useState(calcScore(selection));

    //CHALLENGE BUTTON HANDLERS
    const [filteredChallenges, setFilteredChallenges] = useState(challengeList);
    const [pressed, setPressed] = useState(new Map(selection));

    //OPTIONS HANDLERS
    const [dependencies, setDependencies] = useState(false);
    const [bucketList, setBucketList] = useState(false);

    function handleClick(challenge) {
        var tmp = Array.from(pressed).slice();
        var nextPressed = new Map(tmp);

        var key = challenge.name;

        var state = null;
        handleClickRecursive(nextPressed, state, key);

        setPressed(nextPressed);

        var selection = Array.from(nextPressed).filter(c => c[1] != States.Incomplete)
        setTotal(calcScore(selection));
        localStorage.setItem("selection", JSON.stringify(selection))
    }

    function handleClickRecursive(nextPressed, state, key) {
        var challenge = challengeList.find(c => c.name === key);
        
        if (state == null) {
            switch (pressed.get(key)) {
                case States.Incomplete:
                    if (bucketList) {
                        state = States.Bucket_List;
                    } else {
                        state = States.Completed;
                    }
                    break;
                case States.Bucket_List:
                    if (bucketList) {
                        state = States.Incomplete;
                    } else {
                        state = States.Completed;
                    }
                    break;
                default:
                    if (bucketList) {
                        state = States.Bucket_List;
                    } else {
                        state = States.Incomplete;
                    }
                    break;
            }
        } else if (pressed.get(key) === States.Completed && bucketList) state = States.Completed;

        nextPressed.set(key, state);
        
        if (dependencies && challenge.sub.length > 0) {
            challenge.sub.map((s) => {
                var sub = challengeList.find(s2 => s2.name == s);
                handleClickRecursive(nextPressed, state, sub.name)
            })
        }
    }

    function clearSelection() {
        setTotal(0);

        setPressed(new Map());
        localStorage.setItem("selection", JSON.stringify([]))
    }

    return (
        <>
        <Sidebar updateChallenges={setFilteredChallenges} clearSelection={clearSelection} dependencySet={setDependencies} bucketListSet={setBucketList}/>

        <Table onClick={handleClick} challenges={filteredChallenges} pressed={pressed}/>

        <div id="total">
            <h1>{total} points</h1>
        </div>
        </>
    );
}

function calcScore(selection) {
    var score = 0;

    if (selection !== null) {
        selection.forEach((c) => {
            var challenge = challengeList.find(ch => ch.name === c[0]);

            if (challenge !== undefined && (c[1] === States.Completed || c[1] === true)) {
                var value = tiers.find(t => t.name === challenge.tier).points;
                score += value;
            }
        });
    }

    return score;
}

export default function App() {
    return <Pointometer />
}