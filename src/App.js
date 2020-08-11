import React, { Component } from 'react'
import './App.css'

const DEFAULT_QUERY = 'redux'
const DEFAULT_HPP = '100'

const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = '?query='
const PARAM_PAGE = 'page='
const PARAM_HPP = 'hitsPerPage='


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

// const isSearched = (searchTerm) => (item) =>
//     item.title.toLowerCase().includes(searchTerm.toLowerCase())

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            list,
            searchKey: '',
            searchTerm: DEFAULT_QUERY,
            results: {},
            error: null
        }
        this.onDismiss = this.onDismiss.bind(this)
        this.onSearchChange = this.onSearchChange.bind(this)
        this.onSearchSubmit = this.onSearchSubmit.bind(this)
        this.setSearchTopStories = this.setSearchTopStories.bind(this)
        this.fetchSearchStories = this.fetchSearchStories.bind(this)
    }
    onDismiss(id) {
        const { searchKey, results } = this.state
        const { hits, page } = results[searchKey]
        const updateHits = hits.filter(
            (item) => item.objectID !== id
        )
        this.setState({
            results: {
                ...results,
                [searchKey]: {
                    hits: updateHits,
                    page,
                },
            }
        })
    }
    onSearchChange(event) {
        this.setState({
            searchTerm: event.target.value,
        })
    }
    setSearchTopStories(result) {
        const { hits, page } = result
        const { searchKey, results } = this.state
        const oldHits = page !== 0 ? results && results[searchKey].hits : []
        const updateHits = [...oldHits, ...hits]
        this.setState({
            results: {
                ...results,
                [searchKey]: {
                    hits: updateHits,
                    page
                }
            }
        })
    }
    onSearchSubmit(event) {
        const { searchTerm } = this.state
        this.setState({
            searchKey: searchTerm
        })
        this.needToFetchSearchStories(searchTerm) && this.fetchSearchStories(searchTerm)
        event.preventDefault()
    }
    needToFetchSearchStories(searchTerm) {
        return !this.state.results[searchTerm]
    }
    async fetchSearchStories(searchTerm, page = 0) {
        const url = `${PATH_BASE}${PATH_SEARCH}${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`
        try {
            const result = await (await fetch(`${url}`)).json()
            this.setSearchTopStories(result)
        } catch (error) {
            this.setState({
                error,
            })
            console.error(error)
        }
    }
    componentDidMount() {
        const { searchTerm } = this.state
        this.setState({
            searchKey: searchTerm
        })
        this.fetchSearchStories(searchTerm)
    }
    render() {
        const { searchTerm, results, searchKey, error } = this.state

        const page = (results && results[searchKey] && results[searchKey].page) || 0
        const list = (results && results[searchKey] && results[searchKey].hits) || []
        return (
            <div className="App">
                <div className="page">
                    <div className="interactions">
                        <Search
                            value={searchTerm}
                            onChange={this.onSearchChange}
                            onSubmit={this.onSearchSubmit}
                        >
                            Search
                        </Search>
                    </div>
                    {error ?
                        <div className="interactions">
                            <p>Something went wrong.</p>
                        </div>
                        : <Table
                            list={list}
                            onDismiss={this.onDismiss}
                        ></Table>
                    }
                    <div className="interactions">
                        <Button onClick={() => this.fetchSearchStories(searchKey, page + 1)}>More</Button>
                    </div>
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

const Search = ({ value, onChange, onSubmit, children }) => (
    <form onSubmit={onSubmit}>
        <input type="text" value={value} onChange={onChange}></input>
        <button type="submit" >{children}</button>
    </form>
)

const Table = ({ list, onDismiss }) => (
    <div className="table">
        {list.map((item) => (
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
