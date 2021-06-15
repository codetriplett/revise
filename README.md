# Revise
Provides a UI to modify JSON and highlight changes between files. These changes can be applied to the JSON you are editing with a click of a button. Other JSON files can also serve as default props to any object within another file. This is done by setting the url to that file as the "" prop on the object.

```js
// first import the module
import revise from '@triplett/revise'
// then pass in the port and directory
revise(8080, __dirname)
// paths to JSON will all be relative to this directory
```

Navigate to http://localhost:8080 (or other chosen port) and pass either a 'post' or 'put' param with the path to your JSON to begin editing. A hash value can be added to the url to load candidate props. After submitting the changes, use the 'get' param to show the final merged state of the JSON.
