class config{

    constructor(){
        //dev url
        this.domain = "http://localhost:3000";
        this.loginUrl = this.domain+'/login';
        this.addUser = this.domain+'/addUser';
        this.getUsers = this.domain+'/getUsers';
    }

}
export default new config();