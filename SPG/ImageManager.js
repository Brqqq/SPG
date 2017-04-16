﻿'use strict';

const options = require('./options');
const https = require('https');
const fs = require('fs');
const stream = require('stream').Transform;
const request = require('request');

class ImageManager {
    constructor() {
        this._subredditCount = options.subreddits.length;
        this._nextSubredditIndex = 0;
        this._currentSubredditData = null;
        this._currentSubredditEntryIndex = null;
 
    }

    getNextImageURL(callback) {
        //callback(url);
        if (this._currentSubredditData === null) {
            this.loadNextSubredditData(() => this.getNextImageURL(callback));
            return;
        }

        let foundSuitableImage = false;
        while (!foundSuitableImage) {
            if (this.isLastEntry()) {
                this.loadNextSubredditData(() => this.getNextImageURL(callback));
                return;
            }

            const entry = this._currentSubredditData[this._currentSubredditEntryIndex].data;
            this._currentSubredditEntryIndex++;

            if (entry.is_self === true) continue;
            if (entry.preview === undefined || entry.preview.images === undefined || entry.preview.images.length === 0) continue;

            const image = entry.preview.images[0].source;
            if (image.width < options.minResolution.minWidth || image.height < options.minResolution.minHeight) continue;

            this.downloadImage(image.url, callback);
            foundSuitableImage = true;
        }
        
        
    }
    
    isLastEntry() {
        const amountOfEntries = this._currentSubredditData.length;
        return this._currentSubredditEntryIndex >= amountOfEntries;
    }

    loadNextSubredditData(callback) {
        const subredditName = options.subreddits[this._nextSubredditIndex];
        this._nextSubredditIndex++;
        if (this._nextSubredditIndex >= this._subredditCount)
            this._nextSubredditIndex = 0;
        this.getJSON(subredditName, (jsonResult) => {
            this._currentSubredditData = jsonResult.data.children;
            this._currentSubredditEntryIndex = 0;
            callback();
        })
    }

    downloadImage(url, callback) {
        request.head(url, function (err, res, body) {
            request(url).pipe(fs.createWriteStream('image.png')).on('close', callback);
        });
    }

    getJSON(subreddit, callback) {
        request(`https://www.reddit.com/r/${subreddit}.json`, function (error, response, body) {
            var result = JSON.parse(body);
            callback(result);
        });
    };
}

module.exports = ImageManager;