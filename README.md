# User Experience Player

## Overview
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
  
