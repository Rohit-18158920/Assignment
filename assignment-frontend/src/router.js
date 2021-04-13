import React, { Suspense, Component, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { initializeIcons } from '@uifabric/icons';
import { AuthenticationService } from "./services";
import './assets/css/style.css';
const HomeComponent = lazy(() => import('./HomeComponent/index'));
const LoginComponent = lazy(() => import('./Login/login'));


class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
          loaded: false
        }
      }
      componentWillMount() {
        initializeIcons();
          if (window.location.pathname === '/login') {
            this.setState({
              loaded: true
            })
            return
          }
          let validToken = AuthenticationService.validateTokenId();
          if (validToken === false) {
            window.location.href = '/login'
          } else {
            this.setState({
              loaded: true
            })
          }
      }
      render() {
        if (!this.state.loaded) {
          return (<p>Loading...</p>)
        }
        return (
          <Router>
            <Suspense fallback={<div>Loading...</div>}>
              <Switch>
                <Route path="/login" component={LoginComponent} />
                <Route path="/home" component={HomeComponent} />
              </Switch>
            </Suspense>
          </Router>
        );
      }
}

export default App;