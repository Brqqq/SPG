'use strict';

const ImageManager = require('./ImageManager');
const wallpaper = require('wallpaper');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const tick = function () {
    setInterval(function next() {
        imageManager.getNextImageURL(() => {
            wallpaper.set('image.png');
        });
        return next;
    }(), config.delay * 1000 * 60);
}

const imageManager = new ImageManager(config, tick);