# SPG

Subreddit Picture Grabber is a little tool that lets you specify a series of subreddits. It will then download images from that subreddit and make it your wallpaper. You can specify which subreddits it should use and how often it should retrieve a new wallpaper.
Should supposedly work for Windows, Linux and Mac

## Settings

Modify the 'config.json' file for settings.
- subreddits : Which subreddits to look in for pictures
- maxResults : How many results it will look at from each subreddit
- minResolution : The minimum resolution requires for images
- delay : Minutes until the next wallpaper is loaded
- randomized : If set to true, it will take all the images from all the subreddits combined, shuffle them and go through them one by one

## Running

It requires at least NodeJS v6.10.2. Some previous versions might work, as long as it supports most ES6 features.
First run 'npm install' to install dependencies
Then run 'node app.js' to start the application
