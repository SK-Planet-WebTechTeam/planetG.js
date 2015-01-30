---
title: Installation
id: <%= title.toLowerCase().split(" ").join("_")  %>
order: 1
items: true
item_key: install
---
The very first thing you need to do is import our JS file. In your HTML file where you want to put our game engine, include following code in <code class="html">&lt;head&gt;&lt;/head&gt;</code>.
<pre><code class="html">&lt;script src="./engine/lib/polyfill.js"&gt;&lt;/script&gt;
&lt;script src="./engine/lib/promise-0.1.1.js"&gt;&lt;/script&gt;
&lt;script src="./engine/lib/require.js" data-main="js/main.js"&gt;&lt;/script&gt;
</code></pre>

Then, you also need a **&lt;canvas&gt;** element to draw your game. Thus, basic HTML file for your game should look something like below.

<pre><code class="html">&lt;html&gt;
    &lt;head&gt;
        &lt;script src="./engine/lib/polyfill.js"&gt;&lt;/script&gt;
        &lt;script src="./engine/lib/promise-0.1.1.js"&gt;&lt;/script&gt;
        &lt;script src="./engine/lib/require.js" data-main="js/main.js"&gt;&lt;/script&gt;
    &lt;/head&gt;
    &lt;body&gt;
        &lt;canvas id="canvas"&gt;&lt;/canvas&gt;
    &lt;/body&gt;
&lt;/html&gt;
</code></pre>

As you see from the above code, there are some dependencies.
- RequireJS
- IE polyfill library
- promise library

All three dependency files are included in our repository.

At **data-main** attribute in &lt;script src="./engine/lib/require.js" **data-main="js/main.js"**&gt;&lt;/script&gt;, put the path of your source code for the game.

###RequireJS Configuration
Basic RequireJS configuration needed for our game engine is as below.
<pre><code class="js">requirejs.config({
    baseUrl: './engine/module/',
    paths: {
        game: './game/polypop/js'
    },
    urlArgs: "bust=" + (new Date()).getTime()
});
</code></pre>

- **baseUrl**: Location of engine/module directory
- **paths**: Paths to any other file you need for your game.
- **urlArgs**: Optional, but it is better to use this property so that browser not read from cached files.
For more information, please refer to [RequireJS API doc](http://requirejs.org/docs/api.html#config)
