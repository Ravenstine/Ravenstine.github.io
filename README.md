[![Code Climate](https://codeclimate.com/github/SCPR/kpcc-design-system/badges/gpa.svg)](https://codeclimate.com/github/SCPR/kpcc-design-system)
[![Build Status](https://travis-ci.org/SCPR/kpcc-design-system.svg?branch=master)](https://travis-ci.org/SCPR/kpcc-design-system)

KPCC Design System
==================

This repository houses kpcc-design-system, a shared style library for KPCC web products. Major HT to the [US Web Design Standards](https://github.com/18F/web-design-standards) project and their [cg-style](https://github.com/18F/cg-style) project; the code and structure for KPCC's design system are based in large part on their work.

The kpcc-design-system provides the assets (CSS, SCSS, JS, images and font declarations) to design KPCC-branded, consumer-facing, editorial websites. This allows multiple sites, built in separate repositories and with different languages, to share a unified global style. The kpcc-design-system library is distributed on the node/npm ecosystem.

## Installation and usage

kpcc-design-system can be consumed by a project by installing it via [npm](https://www.npmjs.com/). Run the following command on a computer with node/npm installed to install kpcc-design-system into your project:

```
npm install kpcc-design-system --save
```

Once installed, all the assets from kpcc-design-system have to be consumed by your project. This can be done in multiple ways depending on what assets and your project setup. For example, a simple site could copy over the relevant assets with build commands and include them from the html with link tags.

```
# build commands
cp ./node_modules/kpcc-design-system/dist/scripts/* ./public/scripts
cp ./node_modules/kpcc-design-system/dist/styles/* ./public/styles
cp -R ./node_modules/kpcc-design-system/dist/images/**/* ./public/images
```

Another possibility for importing the JS and SCSS is to use Browserify and SASS to import them into the project.

```js
require('kpcc-design-system');
```

```css
@import './node_modules/kpcc-design-system/src/css/index.sass';
```

### Fonts

Add these tags to your HEAD tag to include fonts.

```
<script src="https://use.typekit.net/cka2qre.js"></script>
<script>try{Typekit.load({ async: true });}catch(e){}</script>
```

### Using SVG images
Images that are part of the kpcc-design-system project are available as one central SVG sprite with each image consisting of a SVG `<symbol>`. To use these images, you can use the SVG `xlink` attribute as follows:
```
  <svg class="icon">
    <use xlink:href="/public/img/scpr-sprite.svg#i-share"/>
  </svg>
```

## Contributing to the design system

Anyone at KPCC can contribute improvements to kpcc-design-system. Making changes/improvements typically involves getting the repo set up for local development, adding/refactoring one or more patterns, committing those changes, and then publishing a new version of the design system to npm.

### Local Development

To get kpcc-design-system up and running for local development:

1. clone the repo to your machine: `git clone git@github.com:SCPR/kpcc-design-system.git`
2. `cd` into the `kpcc-design-system` directory.
3. Run `npm install` to install javascript dependencies.
4. To get the documentation site running locally, run `npm run serve` and navigate to `http://localhost:3001`.

### Adding a new CSS pattern

Adding a new CSS pattern to the design system looks something like:

1. Create a new Sass/SCSS partial in `src/styles/*`, (e.g. a new modal component would be created at `src/styles/components/_modals.scss`).
2. Import the new SCSS partial into the `all.scss` file in the same directory (e.g. `src/css/components/all.scss`).
3. Author your CSS inside the partial for the new pattern, taking care to use [BEMIT](http://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/) conventions and [KSS](http://warpspire.com/kss/) at the top of each file to document your CSS.
4. To document your new pattern, add it to `index.html`.
5. View your new pattern on the documentation server using `npm run serve`, and confirm that its appearance and behavior is as expected.
7. Commit your changes (typically in a feature branch) and issue a Pull Request.

### Publishing a new version of the design system to NPM

kpcc-design-system uses Travis CI to test builds, and also can publish passing builds to npm automatically using git tags and releases. When you're ready to release a new version of the design system, follow these steps:

1. Make sure the changes that make up your release have been merged into `master`.
2. Update the project's version number in `package.json` (https://github.com/SCPR/kpcc-design-system/blob/master/package.json#L3).
3. Commit the update to the `package.json` file.
4. On `master`, create a new tag and give it a brief description, e.g.: `git tag -a v1.4 -m "my version 1.4"`.
5. Push the tag to Github: `git push origin v1.4`.
6. The push to Github will kick off a new build on Travis CI. Once that succeeds, Travis should automatically publish the new version to npm.
7. Verify that your new version has published to npm: https://www.npmjs.com/package/kpcc-design-system.
8. Create a new Release in Github that corresponds to your tag: https://github.com/SCPR/kpcc-design-system/releases/new

## Running the design system documentation

The design system allows you to see changes to components from the kpcc-design-system project and is used for visual regression testing of components. To get the Middleman design system site working:

- Ensure you have Node.js installed.
- Install dependencies by running `npm install`
- Start the server by running `npm run serve`

