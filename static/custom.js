document.addEventListener("DOMContentLoaded", function () {
  // Function to handle the file input change event
  document
    .getElementById("fileInput")
    .addEventListener("change", function (event) {
      console.log("File input changed."); // Log to check if event listener is working
      var file = event.target.files[0];
      var reader = new FileReader();

      reader.onload = function (e) {
        console.log("File reader onload."); // Log to check if FileReader event is triggered
        var data = e.target.result;
        var workbook = XLSX.read(data, { type: "binary" });
        var sheetName = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[sheetName];
        var jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        var headers = Object.keys(jsonData[0]);
        var tableHeaderRow = document.querySelector("#headerRow");
        tableHeaderRow.innerHTML = "";

        headers.forEach(function (header) {
          var tableHeaderCell = document.createElement("th");
          tableHeaderCell.textContent = header;
          tableHeaderRow.appendChild(tableHeaderCell);
        });

        var tableBody = document.querySelector("#dataTable tbody");
        tableBody.innerHTML = "";

        jsonData.forEach(function (row) {
          var tableRow = document.createElement("tr");
          headers.forEach(function (header) {
            var cellValue = row[header] || "";
            var tableCell = document.createElement("td");
            tableCell.textContent = cellValue;
            tableRow.appendChild(tableCell);
          });
          tableBody.appendChild(tableRow);
        });
        var sendToAPIBtn = document.getElementById("sendToAPIBtn");
        sendToAPIBtn.style.display = "inline-block";
      };

      reader.readAsBinaryString(file);
    });

  // Function to handle the "Send to API" button click event
  document.addEventListener("click", function (event) {
    if (event.target && event.target.id === "sendToAPIBtn") {
      // Show the confirmation modal
      var confirmationModal = new bootstrap.Modal(
        document.getElementById("confirmationModal")
      );
      confirmationModal.show();

      // Store the JSON data for each row in an array
      var jsonDataArray = [];
      var tableRows = document.querySelectorAll("#dataTable tbody tr");
      tableRows.forEach(function (tableRow) {
        var jsonData = {};
        var tableCells = tableRow.getElementsByTagName("td");
        for (var i = 0; i < tableCells.length - 1; i++) {
          // Skip the last cell (button cell)
          var header =
            document.querySelector("#headerRow").children[i].textContent;
          var cellValue = tableCells[i].textContent;
          jsonData[header] = cellValue;
        }
        jsonDataArray.push(jsonData);
      });

      // Handle the "Yes, Proceed" button click inside the confirmation modal
      document
        .getElementById("confirmRequestBtn")
        .addEventListener("click", function () {
          console.log("Send to API button clicked");
          console.log(jsonDataArray); // Log the JSON data for each row
          // Perform the API request here with the jsonDataArray
          // ...

          // Close the modal after the API request is completed
          confirmationModal.hide();
        });

      // Handle the "View JSON" button click inside the confirmation modal
      document
        .getElementById("viewJSONBtn")
        .addEventListener("click", function () {
          console.log("View JSON button clicked");
          // Open a new page or modal to display the JSON data
          // Convert the JSON data to a string
          var jsonDataString = JSON.stringify(jsonDataArray, null, 2); // null, 2 for pretty formatting

          // Create a new window and set its content to the JSON data
          var newWindow = window.open("", "_blank");
          newWindow.document.open();
          newWindow.document.write("<pre>" + jsonDataString + "</pre>");
          newWindow.document.close();
        });
    }
  });
  document
    .getElementById("tableFilter")
    .addEventListener("input", function (event) {
      var filterValue = event.target.value.toLowerCase();
      var tableBody = document.querySelector("#dataTable tbody");
      var rows = tableBody.getElementsByTagName("tr");

      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var cells = row.getElementsByTagName("td");
        var rowVisible = false;

        for (var j = 0; j < cells.length; j++) {
          var cellValue = cells[j].textContent.toLowerCase();
          if (cellValue.indexOf(filterValue) > -1) {
            // If the filter value is found in the cell's value, make the row visible
            rowVisible = true;
            break;
          }
        }

        // Set the display property of the row based on its visibility
        row.style.display = rowVisible ? "" : "none";
      }
    });
});
