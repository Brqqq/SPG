'use strict';

const fs = require('fs');
const stream = require('stream').Transform;
const request = require('request');

class ImageManager {
    constructor(config, callback) {
        this._config = config;
        this._subredditCount = this._config.subreddits.length;
        this._nextSubredditIndex = 0;
        this._suitableImages = null;

        this.loadNextSubredditData(callback);
    }

    getNextImageURL(callback) {
        if (this._suitableImages.length == 0) {
            this.loadNextSubredditData(() => this.getNextImageURL(callback));
            return;
        }

        const url = this._suitableImages.shift(); // essentially a dequeue action
        this.downloadImage(url, callback);
    }
    

    findSuitableImages(data) {
        for (let i = 0; i < data.length; i++) {
            const entry = data[i].data;
            if (entry.is_self === true) continue; // No self posts allowed
            if (entry.preview === undefined || entry.preview.images === undefined || entry.preview.images.length === 0) continue; // Make sure it's a proper image that we can use'

            const image = entry.preview.images[0].source;
            if (image.width < this._config.minResolution.minWidth || image.height < this._config.minResolution.minHeight) continue; // Check the resolutions

            this._suitableImages.push(image.url);
        }
    }

    loadNextSubredditData(callback) {
        this._suitableImages = [];

        if (this._config.randomized) { // Load all subreddits
            let counter = 0; // Counter to keep track of if all the requests have been finished
            for (let i = 0; i < this._config.subreddits.length; i++) {
                const subredditName = this._config.subreddits[i];
                this.getJSON(subredditName, (jsonResult) => {
                    this.findSuitableImages(jsonResult.data.children);
                    counter++;
                    if (counter === this._config.subreddits.length) { // This is the last one
                        this.shuffle(this._suitableImages); // Randomize the entire list first
                        callback();
                    }
                });
            }
        }
        else { // Load the first next subreddit only, because it's not randomized
            const subredditName = this._config.subreddits[this._nextSubredditIndex];
            this._nextSubredditIndex++;
            if (this._nextSubredditIndex >= this._subredditCount)
                this._nextSubredditIndex = 0;
            this.getJSON(subredditName, (jsonResult) => {
                this.findSuitableImages(jsonResult.data.children);
                callback();
            });
        }
    }

    downloadImage(url, callback) {
        request.head(url, function (error, res, body) {
            if (error) {
                console.log(`Error downloading image from url: ${url}, error: ${error}, response: ${response}`);
                return;
            }
            request(url).pipe(fs.createWriteStream('image.png')).on('close', callback);
        });
    }

    getJSON(subreddit, callback) {
        request(`https://www.reddit.com/r/${subreddit}/.json?limit=${this._config.maxResults}`, function (error, response, body) {
            if (error) {
                console.log(`Error retrieving info from subreddit: ${subreddit}, error: ${error}, response: ${response}`);
                return;
            }
            let result;
            try {
                result = JSON.parse(body);
            } catch (e) {
                console.log(`Error parsing JSON from subreddit: ${subreddit}, exception: ${e}, response: ${response}, body: ${body}`);
            }
            callback(result);
        });
    }

    shuffle(a) {
        for (let i = a.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [a[i - 1], a[j]] = [a[j], a[i - 1]];
        }
    }
}

module.exports = ImageManager;