/* global superagent, Rx */
let Observable,
    apiUrl,
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

reactiveInspiration_ = Observable.create((observer) => {
    let interval;

    interval = setInterval(() => {
        superagent
            .get(apiUrl)
            .end((err, res) => {
                if (err) {
                    return observer.onError(err);
                }

                let inspiration;

                inspiration = JSON.parse(res.text).joke;

                observer.onNext(inspiration);
            });
    }, 1000);

    return () => {
        clearInterval(interval);
    };
});
stopInspiration_ = Observable.fromEvent(stopButton, 'click').do(e => e.preventDefault());

reactiveInspiration_
    .takeUntil(stopInspiration_)
    .subscribe(
        inspireHTML('inspiration'),
        (err) => {
            console.log('Error while getting inspired', err);
        },
        () => {
            console.log('Done getting inspired!');
        }
    );
