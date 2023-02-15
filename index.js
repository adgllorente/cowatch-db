import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import fs from "fs";
import express from "express";
import { v4 as uuid } from "uuid";
import got from "got";
const app = express();

app.use(cors());

app.get("/sessions/:id", (req, res) => {
  const data = JSON.parse(fs.readFileSync("./db.json"));
  res.json(data.sessions.find(({ id }) => id === req.params.id) || {});
});

app.post("/sessions", async (req, res) => {
  const data = JSON.parse(fs.readFileSync("./db.json"));

  const { token } = await got
    .get("https://cas.s1.sceenic.co/stream/token/v2/", {
      headers: {
        "auth-api-key": process.env.SCEENIC_KEY,
        "auth-api-secret": process.env.SCEENIC_SECRET,
      },
    })
    .json();

  const session = {
    id: uuid(),
    token,
    created: Date.now(),
  };

  data.sessions.push(session);
  fs.writeFileSync("./db.json", JSON.stringify(data, null, 2));

  res.json(session);
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
