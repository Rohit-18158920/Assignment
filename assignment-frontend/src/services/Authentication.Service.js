import jwtDecode from 'jwt-decode';
class AuthenticationService {
    constructor() {
        let getUserDetails = this.validateTokenId()
        this.userData = getUserDetails.user
    }

    validateTokenId() {
        let token = sessionStorage.getItem('token');
        if (token !== null) {
            const jwtDecoded = jwtDecode(token);
            const milis2renewal = Math.round(jwtDecoded.exp * 1000 - (new Date()).getTime() - 30000);
            if (milis2renewal < 0) {
                sessionStorage.removeItem('token')
                return false;
            }
            return jwtDecoded;
        }
        return false;
    }

    logout() {
        sessionStorage.removeItem('token')
    }

}

export default new AuthenticationService();

