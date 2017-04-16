'use strict';

const options = {
    subreddits: ['MotorcyclePorn', 'spaceporn'],
    minResolution: {
        minWidth: 2000,
        minHeight: 2000
    },
    delay: 2 // in minutes, how many minutes to wait before getting the next wallpaper. Decimal values are fine
};

module.exports = options;