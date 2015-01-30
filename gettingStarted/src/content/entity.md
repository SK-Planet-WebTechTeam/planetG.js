---
title: Entity
id: <%= title.toLowerCase().split(" ").join("_")  %>
order: 4
items: true
item_key: entity_items
---

Any object you put in your game is an **Entity**. A character the user play around, a bullet the character shoots, obstacles that block the character's move.. everything is an entity. Entities should be allocated from the [**Entity Pool**](#entity_pool), and then added to a Board to be presented in a specific game scene.
