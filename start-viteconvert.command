#!/bin/bash

# Define the root directory
PROJECT_ROOT="$HOME/viteconvert"

# Use AppleScript to open two separate Terminal windows and keep them open
osascript <<EOF
tell application "Terminal"
    # Start Backend
    do script "cd \"$PROJECT_ROOT/server\" && node index.js; exec \$SHELL"
    
    # Start Frontend
    do script "cd \"$PROJECT_ROOT/client\" && npm run dev; exec \$SHELL"
    
    activate
end tell
EOF

echo "Launching ViteConvert..."