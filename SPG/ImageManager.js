'use strict';

const options = require('./options');
const https = require('https');
const fs = require('fs');
const stream = require('stream').Transform;
const request = require('request');

class ImageManager {
    constructor(callback) {
        this._subredditCount = options.subreddits.length;
        this._nextSubredditIndex = 0;
        this._currentSubredditData = null;
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
    

    findSuitableImages() {
        this._suitableImages = [];
        const data = this._currentSubredditData;

        for (let i = 0; i < data.length; i++) {
            const entry = data[i].data;
            if (entry.is_self === true) continue; // No self posts allowed
            if (entry.preview === undefined || entry.preview.images === undefined || entry.preview.images.length === 0) continue; // Make sure it's a proper image that we can use'

            const image = entry.preview.images[0].source;
            if (image.width < options.minResolution.minWidth || image.height < options.minResolution.minHeight) continue; // Check the resolutions

            this._suitableImages.push(image.url);
        }
    }

    loadNextSubredditData(callback) {
        const subredditName = options.subreddits[this._nextSubredditIndex];
        this._nextSubredditIndex++;
        if (this._nextSubredditIndex >= this._subredditCount)
            this._nextSubredditIndex = 0;
        this.getJSON(subredditName, (jsonResult) => {
            this._currentSubredditData = jsonResult.data.children;
            this.findSuitableImages();
            callback();
        })
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
        request(`https://www.reddit.com/r/${subreddit}/.json?limit=10`, function (error, response, body) {
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
    };
}

module.exports = ImageManager;