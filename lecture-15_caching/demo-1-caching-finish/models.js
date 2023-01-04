import mongoose from "mongoose";

connectDB();

let models = {};

async function connectDB() {
  console.log("connecting to mongodb");
  await mongoose.connect('mongodb://localhost:27017/store');
  console.log("connected to mongodb");

  //Add schemas and models
  const itemSchema = new mongoose.Schema({
    name: String,
    price: Number
  })
  models.Item = mongoose.model('Item', itemSchema)
  
  console.log("finished creating models");
}

export default models;
