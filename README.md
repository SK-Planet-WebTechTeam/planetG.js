planetG.js: Extremely Lightweight HTML5 Game Engine for Mobile Devices
========================

This project contains the commercially-proven HTML5 game engine based on canvas and DOM/GPU specialized for mobile devices (Android and iOS).

Even there are a number of open source HTML5 game engines out there, we're proud of our engine by differentiating it from others,
which provides mobile-device optimized performance improvement techniques.
One of them is to support hybrid rendering context of canvas and DOM/GPU.

By capatilizing on the hybrid rendering context, a game based on our engine can be developed to run on even Android 2.3.x and 4.4/4.4.2 (which suffer from severe performance degradation due to Chrome Webview defect).

Major Features
- require.js based modularization
- mobile device optimized performance including canvas/DOM hybrid rendering context, static object pool
- multi-resolution support for various devicePixelRatio handling
- general game engine feature including sound (WebAudio/Audio tag), Sprite Animation, etc

Roadmap (2.0)
- WebGL back-end for better performance on Android L and iOS8
- support to load mixed resolution resources
- WebWorker integration
- Physics Engine integration (Box2D, physicsJs)
- Smart repaint algorithm improvement (invalidated region merge, Board-level support)
- Entity level event binding
- V8/Jit friendly engine refactoring
- Garbage collector improvement (in an effort to suppress GC almost completely)
- Online DPI/canvas-aware optimized image generation

Developer Guide
- http://sk-planet-webtechteam.github.io/Planet-HTML5-Game-Engine/gettingStarted/index.html

Technical Documents
- How to improve rendering performance by canvas and DOM/GPU hybrid rendering and plus more: http://www.slideshare.net/infect2/korea-linuxforum2014-html5gamesangseoklim
- How to improve JavaScript Performance in the V8-friendly way: http://www.slideshare.net/up2soul/planet-html5gameengine-javascript-performance-enhancement

Demo Games
- Flappy ball
- Avoidance
- Sachunsung
- Piano Tiles

Project Maintainer
- Lim, Sang Seok (sangseok.lim@gmail.com)
- Bae, Cheol Min (cifals0904@gmail.com)
- Kwak, NoHyun (kwakmark@gmail.com)

Project Sponsor
- SK planet (www.skplanet.com)
