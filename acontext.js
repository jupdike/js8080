// fix audio on Safari so mixing works (multiple sounds playing simultaneously)
// see
// https://stackoverflow.com/questions/25654558/html5-js-play-same-sound-multiple-times-at-the-same-time

window.AudioContext = window.AudioContext || window.webkitAudioContext;

const acontext = new AudioContext();

class Sound {
    url = '';
    buffer = null;
    sources = [];

    constructor(url) {
        this.url = url;
    }

    load() {
        if (!this.url) return Promise.reject(new Error('Missing or invalid URL: ', this.url));

        if (this.buffer) return Promise.resolve(this.buffer);

        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();

            request.open('GET', this.url, true);
            request.responseType = 'arraybuffer';

            // Decode asynchronously:
            request.onload = () => {
                acontext.decodeAudioData(request.response, (buffer) => {
                    if (!buffer) {
                        console.log(`Sound decoding error: ${ this.url }`);

                        reject(new Error(`Sound decoding error: ${ this.url }`));

                        return;
                    }

                    this.buffer = buffer;

                    resolve(buffer);
                });
            };

            request.onerror = (err) => {
                console.log('Sound XMLHttpRequest error:', err);

                reject(err);
            };

            request.send();
        });
    }

    play(volume = 1, time = 0) {
        console.log('play 1', this.url);
        if (!this.buffer) return;

        acontext.resume();

        console.log('play 2', this.url);

        // Create a new sound source and assign it the loaded sound's buffer:
        const source = acontext.createBufferSource();
        source.buffer = this.buffer;

        // Keep track of all sources created, and stop tracking them once they finish playing:
        const insertedAt = this.sources.push(source) - 1;
        source.onended = () => {
            source.stop(0);

            this.sources.splice(insertedAt, 1);
        };

        // Create a gain node with the desired volume:
        const gainNode = acontext.createGain();
        gainNode.gain.value = volume;

        // Connect nodes:
        source.connect(gainNode).connect(acontext.destination);

        // Start playing at the desired time:
        source.start(time);

        console.log('play 3', this.url);
    }

    stop() {
        // Stop any sources still playing:
        this.sources.forEach((source) => {
            source.stop(0);
        });
        this.sources = [];
    }

}
