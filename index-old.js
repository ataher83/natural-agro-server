const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000

//middleware
// app.use(cors())
app.use(
  cors({
      origin: [
        'http://localhost:5173', 
        'http://localhost:5174', 
        'http://localhost:5175', 
        'https://natural-agro.web.app'
      ],
      credentials: true,
  }),
)
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0yjrwty.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();  


  const productsCollection = client.db('natural-agro').collection('products');




// products related api

  app.get('/products', async(req, res) => {
      const cursor = productsCollection.find() 
      const result = await cursor.toArray() 
      res.send(result) 
  })


  app.post('/products', async(req, res) => {
    const newProduct = req.body
    // console.log(newProduct)
    const result = await productsCollection.insertOne(newProduct)
    res.send(result) 
  })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Natural Agro Server is running')
  })
  
  app.listen(port, () => {
    console.log(`Natural Agro Server is running on port: ${port}`)
  })