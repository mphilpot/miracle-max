
# miracle-max
Static site generator that used jade (jade-lang.com).

## Commands

```
init
```
Creates static-config.json and sitemap.json. static-config.json defines were your content (dynamic templates) and static files are located. It also offers a dynamicHelper object that you can access in all your template files.

```
page -p <path>
```
This is a convenience method of creating a new page. It'll create a template for the defined path e.g. {content}/index or {content}/blog/post. It also has a reference option -r if you want two pages to contain the same content. If you don't want to utilize this function just remember to add your pages into sitemap.json so that when generate is used they'll be converted to static files. 

```
layout -n <name>
```
Convenience method to create a new template file. This is located in the {content}/layouts directory.


```
dev -p <port>
```
Runs a local server on the specified port. If no port is given it defaults to 8080. This allows the user to do live previews of the templates. It will also allow the user to preview any jade template file that is in the directory.

```
generate
```
BETA: Creates static files of all templates referenced in sitemap.json. 

## Coming Features
- Basic blog functionality
- Link helpers for static files to map between jade and exported html files.


# Underlying Features

## static-config.json
This defines the basic configuration for miracle-max. It contains 3 properties.

- **content:** jade template location
- **static:** static files (css, javascript and images) this is also the location that files are generated to.
- **dynamicHelper:** A JSON object that allows you to define global variables/helpers for your templates.

## sitemap.json
Defines the page paths that will be exported as static content. If a entry contains a "ref" attribute with a path it will duplicate the ref'd pages content for that entry. 