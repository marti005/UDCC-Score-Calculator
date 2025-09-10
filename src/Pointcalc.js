import { useState } from 'react';

import Sidebar from './Sidebar.js';

import tiers from './tiers.json';
import challengeList from './challengelist.json';

function TableHeader({tier}) {
    return (<div style={{ background: '#' + tier.color}} className="challengeheader">
                <div>
                    {tier.name}
                </div>
                <div className="headerpoints">
                    {tier.points} points
                </div>
            </div>
    )
}

function TableElement({challenge, isPressed, onChallengeClick}) {
    var cname = isPressed ? "challengebuttonpressed" : "challengebutton";

    return (
        <div className="buttoncontainer">
            <button style={{ whiteSpace: "pre-line" }} className={cname} onClick={onChallengeClick}>
                {challenge.name.split("<br/>").join("\n")}
            </button>
        </div> 
    )
}

function Column({tier, onClick, challenges, pressed}) {
    return (
        <>
            {challenges.map((c) => {
                let key = c.name;
                if (!pressed.has(key)) pressed.set(key, false);
                return <TableElement key={key} challenge={c} isPressed={pressed.get(key)} onChallengeClick={() => onClick(key, tier.points)}/>
            })}
        </>
    );
}

function Table({onClick, challenges, pressed}) {
    const columns = [];
    const headers = []
    tiers.forEach((t) => {
        headers.push(<TableHeader key={t.name} tier={t}/>)
        columns.push(<div key={t.name} className="column"><Column tier={t} onClick={onClick} challenges={challenges.filter((c) => c.tier === t.name)} pressed={pressed}/></div>);
    });

    return (
        <div id="challengepicker">
            <div id="tiertitles">{headers}</div>
            <div id="challenges">{columns}</div>
        </div>
    )
}

function Pointometer() {
    const [total, setTotal] = useState(iniScore());

    function updateTotal(difference) {
        setTotal(total+difference);
    }

    const [filteredChallenges, setFilteredChallenges] = useState(challengeList);
    const sortedChallenges = filteredChallenges;

    
    //CHALLENGE BUTTON HANDLERS
    const [pressed, setPressed] = useState(new Map(JSON.parse(localStorage.getItem("selection"))));

    function handleClick(key, amount) {
        const tmp = Array.from(pressed).slice();
        const nextPressed = new Map(tmp);

        if (pressed.get(key)) {
            nextPressed.set(key, false);
            updateTotal(-amount);
        } else {
            nextPressed.set(key, true);
            updateTotal(amount);
        }
        setPressed(nextPressed);

        localStorage.setItem("selection", JSON.stringify(Array.from(nextPressed)))
    }

    function clearSelection() {
        setTotal(0);

        setPressed(new Map());
    }

    return (
        <>
        <Sidebar updateChallenges={setFilteredChallenges} clearSelection={clearSelection}/>

        <Table onClick={handleClick} challenges={sortedChallenges} pressed={pressed}/>

        <div id="total">
            <h1>{total} points</h1>
        </div>
        </>
    );
}

function iniScore() {
    var score = 0;

    JSON.parse(localStorage.getItem("selection")).forEach((c) => {
        if (c[1]) {
            var challenge = challengeList.filter(ch => ch.name === c[0]);
            if (challenge.length === 1) {
                var value = tiers.filter(t => t.name === challenge[0].tier);
                score += value[0].points;
            }
        }
    });

    return score;
}

export default function App() {
    return <Pointometer />
}