import React from "react";
import { Bar } from "react-chartjs-2";

function BarChart({ chartData }) {

	return (
			<div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", width: "100%" , aspectRatio:1}}>
			<h2>BAR CHART</h2>
			{(Object.keys(chartData).length != 0)? 
        <Bar
          data={chartData}
          options={{
            plugins: {
              title: {
                display: true,
                text: "Number Of Products Per Price Range"
              }
            }
          }}
        />

      :null} 
			</div>
	);
}

export default BarChart;
