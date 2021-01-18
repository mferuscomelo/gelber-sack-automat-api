import * as functions from "firebase-functions";
import admin = require('firebase-admin');
import express = require('express');
// import parse = require('body-parser');
// import cors = require('cors');

interface Card {
    id: string,
    canGetRoll: boolean;
}

// require('dotenv').config();
admin.initializeApp();
const db = admin.firestore();

const app = express();

// app.use(cors({origin: true}));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.status(200).send('API working');
})

app.get('/:id', async (req, res) => {
    const { id } = req.params;

    db.collection('cards').doc(id).get()
        .then( (doc) => {
            if(doc.exists)
                res.status(200).send(doc.data());
            else
                res.status(404).send('Card not found');
        })
        .catch( (error) => {
            res.status(400).send(`Error getting card info: ${error}`);
        })
})

app.post('/', async (req, res) => {
    try {
        console.log('Got body:', req.body);
        console.log(req.body['card']);
        const { card }: {card: Card} = req.body;

        const docRef = db.collection('cards').doc(card.id);

        docRef.get()
            .then( (doc) => {
                if(!doc.exists) {
                    docRef.set(card)
                        .then( () => {
                            res.status(201).send(`Card created: ${card.id}`);
                        })
                        .catch( (error) => {
                            res.status(400).send(`Error creating card: ${error}`);
                        })
                } else {
                    res.status(400).send(`Card already exists`);
                }
            })
    } catch (error) {
        res.status(400).send(`Request must have an id and canGetRoll: ${error}`);
    }
});

app.patch('/', async (req, res) => {
    try {
        console.log('Got body:', req.body);
        console.log(req.body['card']);
        const { card }: {card: Card} = req.body;

        db.collection('cards').doc(card.id).update(card)
            .then( () => {
                res.status(201).send(`Card updated: ${card.id}`);
            })
            .catch( (error) => {
                res.status(400).send(`Card hasn't been added yet`);
            })
    } catch (error) {
        res.status(400).send(`Request must have an id and canGetRoll: ${error}`);
    }
})

export const api = functions.https.onRequest(app);

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
