function fetchTrainSchedules() {

	var baseUrl = "https://rata.digitraffic.fi/api/v1/live-trains/station/";

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

		var testRow = $("<div></div>").addClass("row");
		testRow.append($("<hr>"));
	
		if (jsonObject[i].trainNumber != null) {
			testRow.append($("<p></p>").text(jsonObject[i].trainNumber));
		}
		else {
			testRow.append($("<p></p>").text("N/A")));
		}

		$("#trainsTable").append(testRow);
	}
}

$("#fetch").on("click", fetchTrainSchedules);