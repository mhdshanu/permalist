import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
const port = 3000;
dotenv.config();
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

const db = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // This line may be necessary for some environments
  },
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    const newTitle = result.rows;
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: newTitle,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/add", async (req, res) => {
  try {
    const item = req.body.newItem;
    await db.query("INSERT INTO items(title) VALUES($1)", [item]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/edit", async (req, res) => {
  try {
    const editClick = req.body.updatedItemId;
    const editTitle = req.body.updatedItemTitle;
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [editTitle, editClick]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/delete", async (req, res) => {
  try {
    const deleteCheck = req.body.deleteItemId;
    await db.query("DELETE FROM items WHERE id = $1", [deleteCheck]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
