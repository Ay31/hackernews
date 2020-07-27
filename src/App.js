import React from 'react'
import logo from './logo.svg'
import './App.css'

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
const helloWorld = 'welcome to React'

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            list,
        }
        this.onDismiss = this.onDismiss.bind(this)
    }
    onDismiss(id) {
        const updatedList = this.state.list.filter(
            (item) => item.objectID !== id
        )
        this.setState({
            list: updatedList,
        })
    }
    render() {
        return (
            <div className="App">
                <form>
                    <input type="text" onChange={this.onSearchChange}></input>
                </form>
                {/* <h2> */}
                {this.state.list.map((item) => {
                    return (
                        <div key={item.objectID}>
                            <span>
                                <a href={item.url}>{item.title}</a>
                            </span>
                            <span>{item.author}</span>
                            <span>{item.num_comments}</span>
                            <span>{item.points}</span>
                            <span>
                                <button
                                    onClick={() =>
                                        this.onDismiss(item.objectID)
                                    }
                                    type="button"
                                >
                                    Dismiss
                                </button>
                            </span>
                        </div>
                    )
                })}
                {/* </h2> */}
            </div>
        )
    }
}

export default App
