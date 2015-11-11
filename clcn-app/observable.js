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
    superagent
        .get(apiUrl)
        .end((err, res) => {
            if (err) {
                return observer.onError(err);
            }

            let inspiration;

            inspiration = JSON.parse(res.text).joke;

            observer.onNext(inspiration);
            observer.onCompleted();

            return () => {
                console.log('Release the Kraken!');
            };
        });
});

reactiveInspiration
    .subscribe(
        inspireHTML('inspiration'),
        (err) => {
            console.log('Error while getting inspired', err);
        },
        () => {
            console.log('Done getting inspired!');
        }
    );
