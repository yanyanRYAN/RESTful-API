const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
//--set view engine to use ejs
app.set('view engine', 'ejs');

//--connect to db
mongoose.connect('mongodb://localhost:27017/wikiDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function(){
  console.log("connection successful.");
});

//--construct Schema
const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
});
//--construct model
const Article = mongoose.model('Article', articleSchema);


app.get("/", function(req, res){
  res.send("yoooo");
});

//--route handler chaining
//--requests targeting all articles
app.route("/articles")
.get(function(req, res){
  Article.find({}, function(err, results){
    if(!err){
      res.send(results);
    } else {
      res.send(err);
    }
  });
})
.post(function(req, res){
  const newArticle = new Article({
    title: req.body.title,
    content: req.body.content
  });
  newArticle.save(function(err){
    if(!err){
      res.send("Successfully added a new article.");
    } else {
      res.send(err);
    }
  });
})
.delete(function(req,res){
  Article.deleteMany({}, function(err){
    if(!err){
      res.send("Successfully deleted all articles.");
    } else {
      res.send(err);
    }
  });
});

//--requests targeting specific article
app.route("/articles/:articleTitle")
.get(function(req, res){
  Article.findOne({title: req.params.articleTitle}, function(err, foundArticle){
    if(foundArticle){
      res.send(foundArticle);
    }else{
      res.send("No articles matching that title found.");
    }
  });
})
.put(function(req, res){
  Article.update(
    {title: req.params.articleTitle},
    {title: req.body.title, content: req.body.content},
    {overwrite:true},
    function(err){
    if(!err){
      res.send("Successfully updated article.");
    }
  });
})
.patch(function(req, res){
  Article.update(
    {title: req.params.articleTitle},
    {$set: req.body},
    function(err){
      if(!err){
        res.send("Successfully updated article.");
      }else{
        console.log(err);
      }
    }
  );
}).delete(function(req, res){
  Article.deleteOne({title: req.params.articleTitle}, function(err){
    if(!err){
      res.send("Successfully deleted article");
    } else {
      res.send(err);
    }
  })
});

app.listen(port, function(){
  console.log("Server started on port: " + port);
});
