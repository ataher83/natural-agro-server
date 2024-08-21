const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
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
);
app.use(express.json());

// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0yjrwty.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with MongoClientOptions to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const productsCollection = client.db('natural-agro').collection('products');

    
    // Get all products [with search, brandFilter, categoryFilter, priceFilter, sortPrice and sortDate]
    app.get('/products', async (req, res) => {
      const { search, brandFilter, categoryFilter, priceFilter, sortPrice, sortDate } = req.query;
      const query = {};
      
      if (search) {
          query.productName = { $regex: search, $options: 'i' };
      }
      
      if (brandFilter) {
          query.productBrand = brandFilter;
      }
      
      if (categoryFilter) {
          query.productCategory = categoryFilter;
      }

      if (priceFilter) {
          query.productPrice = priceFilter;
      }

      const sortOptions = {};
      if (sortPrice) {
          sortOptions.productPrice = sortPrice === 'asc' ? 1 : -1;
      }

      try {
          const result = await productsCollection.find(query).sort(sortOptions).toArray();
          res.send(result);
      } catch (err) {
          res.status(500).send({ error: 'Failed to fetch products' });
      }
    });

    // Create a New Product
    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      try {
        const result = await productsCollection.insertOne(newProduct);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: 'Failed to create product', error });
      }
    });

    // Ping MongoDB to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Natural Agro Server is running');
});

app.listen(port, () => {
  console.log(`Natural Agro Server is running on port: ${port}`);
});
