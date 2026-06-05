# SumoBubble Web Component

## Dev

Of course start with a good old `yarn` to insall dependencies.

Do `yarn dev` to build the WC once and have it served at localhost:3001

or

Do 'yarn watch' to build the WC and watch for changes but also have it served at localhost:3001

No auto reload in this configuration. 

Navigate to http://localhost:3001/local.html for a page loading the WC.
Navitgate to http://localhost:3001/deployed.html for the real deployed prod version one to test.

## Install

Install on a page by inserting this code into the page html.

```
<script type="module" 
  src="https://{url to the hosted app}/wc/sumobubble.js" 
  id="sumobubble-app-scriptastic">
</script>
<sumobubble-wc site="SITE_ID"/>
```

Enjoy.