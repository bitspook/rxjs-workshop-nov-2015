/* global superagent, Rx */
let apiUrl,
    addNInspirations,
    addPromiscuousInspiration,
    inspireHTML,
    getPromiscuousInspiration;

apiUrl = 'http://localhost:8000/inspiration';

inspireHTML = (parentId) => (inspiration) => {
    let parentNode,
        inspirationalNode;

    parentNode = document.getElementById(parentId);
    inspirationalNode = document.createElement('p');
    inspirationalNode.innerHTML = inspiration;

    parentNode.insertBefore(inspirationalNode, parentNode.firstChild);
};

getPromiscuousInspiration = () => new Promise((resolve, reject) => {
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

addPromiscuousInspiration = (promiscuousInspiration) => {
    promiscuousInspiration
        .then(
            inspireHTML('inspiration'),
            (err) => {
                console.error('Error occurred while getting inspiration.', err);
            });
};

addNInspirations = (n) => {
    let count,
        interval,
        maxCount;

    maxCount = n;
    count = 1;

    interval = setInterval(() => {
        addPromiscuousInspiration(
            getPromiscuousInspiration()
        );

        if (count < maxCount) {
            count++;
        } else {
            clearInterval(interval);
        }
    }, 1000);
};

addNInspirations(10);
