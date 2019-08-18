# Interactable Rubik Simulation

> Build my first app with three.js

#### [See the pulished demo on Heroku](https://play-rubik-cube.herokuapp.com/#/)

#### User's guide
- Touch and Mouse events both supported, for the best experience, please clip the brower window to roughly *2-by-3 aspect ratio* and *hit refresh*.
- Hold and drag the blue line on the screen to change the display percentage of the front and end view port.
- Swipe on the background to rotate the rubik cube.
- Swipe on the blocks of the rubik cube to rotate one layer of the cube.
- Reset and Shuffle button on the up right corner.

## Running the code
> Package config modified to support heroku.   
> Build files generated in `/dist`
``` bash
# install dependency
npm install

# serve with express.js // serve at localhost:5000
node server.js
```

## Native Setup with vue-cli
change the start script in package.json form `"start": "node server.js",` to `"start": "npm run dev",`
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
