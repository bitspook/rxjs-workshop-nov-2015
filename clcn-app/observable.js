/* global superagent, Rx */
let Observable,
    apiUrl,
    inspireHTML,
    reactiveInspiration;

apiUrl = 'http://localhost:8000/inspiration';
Observable = Rx.Observable;

inspireHTML = (parentId) => (inspiration) => {
    let parentNode,
        inspirationalNode;

    parentNode = document.getElementById(parentId);
    inspirationalNode = document.createElement('p');
    inspirationalNode.innerHTML = inspiration;

    parentNode.insertBefore(inspirationalNode, parentNode.firstChild);
};

reactiveInspiration = Observable.create((observer) => {
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

reactiveInspiration
    .take(10)
    .subscribe(
        inspireHTML('inspiration'),
        (err) => {
            console.log('Error while getting inspired', err);
        },
        () => {
            console.log('Done getting inspired!');
        }
    );
