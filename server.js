const express = require('express');
const path = require('path');
const PORT = process.env.PORT ?? 3001;
const app = express();
const uuid = require('./helpers/uuid');
const fs = require('fs');
const savedNotes = require('./db/db.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get('/notes', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public/notes.html'))
});

app.get('/api/notes', (req, res) => {
    // res.json(`${req.method} request received to get notes`);
    // console.info(`${req.method} request received to get notes`);
    res.json(savedNotes);
});

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add note`);

    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        let orig = fs.readFileSync('./db/db.json');
        const notes = JSON.parse(orig);
        notes.push(newNote);
        const noteString = JSON.stringify(notes, null, 2);

        fs.writeFile('./db/db.json', noteString, (err) =>
        err
            ? console.error(err)
            : console.log(`Note has been written to JSON file`));
    }
});

// wildcard listener HAS TO BE BELOW other requests or it trumps any other request
app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public/index.html'))
});

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
            console.info(delNotes);
            
            fs.writeFile('./db/db.json', postDel, (err) =>
            err
                ? console.error(err)
                : console.log('note has been deleted yay'));
            return;
        }
        
    }

});


app.listen(PORT, () => {
    console.log(`Application is running @ http://localhost:${PORT}`);
});