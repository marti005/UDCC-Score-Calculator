import {useEffect, useState} from 'react';
import {useDownloadFile} from 'react-downloadfile-hook'

import Sidebar from './Sidebar.js';
import Table from './Table.js';

import {getChallenges, getTiers} from "./getData";

export const States = {
    Incomplete: 0,
    Completed: 1,
    Bucket_List: 2
}

export function StatesToNumbers(text) {
    switch (text) {
        case "Completed":
            return States.Completed
        case "Bucket List":
            return States.Bucket_List
        case "Incomplete":
            return States.Incomplete
        default:
            return text
    }
}

export let challengeList = [];
export let tierList = []

function Pointometer() {
    let selection = JSON.parse(localStorage.getItem("selection"));

    // REMOVE AFTER MOVING TO NEW URL
    if (typeof selection?.[0]?.[0] === "string") {
        selection = selection.map(function (challenge) {
            const newChallenge = challengeList.find((targetChallenge) => targetChallenge.name === challenge[0])
            
            if (newChallenge === undefined) return null
            return [newChallenge.id, challenge[1]]
        })

        selection = selection.filter(Boolean);
        localStorage.setItem("selection", JSON.stringify(selection))
    }

    useEffect(() => {
        Promise.all([getChallenges(), getTiers()])
            .then(([challengesData, tiersData]) => {
                challengeList = challengesData;
                tierList = tiersData;
                setFilteredChallenges(challengesData);

                const [score, bucketScore] = calcScore(selection);
                setTotal(score);
                setBucketListScore(bucketScore);
            })
            .catch(() => {
                console.error("Loading error");
            });
        // eslint-disable-next-line
    }, []);

    //SCORE HANDLERS
    const [total, setTotal] = useState(0);
    const [bucketListScore, setBucketListScore] = useState(0)

    //CHALLENGE BUTTON HANDLERS
    const [filteredChallenges, setFilteredChallenges] = useState(challengeList);
    const [pressed, setPressed] = useState(new Map(selection));

    //OPTIONS HANDLERS
    const [dependencies, setDependencies] = useState(false);
    const [bucketList, setBucketList] = useState(false);

    function handleClick(challenge) {
        const tmp = Array.from(pressed).slice();
        const nextPressed = new Map(tmp);

        handleClickRecursive(nextPressed, null, challenge.id);

        setPressed(nextPressed);

        const selection = Array.from(nextPressed).filter(c => c[1] !== States.Incomplete)
        const score = calcScore(selection);
        setTotal(score[0]);
        setBucketListScore(score[1]);
        localStorage.setItem("selection", JSON.stringify(selection))
    }

    function handleClickRecursive(nextPressed, state, key) {
        const challenge = challengeList.find(c => c.id === key);
        
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
            challenge.sub.forEach((s) => {
                const sub = challengeList.find(s2 => s2.id === s);

                if (sub !== undefined) {
                    handleClickRecursive(nextPressed, state, sub.id)
                }
            })
        }
    }

    function clearSelection() {
        setTotal(0);
        setBucketListScore(0);

        setPressed(new Map());
        localStorage.setItem("selection", JSON.stringify([]))
    }

    const { downloadFile } = useDownloadFile({
        fileName: "selection.json",
        format: "application/json",
        data: JSON.stringify(selection)
    })

    function importSelection(data) {
        const newSelection = JSON.parse(data)

        setPressed(new Map(newSelection))
        localStorage.setItem("selection", data)

        const newScores = calcScore(newSelection)
        setTotal(newScores[0])
        setBucketListScore(newScores[1])
    }

    return (
        <>
            {challengeList.length !== 0 ? (
                <>
                    <Sidebar
                        importSelection={importSelection}
                        exportSelection={downloadFile}
                        updateChallenges={setFilteredChallenges}
                        clearSelection={clearSelection}
                        dependencySet={setDependencies}
                        bucketListSet={setBucketList}
                    />

                    <Table
                        onClick={handleClick}
                        tiers={tierList}
                        challenges={filteredChallenges}
                        pressed={pressed}
                    />

                    <div id="total">
                        <h1>{total} points</h1>
                        <h2>+{bucketListScore} in bucket list</h2>
                    </div>
                </>
            ) : (
                <h1 className="loadingtext">Loading...</h1>
            )}
        </>
    );
}

function calcScore(selection) {
    let score = 0;
    let bucketScore = 0;

    if (selection !== null) {
        selection.forEach((c) => {
            let challenge = challengeList.find(ch => ch.id === c[0]);

            if (challenge !== undefined) {
                let value = tierList.find(t => t.name === challenge.tier)?.points ?? 0;
                if (c[1] === States.Completed || c[1] === true) score += value;
                else if (c[1] === States.Bucket_List) bucketScore += value;
            }
        });
    }

    return [score, bucketScore];
}

export default function App() {
    return <Pointometer />
}
