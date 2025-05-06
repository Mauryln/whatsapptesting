document.addEventListener("DOMContentLoaded", () => {
  const labelSelector = document.getElementById("labelSelector");
  const loadLabelBtn = document.getElementById("loadLabelBtn");
  const labelInfo = document.getElementById("label-info");

  async function checkSessionAndLoadLabels() {
    const userId = window.whatsappSession.getUserId();
    if (!userId) return;

    try {
      const response = await fetch(`http://129.148.27.180:3000/session-status/${userId}`);
      const data = await response.json();
      
      if (data.success && data.status === 'ready') {
        loadLabels();
      } else {
        labelSelector.innerHTML = '<option value="">Conecta WhatsApp primero</option>';
        labelSelector.disabled = true;
      }
    } catch (error) {
      console.error("Error verificando estado de sesión:", error);
      labelSelector.innerHTML = '<option value="">Error al verificar estado</option>';
      labelSelector.disabled = true;
    }
  }

  async function loadLabels() {
    const userId = window.whatsappSession.getUserId();
    try {
      const res = await fetch(`http://129.148.27.180:3000/labels/${userId}`);
      const data = await res.json();

      if (data.success && data.labels.length > 0) {
        labelSelector.innerHTML = '<option value="">Selecciona una etiqueta</option>';
        data.labels.forEach(label => {
          const opt = document.createElement("option");
          opt.value = label.id;
          opt.textContent = label.name;
          labelSelector.appendChild(opt);
        });
        labelSelector.disabled = false;
      } else {
        labelSelector.innerHTML = '<option value="">No hay etiquetas disponibles</option>';
      }
    } catch (err) {
      console.error("Error cargando etiquetas:", err);
      labelSelector.innerHTML = '<option value="">Error al cargar etiquetas</option>';
    }
  }

  async function loadNumbersFromLabel() {
    const userId = window.whatsappSession.getUserId();
    const labelId = labelSelector.value;
    if (!labelId) return alert("Selecciona una etiqueta válida.");
  
    try {
      const res = await fetch(`http://129.148.27.180:3000/labels/${userId}/${labelId}/chats`);
      const data = await res.json();
  
      if (data.success) {
        const numbers = data.numbers;
        const numberList = document.getElementById("numberList");
  
        // Añadir a la lista de checkboxes
        numberList.innerHTML = "";
        numbers.forEach(num => {
          // Añadir el '+' al número para formato internacional
          const formattedNumber = `+${num.replace(/\D/g, '')}`; // Eliminar caracteres no numéricos si es necesario
  
          const checkbox = document.createElement("div");
          checkbox.className = "checkbox-item";
          checkbox.innerHTML = `
            <input type="checkbox" class="number-checkbox" checked value="${formattedNumber}">
            <label>${formattedNumber}</label>
          `;
          numberList.appendChild(checkbox);
        });
  
        labelInfo.textContent = `${numbers.length} números cargados de la etiqueta seleccionada.`;
        updateCountDisplay();
      } else {
        alert("Error al obtener números: " + data.error);
      }
    } catch (err) {
      console.error("Error al cargar números:", err);
      alert("No se pudieron cargar los números desde la etiqueta.");
    }
  }
  

  function updateCountDisplay() {
    const all = document.querySelectorAll(".number-checkbox").length;
    const selected = document.querySelectorAll(".number-checkbox:checked").length;
    document.getElementById("selected-count").textContent = selected;
    document.getElementById("total-count").textContent = all;
  }

  // Verificar el estado inicial de la sesión
  checkSessionAndLoadLabels();

  // Escuchar cambios en el estado de la sesión
  document.addEventListener("whatsappSessionStatusChanged", (e) => {
    if (e.detail.status === "ready") {
      checkSessionAndLoadLabels();
    } else if (e.detail.status === "no_session") {
      labelSelector.innerHTML = '<option value="">Conecta WhatsApp primero</option>';
      labelSelector.disabled = true;
    }
  });

  // Verificar el estado de la sesión periódicamente
  setInterval(checkSessionAndLoadLabels, 5000);

  loadLabelBtn.addEventListener("click", loadNumbersFromLabel);
});
