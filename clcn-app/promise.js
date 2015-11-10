/* global superagent, Rx */
let apiUrl,
    promiscuousInspiration;

apiUrl = 'http://localhost:8000/inspiration';

promiscuousInspiration = new Promise((resolve, reject) => {
    superagent
        .get(apiUrl)
        .end((err, res) => {
            if (err) {
                return reject(err);
            }

            let inspiration;

            inspiration = JSON.parse(res.text).joke;
            return resolve(inspiration);
        });
});

promiscuousInspiration
    .then((inspiration) => {
        console.log('Get Inspired: ', inspiration);
    }, (err) => {
        console.error('Error occurred while getting inspiration.', err);
    });
