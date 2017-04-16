'use strict';

const ImageManager = require('./ImageManager');
const wallpaper = require('wallpaper');
const options = require('./options');

const imageManager = new ImageManager();

const tick = function () {
    setInterval(() => {
        imageManager.getNextImageURL(() => {
            wallpaper.set('image.png');
        });
    }, options.delay * 1000 * 60);
    
}

tick();