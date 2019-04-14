// Global variables for list of all stations and the code of the current one
var stationNamesList = [];
var currentStationCode = "";

// Initializing the list of stations when the website is loaded
function initStationList() {

    // Setting the URL to an API that contains metadata about the stations
	var url = "https://rata.digitraffic.fi/api/v1/metadata/stations";
	var stationsData;

	// Establishing connection to the API
	$.ajax({
		type: "GET",
		dataType: "json",
		url: url,
		data: "",
		success: function (stationsData) {
			
			// Mapping the station names and short codes from the API to a list
			stationNamesList = stationsData.map(function(station) {
				return {
					name: station.stationName,
					shortCode: station.stationShortCode
				};
			});
			
			// Appending the station names to the input field, for the user to see
			$.each(stationNamesList, function(i, station) {
				$("#stationSelect").append("<option value='" + station.name + "'>");
			});
		},
		error: function() {
			alert("Error: unable to retrieve station data");
		}
	});
}

// Calling the init function right away
initStationList();

// Fetching train schedules from an API when the user chooses a station
function fetchTrainSchedules() {

	// Getting the station from the input field, and capitalizing the first letter just in case
	var stationName = $("#stationInput").val();
	stationName = stationName.charAt(0).toUpperCase() + stationName.slice(1).toLowerCase();
	
	// Checking that the station exists in the list of stations
	if (stationNamesList.find(value => value.name == stationName)) {
	
		// Getting the current station code from the list based on the name
		currentStationCode = stationNamesList.find(value => value.name == stationName).shortCode;
		
		// Hiding the "Station not found" error, in case it's left there from previous search
		$("#stationNotFoundError").addClass('d-none');
		
		// Building the URL address from the station code and some fixed variables (trains departing in the next 12 hours)
		var url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + currentStationCode +
			"?minutes_before_departure=720&minutes_after_departure=0&minutes_before_arrival=720&minutes_after_arrival=0";
		
		var trainsData;

		// Establishing connection to the API
		$.ajax({
			type: "GET",
			dataType: "json",
			url: url,
			data: "",
			success: function (trainsData) {
			
				// Creating the train schedule table if all goes well
				createTable(trainsData);
			},
			error: function() {
				alert("Error: unable to retrieve train data");
			}
		});
	}
	
	// Showing error if the station is not found from the station list
	else {
		$("#stationNotFoundError").removeClass('d-none');
		$("#noTrainsText").addClass('d-none');
		$("#trainsTable").addClass('d-none');
	}
}

// Creating a table with a row for each train departing from the current station in the next 12 hours
function createTable(trainsData) {

	// Clearing any previous trains from the table
	$("#trainRows").empty();
	var tableRowList = [];
	
	// Iterating over every individual train
	for (var i = 0; i < trainsData.length; i++) {

		// Filtering the trains based on their type, since there are also freight trains and such in the data
		if (trainsData[i].trainType == "IC" || trainsData[i].trainType == "S" || trainsData[i].trainType == "PYO") {

			// Appending the train type and number in the first column
			var tableRow = $("<tr>");
			tableRow.append($("<td>").text(trainsData[i].trainType + " " + trainsData[i].trainNumber));
		
			// Getting the first station code from the data, finding it's full name from the station list and appending it in the second column.
			// Also, the word "asema" is removed from the name, since it's self-evident anyway
			var departureStationCode = trainsData[i].timeTableRows[0].stationShortCode;
			var departureStationName = stationNamesList.find(value => value.shortCode == departureStationCode).name.replace(" asema","");
			tableRow.append($("<td>").text(departureStationName));
			
			// Doing the same thing with the last station in the data, and appending it in the third column
			var arrivalStationCode = trainsData[i].timeTableRows[trainsData[i].timeTableRows.length-1].stationShortCode;
			var arrivalStationName = stationNamesList.find(value => value.shortCode == arrivalStationCode).name.replace(" asema","");
			tableRow.append($("<td>").text(arrivalStationName));
			
			// Finding out the index where the current station is located in the train's time table
			var currentStationIndex = trainsData[i].timeTableRows.findIndex(function(station, i){
				return station.stationShortCode === currentStationCode;
			});
			
			// Checking that the station is not the final destination (so that the train has departure time)
			if (trainsData[i].timeTableRows[currentStationIndex+1] != null) {
				
				// Getting the scheduled departure time from the current station, and formatting it in hh:mm format
				var scheduledDepartureTime = new Date(trainsData[i].timeTableRows[currentStationIndex+1].scheduledTime);
				var formattedTime = scheduledDepartureTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
				
				// Getting the number of minutes that the scheduled time differs from the actual time
				var minutesLate = trainsData[i].timeTableRows[currentStationIndex+1].differenceInMinutes;
			
				// If the train is not late, appending the scheduled time in the fourth column
				if (minutesLate == null || minutesLate < 1) {
					tableRow.append($("<td>").addClass("time").text(formattedTime));
				}
				
				// If the train IS late, appending the actual time in red text and the scheduled time in smaller text next to it
				else {
					var lateTime = new Date(scheduledDepartureTime.getTime() + minutesLate*60000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
					var timeCell = $("<td>").addClass("time red-text").text(lateTime);
					timeCell.append($("<span>").addClass("small-text").text(" (" + formattedTime + ")"));
					tableRow.append(timeCell);
				}
			
				// Pushing the table row into a list, to be sorted before going into the final table
				tableRowList.push(tableRow);
			}
		}
	}
	
	// Checking that there's at least 1 train row successfully added to the list
	if (tableRowList.length > 0) {
		
		// Sorting the train rows based on their departure times (newest first)
		tableRowList.sort(function(row1, row2) {
			var time1 = $(row1).children(".time").text();
			var time2 = $(row2).children(".time").text();
			return (time1 < time2) ? -1 : (time1 > time2) ? 1 : 0;
		})
		
		// Finally, adding all the train rows to the table
		$("#trainsTable").append(tableRowList);
		
		// Displaying the table and hiding the "No trains" text in case it was shown previously
		$("#trainsTable").removeClass('d-none');
		$("#noTrainsText").addClass('d-none');
	}
	else {
		
		// If there's no trains, hiding the table and showing the "No trains" text in it's place
		$("#trainsTable").addClass('d-none');
		$("#noTrainsText").removeClass('d-none');
	}
}

// Fetching the trains when the user presses enter on the input field
$(document).ready(function() {
	$('#stationInput').keydown(function(event) {
		if (event.which == 13) {
			fetchTrainSchedules();
			event.preventDefault();
		}
	});
});