const headerMapping = {
  "Billable Units": "billable_units",
  "Campaign ID / Strategy ID": "campaign",
  "Comitted Units": "commited_units",
  "Line item name": "name",
  "Price per Unit": "price_per_unit",
  "Unit Mapping (KPI)": "unit_mapping",
  "Type of units (KPI)": "unit_type",
  Month: "month",
  Year: "year",
  "External publisher name": "external_name",
  "External Publisher Cost": "external_cost",
  "Currency of the external cost": "external_currency",
  "mediasmart console/external publishers": "type",
  "Proxy KPI": "proxy_kpi",
  "Proxy Price": "proxy_price_per_unit",
  "Insertion Order ID": "io_id",
  "IO Number": "io_number",
  "Organization ID": "organization",
  "IO Value (IO Currency)": "io_value_client_currency",
  Entity: "entity",
  "Rebate (in %)": "rebate_percent",
};

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

  function convertTableDataToJson() {
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
        // Use the header mapping to get the corresponding API header
        var apiHeader = headerMapping[header];
        jsonData[apiHeader] = cellValue;
      }
      jsonDataArray.push(jsonData);
    });
    return jsonDataArray;
  }

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
          var jsonDataArray = convertTableDataToJson();
          var jsonDataString = JSON.stringify(jsonDataArray, null, 2); // null, 2 for pretty formatting
          // Open a new page or modal to display the JSON data
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

  // Function to convert the table data to JSON with translated headers
});

// ... (Código existente) ...

// Function to handle the "Listar IO's" button click event
// Function to handle the "Listar IO's" button click event

function listIOs() {
  fetch("/get_ios_data")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error fetching IO data");
      }
      return response.json();
    })
    .then((iosData) => {
      console.log(iosData); // Log the IO data to the console
      currentPage = "LineIO";
      fillTableWithData(iosData, currentPage); // Fill the table with the retrieved data
    })
    .catch((error) => {
      console.error(error);
    });
}

// Function to fill the table with the retrieved data
function fillTableWithData(data, currentPage) {
  var headers = Object.keys(data[0]);
  var tableHeaderRow = document.querySelector("#headerRow");
  tableHeaderRow.innerHTML = "";

  // Add an empty header cell at the left start of the header row for the icon column
  var iconHeaderCell = document.createElement("th");
  tableHeaderRow.appendChild(iconHeaderCell);

  headers.forEach(function (header) {
    var tableHeaderCell = document.createElement("th");
    tableHeaderCell.textContent = header;
    tableHeaderRow.appendChild(tableHeaderCell);
  });

  var tableBody = document.querySelector("#dataTable tbody");
  tableBody.innerHTML = "";

  data.forEach(function (row) {
    var tableRow = document.createElement("tr");

    // Create the clickable icon (pencil) and add it as the first cell in the row
    var editIconCell = document.createElement("td");
    var editIcon = document.createElement("img");
    editIcon.src = "static/pencil.svg";
    editIcon.alt = "Edit";
    editIcon.classList.add("edit-icon");
    editIconCell.appendChild(editIcon);
    editIconCell.addEventListener("click", function () {
      openModalWithData(currentPage, row);
    });
    tableRow.appendChild(editIconCell);

    // Iterate through the properties of the row object
    for (const property in row) {
      if (Object.hasOwnProperty.call(row, property)) {
        let cellValue = row[property];

        // Handle nested objects by converting them to JSON strings
        if (typeof cellValue === "object" && cellValue !== null) {
          cellValue = JSON.stringify(cellValue);
        }

        // Handle lists by joining the elements into a comma-separated string
        if (Array.isArray(cellValue)) {
          cellValue = cellValue.join(", ");
        }

        var tableCell = document.createElement("td");
        tableCell.textContent = cellValue;
        tableRow.appendChild(tableCell);
      }
    }

    tableBody.appendChild(tableRow);
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
}

function openModalWithData(page, row) {
  var modal;
  var entityField;
  var ioValueClientCurrencyField;
  var rebatePercentField;
  var stateField;
  var ioNumberField;
  var organization;
  var ioID;
  var token = document.body.getAttribute("data-token");


  if (page === "LineItem") {
    modal = document.getElementById("editLIModal");
    entityField = document.getElementById("entity");

    // Fill the common fields with data from the selected row
    entityField.value = row.entity || "";
  } else if (page === "LineIO") {
    modal = document.getElementById("editIOModal");
    entityField = document.getElementById("entity");
    ioValueClientCurrencyField = document.getElementById("ioValueClientCurrency");
    rebatePercentField = document.getElementById("rebatePercent");
    stateField = document.getElementById("state");
    ioNumberField = document.getElementById("ioNumber");
    organization = document.getElementById("organization");
    ioID = document.getElementById("ioID");

    // Fill the common fields with data from the selected row
    entityField.value = row.entity || "";
    ioValueClientCurrencyField.value = row.io_value_client_currency || "";
    rebatePercentField.value = row.rebate_percent || "";
    stateField.value = row.state || "";
    ioNumberField.value = row.io_number || "";
    organization.value = row.organization || "";
    ioID.value = row.id || "";
  }

  // Open the modal
  var editModal = new bootstrap.Modal(modal);
  editModal.show();

  

  // Handle the "Update" button click inside the modal
  var updateButton = document.getElementById("updateButton");
  updateButton.addEventListener("click", function () {
    var updatedData;

    if (page === "LineItem") {
      updatedData = {
        entity: entityField.value,
        // Add other fields specific to LineItem page as needed
      };

      // Perform the API call here with the updatedData
      // For example, using fetch and the appropriate API endpoint
      fetch("/update_lineitem", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("LineItem data updated:", data);
          // Close the modal after updating
          editModal.hide();
        })
        .catch((error) => {
          console.error("Error updating LineItem data:", error);
        });
    } else if (page === "LineIO") {
      updatedData = {
        entity: entityField.value,
        io_value_client_currency: ioValueClientCurrencyField.value,
        rebate_percent: rebatePercentField.value,
        state: stateField.value,
        io_number: ioNumberField.value,
        organization: organization.value
        // Add other fields specific to LineIO page as needed
      };
      console.log(updatedData);

      // Perform the API call here with the updatedData
      // For example, using fetch and the appropriate API endpoint
      fetch("https://api.mediasmart.io/api/insertion_orders/" + ioID.value, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify(updatedData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("LineIO data updated:", data);
          // Close the modal after updating
          editModal.hide();
          fetch("/get_ios_data")
            .then((response) => response.json())
            .then((updatedData) =>{
              fillTableWithData(updatedData, page);

            })
            .catch((error) => {
              console.error("Error fetching updated data:", error);
            })
        })
        .catch((error) => {
          console.error("Error updating LineIO data:", error);
        });
    }
  });
}

// Attach event listeners to input fields
document.addEventListener("DOMContentLoaded", function () {
  var inputFields = document.querySelectorAll(".modal input");
  inputFields.forEach(function (field) {
    field.addEventListener("input", handleInputChange);
  });
});

// Function to handle input changes and show the "Update" button
function handleInputChange() {
  var updateButton = document.getElementById("updateButton");
  updateButton.style.display = "inline-block";
}




function listLIs() {
  fetch("/get_li_data")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error fetching IO data");
      }
      return response.json();
    })
    .then((li_data) => {
      console.log(li_data); // Log the IO data to the console
      currentPage = "LineItem";
      fillTableWithData(li_data, currentPage); // Fill the table with the retrieved data
    })
    .catch((error) => {
      console.error(error);
    });
}

// ... (Código existente) ...
