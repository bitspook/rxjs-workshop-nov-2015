/* global superagent, Rx */
let apiUrl,
    addPromiscuousInspiration,
    getPromiscuousInspiration,
    inspireHTML,
    startGettingInspired,
    stopButton,
    stopGettingInspired;

apiUrl = 'http://localhost:8000/inspiration';
stopButton = document.getElementById('stop');

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

startGettingInspired = () => {
    return setInterval(() => {
        addPromiscuousInspiration(
            getPromiscuousInspiration()
        );
    }, 1000);
};

stopGettingInspired = (interval) => (e) => {
    e.preventDefault();
    stopButton.removeEventListener('click', stopGettingInspired(interval));

    clearInterval(interval);
};

stopButton.addEventListener('click', stopGettingInspired(startGettingInspired()));
