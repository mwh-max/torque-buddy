let torqueSpecs = {};

fetch("./torqueData.json")
  .then((res) => res.json())
  .then((data) => {
    torqueSpecs = data;
  })
  .catch((err) => {
    console.error("Failed to load torque specs:", err);
  });

const vehicleData = {
  Toyota: {
    Camry: [2020, 2021],
    Corolla: [2019, 2022],
    Tacoma: [2021],
  },
  Honda: {
    Civic: [2022, 2023],
    Accord: [2020, 2021],
    CRV: [2022],
  },
  Ford: {
    F150: [2021],
    Focus: [2018],
  },
  Subaru: {
    Outback: [2020],
    Forester: [2021],
  },
};

const makeSelect = document.getElementById("make");
const modelSelect = document.getElementById("model");
const yearSelect = document.getElementById("year");

window.addEventListener("load", () => {
  const savedMake = localStorage.getItem("selectedMake");
  const savedModel = localStorage.getItem("selectedModel");
  const savedYear = localStorage.getItem("selectedYear");

  if (savedMake) {
    makeSelect.value = savedMake;
    makeSelect.dispatchEvent(new Event("change"));
  }
});

makeSelect.addEventListener("change", () => {
  const selectedMake = makeSelect.value;
  localStorage.setItem("selectedMake", selectedMake);
  modelSelect.innerHTML = '<option value="">-- Select Model --</option>';
  yearSelect.innerHTML = '<option value="">-- Select Year --</option>';

  if (selectedMake && vehicleData[selectedMake]) {
    const models = Object.keys(vehicleData[selectedMake]);
    models.forEach((model) => {
      const option = document.createElement("option");
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    });
    const savedModel = localStorage.getItem("selectedModel");
    if (savedModel && models.includes(savedModel)) {
      modelSelect.value = savedModel;
      modelSelect.dispatchEvent(new Event("change"));
    }
  }
});

