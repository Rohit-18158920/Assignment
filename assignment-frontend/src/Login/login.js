import React from 'react';
import './style.css';
import Config from '../config';
import LineLoader from '../components/LineLoader';

function validate(username, password) {
  return {
    username: username.length === 0,
    password: password.length === 0,
  };
}

class LoginComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      cardHidden: true,
      email: "",
      password: ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.submituserRegistrationForm = this.submituserRegistrationForm.bind(this);
    document.body.style.backgroundColor = "#0747a6";
  }
  componentDidMount() {
    setTimeout(
      function () {
        this.setState({
          cardHidden: false,
          email: "",
          password: "",
          isDisabledusername: false,
          isDisabledpassword: false,
          userName: false,
          errorMsg: "",
          loaded: true
        });
      }.bind(this),
      700
    );
  }
  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
    if (event.target.id === 'email') {
      this.setState({ isDisabledusername: false });
    }
    if (event.target.id === 'password') {
      this.setState({ isDisabledpassword: false });
    }
  }
  handleSubmit = event => {
    event.preventDefault();

    if (!this.canBeSubmitted()) {
      event.preventDefault();
      return;
    }
    this.setState({
      errorMsg: ''
    })

    this.validateData();

  }
  submituserRegistrationForm(e) {
    e.preventDefault();
    this.validateData();

  }
  canBeSubmitted() {
    const errors = validate(this.state.email, this.state.password);
    const isDisabled = Object.keys(errors).some(x => errors[x]);
    this.setState({ isDisabledusername: errors.username });
    this.setState({ isDisabledpassword: errors.password });
    return !isDisabled;
  }

  render() {
    return (
      <div className="login-form">
        {!this.state.loaded ? (
          <LineLoader />
        ) : <></>}
        <form onSubmit={this.handleSubmit}>
          {/* <>
            <img src="/apple-icon-57x57.png" alt="kbz icon" />
          </> */}
          <h2 className="text-center">Cognito User Tool</h2>
          <div className="form-group has-error">
            <input id="email" type="text" className="form-control" name="username" value={this.state.email} onChange={this.handleChange} placeholder="Username" required />
          </div>
          <div className="form-group">
            <input id="password" type="password" className="form-control" name="password" value={this.state.password} onChange={this.handleChange} placeholder="Password" required />
          </div>
          <div className="form-group">
            <button type="submit" disabled={!this.state.loaded} className="btn btn-primary btn-lg btn-block ">Sign in</button>
          </div>
          {
            this.state.errorMsg !== '' ?
              <div align="center" style={{ color: "red" }}>
                {this.state.errorMsg}
              </div> : <></>
          }
        </form>

      </div>
    );
  }

  validateData() {
    let api = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      url: Config.loginUrl,
      body: {
        "username": this.state.email,
        "password": this.state.password
      }
    }
    // window.location.href = '/home';
    this.setState({
      loaded: false
    })
    this.request(api).then((res) => {
      if (res.status === 200 || res.status === 304) {
        console.log("reached here")
        return res.json().then((res) => {
          let redirectToHomePage = '/home';
          this.setState({
            loaded: true
          })
          sessionStorage.setItem('homePage', redirectToHomePage);
          sessionStorage.setItem('token', res.token);
          sessionStorage.setItem('userId', res.username);
          console.log('res::' + JSON.stringify(res));
          window.location.href = redirectToHomePage;

        })
      } else if (res.status === 401) {

        return res.json().then((res) => {
          console.log('reached here' + JSON.stringify(res));
          this.setState({
            loaded: true,
            errorMsg: res.error
          })
        })
      } else {
        this.setState({
          loaded: true,
          errorMsg: 'Something went wrong'
        })
      }
    });
  }
  async request(api, query) {
    let result = await fetch(api.url, {
      method: api.method,
      headers: api.headers,
      body: this.validateBody(api)
    });
    return result
  }
  validateBody(api) {
    if (api.method === 'GET' || api.method === 'PUT') {
      return JSON.stringify()
    }
    return JSON.stringify(api.body);
  }
}

export default LoginComponent;  