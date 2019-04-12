var stationNamesList = [];

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
	var stationCode = stationNamesList.find(value => value.name == stationName).shortCode;
	
	var url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + stationCode;
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

	for (var i = 0; i < trainsData.length; i++) {

		var tableRow = $("<tr>");
	
		if (trainsData[i].trainNumber != null) {
			tableRow.append($("<td>").text(trainsData[i].trainNumber));
		}
		else {
			tableRow.append($("<td>").text("N/A"));
		}
		
		if (trainsData[i].timeTableRows != null) {

			var departureStationCode = trainsData[i].timeTableRows[0].stationShortCode;
			var departureStationName = stationNamesList.find(value => value.shortCode == departureStationCode).name.replace(" asema","");
			tableRow.append($("<td>").text(departureStationName));
			
			var arrivalStationCode = trainsData[i].timeTableRows[trainsData[i].timeTableRows.length-1].stationShortCode;
			var arrivalStationName = stationNamesList.find(value => value.shortCode == arrivalStationCode).name.replace(" asema","");
			tableRow.append($("<td>").text(arrivalStationName));
			
			tableRow.append($("<td>").text(new Date(trainsData[i].timeTableRows[trainsData[i].timeTableRows.length-1].scheduledTime).toLocaleTimeString()));
		}
		else {
			tableRow.append($("<td>").text("N/A"));
			tableRow.append($("<td>").text("N/A"));
			tableRow.append($("<td>").text("N/A"));
		}

		$("#trainRows").append(tableRow);
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