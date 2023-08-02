const headerMapping = {
  "Billable Units": "billable_units",
  "Campaign ID / Strategy ID": "campaign",
  "Comitted Units": "commited_units",
  "Line item name": "name",
  "Price per Unit": "price_per_unit",
  "Unit Mapping (KPI)": "unit_mapping",
  "Type of units (KPI)": "unit_type",
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
  "Entity": "entity",
  "Rebate (in %)": "rebate_percent",
  "month": "month",
  "year": "year"
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
    if (header !== "billable_units") {
      // Exclude the "billable_units" field from the header row
      var tableHeaderCell = document.createElement("th");
      tableHeaderCell.textContent = header;
      tableHeaderRow.appendChild(tableHeaderCell);
    } else {
      // If "billable_units" field is found, add three separate headers for month, year, and units
      var tableHeaderCellMonth = document.createElement("th");
      tableHeaderCellMonth.textContent = "Month";
      tableHeaderRow.appendChild(tableHeaderCellMonth);

      var tableHeaderCellYear = document.createElement("th");
      tableHeaderCellYear.textContent = "Year";
      tableHeaderRow.appendChild(tableHeaderCellYear);

      var tableHeaderCellUnits = document.createElement("th");
      tableHeaderCellUnits.textContent = "Units";
      tableHeaderRow.appendChild(tableHeaderCellUnits);
    }
  });

  var tableBody = document.querySelector("#dataTable tbody");
  tableBody.innerHTML = "";

  data.forEach(function (row) {
    // Check if "billable_units" is an array and iterate over each object inside it
    if (Array.isArray(row.billable_units)) {
      row.billable_units.forEach(function (billableUnit) {
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

        for (const property in row) {
          if (Object.hasOwnProperty.call(row, property)) {
            if (property !== "billable_units") {
              // Exclude the "billable_units" field from the table cells
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
            } else {
              // If "billable_units" field is found, split it into month, year, and units
              var tableCellMonth = document.createElement("td");
              var tableCellYear = document.createElement("td");
              var tableCellUnits = document.createElement("td");

              tableCellMonth.textContent = billableUnit.month || "";
              tableCellYear.textContent = billableUnit.year || "";
              tableCellUnits.textContent = billableUnit.units || "";

              tableRow.appendChild(tableCellMonth);
              tableRow.appendChild(tableCellYear);
              tableRow.appendChild(tableCellUnits);
            }
          }
        }

        tableBody.appendChild(tableRow);
      });
    } else {
      // If "billable_units" is not an array, create a single row for the object
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

      for (const property in row) {
        if (Object.hasOwnProperty.call(row, property)) {
          if (property !== "billable_units") {
            // Exclude the "billable_units" field from the table cells
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
          } else {
            // If "billable_units" field is found but not an array, create empty cells for month, year, and units
            var tableCellMonth = document.createElement("td");
            var tableCellYear = document.createElement("td");
            var tableCellUnits = document.createElement("td");

            tableCellMonth.textContent = "";
            tableCellYear.textContent = "";
            tableCellUnits.textContent = "";

            tableRow.appendChild(tableCellMonth);
            tableRow.appendChild(tableCellYear);
            tableRow.appendChild(tableCellUnits);
          }
        }
      }

      tableBody.appendChild(tableRow);
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
  var entityField;
  var billableUnitsField;
  var campaignsField;
  var commitedUnitsField;
  var externalCostField;
  var externalCurrencyField;
  var externalNameField;
  var LIidField;
  var nameField;
  var pricePerUnitField;
  var proxyKPIField;
  var proxyPricePerUnitField;
  var stateField;
  var typeField;
  var unitMappingField;
  var unitTypeField;
  var token = document.body.getAttribute("data-token");


  if (page === "LineItem") {
    modal = document.getElementById("editLIModal");
    billableUnitsField = document.getElementById("billable_units");
    campaignsField = document.getElementById("campaigns");
    commitedUnitsField = document.getElementById("commited_units");
    externalCostField = document.getElementById("external_cost");
    externalCurrencyField = document.getElementById("external_currency");
    externalNameField = document.getElementById("external_name");
    LIidField = document.getElementById("id");
    nameField = document.getElementById("name");
    pricePerUnitField = document.getElementById("price_per_unit");
    proxyKPIField = document.getElementById("proxy_kpi");
    proxyPricePerUnitField = document.getElementById("proxy_price_per_unit");
    stateField = document.getElementById("state");
    typeField = document.getElementById("type");
    unitMappingField = document.getElementById("unit_mapping");
    unitTypeField = document.getElementById("unit_type");

    // Fill the common fields with data from the selected row
    billableUnitsField.textContent = JSON.stringify(row.billable_units) || "";
    campaignsField.value = row.campaigns || "";
    commitedUnitsField.value = row.commited_units || "";
    externalCostField.value = row.external_cost || "";
    externalCurrencyField.value = row.external_currency || "";
    externalNameField.value = row.external_name || "";
    LIidField.value = row.id || "";
    nameField.value = row.name || "";
    pricePerUnitField.value = row.price_per_unit || "";
    proxyKPIField.value = row.proxy_kpi || "";
    proxyPricePerUnitField.value = row.proxy_price_per_unit || "";
    stateField.value = row.state || "";
    typeField.value = row.type || "";
    unitMappingField.value = row.unit_mapping || "";
    unitTypeField.value = row.unit_type || "";


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
