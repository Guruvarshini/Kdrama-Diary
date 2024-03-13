import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';
import pkg from 'mdl-scraper';
const { mdl } = pkg;
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
let db=new pg.Client({
    user: "postgres",
  host: "localhost",
  database: "kdrama",
  password: "***",
  port: 5433,
});
db.connect();
const t=await db.query("select * from kdrama_blog order by id");
let kdramas=t.rows;
const tt=await db.query("select * from to_watch order by id");
let items = tt.rows;
const ttt=await db.query("select * from quotes order by id");
let quotes = ttt.rows;
app.get("/", (req, res) => {
  res.render("index.ejs", {
    listItems: items,
    kdramas:kdramas,
    quotes:quotes,
  });
});

app.post("/add", async(req, res) => {
  db.query("insert into to_watch(titles) values($1)",[req.body.newItem]);
  const ta=await db.query("select * from to_watch order by id");
  items = ta.rows;
  res.redirect("/");
});

app.post("/edit", async(req, res) => {
  db.query("update to_watch set titles=$1 where id=$2",[req.body.updatedItemTitle,parseInt(req.body.updatedItemId)]);
  const tr=await db.query("select * from to_watch order by id");
  items = tr.rows;
  res.redirect("/");
});

app.post("/editdes", async(req, res) => {
  db.query("update kdrama_blog set description=$1 where id=$2",[req.body.updatedItemDescription,parseInt(req.body.updatedItemId)]);
  const tr=await db.query("select * from kdrama_blog order by id");
  kdramas = tr.rows;
  res.redirect("/");
});
app.post("/editrate", async(req, res) => {
  db.query("update kdrama_blog set rating=$1 where id=$2",[parseFloat(req.body.updatedItemRating),parseInt(req.body.updatedItemId)]);
  const tr=await db.query("select * from kdrama_blog order by id");
  kdramas = tr.rows;
  res.redirect("/");
});
app.post("/delete", async(req, res) => {
  db.query("delete from to_watch where id=$1",[req.body.deleteItemId]);
  const t=await db.query("select * from to_watch order by id");
  items = t.rows;
  res.redirect("/");
});

app.post("/addquotes",async(req,res)=>{
  res.render("newq.ejs");
});
app.post("/addq",async(req,res)=>{
   db.query("insert into quotes(title,quote) values($1,$2)",[req.body.kdramaTitle,req.body.kdramaQuote]);
   const ttt=await db.query("select * from quotes order by id");
   quotes = ttt.rows;
   res.redirect("/");
});
app.post("/addkdrama",(req,res)=>{
  res.render("new.ejs");
});
app.post("/addk",async(req,res)=>{
  let th,url,epi,rank;
  await mdl.SearchQuery(req.body.kdramaTitle+"").then((data) => {
      th=data.dramas[0].thumb;
      url=data.dramas[0].url;
      epi=data.dramas[0].series;
      rank=data.dramas[0].ranking;
  });
  db.query("insert into kdrama_blog(title,description,rating,thumb,url,episodes,ranking) values($1,$2,$3,$4,$5,$6,$7)",[req.body.kdramaTitle,req.body.kdramaDes,parseFloat(req.body.kdramaRate),th,url,epi,rank]);
  const t=await db.query("select * from kdrama_blog order by id");
  kdramas=t.rows;
  res.redirect("/");
});
app.post("/deletek", async(req, res) => {
  db.query("delete from kdrama_blog where id=$1",[req.body.deleteItemId]);
  const t=await db.query("select * from kdrama_blog order by id");
  kdramas = t.rows;
  res.redirect("/");
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
