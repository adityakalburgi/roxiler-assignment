import './App.css';
import React from 'react';
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import PieChart from './PieChart';
import BarChart from './BarChart';

Chart.register(CategoryScale);


class Statistics extends React.Component{
    constructor(props){
        super(props);
        this.props = props;
        this.chartMounted = false;
    }
   

    render(){
        
        return (
            <div style={{display:"flex",flexGrow:1,alignItems:"center",justifyContent:"center"}}>
                <div style={{width:"25vw",overflow:"hidden"}}>
                    <h2>{`Total Sale : ${this.props.stats.totalSaleAmount}`}</h2>
                    <h2>{`Total Sold Item : ${this.props.stats.totalSold}`}</h2>
                    <h2>{`Total Not Sold Item : ${this.props.stats.totalNotSold}`}</h2>
                </div>
                <div style={{width:"40vw",overflow:"hidden"}}>
                    <BarChart chartData={this.props.barChartData}/>
                </div>
                <div style={{width:"35vw",overflow:"hidden"}}>
                    <PieChart chartData={this.props.pieChartData}/>
                </div>
            </div>
        )
    }
}

export default Statistics;