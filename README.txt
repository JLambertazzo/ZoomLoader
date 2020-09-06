ZoomLoader, a submission for the First Day Back Hacks 2020.

This project is a full stack web application and its purpose is to save zoom meeting links and their start times, as well as open the meetings when the time comes. This allows users to save all of their meetings in one place. 

This project's frontend was created in bootstrap, the backend was created in node.js with a connection to a mongodb database. The frontend and backend were connected using socket.io.

To run this web app on your own machine:
1. download this repo to your device
2. open a command prompt to the repo folder
3. type "node app.js" and hit enter
after doing this you should be able to connect from your browser by going to "localhost:3000" in the address bar
####NOTE: connecting to the database uses a hidden environment variable as a key for security. If running on your own machine you will need to create/connect to your own mongodb atlas database and edit the code in app.js accordingly.
