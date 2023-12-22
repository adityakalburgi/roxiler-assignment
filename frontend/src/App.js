import './App.css';
import React from 'react';
import Transactions from './Transactions';
import Statistics from './Statistics';

let pieColors = [];
let barColors = [];

class App extends React.Component {

  constructor(props){
    super(props);
    this.props = props;
    this.state = {
      showStats : false,
      month : "01",
      barChartData : {

      },
      pieChartData : {

      },
      stats : {

      }
    }
  }
  
  componentDidMount(){
    fetch(`http://localhost:3000/initDB`)
  }

  render(){
    return (
      <div className="App">
        <header className="App-header">
          {
            (!this.state.showStats)? <Transactions month = {this.state.month} passMonth = {(value)=> {
              fetch(`http://localhost:3000/combinedData?month=${value}`)
              .then((response)=>response.json())
              .then((Data)=>{
                  if(Data[2].length){

                    if(pieColors.length !== Data[2].length){
                      pieColors = Data[2].map(data => `#${parseInt(Math.random()*1000)}`)
                    }
                    if(barColors.length !== Data[1].length){
                      barColors = Data[1].map(data => `#${parseInt(Math.random()*1000)}`)
                    }

                      this.setState({
                        showStats:this.state.showStats,
                        month:value,
                        barChartData : {
                          labels: Data[1].map(data => data.range), 
                          datasets: [
                                {
                                  label: "Product Count",
                                  data: Data[1].map(data => data.count),
                                  backgroundColor: barColors,
                                  borderColor: "black",
                                  borderWidth: 1
                                }
                              ]
                        },
                        pieChartData : {
                          labels: Data[2].map(data => data.category), 
                          datasets: [
                                {
                                  label: "Product Count",
                                  data: Data[2].map(data => data.count),
                                  backgroundColor: pieColors,
                                  borderColor: "black",
                                  borderWidth: 1
                                }
                              ]
                      },
                      stats : Data[0][0]
                      })
                  }
              })
              .catch(console.log)
                    
            
            }}/>:<Statistics month = {this.state.month} barChartData = {this.state.barChartData} pieChartData = {this.state.pieChartData} stats = {this.state.stats}/>

          }
        </header>
        <footer className='App-footer'>
          <div className="Btn-group">
            <button style={{backgroundColor:(this.state.showStats)?"#7df604":"#4f9906"}} onClick={()=>{
              this.setState({showStats : false, month : this.state.month, chartData : this.state.chartData});
            }}>Show Transactions</button>
            <button style={{backgroundColor:(!this.state.showStats)?"#7df604":"#4f9906"}} onClick={()=>{
              this.setState({showStats : true});
            }}>Show Statistics</button>
          </div>
        </footer>
      </div>
    );   
  }
}

export default App;
