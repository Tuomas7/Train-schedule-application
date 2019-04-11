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

	$("#trainsTable").empty();

	for (var i = 0; i < jsonObject.length; i++) {

		var tableRow = $("<tr>").addClass("row");
	
		if (jsonObject[i].trainNumber != null) {
			tableRow.append($("<td>").text(jsonObject[i].trainNumber));
		}
		else {
			testRow.append($("<td>").text("N/A"));
		}
		
		if (jsonObject[i].departureDate != null) {
			tableRow.append($("<td>").text(jsonObject[i].departureDate));
		}
		else {
			testRow.append($("<td>").text("N/A"));
		}

		$("#trainsTable").append(tableRow);
	}
}

$("#fetch").on("click", fetchTrainSchedules);