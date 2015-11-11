/* global superagent, Rx */
let Observable,
    apiUrl,
    getPromiscuousInspiration,
    inspireHTML,
    reactiveInspiration_,
    stopButton,
    stopInspiration_;

apiUrl = 'http://localhost:8000/inspiration';
Observable = Rx.Observable;
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

stopInspiration_ = Observable.fromEvent(stopButton, 'click').do(e => e.preventDefault());

reactiveInspiration_ = Observable
    .interval(1000)
    .flatMap(getPromiscuousInspiration)
    .takeUntil(stopInspiration_);

reactiveInspiration_
    .subscribe(
        inspireHTML('inspiration'),
        (err) => {
            console.log('Error while getting inspired', err);
        },
        () => {
            console.log('Done getting inspired!');
        }
    );
