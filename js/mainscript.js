var stationNamesList = [];
var currentStationCode = "";

function initStationList() {

	var url = "https://rata.digitraffic.fi/api/v1/metadata/stations";
	var stationsData;

	$.ajax({
		type: "GET",
		dataType: "json",
		url: url,
		data: "",
		success: function (stationsData) {
			
			stationNamesList = stationsData.map(function(station) {
				return {
					name: station.stationName,
					shortCode: station.stationShortCode
				};
			});
			
			$.each(stationNamesList, function(i, station) {
				$("#stationSelect").append("<option value='" + station.name + "'>");
			});
		},
		error: function() {
			alert("Error: unable to retrieve station data");
		}
	});
}

initStationList();

function fetchTrainSchedules() {

	var stationName = $("#stationInput").val();
	currentStationCode = stationNamesList.find(value => value.name == stationName).shortCode;
	
	var url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + currentStationCode +
		"?minutes_before_departure=720&minutes_after_departure=0&minutes_before_arrival=720&minutes_after_arrival=0";
		
	var trainsData;

	$.ajax({
		type: "GET",
		dataType: "json",
		url: url,
		data: "",
		success: function (trainsData) {
			createPage(trainsData);
		},
		error: function() {
			alert("Error: unable to retrieve train data");
		}
	});
}

function createPage(trainsData) {

	$("#trainRows").empty();
	var tableRowList = [];
	
	for (var i = 0; i < trainsData.length; i++) {

		if (trainsData[i].trainType == "IC" || trainsData[i].trainType == "S" || trainsData[i].trainType == "PYO") {

			var tableRow = $("<tr>");
			tableRow.append($("<td>").text(trainsData[i].trainType + " " + trainsData[i].trainNumber));
		
			var departureStationCode = trainsData[i].timeTableRows[0].stationShortCode;
			var departureStationName = stationNamesList.find(value => value.shortCode == departureStationCode).name.replace(" asema","");
			tableRow.append($("<td>").text(departureStationName));
			
			var arrivalStationCode = trainsData[i].timeTableRows[trainsData[i].timeTableRows.length-1].stationShortCode;
			var arrivalStationName = stationNamesList.find(value => value.shortCode == arrivalStationCode).name.replace(" asema","");
			tableRow.append($("<td>").text(arrivalStationName));
			
			var currentStationIndex = trainsData[i].timeTableRows.findIndex(function(station, i){
				return station.stationShortCode === currentStationCode;
			});
			
			if (trainsData[i].timeTableRows[currentStationIndex+1] != null) {
				
				var scheduledDepartureTime = new Date(trainsData[i].timeTableRows[currentStationIndex+1].scheduledTime);
				var formattedTime = scheduledDepartureTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
				
				var minutesLate = trainsData[i].timeTableRows[currentStationIndex+1].differenceInMinutes;
			
				if (minutesLate == null || minutesLate < 1) {
					tableRow.append($("<td>").addClass("time").text(formattedTime));
				}
				else {
					var lateTime = new Date(scheduledDepartureTime.getTime() + minutesLate*60000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
					var timeCell = $("<td>").addClass("time red-text").text(lateTime);
					timeCell.append($("<span>").addClass("small-text").text(" (" + formattedTime + ")"));
					tableRow.append(timeCell);
				}
			
				tableRowList.push(tableRow);
			}
		}
	}
	
	if (tableRowList.length > 0) {
		
		tableRowList.sort(function(row1, row2) {
			var time1 = $(row1).children(".time").text();
			var time2 = $(row2).children(".time").text();
			return (time1 < time2) ? -1 : (time1 > time2) ? 1 : 0;
		})
		
		$("#trainsTable").append(tableRowList);
		
		$("#trainsTable").removeClass('d-none');
		$("#noTrainsText").addClass('d-none');
	}
	else {
		$("#trainsTable").addClass('d-none');
		$("#noTrainsText").removeClass('d-none');
	}
}

$(document).ready(function() {
	$('#stationInput').keydown(function(event) {
		if (event.which == 13) {
			fetchTrainSchedules();
			event.preventDefault();
		}
	});
});