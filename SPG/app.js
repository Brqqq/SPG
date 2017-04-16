'use strict';

const ImageManager = require('./ImageManager');
const backgroundChangeDelay = 3000; // milliseconds
const imageManager = new ImageManager();
const wallpaper = require('wallpaper');

const init = function () {

}

const tick = function () {
    setInterval(() => {
        imageManager.getNextImageURL(() => {
            wallpaper.set('image.png');
        });
    }, backgroundChangeDelay);
    
}

tick();