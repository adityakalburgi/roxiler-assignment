import React from "react";
import { Pie } from "react-chartjs-2";

function PieChart({ chartData }) {
  console.log(chartData)
  return (

    <div className="chart-container" style={{width:"80%",aspectRatio:1}}>
      <h2 style={{ textAlign: "center" }}>Pie Chart</h2>
      {(Object.keys(chartData).length != 0)? 
        <Pie
          data={chartData}
          options={{
            plugins: {
              title: {
                display: true,
                text: "Number Of Products Per Category"
              }
            }
          }}
        />

      :null}
    </div>
  );
}
export default PieChart;