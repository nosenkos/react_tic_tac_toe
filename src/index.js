import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
    return (
        <button className="square"
                style={{color: props.style}}
                onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            maxItem: 9,
        }
    }

    renderSquare(i) {
        let combWin = this.props.combWin;
        let status = false;
        if(combWin) {
            status = combWin.includes(i)
        }

        return <Square key={i}
                       value={this.props.squares[i]}
                       style={this.props.currentItem === i || status? 'red' : 'black'}
                       onClick={() => this.props.onClick(i)}/>;
    }

    createSquares = () => {
        let squares = [];
        let item = 0;

        for (let i = 0; i < 3; i++) {
            let children = [];

            for (let j = 0; j < 3; j++) {
                children.push(
                    this.renderSquare(item)
                );
                item += 1;
            }
            squares.push(<div key={i} className="board-row">{children}</div>)
        }

        return squares;
    };


    render() {
        return (
            <div>
                {this.createSquares()}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                posXY: {
                    current: null,
                    x: null,
                    y: null,
                },
            }],
            xIsNext: true,
            stepNumber: 0,
            order: 'asc',
            comdWin: null,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const posXY = calculatePosXY(i);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const draw = null;

        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                posXY: posXY,
            }]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    orderDo() {
        const order = this.state.order;
        let status = order === "desc" ? "asc" : "desc";

        this.setState({
            order: status,
        });

    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const order = this.state.order;

        let moves = history.map((step, move) => {
                const desc = move ?
                    'Go to move #' + move :
                    'Go to game start';
                const posXY = move ?
                    'Position (Col: ' + step.posXY.posX + ', Row: ' + step.posXY.posY + ')' :
                    '';
                return (
                    <li key={ step.posXY.current }>
                        <button onClick={() => this.jumpTo(move)}>{desc}</button>
                        <span>{posXY}</span>
                    </li>
                );
            });

        if (order === "asc"){
            moves.sort((a, b) => a - b);
        } else {
            moves.sort((a, b) => a - b).reverse();
        }

        let status;
        if (winner) {
            status = 'Winner: ' + winner.player;
            this.state.combWin = winner.combWin;
        } else if(history.length === 10) {
            status = "The result being a draw!";
            this.state.combWin = null;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            this.state.combWin = null;
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        currentItem={current.posXY.current}
                        combWin={this.state.combWin}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>
                        <button onClick={() => this.orderDo()}>Toggle</button>
                    </div>
                    {order === 'desc' ?
                        <ol reversed>{moves}</ol>
                        :
                        <ol>{moves}</ol>
                    }
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {player: squares[a], combWin: lines[i]}
        }
    }
    return null;
}

function calculatePosXY(index) {
    index += 1;
    let X = null;
    let Y = null;
    let cur = null;
    if (index > 0 && index <= 3) {
        Y = 1;
        X = index;
        cur = index;
    } else if (index > 3 && index <= 6) {
        Y = 2;
        X = index - 3;
        cur = index;
    } else if (index > 6 && index <= 9) {
        Y = 3;
        X = index - 6;
        cur = index;
    }

    if (X && Y) {
        return {current: cur - 1, posX: X, posY: Y}
    }

    return null;

}