modelSelect.addEventListener("change", () => {
  const selectedMake = makeSelect.value;
  const selectedModel = modelSelect.value;
  localStorage.setItem("selectedModel", selectedModel);
  yearSelect.innerHTML = '<option value="">-- Select Year --</option>';

  if (selectedModel && vehicleData[selectedMake][selectedModel]) {
    const years = vehicleData[selectedMake][selectedModel];
    years.forEach((year) => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    const savedYear = localStorage.getItem("selectedYear");
    if (savedYear) {
      yearSelect.value = savedYear;
      yearSelect.dispatchEvent(new Event("change"));
    }
  }
});

const resultsDiv = document.getElementById("results");

yearSelect.addEventListener("change", () => {
  if (Object.keys(torqueSpecs).length === 0) {
    resultsDiv.innerHTML = `<p class="text-red-500">Torque data is still loading. Please wait ...</p>`;
    return;
  }

  const make = makeSelect.value;
  const model = modelSelect.value;
  const year = yearSelect.value;
  localStorage.setItem("selectedYear", year);

  resultsDiv.innerHTML = "";

  if (make && model && year && torqueSpecs[make]?.[model]?.[year]) {
    const specs = torqueSpecs[make][model][year];
    resultsDiv.innerHTML = `
 <div class="animate-fade-in">
    <h2 class="text-xl font-bold mb-2">Torque Specs for ${make} ${model} ${year}</h2>
    <ul class="list-disc pl-6 space-y-2">
      <li>🔩 <strong>Wheel Lug:</strong> ${specs.wheelLug}</li>
      <li>🛢️ <strong>Oil Drain Plug:</strong> ${specs.oilDrainPlug}</li>
      ${
        specs.sparkPlugs
          ? `<li>⚡ <strong>Spark Plugs:</strong> ${specs.sparkPlugs}</li>`
          : ""
      }
      ${
        specs.caliperBolts
          ? `<li>🛑 <strong>Brake Caliper Bolts:</strong> ${specs.caliperBolts}</li>`
          : ""
      }
      ${
        specs.transPanBolts
          ? `<li>⚙️ <strong>Transmission Pan Bolts:</strong> ${specs.transPanBolts}</li>`
          : ""
      }
    </ul>
  </div>
    `;
  } else {
    resultsDiv.innerHTML = `<p>No data available for that selection.</p>`;
  }
});

const clearBtn = document.getElementById("clearSelection");

clearBtn.addEventListener("click", () => {
  localStorage.removeItem("selectedMake");
  localStorage.removeItem("selectedModel");
  localStorage.removeItem("selectedYear");

  makeSelect.value = "";
  modelSelect.innerHTML = '<option value="">-- Select Model --</option>';
  yearSelect.innerHTML = '<option value="">-- Select Year --</option>';
  resultsDiv.innerHTML = "";

  alert("Previous selection cleared.");
});

const printBtn = document.getElementById("printSpecs");

printBtn.addEventListener("click", () => {
  if (resultsDiv.innerHTML.trim() === "") {
    alert("No torque specs to print.");
    return;
  }
  window.print();
});

const editor = document.getElementById("jsonEditor");
const loadBtn = document.getElementById("loadJson");
const applyBtn = document.getElementById("applyJson");
const feedback = document.getElementById("jsonFeedback");

loadBtn.addEventListener("click", () => {
  editor.value = JSON.stringify(torqueSpecs, null, 2);
  feedback.textContent = "Loaded current data into editor.";
  feedback.className = "text-blue-600";
});

applyBtn.addEventListener("click", () => {
  try {
    const updated = JSON.parse(editor.value);
    torqueSpecs = updated;
    feedback.textContent =
      "Updated in-memory torque data. Use dropdowns to preview.";
    feedback.className = "text-green-600";
  } catch (err) {
    feedback.textContent = "Invalid JSON. Please fix syntax.";
    feedback.className = "text-red-600";
  }
});

const downloadBtn = document.getElementById("downloadJson");

downloadBtn.addEventListener("click", () => {
  const blob = new Blob([editor.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "torqueData-edited.json";
  a.click();
  URL.revokeObjectURL(url);
});

const uploadBtn = document.getElementById("uploadJsonBtn");
const uploadInput = document.getElementById("uploadJsonInput");

uploadBtn.addEventListener("click", () => {
  uploadInput.click(); // Trigger file picker
});

uploadInput.addEventListener("change", () => {
  const file = uploadInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      torqueSpecs = parsed;
      editor.value = JSON.stringify(torqueSpecs, null, 2); // Update editor too
      feedback.textContent = `Imported JSON from "${file.name}"`;
      feedback.className = "text-green-600";
    } catch (err) {
      feedback.textContent = "Invalid JSON file.";
      feedback.className = "text-red-600";
    }
  };
  reader.readAsText(file);
});

// Drag-and-drop support
editor.addEventListener("dragover", (e) => {
  e.preventDefault();
  editor.classList.add("dragover");
});

editor.addEventListener("dragleave", () => {
  editor.classList.remove("dragover");
});

editor.addEventListener("drop", (e) => {
  e.preventDefault();
  editor.classList.remove("dragover");

  const file = e.dataTransfer.files[0];
  if (!file || !file.name.endsWith(".json")) {
    feedback.textContent = "Please drop a .json file.";
    feedback.className = "text-red-600";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      torqueSpecs = parsed;
      editor.value = JSON.stringify(torqueSpecs, null, 2);
      feedback.textContent = `Imported JSON from drag-and-drop.`;
      feedback.className = "text-green-600";
    } catch (err) {
      feedback.textContent = "Invalid JSON file.";
      feedback.className = "text-red-600";
    }
  };
  reader.readAsText(file);
});

const clearEditorBtn = document.getElementById("clearJsonEditor");

clearEditorBtn.addEventListener("click", () => {
  editor.value = "";
  feedback.textContent = "JSON editor cleared.";
  feedback.className = "text-blue-600";
});
