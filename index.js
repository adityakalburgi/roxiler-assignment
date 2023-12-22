/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */
const { MongoClient } = require('mongodb');
const express = require('express');
const https = require('node:https');
const http = require('node:http');
const path = require('node:path');
const cors = require('cors');

const thirdPartyAPI = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';
const priceRanges = ["0-100","101-200","201-300","301-400","401-500","501-600","601-700","701-800","801-900","901-above"]
const port = 3000;
const apiUrls = [
  `http://localhost:${port}/statistics`,
  `http://localhost:${port}/bar-chart`,
  `http://localhost:${port}/pie-chart`,
];
const credentials = {
  name : "nikhilkalburgi",
  password : "GTp2PCTQWEvk6wLD"
}

const app = express();
let client = null;
app.use(cors());
app.use(express.static(path.join(__dirname, 'frontend',"build")));

/**
 * @function initializeDB is used to connect MongoDB Atlas
 */
async function initializeDB(){
    client = await MongoClient.connect(
      `mongodb+srv://${credentials.name}:${credentials.password}@cluster0.dm275fl.mongodb.net/`
    );
    
    await insertData()   
}

/**
 * @function insertData is used to insert MongoDB Atlas collection only once
 */
async function insertData(){
  try {
    const req = https.request(thirdPartyAPI, (res) => {
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
      res.setEncoding("utf-8");
      var body = '';
      res.on('data', (seedData) => {
        body += seedData;
        
      });
      res.on('end',async ()=>{
        var seedData = JSON.parse(body)
        const coll = client.db('sample').collection('data');
        if(!coll.countDocuments({})){     
          const result = await coll.insertMany(seedData);
        }
      })
    });
    
    req.on('error', (e) => {
      console.error(e);
    });
    req.end();
    

  } catch (error) {
    console.error('Error initializing database:', error.message);
  }
}


function fetchData(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}


/**
 * GET API to Initialize Database
 */
app.get('/initDB', (req, res) => {

  initializeDB().then(()=>{
  }).catch(console.log)
});


/**
 * GET API to list the all transactions with Search and Pignation Support
 */
app.get('/transactions', async (req, res) => {
  try {
    const { page = 1, perPage = 10, search = '', month } = req.query;
    const regex = new RegExp(search, 'i');

    const Transaction = client.db('sample').collection('data');

    const transactions = await Transaction.find({
      $or: [
        { title: regex },
        { description: regex },
        { price: regex },
      ],
      dateOfSale : { $regex: new RegExp(`-${month}-`) }
    })
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));
    const result = await transactions.toArray();
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET API to calculate TotalAmountOfSales , TotalSold , TotalNotSold
 */
app.get('/statistics',async (req, res) => {
  try {
    const { month } = req.query;

    const Transaction = client.db('sample').collection('data');

    const stats = await Transaction.aggregate([
      {
          $match: {
              sold: true,
              dateOfSale:  { $regex: new RegExp(`-${month}-`) }
          }
      },
      {
          $group: {
              _id: null,
              totalSaleAmount : { $sum: "$price" },
              totalSold : { $sum: 1},
          }
      }
  ])

  const notSold = await Transaction.aggregate([
    {
        $match: {
            sold: false,
            dateOfSale:  { $regex: new RegExp(`-${month}-`) }
        }
    },
    {
        $group: {
            _id: null,
            totalNotSold : { $sum: 1},
        }
    }
])
  
    const result = await stats.toArray();
    const totalNotSold = await notSold.toArray();
    result[0].totalNotSold = totalNotSold[0].totalNotSold
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

/**
 * GET API to fetch Number of Products per Price Range
 */
app.get('/bar-chart',async (req, res)=>{
  try{
    const { month } = req.query;

    const Transaction = client.db('sample').collection('data');

    const chart = await Transaction.aggregate([
      {
          $match: {
              dateOfSale:  { $regex: new RegExp(`-${month}-`) }
          }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $and: [{ $gte: ["$price", 0] }, { $lte: ["$price", 100] }] }, then: "0-100" },
                { case: { $and: [{ $gte: ["$price", 101] }, { $lte: ["$price", 200] }] }, then: "101-200" },
                { case: { $and: [{ $gte: ["$price", 201] }, { $lte: ["$price", 300] }] }, then: "201-300" },
                { case: { $and: [{ $gte: ["$price", 301] }, { $lte: ["$price", 400] }] }, then: "301-400" },
                { case: { $and: [{ $gte: ["$price", 401] }, { $lte: ["$price", 500] }] }, then: "401-500" },
                { case: { $and: [{ $gte: ["$price", 501] }, { $lte: ["$price", 600] }] }, then: "501-600" },
                { case: { $and: [{ $gte: ["$price", 601] }, { $lte: ["$price", 700] }] }, then: "601-700" },
                { case: { $and: [{ $gte: ["$price", 701] }, { $lte: ["$price", 800] }] }, then: "701-800" },
                { case: { $and: [{ $gte: ["$price", 801] }, { $lte: ["$price", 900] }] }, then: "801-900" },
                { case: { $gte: ["$price", 901] }, then: "901-above" },
              ],
              default: "Unknown"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
            _id: 0,
            range: "$_id",
            count: 1 
        }
    }
  ])
  
    const result = await chart.toArray();
    priceRanges.forEach(element => {
      if(result.every(ele =>{
        if(ele.range !== element) return true
      })){
        result.push({count : 0, range : element})
        result.sort((a,b)=> a.range[0] - b.range[0])
      }
    });
    res.json(result)
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
})

/**
 * GET API to fetch Number of Products per Category
 */
app.get('/pie-chart',async (req, res)=>{
  try{
    const { month } = req.query;

    const Transaction = client.db('sample').collection('data');

    const chart = await Transaction.aggregate([
      {
          $match: {
              dateOfSale:  { $regex: new RegExp(`-${month}-`) }
          }
      },
      {
        $group: {
            _id: "$category", 
            count: { $sum: 1 } 
        }
    },
    {
        $project: {
            _id: 0,
            category: "$_id", 
            count: 1
        }
    }
  ])
  
    const result = await chart.toArray();
    res.json(result)
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
})

/**
 * GET API to combine all the above APIs
 */
app.get('/combinedData',async (req, res)=>{
  const { month } = req.query;

  const apiPromises = apiUrls.map(url => fetchData(`${url}?month=${month}`));
  let responses = await Promise.all(apiPromises);
  
  responses = Object.assign({},responses)

  res.json(responses);
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});