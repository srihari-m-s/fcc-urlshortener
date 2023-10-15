import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import db from "./db.js";

// Express setup
dotenv.config();
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Url Schema
const { Schema } = mongoose;

const urlSchema = new Schema({
  original_url: String,
  short_url: String,
});

const Url = mongoose.model("Url", urlSchema);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

// Index route
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Challenge endpoint
app.post("/api/shorturl", async function (req, res) {
  let formData = req.body;
  let original = formData.url;
  console.log("original", original);

  // Validity check
  const urlRegex = /^(https?):\/\/w{3}\.[a-zA-Z]+\.[a-zA-Z]+/g;
  if (!urlRegex.test(original)) {
    res.json({ error: "invalid url" });
  } else {
    let short = /\.[a-zA-Z0-9]+\./g.exec(original)[0].split(".")[1];
    short = short.slice(0, 1) + short.slice(-1);
    console.log(original, short);

    const newUrl = new Url({ original_url: original, short_url: short });

    try {
      const savedUrl = await newUrl.save();
      console.log("savedUrl", savedUrl);
      const { original_url, short_url } = savedUrl;
      res.json({ original_url: original_url, short_url: short_url });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }

  // res.json({ original_url: original, short_url: short });
});

// get short_url state
app.get(`/api/shorturl/:short`, async function (req, res) {
  let short = req.params.short;
  console.log("get", short);
  try {
    const responseDocument = await Url.findOne({ short_url: short }).exec();
    console.log("redirect to", responseDocument);
    res.redirect(responseDocument?.original_url);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port >> http://localhost:${port}`);
});
