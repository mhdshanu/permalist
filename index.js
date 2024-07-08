import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
const port = 3000;
dotenv.config();



const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  connectionString: process.env.DATABASE_URL,
});
db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async(req, res) => {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  console.log(result.rows);
  const newTitle = result.rows;
  
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: newTitle,
  });
});

app.post("/add", async(req, res) => { //When clicked on add the typed name will be added to the array. So when redirected, that too appears in homepage.
  const item = req.body.newItem;  //newItem is the name of the input field
  items.push({ title: item });
  const result = await db.query("INSERT INTO items(title) VALUES($1)", [item]);
  console.log(result.rows);
  res.redirect("/");
});

app.post("/edit", async(req, res) => {
  const editClick = req.body.updatedItemId
  const editTitle = req.body.updatedItemTitle;
  await db.query("UPDATE items SET title = $1 WHERE id = $2", [editTitle,editClick]);
  res.redirect("/");
});

app.post("/delete", async(req, res) => {
  const deleteCheck = req.body.deleteItemId;
  await db.query("DELETE FROM items WHERE id = $1", [deleteCheck]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
