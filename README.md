# Travelz App

A simple web application that allows you to map out your travel memories using the Leaflet API and Web Storage API. 

**NOTE:** The storage capacity for saving data is currently limited to the web browser's local storage capacity.


## Usage Overview

1. User clicks on the map where they wish to place a travel pin
2. User fills out the form that appears in the left column
3. Form input data is validated
	* Image file size limit is currently set to 1MB max
4. Data is stored and displayed in the left column in a postacrd style card
5. A pin is also added on the map where the user had clicked, along with the uploaded image in a small polaroid style format above the pin
6. When user clicks on a postcard card in the left column, the map moves to center the pin of the clicked card
7. "Delete All" button allows the user to delete all the data and start fresh
	* A popup alert message appears to confirm the user does indeed want to delete all the data
8. The "+" and "-" buttons on the map can be used to zoom in and out


## Technologies Used

* JavaScript ES6
* HTML5
* CSS3
* [Leaflet API](https://leafletjs.com/index.html)
* [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)


## Acknowledgment

This project was inspired by the Mapty app from a [JavaScript Udemy Course](https://www.udemy.com/course/the-complete-javascript-course/)
