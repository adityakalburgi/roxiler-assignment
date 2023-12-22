import './App.css';
import React from 'react';

const months = {"Jan" : "01","Feb" : "02","Mar" : "03","Apr" : "04","May" : "05","Jun" : "06","Jul" : "017","Aug" : "08","Sep" : "09","Oct" : "10","Nov" : "11","Dec" : "12"};
let isNext = true;
let dataCopy = [{
    id : "NIL",
    title : "NIL",
    description : "NIL",
    price : "NIL",
    category : "NIL",
    sold : "NIL",
    image : "NIL"
}];

const Select = ({ label, value, options, onChange }) => {
    return (
     
        <select value={value} onChange={onChange} style={{padding:"10px",width:"10vw",backgroundColor:"#7df604"}}>
          {options.map((option,index) => (
            <option key={index} value={option.value}>{option.label}</option>
          ))}
        </select>
    );
  };

class Transactions extends React.Component{
    constructor(props){
        super(props);
        this.props = props;
        this.page = 1;
        this.stop = false;
        this.productCount = 0;
        this.options = [
            { label: 'Jan', value: '01' },
            { label: 'Feb', value: '02' },
            { label: 'Mar', value: '03' },
            { label: 'Apr', value: '04' },
            { label: 'May', value: '05' },
            { label: 'Jun', value: '06' },
            { label: 'Jul', value: '07' },
            { label: 'Aug', value: '08' },
            { label: 'Sep', value: '09' },
            { label: 'Oct', value: '10' },
            { label: 'Nov', value: '11' },
            { label: 'Dec', value: '12' },
          ];

        this.state = {
            month : this.props.month,
            data : dataCopy
        }  
    }

    componentWillUnmount(){
        this.props.passMonth(this.state.month);
    }

    render(){
        return (
            <div className='Transaction'>
                <div className='Above-table'>
                <button onClick={()=>{
                    this.page = 1;
                    isNext = true;
                    fetch(`http://localhost:3000/transactions?month=${this.state.month}`)
                    .then((response)=>response.json())
                    .then((data)=>{
                        this.setState({month : this.state.month,data : data})
                        dataCopy = data;
                    })
                    .catch(console.log)
                }}>Send Transactions</button>
                <button onClick={()=>{
                    if(this.page > 1){
                        fetch(`http://localhost:3000/transactions?month=${this.state.month}&page=${--this.page}`)
                        .then((response)=>response.json())
                        .then((data)=>{
                            if(data.length){
                                this.setState({month : this.state.month,data : data})
                                dataCopy = data;
                            }
                            isNext = true;
                    })
                    .catch(console.log)
                        
                    }
                }}>Prev</button>
                <button onClick={()=>{
                    if(isNext){
                        fetch(`http://localhost:3000/transactions?month=${this.state.month}&page=${++this.page}`)
                        .then((response)=>response.json())
                        .then((data)=>{
                            if(data.length){
                                this.setState({month : this.state.month,data : data})
                                dataCopy = data;
                            }
                        else{
                            this.page--;
                            isNext = false;
                        }
                        })
                        .catch(console.log)
                        
                    }
                }}>Next</button>
                <Select
                    label="Select Month"
                    options={this.options}
                    value={this.state.month}
                    onChange={(event)=>{this.setState({month:event.target.value})}}
                />
                </div>
                <div style={{height:"70%",overflowY:"auto",position: "fixed",top: '102px'}}>

                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Sold</th>
                            <th>Image</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.data.map((value,index) => {
                            return (
                                <tr key={index}>
                                    <td>{value.id}</td>
                                    <td>{value.title}</td>
                                    <td>{value.description}</td>
                                    <td>{value.price}</td>
                                    <td>{value.category}</td>
                                    <td>{value.sold.toString()}</td>
                                    <td>{value.image}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                </div>
            </div>
        )
    }
}

export default Transactions;