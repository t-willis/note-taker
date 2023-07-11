// various requires to be used below
const express = require('express');
const path = require('path');
const PORT = process.env.PORT ?? 3001;
const app = express();
const uuid = require('./helpers/uuid');
const fs = require('fs');

// middle-ware to accept data from the user
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// middle-ware to declare static directory
app.use(express.static('public'));

// get for the /notes url path from public folder
app.get('/notes', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public/notes.html'))
});

// get to read db.json and use it to populate the page
app.get('/api/notes', (req, res) => {
    let orig = fs.readFileSync('./db/db.json');
    const notes = JSON.parse(orig);
    res.json(notes);
});

// post to take in user input and write it to db.json, then res with the updated db.json
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add note`);

    // deconstructing user input
    const { title, text } = req.body;

    // check if title AND text exist then assign to new object including a random id
    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        // read db.json, parse, add newNote to parsed data, stringify with replacer/space
        let orig = fs.readFileSync('./db/db.json');
        const notes = JSON.parse(orig);
        notes.push(newNote);
        const noteString = JSON.stringify(notes, null, 2);

        // writeFileSync db.json using the newly updated string including user input
        fs.writeFileSync('./db/db.json', noteString, (err) =>
        err
            ? console.error(err)
            : console.log(`Note has been written to JSON file`));
    }
    
    // re-populate the page with updated db.json data in res
    let orig = fs.readFileSync('./db/db.json');
    const notes = JSON.parse(orig);
    res.json(notes);
});

// delete to remove selected note from db.json
app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    console.info(`delete req received for ${id}`);
    res.json('delete request received, this should be in insomnia');
    
    let origSaved = fs.readFileSync('./db/db.json');
    let delNotes = JSON.parse(origSaved);
    
    for (let i = 0; i < delNotes.length; i++) {
        if (delNotes[i].id === id) {
            delNotes.splice(i, 1);
            postDel = JSON.stringify(delNotes);
            
            fs.writeFile('./db/db.json', postDel, (err) =>
            err
            ? console.error(err)
            : console.log('note has been successfully deleted'));
            return;
        }
        
    }
    
});

// wildcard listener HAS TO BE BELOW other requests or it trumps any other request
app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public/index.html'))
});

// listen for user input/requests
app.listen(PORT, () => {
    console.log(`Application is running @ http://localhost:${PORT}`);
});