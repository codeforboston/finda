# Finda [![Build Status](https://travis-ci.org/codeforboston/finda.png)](https://travis-ci.org/codeforboston/finda)

_You have data with locations. Share it with the world._

### Why use Finda?

1. You have data with addresses / locations.
2. You want to put it online.
3. You want people to be able to search data and find the services they need near them.


## I want to use this app for my data set.

Great! Head over to our [Getting Started wiki](finda.wiki/Home.md) 

## Development

1. This app reads in data.geojson (provided by the end user) and config.json (customized by the end user).
2. It's all client-side Javascript with a single page for the entire app, so non-developers can deploy quickly.
3. Keep everything human-readable.

### Set up your computer

##### Mac or Linux

1. Open the Terminal application.

2. Make sure the command-line tool Git is installed by entering `which git` into Terminal. If the command returns a filepath, you're all set. (If Git is not installed, [install it](http://git-scm.com/book/en/Getting-Started-Installing-Git).)

##### Windows

- [Install Git for Windows](http://git-scm.com/book/en/Getting-Started-Installing-Git).


### Copy the code to your computer.

1. Navigate to the folder you'd like to copy the code to by using the cd command.

2. Clone the repository (i.e. copy the code) from where it's hosted online. Do this by entering `git clone git@github.com:codeforboston/finda.git`

3. Open the folder you just downloaded using your favorite text editor. (We use [Sublime Text](http://www.sublimetext.com/).)


### Add your data.

Finda requires that your data is in GeoJSON format, since it's an open, web-friendly format.

If your data is not in GeoJSON format, you might try converting it using [Ogre](http://ogre.adc4gis.com/). We haven't used it ourselves, but it seems worth a try. We'll recommend an option we've tested in the future.

To consume a remote URL instead of the local `data.geojson`, open up `config.json` and modify the `geojson_source` variable. By default, this variable loads the local `data.geojson`.


### Configure the application.

To configure the Finda app to display your data, fill in the configuration file.

__TODO: Finish this section.__


### Style the application.

You can edit the display of your application using `style.css` in the `styles` directory.

__TODO: Finish this section.__

### Testing
Finda comes with a small set of unittests that you can run with Karma.

### Installing Karma
    npm install -g karma

### Running the tests
    karma server # starts a server which automatically runs the tests
