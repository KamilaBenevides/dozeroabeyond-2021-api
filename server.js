const express = require("express");
const axios = require("axios").default;
const cors = require("cors");
const { json, urlencoded } = require("body-parser");

const { firestore, storage } = require("./firebase");
const app = express();

const port = process.env.PORT || 8081

// Middlewares
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  if (req.headers.authorization === "Bearer autenticado") {
    next();
  } else {
    res.sendStatus(403);
  }
});

// CRUD Users
app.get("/users", async (req, res) => {
  try {
    const users = await firestore.collection("usuarios").get();
    const usersData = users.docs.map((userDoc) => {
      const user = userDoc.data();
      delete user.password;
      return user;
    });
    res.status(200).send(usersData);
  } catch (e) {
    console.error(e)
    res.status(500).send();
  }
});

// CRUD Posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await firestore.collection("posts").get();
    const postsData = posts.docs.map((userDoc) => {
      const posts = userDoc.data();
      delete posts.password;
      return posts;
    });
    res.status(200).send(postsData);
  } catch (e) {
    console.error(e)
    res.status(500).send();
  }
});

app.get("/posts/:to", async (req, res) => {
  const to = req.params.to;
  console.log("to ", to)
  try {
    const posts = await firestore.collection("posts").where('to', '==', to).get();
    const postsData = posts.docs.map((userDoc) => {
      const posts = userDoc.data();
      return posts;
    });
     
    console.log("posts: ", postsData.entries() )
    res.status(200).send(postsData);
    
  } catch (e) {
    console.log("erro: " + e)
    res.status(500).send("Internal Error, Sorry");
  }
});


app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  console.log("id ", id)
  try {
    const document = await firestore.collection("usuarios").doc(id).get();
    console.log("document: ", document )
    if (document.exists) {
      const userData = document.data();
      console.log(userData)
      delete userData.password;
      res.status(200).send(userData);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    console.log("erro: " + e)
    res.status(500).send("Internal Error, Sorry");
  }
});

app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await firestore.collection("usuarios").doc(id).delete()
    res.status(204).send();
  } catch (e) {
    res.status(500).send("Internal Error, Sorry");
  }
});

app.delete("/posts/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await firestore.collection("posts").doc(id).delete();
    res.status(204).send();
  } catch (e) {
    res.status(500).send("Internal Error, Sorry");
  }
});

app.post("/users", async (req, res) => {
  try {
    const docRef = firestore.collection("usuarios").doc(req.body.id);
    console.log(req.body)
    const user = { name: req.body.name, id: req.body.id, email: req.body.email};
    console.log(user)
    await docRef.set(user)
    res.status(201).send({ id: docRef.id })
  } catch (e) {
    console.error(e)
    res.status(500).send("Internal Error, Sorry")
  }
});

app.post("/posts", async (req, res) => {
  console.log(req.body)
  console.log(req)
  console.log("alo")
  
  try {
    const docRef = firestore.collection("posts").doc()
    console.log("ver")
    console.log(req.body)
    const post = {
      id: docRef.id, 
      name: req.body.name, 
      to: req.body.to, 
      from: req.body.from, 
      text: req.body.text, 
      file: req.body.file, 
      createAt: req.body.createAt,
      fileUrl: req.body.fileUrl,
    }
    await docRef.set(post)
    res.status(201).send({ id: docRef.id })
  } catch (e) {
    console.error(e)
    res.status(500).send("Internal Error, Sorry")
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const docId = req.params.id;
    const userData = {
      id: docId,
      name: req.body.name,
      password: req.body.password,
      email: req.body.email
    };
    await firestore
      .collection("usuarios")
      .doc(docId)
      .set(userData, { merge: true });
    res.status(204).send();
  } catch (e) {
    res.status(500).send("Internal Error, Sorry");
  }
});

app.put("/posts/:id", async (req, res) => {
  try {
    const docId = req.params.id;
    const postData = {
      id: docId,
      text: req.body.text
    };
    await firestore
      .collection("posts")
      .doc(docId)
      .set(postData, { merge: true });
    res.status(204).send();
  } catch (e) {
    res.status(500).send("Internal Error, Sorry");
  }
});

app.post("/users/:id/recover-password", async (req, res) => {
  try {
    const docId = req.params.id;
    let randomPassword = (Math.random() + 1).toString(36).substring(2);
    const userData = {
      password: randomPassword,
    };

    await firestore
      .collection("usuarios")
      .doc(docId)
      .set(userData, { merge: true });

    console.log(`Manda email pro usuário com a senha dele: ${randomPassword}`);
    res.status(200).send();
  } catch (e) {
    console.error(e)
    res.status(500).send("Internal Error, Sorry");
  }
});


app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`);
});
