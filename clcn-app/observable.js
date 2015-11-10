/* global superagent, Rx */
let Observable,
    apiUrl,
    reactiveInspiration;

apiUrl = 'http://localhost:8000/inspiration';
Observable = Rx.Observable;

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
        });
});

reactiveInspiration
    .subscribe(
        (inspiration) => {
            console.log('Get inspired: ', inspiration);
        },
        (err) => {
            console.log('Error while getting inspired', err);
        },
        () => {
            console.log('Done getting inspired!');
        }
    );
