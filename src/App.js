import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { sortBy } from 'lodash'
import classNames from 'classnames'
import './App.css'

const DEFAULT_QUERY = 'redux'
const DEFAULT_HPP = '10'

const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = '?query='
const PARAM_PAGE = 'page='
const PARAM_HPP = 'hitsPerPage='

const SORTS = {
    NONE: (list) => list,
    TITLE: (list) => sortBy(list, 'title'),
    AUTHOR: (list) => sortBy(list, 'author'),
    COMMENTS: (list) => sortBy(list, 'num_comments').reverse(),
    POINTS: (list) => sortBy(list, 'points').reverse(),
}

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
            error: null,
            isLoading: false,
            sortKey: 'NONE',
            isSortReverse: false
        }
        this.onDismiss = this.onDismiss.bind(this)
        this.onSearchChange = this.onSearchChange.bind(this)
        this.onSearchSubmit = this.onSearchSubmit.bind(this)
        this.setSearchTopStories = this.setSearchTopStories.bind(this)
        this.fetchSearchStories = this.fetchSearchStories.bind(this)
        this.onSort = this.onSort.bind(this)
    }
    onDismiss(id) {
        const { searchKey, results } = this.state
        const { hits, page } = results[searchKey]
        const updateHits = hits.filter((item) => item.objectID !== id)
        this.setState({
            results: {
                ...results,
                [searchKey]: {
                    hits: updateHits,
                    page,
                },
            },
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
                    page,
                },
            },
            isLoading: false,
        })
    }
    onSearchSubmit(event) {
        const { searchTerm } = this.state
        this.setState({
            searchKey: searchTerm,
        })
        this.needToFetchSearchStories(searchTerm) &&
            this.fetchSearchStories(searchTerm)
        event.preventDefault()
    }
    needToFetchSearchStories(searchTerm) {
        return !this.state.results[searchTerm]
    }
    async fetchSearchStories(searchTerm, page = 0) {
        const url = `${PATH_BASE}${PATH_SEARCH}${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`
        try {
            this.setState({
                isLoading: true,
            })
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
            searchKey: searchTerm,
        })
        this.fetchSearchStories(searchTerm)
    }
    onSort(sortKey) {
        const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
        this.setState({
            sortKey,
            isSortReverse,
        })
    }
    render() {
        const {
            searchTerm,
            results,
            searchKey,
            error,
            isLoading,
            sortKey,
            isSortReverse
        } = this.state

        const page =
            (results && results[searchKey] && results[searchKey].page) || 0
        const list =
            (results && results[searchKey] && results[searchKey].hits) || []
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
                    {error ? (
                        <div className="interactions">
                            <p>Something went wrong.</p>
                        </div>
                    ) : (
                            <Table
                                list={list}
                                sortKey={sortKey}
                                isSortReverse={isSortReverse}
                                onSort={this.onSort}
                                onDismiss={this.onDismiss}
                            ></Table>
                        )}

                    <ButtonWithLoading
                        isLoading={isLoading}
                        onClick={() =>
                            this.fetchSearchStories(searchKey, page + 1)
                        }
                    >
                        More
                    </ButtonWithLoading>
                </div>
            </div>
        )
    }
}

// HOC

const withLoading = (Component) => ({ isLoading, ...props }) => {
    return isLoading ? <Loading></Loading> : <Component {...props}></Component>
}

// Button

const Button = ({ className, onClick, children }) => (
    <button className={className} onClick={onClick} type="button">
        {children}
    </button>
)
Button.propTypes = {
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
}
Button.defaultProps = {
    className: '',
}

const ButtonWithLoading = withLoading(Button)
// Search

// const Search = ({ value, onChange, onSubmit, children }) => {
//     let input
//     return (
//         <form onSubmit={onSubmit}>
//             <input type="text" value={value} onChange={onChange} ref={node => input = node}></input>
//             <button type="submit" >{children}</button>
//         </form>
//     )
// }

// Search.propTypes = {
//     value: PropTypes.string,
//     onChange: PropTypes.func.isRequired,
//     onSubmit: PropTypes.func.isRequired,
//     children: PropTypes.node
// }

class Search extends Component {
    componentDidMount() {
        this.input && this.input.focus()
    }
    render() {
        const { value, onChange, onSubmit, children } = this.props
        return (
            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    ref={(node) => (this.input = node)}
                ></input>
                <button type="submit">{children}</button>
            </form>
        )
    }
}

// Table

const Table = ({ list, onDismiss, sortKey, onSort, isSortReverse }) => {
    const sortList = isSortReverse ? SORTS[sortKey](list).reverse() : SORTS[sortKey](list)
    return (
        <div className="table">
            <div className="table-header">
                <span style={{ width: '40%' }}>
                    <Sort sortKey={'TITLE'} activeSortKey={sortKey} onSort={onSort}>Title</Sort>
                </span>
                <span style={{ width: '30%' }}>
                    <Sort sortKey={'AUTHOR'} activeSortKey={sortKey} onSort={onSort}>Author</Sort>
                </span>
                <span style={{ width: '10%' }}>
                    <Sort sortKey={'COMMENTS'} activeSortKey={sortKey} onSort={onSort}>Comments</Sort>
                </span>
                <span style={{ width: '10%' }}>
                    <Sort sortKey={'POINTS'} activeSortKey={sortKey} onSort={onSort}>Points</Sort>
                </span>
                <span style={{ width: '10%' }}>
                    Archive
                </span>
            </div>
            {sortList.map((item) => (
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
}
Table.propTypes = {
    list: PropTypes.arrayOf(
        PropTypes.shape({
            objectID: PropTypes.string.isRequired,
            author: PropTypes.string,
            url: PropTypes.string,
            num_comments: PropTypes.number,
            points: PropTypes.number,
        })
    ).isRequired,
    onDismiss: PropTypes.func.isRequired,
}

// Sort

const Sort = ({ onSort, sortKey, children, activeSortKey }) => {
    const sortClass = classNames('button-inline', {
        'button-active': sortKey === activeSortKey
    })
    return (
        <Button className={sortClass} onClick={() => onSort(sortKey)}>{children}</Button>
    )
}

// Loading

const Loading = () => <div>Loading....</div>

export default App

export { Button, Search, Table }
