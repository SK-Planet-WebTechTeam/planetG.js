---
title: Entity
id: <%= title.toLowerCase().split(" ").join("_")  %>
order: 4
items: true
item_key: entity_items
---

Any object you put in your game is an **Entity**. A character the user play around, a bullet the character shoots, obstacles that block the character's move.. everything is an entity. Entities should be allocated from the [**Entity Pool**](#entity_pool), and then added to a Board to be presented in a specific game scene.

An entity has following properties.
<pre><code class="json">{
    "domRendering": false,
    "domRenderer": null,
    "enabled": true,
    "detectable": true,
    "opacity": 1,
    "anchorX": 0,
    "anchorY": 0,
    "rotate": 0,
    "scaleX": 1,
    "scaleY": 1,
    "x": 0,
    "y": 0,
    "z": 0,
    "width": 0,
    "height": 0
}
</code></pre>


- **domRendering**:
- **domRenderer**:
- **enabled**: if true, the entity is shown on board, otherwise it doesn't appear on board.
- **detectable**:
- **opacity**: opacity of the entity
- **anchorX, anchorY**: anchor point to top-left corner from center
- **rotate**: amount of rotation (in radian)
- **scaleX, scaleY**: scale factor
- **x, y, z**: entity's position on board (center of the entity)
- **width**: width of the entity
- **height**: height of the entity