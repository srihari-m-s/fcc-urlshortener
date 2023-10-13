import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

// Index route
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

let url = {
  original_url: "",
  short_url: "",
};

// Challenge endpoint
app.post("/api/shorturl", function (req, res) {
  let formData = req.body;
  let original = formData.url;

  // Validity check
  const urlRegex = /^(https?):\/\/w{3}\.[a-zA-Z]+\.[a-zA-Z]+/g;
  if (!urlRegex.test(original)) {
    return res.json({ error: "invalid url" });
  }
  // console.log(url, original);
  let short = /\.[a-zA-Z0-9]+\./g.exec(original)[0].slice(1, -1);
  short = short.slice(0, 1) + short.slice(-1);

  url.original_url = original;
  url.short_url = short;

  res.json({ original_url: original, short_url: short });
});

// get short_url state
app.get(`/api/shorturl/:short`, function (req, res) {
  let short = req.params.short;
  if (url.short_url === short) {
    res.redirect(url.original_url);
  } else {
    res.json({ error: "unrecognised short URL" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port >> http://localhost:${port}`);
});
