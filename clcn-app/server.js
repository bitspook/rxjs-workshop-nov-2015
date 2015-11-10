import express from 'express';
import {
    readFile
} from 'fs';
import {
    Observable,
} from 'rx';
import {
    transformFile,
} from 'babel-core';

let app,
    createEs6ScriptRoute,
    inspirationalFile,
    port,
    readFile_,
    transformFile_;

app = express();
port = 8000;
inspirationalFile = `${__dirname}/data/nerdy-jokes.json`;
transformFile_ = Observable.fromNodeCallback(transformFile);
readFile_ = Observable.fromNodeCallback(readFile);

/**
 * Create express route for sending javascript code which is transformed from ES6 to ES5.
 *
 * @param {string} name Name of the script with which script will be hosted. e.g "promise" from "promise.js"
 * @param {string} scriptPath Location from where ES6 script should be read. Defaults to "__dirname + `name`.js"
 */
createEs6ScriptRoute = (name, scriptPath = `${__dirname}/${name}.js`) => {
    app.get(`/${name}.js`, (req, res) => {
        transformFile_(scriptPath, {
            presets: ['es2015', 'stage-0'],
        })
            .pluck('code')
            .subscribe(
                (script) => res.send(script),
                (err) => res.send(`console.error("${err.message}")`)
            );
    });
};

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

app.get('/promise', (req, res) => {
    res.redirect('/promise.html');
});

app.get('/unicorn-in-the-room', (req, res) => {
    res.redirect('/observable.html');
});

createEs6ScriptRoute('promise');
createEs6ScriptRoute('observable');

app.get('/inspiration', (req, res) => {
    readFile_(inspirationalFile, 'utf-8')
        .map(JSON.parse)
        .pluck('value')
        .map((inspirations) => {
            let index;

            index = Math.floor(Math.random() * inspirations.length);
            return inspirations[index];
        })
        .subscribe(
            (inspiration) => res.send(inspiration),
            (err) => res.send({
                type: 'error',
                value: err.message,
            })
        );
});

app.listen(port, (err) => {
    if (err) {
        console.log('Error occured while starting server', err);
        return;
    }

    console.log(`Server listening on port ${port}`);
});
