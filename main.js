function getStringifiedDate(date, separator = "/") {
  if (!date) return "";

  let safeDate = date;
  if (safeDate instanceof Date === false) {
    safeDate = new Date(safeDate);
  }

  const day = safeDate.getDate();
  const month = safeDate.getMonth() + 1;
  const year = safeDate.getFullYear();

  return `${day}${separator}${month}${separator}${year}`;
}

function initPrefixInteraction() {
  function storePrefixValue(value) {
    localStorage.setItem("prefix", value);
  }
  function getPrefixStoreValue() {
    return localStorage.getItem("prefix") || "";
  }

  function onPrefixInput() {
    const prefix = prefixInput.value;
    storePrefixValue(prefix);

    const currentDate = new Date();
    const prefixedDate = `${prefix}-${getStringifiedDate(currentDate, "-")}`;

    const result = document.getElementById("result");
    result.textContent = prefixedDate;
  }

  const prefixInput = document.getElementById("prefixInput");

  prefixInput.value = getPrefixStoreValue();
  onPrefixInput();

  prefixInput.addEventListener("input", onPrefixInput);
}

function copyToClipboard() {
  const resultText = document.getElementById("result").textContent;

  const tempInput = document.createElement("input");
  tempInput.value = resultText;

  document.body.appendChild(tempInput);

  tempInput.select();

  document.execCommand("copy");
  document.body.removeChild(tempInput);
}

function initExpositionForm() {
  function handleExpositionFormSubmit(event) {
    event.preventDefault(); // Prevent form submission

    // Get form values
    const situation = document.getElementById("situation").value;
    const prediction = document.getElementById("prediction").value;
    const timeInputs = document.getElementsByName("time[]");
    const stressInputs = document.getElementsByName("stress[]");
    const actual = document.getElementById("actual").value;

    // Create an object to store the form data
    const formData = {
      situation: situation,
      prediction: prediction,
      chartData: [],
      actual,
      creationDate: new Date().toISOString(),
    };

    // Loop through the time and stress inputs to collect chart data
    for (let i = 0; i < timeInputs.length; i++) {
      const time = timeInputs[i].value;
      const stress = stressInputs[i].value;
      formData.chartData.push({ time: time, stress: stress });
    }

    // Save formData to localStorage
    const expositions = JSON.parse(localStorage.getItem("exposition")) || [];
    expositions.push(formData);
    localStorage.setItem("exposition", JSON.stringify(expositions));

    // Log the form data to the console
    console.log({ formData });

    // Reset the form
    event.target.reset();

    // Update the exposition list
    initExpositionList();
  }

  document
    .getElementById("expositionForm")
    .addEventListener("submit", handleExpositionFormSubmit);
}

function initAddRow() {
  const addRowButton = document.getElementById("addRowButton");
  const table = document.querySelector("table");

  function onAddRowButtonClick() {
    const newRow = document.createElement("tr");

    const newCell1 = document.createElement("td");
    newCell1.innerHTML = `<input type="number" name="time[]" required />`;
    newRow.appendChild(newCell1);

    const newCell2 = document.createElement("td");
    const select = document.createElement("select");
    select.name = "stress[]";
    for (let index = 0; index <= 10; index++) {
      select.innerHTML += `<option value="${index}">${index}</option>`;
    }
    newCell2.appendChild(select);
    newRow.appendChild(newCell2);

    table.appendChild(newRow);
  }
  onAddRowButtonClick();

  addRowButton.addEventListener("click", onAddRowButtonClick);
}

function initExpositionList() {
  const expositions = JSON.parse(localStorage.getItem("exposition")) || [];
  const sortedExpositions = expositions.sort((a, b) => {
    if (a.creationDate === undefined || b.creationDate === undefined) return -1;
    return new Date(a.creationDate) - new Date(b.creationDate);
  });

  const list = document.getElementById("expositionsList");
  list.innerHTML = "";

  sortedExpositions.forEach((exposition) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <details>
        <summary>${getStringifiedDate(exposition.creationDate)} | ${
      exposition.situation
    }</summary>

        <ol>
          <li>Situation: ${exposition.situation}</li>
          <li>Prediction: ${exposition.prediction}</li>
          <li>Actual: ${exposition.actual}</li>
          <li>Chart Data:
            <ol>
              ${exposition.chartData
                .map(
                  (data) =>
                    `<li>Time: ${data.time} | Stress: ${data.stress}</li>`
                )
                .join("")}
            </ol>
          <li>Creation Date: ${exposition.creationDate ?? "No date registered"}</li>
        </ol>
      </details>
    `;
    list.appendChild(listItem);
  });
}

(() => {
  initPrefixInteraction();
  initExpositionForm();
  initAddRow();
  initExpositionList();
})();
