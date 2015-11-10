/* global superagent, Rx */
let apiUrl;

apiUrl = 'http://localhost:8000/inspiration';

superagent
    .get(apiUrl)
    .end((err, res) => {
        let inspiration;

        inspiration = JSON.parse(res.text).joke;

        console.log(inspiration);
    });
