import { useState } from 'react';

import { TIERS, C_TYPE, GAME, R_TYPE } from './params.js';
import { challengeList } from './challengelist.js';

function TableHeader({tier}) {
    return (<div class="challengeheader">
                <div>
                    {tier[0]}
                </div>
                <div class="headerpoints">
                    {tier[1]} points
                </div>
            </div>
    )
}

function TableElement({challenge, isPressed, onChallengeClick}) {
    var cname = isPressed ? "challengebuttonpressed" : "challengebutton";

    return (
        <div>
            <button class={cname} onClick={onChallengeClick}>
                {challenge.name}
            </button>
        </div> 
    )
}

function Column({tier, onClick, challenges, pressed}) {
    return (
        <>
            <TableHeader tier={tier} />
            {challenges.map((c) => {
                if (c.tier === tier[1]) {
                    let key = c.name;
                    if (!pressed.has(key)) pressed.set(key, false);
                    return <TableElement key={key} challenge={c} isPressed={pressed.get(key)} onChallengeClick={() => onClick(key, tier[1])}/>
                }
            })}
        </>
    );
}

function Table({onClick, challenges, pressed}) {
    const columns = [];
    Object.entries(TIERS).forEach((t) => {
        columns.push(<div class="column"><Column tier={t} onClick={onClick} challenges={challenges.filter((c) => c.tier === t[1])} pressed={pressed}/></div>);
    });

    return (
        <div class="challengepicker">
            <span class="content">
                {columns}
            </span>
        </div>
    )
}

function Checkbox({id, checked, text, cat, param, updateFilter}) {
    return (
        <div>
            <label>
                <input checked={checked} type="checkbox" onChange={(e) => updateFilter(id, e.target.checked, cat, param)}/>
                    {' '}
                    {text}
            </label>
        </div>
    );
}

function Sidebar({total, updateFilter, clearFilter, clearSelection}) {
    const [checked, setChecked] = useState(Array(8).fill(false));

    function resetFilter() {
        setChecked(Array(8).fill(false));
    
        clearFilter();
    }

    function updateCheckbox(id, state, cat, param) {
        var nextChecked = checked.slice();
        nextChecked[id] = !nextChecked[id];
        setChecked(nextChecked);

        updateFilter(state, cat, param);
    }

    const ctypeBoxes = [];
    Object.entries(C_TYPE).forEach((c, index) => {
        ctypeBoxes.push(<Checkbox id={index} checked={checked[index]} text={c[1]} cat="challenge" param={c[1]} updateFilter={updateCheckbox}/>)
    });

    const gameBoxes = [];
    Object.entries(GAME).forEach((c, index) => {
        gameBoxes.push(<Checkbox id={3+index} checked={checked[3+index]} text={c[1]} cat="game" param={c[1]} updateFilter={updateCheckbox}/>)
    });
    

    const rtypeBoxes = [];
    Object.entries(R_TYPE).forEach((c, index) => {
        rtypeBoxes.push(<Checkbox id={6+index} checked={checked[6+index]} text={c[1]} cat="run" param={c[1]} updateFilter={updateCheckbox}/>)
    });

    return (
            <div class="sidenav">
            <form>
                <div><h2>Filter by:</h2></div>
                <div><p>Challenge type</p></div>
                <div>
                    {ctypeBoxes}
                </div>
                <div><p>Game</p>
                    {gameBoxes}
                </div>
                <div><p>Run type</p>
                    {rtypeBoxes}
                </div>
            </form>

            <div class="sidebarbuttons">
                <div><button class="sidebutton" onClick={resetFilter}>Clear filters</button></div>
                <div><button class="sidebutton" onClick={clearSelection}>Clear selection</button></div>
            </div>

            <div class="total">
                <h1>{total} points</h1>
            </div>
        </div>
    );
}

function Pointometer() {
    const [total, setTotal] = useState(0);

    //FILTER HANDLERS
    const [ctypeFilter, setCtypeFilter] = useState(new Set());
    const [gameFilter, setGameFilter] = useState(new Set());
    const [rtypeFilter, setRtypeFilter] = useState(new Set());

    function updateTotal(difference) {
        setTotal(total+difference);
    }

    function updateFilter(checked, cat, param) {
        switch (cat) {
            case "challenge":
                if (checked) setCtypeFilter((prev) => new Set(prev).add(param));
                else setCtypeFilter((prev) => {const next = new Set(prev); next.delete(param); return next;});
                break;
            case "game":
                if (checked) setGameFilter((prev) => new Set(prev).add(param));
                else setGameFilter((prev) => {const next = new Set(prev); next.delete(param); return next;});
                break;
            case "run":
                if (checked) setRtypeFilter((prev) => new Set(prev).add(param));
                else setRtypeFilter((prev) => {const next = new Set(prev); next.delete(param); return next;});
                break;
        }
    }

    function filterChallenges() {
        var challenges = challengeList;

        challenges = ctypeFilter.size === 0 ? challenges : challenges.filter((c) => ctypeFilter.has(c.ctype));
        challenges = gameFilter.size === 0 ? challenges : challenges.filter((c) => gameFilter.has(c.game));
        challenges = rtypeFilter.size === 0 ? challenges : challenges.filter((c) => rtypeFilter.has(c.rtype));
        
        return challenges;
    }

    function clearFilter() {
        setCtypeFilter(new Set()); 
        setGameFilter(new Set()); 
        setRtypeFilter(new Set()); 
    }

    const filteredChallenges = filterChallenges();
    console.log(filteredChallenges.length);

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
        <Sidebar total={total} updateFilter={updateFilter} clearFilter={clearFilter} clearSelection={clearSelection}/>
        <Table onClick={handleClick} challenges={filteredChallenges} pressed={pressed}/>
        </>
    );
}

export default function App() {
    return <Pointometer />
}