// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

const SortableItem = SortableElement(({value}) => <li>{value}</li>);

const SortableList = SortableContainer(({items}) => {
    return (
        <ul>
            {items.map((value, index) =>
                <SortableItem
                  key={`item-${index}`}
                  index={index}
                  value={`list item: ${value} ${index}`}
                />
            )}
        </ul>
    );
});

export default class Home extends Component {
    state = {
        initialItems:
        [
        "Apples",
        "Oranges",
        "Chicken",
        "Eggs",
        "Fish",
        "Duck"
        ],
        items: ["first", "items"]
    }

      onSortEnd = ({oldIndex, newIndex}) => {
        this.setState({
            items: arrayMove(this.state.items, oldIndex, newIndex)
        });
      }

    filterList = (event) => {
        var updatedList = this.state.initialItems;
        updatedList = updatedList.filter(function(item){
            return item.toLowerCase().indexOf(event.target.value.toLowerCase()) !== -1;
        });
        this.setState({items: updatedList})
    }

    componentWillMount = () => {
        this.setState({items: this.state.initialItems})
    }

    render = () => {
        return (
            <div className="filter-list">
                <input type="text" placeholder="Search" onChange={this.filterList}/>
                <SortableList
                  items={this.state.items}
                  onSortEnd={this.onSortEnd}
                  lockAxis='y'
                />
            </div>
        )
    }
}
