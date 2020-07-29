import React, { Component } from 'react'
import './App.css'

const DEFAULT_QUERY = 'redux'

const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = '/query='

const url = `${PATH_BASE}${PATH_SEARCH}${PARAM_SEARCH}`

const list = [
    {
        title: 'React',
        url: 'https://facebook.github.io/react/',
        author: 'Jordan Walke',
        num_comments: 3,
        points: 4,
        objectID: 0,
    },
    {
        title: 'Redux',
        url: 'https://github.com/reactjs/redux',
        author: 'Dan Abramov, Andrew Clark',
        num_comments: 2,
        points: 5,
        objectID: 1,
    },
]

const largeColumn = {
    width: '40%',
}

const midColumn = {
    width: '30%',
}

const smallColumn = {
    width: '10%',
}

const isSearched = (searchTerm) => (item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            list,
            searchTerm: '',
            result: '',
        }
        this.onDismiss = this.onDismiss.bind(this)
        this.onSearchChange = this.onSearchChange.bind(this)
        this.setSearchTopStories = this.setSearchTopStories.bind(this)
        this.fetchSearchStories = this.fetchSearchStories.bind(this)
    }
    onDismiss(id) {
        const updatedList = this.state.list.filter(
            (item) => item.objectID !== id
        )
        this.setState({
            list: updatedList,
        })
    }
    onSearchChange(event) {
        this.setState({
            searchTerm: event.target.value,
        })
    }
    setSearchTopStories(result) {
        this.setState({
            result,
        })
    }
    async fetchSearchStories(searchTerm) {
        try {
            const response = await fetch(`${url}${searchTerm || DEFAULT_QUERY }`)
            this.setSearchTopStories(response.json())
        } catch (error) {
            console.error(error)
        }
    }
    componentDidMount() {
        const { searchTerm } = this.state
        this.fetchSearchStories(searchTerm)
    }
    render() {
        const { searchTerm, result } = this.state
        if (!result) {
            return null
        }
        return (
            <div className="App">
                <div className="page">
                    <div className="interactions">
                        <Search
                            value={searchTerm}
                            onChange={this.onSearchChange}
                        >
                            Search
                        </Search>
                    </div>

                    <Table
                        list={result.hits}
                        pattern={searchTerm}
                        onDismiss={this.onDismiss}
                    ></Table>
                </div>
            </div>
        )
    }
}

const Button = ({ className = '', onClick, children }) => (
    <button className={className} onClick={onClick} type="button">
        {children}
    </button>
)

const Search = ({ value, onChange, children }) => (
    <form>
        {children}
        <input type="text" value={value} onChange={onChange}></input>
    </form>
)

const Table = ({ list, pattern, onDismiss }) => (
    <div className="table">
        {list.filter(isSearched(pattern)).map((item) => (
            <div key={item.objectID} className="table-row">
                <span style={largeColumn}>
                    <a href={item.url}>{item.title}</a>
                </span>
                <span style={midColumn}>{item.author}</span>
                <span style={smallColumn}>{item.num_comments}</span>
                <span style={smallColumn}>{item.points}</span>
                <span style={smallColumn}>
                    <Button
                        onClick={() => onDismiss(item.objectID)}
                        className="button-inline"
                    >
                        Dismiss
                    </Button>
                </span>
            </div>
        ))}
    </div>
)

export default App
