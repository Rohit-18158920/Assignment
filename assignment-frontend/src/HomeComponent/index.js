import './style.css';
import Config from '../config';
import React, { Component, Fragment } from "react";
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Panel, PanelType, ActionButton } from 'office-ui-fabric-react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton} from 'office-ui-fabric-react/lib/Button';
import LineLoader from '../components/LineLoader';
import { Table } from 'react-bootstrap';
import Pagination from "react-js-pagination";
import './style.css';
import { ReactComponent as Logo } from '../assets/img/exit.svg';
import { PanelBase } from 'office-ui-fabric-react/lib/components/Panel/Panel.base';
import { elementContains } from 'office-ui-fabric-react/lib/Utilities';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { getIconClassName } from '@uifabric/styling';
import validator from 'validator';
PanelBase.prototype._dismissOnOuterClick = function (ev) {
    var panel = this._panel.current;
    if (this.state.isOpen && panel) {
        if (!elementContains(panel, ev.target)) {
            if (this.props.onOuterClick) {
                if (this.props.onOuterClick() !== true)
                    ev.preventDefault();
            }
            else {
                this.dismiss();
            }
        }
    }
};

class HomeComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: sessionStorage.getItem("userId"),
            initialValueLoaded: true,
            newObj: {},
            loaded: true,
            genderList:[
                {
                    id:"Male",
                    value:"Male"
                },
                {
                    id:"Female",
                    value:"Female"
                }
            ],
            tableHead: [
                { label: 'Name', value: 'name', alertName:'nameAlert'},
                { label: 'Gender', value: 'gender', alertName:'genderAlert'},
                { label: 'Nickname', value: 'nickname', alertName:'nicknameAlert'},
                { label: 'Email Address', value: 'email', alertName:'emailAlert'},
                { label: 'Phone Number', value: 'phone_number', alertName:'phone_numberAlert'}
            ],
            sortingCondition :{
                name:'Sort',
                gender:'Sort',
                nickname:'Sort',
                email:'Sort',
                phone_number:'Sort'
            },
            paginatedDataList: [],
            itemsCountPerPage: 5,
            pageRangeDisplayed: 5,
            activePage: 1,
            panel: {
                visibility: false,
                event: ''
            }
        }
        let api = {
            headers: {
                'Authorization': sessionStorage.getItem('token')
            },
            method: 'GET',
            url: Config.getUsers
        }
        setTimeout(() => {
            this.request(api).then((res) => {
                return res.json().then((res) => {
                    this.state.dataShowList = res.result;
                    this.state.dataList = res.result;
                    this.state.totalRows = res.result!==undefined? res.result.length:0;
                    var filteredList = res.result!==undefined?res.result:[];
                    var list = [];
                    // console.log("Items count per page::" + this.state.itemsCountPerPage);
                    for (var i = 0; i < this.state.itemsCountPerPage && i < filteredList.length; i++) {
                        list.push(filteredList[i]);
                    }
                    this.state.paginatedDataList = list;
                    console.log("list::" + JSON.stringify(list))
                    // console.log("paginated list::" + JSON.stringify(filteredList))
                    this.state.filteredList = filteredList;
                    this.state.initialValueLoaded = true;
                })
            }).then(json => this.setState({ done: true }));
        }, 1200);

        this.filterdata = this.filterdata.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.onSortChange = this.onSortChange.bind(this);
        this.addRow = this.addRow.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this._closeAlert = this._closeAlert.bind(this);
        this._closePanel = this._closePanel.bind(this);
    }
    _closeAlert() {
        this.setState({
            hideAlert: true,
            alertMessage: ""
        })
    }
    onSortChange(value) {
        console.log("value::" + value);
        var filteredList = this.state.filteredList;
        var sortingOper = this.state.sortingCondition[value];
        if (sortingOper === 'SortUp') {
            filteredList.sort((obj1, obj2) => {
                return this.compareObjets(obj2, obj1, value);
            })
            sortingOper = 'SortDown';
        }
        else {
            filteredList.sort((obj1, obj2) => {
                return this.compareObjets(obj1, obj2, value);
            });
            sortingOper = 'SortUp';
        }
        var list = [];
        for (var i = 0; i < this.state.itemsCountPerPage && i < filteredList.length; i++) {
            list.push(filteredList[i]);
        }
        var sortingCondition = this.state.sortingCondition;
        sortingCondition[value] = sortingOper;
        this.setState({
            activePage: 1,
            totalRows: (filteredList.length),
            filteredList: filteredList,
            paginatedDataList: list,
            sortingCondition: sortingCondition
        })
    }
    _logout() {
        sessionStorage.removeItem('token');
        window.location.href = "/login";
    }
    filterdata = event => {
        console.log('value' + event.target.value);
        this.setState({
            filterValue: event.target.value
        });
        let filteredList = this.state.dataShowList;

        filteredList = filteredList.filter((data) => {
            let name = data.name.toLowerCase();
            let nickname = data.nickname.toLowerCase();
            var email = data.email.toLowerCase();
            var phoneNumber = data.phone_number.toLowerCase();
            if (name.indexOf(
                event.target.value.toLowerCase()) !== -1)
                return true;
            else if (nickname.indexOf(
                event.target.value.toLowerCase()) !== -1)
                return true;
            else if (email.indexOf(
                event.target.value.toLowerCase()) !== -1)
                return true;
            else if (phoneNumber.indexOf(
                event.target.value.toLowerCase()) !== -1)
                return true;
            else
                return false;
        });
        console.log("filteredList::" + JSON.stringify(filteredList));
        var list = [];
        for (var i = 0; i < this.state.itemsCountPerPage && i < filteredList.length; i++) {
            list.push(filteredList[i]);
        }
        this.setState({
            activePage: 1,
            totalRows: (filteredList.length),
            filteredList: filteredList,
            paginatedDataList: list
        })
    }
    handlePageChange(pageNumber) {
        console.log(`active page is ${pageNumber}`);
        var list = []
        for (var i = (pageNumber - 1) * this.state.itemsCountPerPage; i < (pageNumber * this.state.itemsCountPerPage) && i < this.state.filteredList.length; i++) {
            list.push(this.state.filteredList[i]);
        }
        this.setState({
            activePage: pageNumber,
            paginatedDataList: list
        });
    }
    addRow(col) {
        var newObj = {
            requestType: "INSERT",
            name: "",
            email: "",
            phone_number: "",
            nickname: "",
            gender: "Male",
            password:""
        }
        this.setState({
            newObj: newObj,
            panel: {
                visibility: true,
                event: 'Add New Entry'
            }
        })
    }
    handleChange = event => {
        var newObj = this.state.newObj;
        var eventId = event.target.id;
        var alertId = eventId+"Alert";
        var value = event.target.value;
        var submitAllowed = this.state.submitAllowed;
        if(eventId==='email'){
            if(validator.isEmail(value)){
                document.getElementById(alertId).innerHTML="";
                submitAllowed=true;
            }
            else{
                document.getElementById(alertId).innerHTML="<em>Invalid Email Address</em>";
                submitAllowed= false;
            }
        }else if(eventId==='phone_number'){
            console.log("value::"+validator.isMobilePhone(value,'any',{strictMode:true}));
        }
        newObj[eventId] = value;
        
        this.setState({
            newObj: newObj,
            submitAllowed: submitAllowed
        });
    }
    handleSubmit = event => {
        event.preventDefault();
        this.setState({
            loaded: false,
            hideDeleteDialog: true
        })
        let api = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.getItem('token')
            },
            method: 'POST',
            url: Config.addUser,
            body: this.state.newObj
        };
        setTimeout(() => {
            this.request(api).then((res) => {
                if (res.status === 200 || res.status === 304) {
                    return res.json().then((res) => {
                        var filteredList = res.result;
                        var list = [];
                        for (var i = 0; i < this.state.itemsCountPerPage && i < filteredList.length; i++) {
                            console.log("Reached here::" + i)
                            list.push(filteredList[i]);
                        }
                            this.setState({
                                dataShowList: res.result,
                                dataList: res.result,
                                totalRows: res.result.length,
                                filteredList: filteredList,
                                paginatedDataList: list,
                                filterValue: ""
                            });
                        this.setState({
                            loaded: true,
                            panel: {
                                visibility: false,
                                event: ''
                            },
                            hideAlert: false,
                            alertMessage: "Success"
                        })
                    })
                } else if(res.status===400){
                    return res.json().then((res) => {
                        this.setState({
                            loaded: true,
                            hideAlert: false,
                            hideDeleteDialog: true,
                            alertMessage: res.message,
                        })
                    })
                }
                    else if (res.status === 401) {
                    return res.json().then((res) => {
                        this.setState({
                            loaded: true,
                            hideAlert: false,
                            hideDeleteDialog: true,
                            alertMessage: res.message,
                        })
                    })
                } else if (res.status === 503) {
                    // console.log(res.message);
                    this.setState({
                        loaded: true,
                        hideDeleteDialog: true,
                        hideAlert: false,
                        alertMessage: 'Server Timeout'
                    });
                }
                else if (res.status === 500) {
                    this.setState({
                        loaded: true,
                        hideDeleteDialog: true,
                        hideAlert: false,
                        alertMessage: 'Server Offline'
                    });
                }
                else {
                    this.setState({
                        loaded: true,
                        hideDeleteDialog: true,
                        hideAlert: false,
                        alertMessage: 'Something went wrong'
                    });
                }
            }).then(json => this.setState({ done: true }));
        }, 1200);
    }
    _closePanel() {
        var pan = {
            visibility: false,
            event: ''
        }
        this.setState({
            newObj: {},
            panel: pan,
            submitAllowed: true,
            alertMap: {}
        });
    }
    render() {
        return (
            <>
                <nav className="navbar navbar-expand-sm navbar-expand-md navbar-expand-lg navbar-dark bgNavColor">
                    <div className="navbar-brand " style={{ color: '#0747a6' }} >
                        Cognito User Profile
                        </div>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapsibleNavbar">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <ul className="nav navbar-nav ml-auto">
                        <span>{this.state.userId}</span>&nbsp;&nbsp;
    
                        <li onClick={() => this._logout()}><a className="textColor" href="/#">
                            <Logo />
                            Logout
                            </a>
                        </li>
                    </ul>
                </nav>
                <div className="card-body border-bottom-0 dataTable" >
                    {!this.state.initialValueLoaded ?
                        <LineLoader />
                        :
                        <>
                            <div class="input-group mb-3">

                                <input type="text" id="fileNameFilter" name="fileNameFilter" class="form-control someChange" placeholder="Search by Name or Nickname or Email or Phone Number" aria-label="FileName" aria-describedby="basic-addon1"
                                    value={this.state.filterValue} onChange={this.filterdata}
                                />
                                <ActionButton
                                    data-automation-id="test"
                                    onClick={(e) => this.addRow(e)}
                                    iconProps={{ iconName: 'AddFriend' }}
                                    allowDisabledFocus={true}>
                                    Add new record
                                </ActionButton>
                            </div>


                            <div className="row ">
                                {!this.state.loaded ?
                                    <LineLoader /> : <></>}
                                <Table bordered responsive>
                                    <thead class="rohit-nowrap-1 tableHeadbgColor">
                                        <tr>
                                            
                                            {this.state.tableHead.map((obj, key) =>
                                                <>
                                                    {obj !== null && obj !== undefined ?
                                                        <th >
                                                            {obj.label} &nbsp;&nbsp;
                                                            <button id={obj.value} onClick={(e) => this.onSortChange(obj.value, e)}>
                                                                <Icon iconName={this.state.sortingCondition[obj.value]} class={`${getIconClassName('Sort')}`} />
                                                            </button>
                                                        </th>
                                                        : <></>
                                                    }

                                                </>

                                            )}

                                        </tr>
                                    </thead>
                                    <tbody class="rohit-nowrap-1">
                                        {
                                            this.state.paginatedDataList.map((obj, key) =>
                                                <tr>
                                                    {this.state.tableHead.map((obj1, key) =>
                                                        <>
                                                            {obj1 !== null && obj1 !== undefined ?
                                                                <td >
                                                                    {obj[obj1.value]}
                                                                </td>
                                                                : <></>
                                                            }
                                                        </>
                                                    )}
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                </Table>
                            </div>
                            <div class="row" style={{ position: 'absolute', right: 33 }}>
                                <div class="col-md-12" >
                                    <Pagination
                                        itemClass="page-item"
                                        linkClass="page-link"
                                        activePage={this.state.activePage}
                                        itemsCountPerPage={this.state.itemsCountPerPage}
                                        totalItemsCount={this.state.totalRows}
                                        pageRangeDisplayed={this.state.pageRangeDisplayed}
                                        onChange={this.handlePageChange}
                                    />
                                </div>
                            </div>
                        </>
                    }
                </div>
                {this.state.initialValueLoaded ?
                    <Panel isOpen={this.state.panel.visibility}
                        onDismiss={() => this._closePanel()}
                        type={PanelType.customNear}
                        customWidth="60%"
                        headerText={this.state.panel.event}
                        closeButtonAriaLabel="Close"
                    >
                        {!this.state.loaded ?
                            <LineLoader />
                            : <></>
                        }
                        <Fragment>
                            <form className="card-body border-bottom-0" onSubmit={this.handleSubmit} style={{ paddingLeft: '10%', paddingRight: '10%', backgroundColor: 'white' }}>
                                <div className="form-row">
                                    {
                                        this.state.tableHead.map((obj, key) =>
                                            <>
                                                {obj !== null && obj !== undefined ?
                                                    <div className="form-group col-md-12">
                                                        <Label htmlFor={obj.value} required={true}>{obj.label}</Label>
                                                        {obj.value === 'gender' ?
                                                            <>
                                                                <select id="gender" name="gender" defaultValue="Male" onChange={(evt) => {
                                                                    this.setState({});
                                                                    var newObj = this.state.newObj;
                                                                    newObj['gender'] = evt.target.value;
                                                                    this.setState({
                                                                        newObj: newObj
                                                                    });
                                                                    this.setState({});
                                                                }} className="custom-select">
                                                                    {this.state.genderList.map((obj1, key) =>
                                                                        <option value={obj1.value} >{obj1.id}</option>)}
                                                                </select>
                                                            </>
                                                            : <>
                                                            <input className="form-control" type="text" id={obj.value} name={obj.value} value={this.state.newObj[obj]} onChange={this.handleChange} required/><span className="error" id={obj.alertName}></span>
                                                            </>
                                                        }
                                                        
                                                    </div>
                                                    : <></>
                                                }
                                            </>
                                        )
                                    }
                                    <div className="form-group col-md-12">
                                                        <Label htmlFor="password" required={true}>Password</Label>
                                                        <input className="form-control" type="text" id="password" name="password" value={this.state.newObj["password"]} onChange={this.handleChange} required/>
                                                    </div>
                                    <div className="form-group col-md-12" align="center">
                                        <button type="submit" disabled={!this.state.submitAllowed} className="btn btn-primary">
                                            Submit
                                        </button>
                                    </div>

                                </div>
                            </form>
                        </Fragment>
                    </Panel>

                    : <></>
                }
<Dialog
                    hidden={this.state.hideAlert}
                    onDismiss={this._closeAlert}
                    dialogContentProps={{
                        type: DialogType.largeHeader,
                        title: 'Alert',
                        closeButtonAriaLabel: 'Close',
                        subText: this.state.alertMessage
                    }}
                    modalProps={{
                        isBlocking: false,
                        styles: { main: { maxWidth: 550 } }
                    }}
                >
                    <DialogFooter>
                        <PrimaryButton onClick={this._closeAlert} text="Close" />
                    </DialogFooter>
                </Dialog>
            </>
        );
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
    compareObjets(object1, object2, key) {
        const obj1 = object1[key].toUpperCase();
        const obj2 = object2[key].toUpperCase();
        if (obj1 < obj2)
            return -1;
        if (obj2 > obj1)
            return 1;
        else
            return 0;
    }
}

export default HomeComponent;