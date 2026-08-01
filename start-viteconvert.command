#!/bin/bash

cd ~/viteconvert

# Start frontend
cd client
npm run dev &

# Start backend
cd ../server
node index.js

wait

