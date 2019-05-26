# User Experience Record and Player

## Overview
This project's goal is to be a fully client side user experience recorder which can be used for live simulation and playback. It uses web workers (worker thread pools and worker specific task pools) to do the heavy processing. The main goal is to be highly optimized so the user does not feel any performance degradation because of the heavy event processing. Most of the heavy processing (HTML diffing, screenshots, etc) is done to have a lean and clean data ouput which can be easily serialized and deserialied.

The idea of HTML diffing will be really useful as it will keep the data size really compact and avoid a lot of processing and complications while at the same time provide the exact site view.
Simulation will just replay the events on a live site instance while the player will transition between site view states (different HTML). This will allow for skipping, fast forwarding, inactivity tracking, etc.

There are a lot of use cases for this type of recording. The obvious use cases are for bug reporting, analytics, campaign tracking, and A/B testing. Eventually this can be compact enough for live sharing. Instead of sending bytes of each window frame (pixels) with huge size and network costs, it will be a few bytes of data.

## Try it out

### Setting up the Recorder
1. Clone the repo.
2. cd into the `recorder` folder and execute `npm i`.
3. Execute `npm run dev`. This starts a webpack-dev-server instance located at https://localhost:8080
4. Use a chrome extension like JavaScript Injector to inject the resulting dist entry js file into a website of your choosing. https://chrome.google.com/webstore/detail/javascript-injector/djnjegpffahmfpjdlkciiecmeaebghlk
OR
4. Copy and paste this into the javascript console of any website (This will not work or give limited functionality if the website has various CSPs enabled.): 
```js
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'http://localhost:8080/ux-recorder.js';
script.id = 'ux-recorder-script-tag';
document.head.appendChild(script);
```

## Random
- Basic Data
  - Cookies (Session, Sticky, etc)
  - Response data
  - Domain
  - IP address
  - Date (ISO 8601)
  - Referrer
  - Console Logs
  - HTTP Headers
  - Active element
  - Focused element
  - Initial HTML
- Action Data
  - Point (X, Y)
  - Date (ISO 8601)
  - Url Route (URL)
  - HTML Diff (Webworker)
  - Screen shots
  - Performance metrics

- Replay User Experience (Video or website incremental HTML diffs)
- Export as 
- Simulate User Experience (Replay actions on live site)
  - Wait for various loading
  - Potentially dangerous and not allowed
  - Use canvas draw user actions
  - Point in time traveling (fast forwarding) 
  - Can be used for validation and testing

- Mouse inputs
  - Down
  - Up
  - Click
  - Drag
  - Hover
    - Inputs
    - Buttons
    - Anchor tags
    - Images
  - Pointer Move
    - Predicted based on current and last action. The mouse pointer will translate from Point P to Point C within a given time frame.
    - Fast forward to next action frame. Show event log list.
    - Adjustable speed

- Keyboard inputs
  - Active element

- Before unload
  - Store all events and data into local storage. Track last synced date.
  - Post back to API
  - Batch vs Single
  

Treat HTML and CSS updates separate from user action.
Prefer websockets for live sharing


## TODO:
- Add fields to contain mutation data (added and removed nodes, attributes, etc)
- Optimize Render events using a virtual DOM differ
- Support querying and aggregating data. Create an advanced querying front end for the player.
- SQL connector module with mapped events to allow for mass reporting on events and session data.

