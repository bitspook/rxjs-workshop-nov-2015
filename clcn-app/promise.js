/* global superagent, Rx */
let apiUrl,
    inspireHTML,
    promiscuousInspiration;

apiUrl = 'http://localhost:8000/inspiration';

inspireHTML = (parentId) => (inspiration) => {
    let parentNode,
        inspirationalNode;

    parentNode = document.getElementById(parentId);
    inspirationalNode = document.createElement('p');
    inspirationalNode.innerHTML = inspiration;

    parentNode.insertBefore(inspirationalNode, parentNode.firstChild);
};

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
    .then(
        inspireHTML('inspiration'),
        (err) => {
            console.error('Error occurred while getting inspiration.', err);
        });
