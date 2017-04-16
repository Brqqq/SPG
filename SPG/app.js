'use strict';

const ImageManager = require('./ImageManager');
const wallpaper = require('wallpaper');
const backgroundChangeDelay = 3000; // milliseconds

const imageManager = new ImageManager();

const tick = function () {
    setInterval(() => {
        imageManager.getNextImageURL(() => {
            wallpaper.set('image.png');
        });
    }, backgroundChangeDelay);
    
}

tick();