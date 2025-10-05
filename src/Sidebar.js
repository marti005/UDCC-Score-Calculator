import { useState } from 'react';

import challengeList from './challengelist.json';
import filters from './filters.json';

import soul from './img/red_soul.png';

function FilterCheckbox({id, checked, text, cat, updateFilter}) {
    return (
        <div>
            <label>
                <input checked={checked} type="checkbox" onChange={(e) => updateFilter(id, e.target.checked, cat, text)}/>
                    {' '}
                    {text}
            </label>
        </div>
    );
}

function Checkbox({id, checked, text, onChange}) {
    return(
        <div className="otherOption">
            <label>
                <input checked={checked} type="checkbox" onChange={(e) => onChange(id)}/>
                {' '}
                {text}
            </label>
        </div>
    )
}

function Searchbar({searchText, updateSearchText}) {
    return (
        <input id="searchbar" type="text" value={searchText} onChange={(e) => updateSearchText(e.target.value)} placeholder="Search..."/>
    )
}

export default function Sidebar({updateChallenges, clearSelection, dependencySwitch}) {
    const [enabled, setEnabled] = useState(false);

    const [checked, setChecked] = useState([]);

    const [filter, setFilter] = useState(Array.from({length: filters.length}, () => new Set()));

    const [searchText, setSearchText] = useState("");

    function resetCheckboxes() {
        setChecked([]);

        clearFilter();
    }
    
    function clearFilter() {
        var newFilter = Array.from({length: filters.length}, () => new Set());
        var newText = "";

        setFilter(newFilter);
        setSearchText(newText);
        filterChallenges(newFilter, newText);
    }

    function updateFilter(state, cat, option) {
        var newFilter = filter.slice();

        if (state)  newFilter[cat].add(option);
        else newFilter[cat].delete(option);
        
        filterChallenges(newFilter, searchText);
        setFilter(newFilter);
    }

    function filterChallenges(newFilter, newText) {
        var challenges = challengeList;

        newFilter.forEach((catFilter, index) => {
            challenges = catFilter.size === 0 ? challenges : challenges.filter((c) => catFilter.has(Object.values(c)[2+index]));
        })

        challenges = challenges.filter((c) => c.name.toLowerCase().indexOf(newText.toLowerCase()) !== -1);
         
        updateChallenges(challenges);
    }

    function updateCheckbox(id, state, cat, option) {
        var nextChecked = checked.slice();
        nextChecked[id] = !nextChecked[id];
        setChecked(nextChecked);

        updateFilter(state, cat, option);
    }

    function updateSearchText(text) {
        setSearchText(text);

        filterChallenges(filter, text);
    }

    function updateDependencyCheckbox(id) {
        var nextChecked = checked.slice();
        nextChecked[id] = !nextChecked[id];
        setChecked(nextChecked);

        dependencySwitch();
    }

    if (enabled) {
        var filterCategories = [];
        var i = 0;
        var id;
        filters.forEach((cat, index) => {
            var filterOptions = [];
            Object.entries(cat.options).forEach((option) => {
                id = i;
                var isChecked = checked[id] === undefined ? false : checked[id];
                filterOptions.push(<FilterCheckbox key={id} id={id} checked={isChecked} text={option[1]} cat={index} updateFilter={updateCheckbox}/>);
                ++i;
            });

            filterCategories.push(<div key={index}><div className="catName">{cat.name}</div><div>{filterOptions}</div></div>);
        });

        ++id;
        var otherCheckboxes = [];
        var isChecked = checked[id] === undefined ? false : checked[id];
        otherCheckboxes.push(<Checkbox key={id} id={id} checked={isChecked} text="Autoselect dependencies" onChange={updateDependencyCheckbox} />)

        return (
            <div id="sidenav">
                    <div><button onClick={() => setEnabled(false)} id="closebutton"><h1>X</h1></button></div>
                <div><Searchbar searchText={searchText} updateSearchText={updateSearchText}/></div>
                <div><h2>Filter by</h2></div>
                <form>
                    {filterCategories}
                    <h2>Options</h2>
                    {otherCheckboxes}
                </form>

                <div id="sidebarbuttons">
                    <div><button onClick={resetCheckboxes}>Clear filters</button></div>
                    <div><button onClick={clearSelection}>Clear selection</button></div>
                </div>

                <p>Made with <img src={soul}></img> for <a href="https://discord.gg/WVFcWXwT6A" target="_blank">UDCC</a></p>
            </div>
        );
    } else {
        return (
            <button onClick={() => setEnabled(true)} id="openbutton">{'>'}</button>
        );
    }
}