const express = require('express')
const cors = require('cors');
require("dotenv").config()
const app = express()
const port = 5000
app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7gwzlnt.mongodb.net/?appName=Cluster0`;

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
    // await client.connect();
    const db =client.db('blood_donation')
    const donorsColl=db.collection('donors')
  const  requestsColl = db.collection('blood_requests')

    app.get("/donors", async (req, res) => {
            const donors = await donorsColl.find().toArray();
            res.send(donors);
        });

   
app.get("/donors/:id", async (req, res) => {
  const id = req.params.id;
  const donor = await donorsColl.findOne({ _id: new ObjectId(id) });

  if (!donor) {
    return res.status(404).json({ message: "Donor not found" });
  }

  res.json(donor);
});

app.post("/donors", async (req, res) => {
  try {
    const donor = req.body;

    const exists = await donorsColl.findOne({ phone: donor.phone });

    if (exists) {
      return res.status(409).send({
        success: false,
        message: "You have already registered as a donor."
      });
    }

    const result = await donorsColl.insertOne(donor);
    res.send({ success: true, insertedId: result.insertedId });
  } catch (error) {
    res.status(500).send({ error: "Failed to save donor" });
  }
});

app.post("/blood-requests", async (req, res) => {
    try {
      const requestData = req.body;
      
      if (!requestData.patientName || !requestData.bloodGroup || !requestData.contactNumber || !requestData.hospitalName) {
        return res.status(400).send({
          success: false,
          message: "Patient Name, Blood Group, Contact Number, and Hospital Name are mandatory for a request."
        });
      }
      
      const requestToInsert = {
        ...requestData,
        status: 'Pending', 
        requestedAt: new Date(),
      };

      const result = await requestsColl.insertOne(requestToInsert);
      
      res.status(201).send({
        success: true,
        message: "Blood request saved successfully. Donors will be notified.",
        insertedId: result.insertedId,
      });

    } catch (error) {
      console.error("Error saving blood request:", error);
      res.status(500).send({ error: "Failed to save blood request due to a server error." });
    }
  });



    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port, () => {
  console.log(`server running on port ${port}`)
})
