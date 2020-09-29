import React from 'react';
import { Switch, Route} from 'react-router-dom';
import JoinRoom from '../components/JoinRoom/JoinRoom';
import ChatRoom from '../components/ChatRoom/ChatRoom';
import VideoChat from '../components/VideoChat/VideoChat'

const Routes = () => (
    <Switch>
        <Route exact path="/" component={JoinRoom} />
        <Route exact path="/room/:id" component={ChatRoom} />
        <Route exact path="/room/videocall/:id" component={VideoChat}></Route>
    </Switch>
);

export default Routes;