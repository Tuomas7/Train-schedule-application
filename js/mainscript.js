function fetchTrainSchedules() {

	var url = "https://rata.digitraffic.fi/api/v1/live-trains/station/";

	var station = "HKI";
	
	url += station;

	var jsonObject;

	$.ajax({
		type: "GET",
		dataType: "json",
		url: url,
		data: "",
		success: function (jsonObject) {
			createPage(jsonObject);
		},
		error: function() {
			alert("Error: unable to retrieve train data");
		}
	})
}

function createPage(jsonObject) {

	$("#trainRows").empty();

	for (var i = 0; i < jsonObject.length; i++) {

		var tableRow = $("<tr>");
	
		if (jsonObject[i].trainNumber != null) {
			tableRow.append($("<td>").text(jsonObject[i].trainNumber));
		}
		else {
			tableRow.append($("<td>").text("N/A"));
		}
		
		if (jsonObject[i].timeTableRows != null) {
			tableRow.append($("<td>").text(jsonObject[i].timeTableRows[0].stationShortCode));
			tableRow.append($("<td>").text(jsonObject[i].timeTableRows[jsonObject[i].timeTableRows.length-1].stationShortCode));
			tableRow.append($("<td>").text(new Date(jsonObject[i].timeTableRows[jsonObject[i].timeTableRows.length-1].scheduledTime).toLocaleTimeString()));
		}
		else {
			tableRow.append($("<td>").text("N/A"));
			tableRow.append($("<td>").text("N/A"));
			tableRow.append($("<td>").text("N/A"));
		}

		$("#trainRows").append(tableRow);
	}
}

$("#fetch").on("click", fetchTrainSchedules);