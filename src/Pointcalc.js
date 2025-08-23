import { useState } from 'react';

import Sidebar from './Sidebar.js';

import { TIERS } from './params.js';
import { challengeList } from './challengelist.js';

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
    TIERS.forEach((t) => {
        headers.push(<TableHeader key={t.name} tier={t}/>)
        columns.push(<div key={t.name} className="column"><Column tier={t} onClick={onClick} challenges={challenges.filter((c) => c.tier === t.name)} pressed={pressed}/></div>);
    });

    return (
        <div id="challengepicker">
            <span id="content">
                <div id="tiertitles">{headers}</div>
                <div id="challenges">{columns}</div>
            </span>
        </div>
    )
}

function Pointometer() {
    const [total, setTotal] = useState(0);

    function updateTotal(difference) {
        setTotal(total+difference);
    }

    const [filteredChallenges, setFilteredChallenges] = useState(challengeList);
    const sortedChallenges = filteredChallenges.sort(challengeSort);

    
    //CHALLENGE BUTTON HANDLERS
    const [pressed, setPressed] = useState(new Map());

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
            {total} points
        </div>
        </>
    );
}

function challengeSort(a, b) {
    return a.name.localeCompare(b.name);
} 

export default function App() {
    return <Pointometer />
}