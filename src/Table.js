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

function TableElement({name, state, onChallengeClick}) {
    var cname;
    
    switch(state) {
        case 1: 
            cname = "challengebuttonpressed";
            break;
        case 2: 
            cname = "challengebuttonbucket";
            break;
        default:
            cname = "challengebutton";
    }

    return (
        <div className="buttoncontainer">
            <button style={{ whiteSpace: "pre-line" }} className={cname} onClick={onChallengeClick}>
                {name.split("<br/>").join("\n")}
            </button>
        </div> 
    )
}

function Column({onClick, challenges, pressed}) {
    return (
        <>
            {challenges.map((c) => {
                let key = c.id;
                let name = challenges.find((c) => c.id === key).name
                if (!pressed.has(key)) pressed.set(key, 0);
                return <TableElement key={key} name={name} state={pressed.get(key)} onChallengeClick={() => onClick(c)}/>
            })}
        </>
    );
}

export default function Table({onClick, challenges, tiers, pressed}) {
    const columns = [];
    const headers = []
    tiers.forEach((t) => {
        headers.push(<TableHeader key={t.name} tier={t}/>)
        columns.push(<div key={t.name} className="column"><Column onClick={onClick} challenges={challenges.filter((c) => c.tier === t.name)} pressed={pressed}/></div>);
    });

    return (
        <div id="challengepicker">
            <div id="tiertitles">{headers}</div>
            <div id="challenges">{columns}</div>
        </div>
    )
}