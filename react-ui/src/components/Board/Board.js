import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ResizableBox } from 'react-resizable';
import { CSVLink } from "react-csv";
import { RIEInput } from '../REIK'
import TransitionGroup from 'react-transition-group/TransitionGroup'
import plus from './images/icons/iconic/raster/black/plus_alt_32x32.png'
import minus from './images/icons/iconic/raster/black/minus_alt_32x32.png'
import Card from '../Card/Card'
import cardColors from '../Card/images'
import Sticker from '../Sticker/Sticker'
import './css/style.css';
import './css/bigcards.css'
import github from '../../images/github.png'

class Board extends Component {
    constructor(props) {
        super(props)
        const { match } = props
        const boardid = match.url
        this.state = {
            boardid,
            iconsVisible: false,
            download: false
        }
        this.download = this.download.bind(this)
    }
    componentDidMount() {
        const { scrumblr } = this.props.stores
        scrumblr.joinRoom(this.state.boardid)
    }

    // there has to be a better way to manage the icon's visibility
    displayIcons = () => {
        this.setState({ iconsVisible: true })
    }

    hideIcons = () => {
        this.setState({ iconsVisible: false })
    }

    createCard = (boardid) => {
        const { scrumblr } = this.props.stores
        const rotation = Math.random() * 10 - 5
        const keys = Object.keys(cardColors)
        const color = keys[keys.length * Math.random() << 0]
        const zindex = scrumblr.boards[boardid].moves
        const card = scrumblr.addCard(boardid, color, 'Double Click to Edit', 29, -489, rotation, [], null, zindex + 1)
        card.create()
    }

    handleStart(event, data) {
        this.setState({ startSize: data.size })

    }

    handleStop(event, data) {
        const boardid = this.props.match.url
        const board = this.props.stores.scrumblr.boards[boardid]
        board.updateSize(data.size.height, data.size.width)
        this.setState({ height: data.size.height, width: data.size.width })
    }

    addColumn(board) {
        board.addColumn('New')()
    }

    removeColumn(board) {
        board.removeColumn()()
    }

    columnChanged(idx, board, data) {
        board.updateColumn(idx, data.text)()

    }
    nameChanged(data) {
        const boardid = this.props.match.url
        const scrumblr = this.props.stores.scrumblr
        scrumblr.setUserName(data.text)(boardid)
    }
    onResize(e, data) {
        const scrumblr = this.props.stores.scrumblr
        const boardid = this.props.match.url
        const board = scrumblr.boards[boardid]
        const cards = scrumblr.cards
        const moveXPct = e.movementX / (data.size.width)
        const moveX = moveXPct
        board.cards.forEach(card => {
            cards[card].move(cards[card].x + (cards[card].x * moveXPct), cards[card].y - e.movementY)
        })
    }

    download() {
        this.setState({ download: !this.state.download })
        return true
    }

    render() {
        const boardid = this.props.match.url
        const { scrumblr, server } = this.props.stores
        const board = scrumblr.boards[boardid]
        const cards = scrumblr.cards
        const users = scrumblr.users
        const cardIds = scrumblr.boards[this.state.boardid] ? scrumblr.boards[this.state.boardid].cards ? scrumblr.boards[this.state.boardid].cards : [] : []
        const exportedCards = cardIds.map(id => ({ id, text: cards[id].text }))

        return board ?
            <TransitionGroup>
                <div className='layoutRoot'>
                    <div className='github'><a className='github' href={process.env.REACT_APP_GITHUB_URL ? process.env.REACT_APP_GITHUB_URL : 'https://github.com/mannyhuerta/scrumblr'}><img src={github} height="20px" width="20px" />&nbsp;github</a><span style={{ marginLeft: '10px' }}>Global Users: {server.connected}, In Room: {board.users.length + 1} </span></div>
                    <ResizableBox className='board-outline' onResize={this.onResize.bind(this)} onResizeStop={this.handleStop.bind(this)} onResizeStart={this.handleStart.bind(this)} width={parseInt(board.width)} height={parseInt(board.height)}>
                        <div id='board'>
                            <div id='board-doodles' />

                            {/* make table a div */}
                            <table id='board-table' className='board-table' >
                                <tbody>
                                    <tr>
                                        {board.columns && board.columns.map(((col, idx) => (
                                            <td key={idx} className={`col ${idx == 0 && 'first'}`} width="10%">
                                                <h2><RIEInput
                                                    shouldStartEditOnDoubleClick={true}
                                                    value={col.text}
                                                    // beforeStart={this.beforeStartEditing.bind(this)}
                                                    // afterFinish={this.afterFinishEditing.bind(this)}
                                                    change={(data) => { this.columnChanged(idx, board, data) }}
                                                    propName='text'
                                                /></h2>
                                            </td>)))}
                                        <td id='icon-col' className='icon-col' onMouseEnter={this.displayIcons} onMouseLeave={this.hideIcons}>
                                            <img id='add-col' className={`${this.state.iconsVisible ? 'icons-visible' : 'icons-invisible'}`} width='20' heigh='20' src={plus} onClick={() => { this.addColumn(board) }} />
                                            <img id='delete-col' className={`${this.state.iconsVisible ? 'icons-visible' : 'icons-invisible'}`} width='20' heigh='20' src={minus} onClick={() => { this.removeColumn(board) }} />

                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                    </ResizableBox>

                    <div className='buttons'>
                        <i id='create-card' className='fa fa-plus-circle fa-2x bottom-icon' onClick={() => { this.createCard(boardid) }} />
                        <i id='smallify' className='fa fa-expand fa-2x bottom-icon' />
                        {exportedCards.length > 0 &&
                            this.state.download &&
                            <CSVLink onClick={() => { this.download(); return true }} data={exportedCards}><i id='download' className='fa fa-download fa-2x bottom-icon download-ready' /></CSVLink>
                        }
                        {exportedCards.length > 0 && !this.state.download && <i id='download' className='fa fa-download fa-2x bottom-icon download-notready' onClick={this.download} />}

                    </div>
                    <div className='stickers'>
                        <Sticker color='red' canDrag />
                        <Sticker color='blue' canDrag />
                        <Sticker color='yellow' canDrag />
                        <Sticker color='green' canDrag />
                        <br />
                        <Sticker color='pink' canDrag />
                        <Sticker color='lightblue' canDrag />
                        <Sticker color='orange' canDrag />
                        <Sticker color='purple' canDrag />
                        <br />
                        <Sticker color='nosticker' canDrag />


                    </div>

                    {board.cards.map((id) => {
                        const card = cards[id]
                        return <Card key={id} card={card} scrumblr={scrumblr} />
                    }
                    )}
                    <div className='names'>
                        <p>connected:</p>
                        <div className='yourname-input'>
                            <RIEInput
                                shouldStartEditOnDoubleClick={true}
                                value={scrumblr.getYourName()}
                                // beforeStart={this.beforeStartEditing.bind(this)}
                                // afterFinish={this.afterFinishEditing.bind(this)}
                                change={(data) => { this.nameChanged(data) }}
                                propName='text'
                            /> (you)
                        </div>
                        <ul className='names-ul'>
                            {board.users && board.users.map(id => (<li key={id}>{users[id].name}</li>))}
                        </ul>

                    </div>
                </div>
            </TransitionGroup >
            : <div>Waiting on board data..</div>
    }
}

export default observer(Board);