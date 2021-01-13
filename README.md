# ZoomLoader
ZoomLoader is a web app made to help you manage your zoom meetings.
### Hosted [here](https://zoomloader.herokuapp.com/)

## Set Up

To set up this project and run it for yourself follow the steps below:
1. Clone this repo to a folder on your device.
2. Create a file in the repository named 'localdb'
3. Run the program using the following commands:
   1. `npm i`
   2. `mongod --dbpath localdb` (in a separate terminal)
   3. `npm start`
4. The site should now be available locally on localhost:5000

## Usage

Once installed and started visit localhost:5000
* Sign up or log in using the buttons on the top right
* Add zoom links and the time/dates of the meetings to 
* If logged in, save your meetings and their times by pressing the save button

## Technologies Used

* Node.js - backend/running server
* Socket.io - frontend/backend connection
* MongoDB - Database for users and their meetings
* HTML/CSS/JavaScript
