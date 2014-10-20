HTML5 Game Engine
========================

This project contains the commercially-proven HTML5 game engine based on canvas and DOM/GPU for mobile devices (Android and iOS).
Even there are a number of open source HTML5 game engines out there, we're proud of our engine by differentiating it from others,
which provides mobile-device optimized performance improvement techniques.
One of them is to support hybrid rendering context of <canvas> and DOM/GPU HW acceleratoin.
By capatilizing on the hybrid rendering context, a game based on our engine can be developed to run on even Android 2.3.x and 4.4/4.4.2 (which has severe performance limitation due to Chrome Webview defect)

Major Features
- require.js based modularization
- mobile device optimized performance including canvas/DOM hybrid rendering context, static object pool
- multi-resolution support for various devicePixelRatio handling
- general game engine feature including sound (WebAudio/Audio tag), Sprite Animation, etc
