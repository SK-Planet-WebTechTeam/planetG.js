Getting Started Generator
=========================

Getting Started page for PWGE management tool.

Output
- ./index.html

Resources
- ./res/css
- ./res/js

Source files
- ./src/content/**/*.md
- ./src/layout/*.md

Source File
- Each title of contents must have one separate MD file under ./src/content/ directory
- Each subtitle of a title must be located under ./src/content/{TITLE}/N.{SUBTITLE}.md
- File name of each subtitle should contain its order among its greater title (i.e. ./src/content/entity/1.entitypool.md, ./src/content/entity/2.add_to_board.md ). Files are ordered by this order specified in the file name.

YAML Front Matter Guide

Each title must have following properties in its YFM

- title: Entity 										#title of the content
- id: <%= title.toLowerCase().split(" ").join("_")  %> 	# this will automatically generate DOM element's id from it's title
- order: 4 												# order among titles (excluding subtitles)
- items: true 											# true all the time.
- item_key: entity_items 								# if the title has subtitles, make a unique item_key to identify its subtitles.



Each subtitle must have following properties in its YFM

- title: Entity Pool									#title of the content
- id: <%= title.toLowerCase().split(" ").join("_")  %>	# this will automatically generate DOM element's id from it's title
- item_key: entity_items								# item_key of its greater title.
- child: true 											# true for all subtitle


Build command
- grunt