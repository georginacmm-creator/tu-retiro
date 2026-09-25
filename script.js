const CONFIG = {
  annualRate: 0.10,
  annualInflation: 0.04,
  calendly: "https://calendly.com/georgina-inviertemas/fondosindexados",
  whatsapp: "525572449150",
  googleSheetsUrl: "https://script.google.com/macros/s/AKfycbxfPqfnSDF2Kl8dkdRHWn0QM9WPrvuC15mITAY4sdwJkmQr-jZ8hQd7rknMsfd1woqy8w/exec"
};

const $ = (id) => document.getElementById(id);

const money = (n) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Math.round(n));

function calculate() {
  const age = Math.max(18, Number($("age")?.value || 38));
  const retireAge = Math.max(
    age + 1,
    Number($("retireAge")?.value || 65)
  );

  const monthly = Math.max(
    0,
    Number($("monthly")?.value || 0)
  );

  const months = (retireAge - age) * 12;
  const r = CONFIG.annualRate / 12;

  const futureContrib =
    r === 0
      ? monthly * months
      : monthly * ((Math.pow(1 + r, months) - 1) / r);

  const futureValue = futureContrib;
  const totalContrib = monthly * months;
  const growth = Math.max(0, futureValue - totalContrib);

  const fiscalEnabled =
    document.querySelector("#taxChoices .choice.active")?.dataset.value !== "no";

  const fiscalBenefit = fiscalEnabled
    ? monthly * 12 * 0.20
    : 0;

  // Resultado
  if ($("summaryYears")) {
    $("summaryYears").textContent = `${retireAge - age} años`;
  }

  if ($("summaryAge")) {
    $("summaryAge").textContent = `${retireAge} años`;
  }

  if ($("summaryContrib")) {
    $("summaryContrib").textContent = money(totalContrib);
  }

  if ($("summaryGrowth")) {
    $("summaryGrowth").textContent = money(growth);
  }

  if ($("futureValue")) {
    $("futureValue").textContent = money(futureValue);
  }

  if ($("fiscalValue")) {
    $("fiscalValue").textContent = money(fiscalBenefit);
  }

  // Gráfica simple
  renderSimpleProgress(totalContrib, growth);

  // Escenario del formulario
  if ($("leadScenarioValue")) {
    $("leadScenarioValue").textContent =
      `${age} años → ${retireAge} años`;
  }

  if ($("leadMonthlyValue")) {
    $("leadMonthlyValue").textContent = money(monthly);
  }

  
  // Llenar automáticamente el ahorro mensual
  const savingsInput = document.querySelector(
    '#leadForm input[name="savings"]'
  );

  if (
    savingsInput &&
    !savingsInput.dataset.userEdited
  ) {
    savingsInput.value = monthly || "";
  }
}

const downloadProjection = document.getElementById("downloadProjection");

if (downloadProjection) {
  downloadProjection.addEventListener("click", () => {
    if (!window.jspdf) {
      alert("No se pudo cargar el generador de PDF. Recarga la página e inténtalo de nuevo.");
      return;
    }

    const { jsPDF } = window.jspdf;

    const age = Math.max(18, Number($("age")?.value || 38));
    const retireAge = Math.max(
      age + 1,
      Number($("retireAge")?.value || 65)
    );
    const monthly = Math.max(
      0,
      Number($("monthly")?.value || 0)
    );
    const income = Math.max(
      0,
      Number($("income")?.value || 0)
    );

    const years = retireAge - age;
    const months = years * 12;
    const r = CONFIG.annualRate / 12;

    const futureValue =
      r === 0
        ? monthly * months
        : monthly * ((Math.pow(1 + r, months) - 1) / r);

    const totalContrib = monthly * months;
    const growth = Math.max(
      0,
      futureValue - totalContrib
    );

    const fiscalEnabled =
      document.querySelector(
        "#taxChoices .choice.active"
      )?.dataset.value !== "no";

    const fiscalBenefit = fiscalEnabled
      ? monthly * 12 * 0.20
      : 0;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const blue = [0, 76, 151];
    const darkBlue = [0, 57, 120];
    const green = [20, 170, 100];
    const dark = [35, 55, 75];
    const muted = [95, 120, 145];
    const softBlue = [241, 248, 253];
    const softGreen = [235, 250, 242];
    const white = [255, 255, 255];

    const moneyPDF = (value) =>
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0
      }).format(Math.round(value));

    // ==========================================
    // FONDO
    // ==========================================

    pdf.setFillColor(...white);
    pdf.rect(0, 0, 210, 297, "F");

    // ==========================================
    // ENCABEZADO
    // ==========================================

    pdf.setFillColor(...softBlue);
    pdf.rect(0, 0, 210, 58, "F");

    pdf.setFillColor(...blue);
    pdf.rect(0, 0, 8, 58, "F");

    pdf.setTextColor(...blue);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("TU PROYECCIÓN DE RETIRO", 20, 14);

    pdf.setFontSize(22);
    pdf.text("Un vistazo a tu", 20, 27);
    pdf.text("futuro financiero", 20, 37);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...muted);

    pdf.text(
      "Una primera referencia para visualizar tu escenario",
      20,
      47
    );

    pdf.text(
      "de retiro y las oportunidades que puedes aprovechar hoy.",
      20,
      53
    );

    // Allianz tipográfico
    pdf.setTextColor(...blue);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);
    pdf.text("Allianz", 160, 18);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text("Distribuidor Autorizado", 160, 24);

    // ==========================================
    // TU ESCENARIO
    // ==========================================

    pdf.setFillColor(...softBlue);
    pdf.roundedRect(12, 64, 186, 48, 5, 5, "F");

    pdf.setTextColor(...blue);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Tu escenario", 20, 76);

    const columns = [
      { x: 20, label: "Edad actual", value: `${age}`, suffix: "años" },
      { x: 55, label: "Edad de retiro", value: `${retireAge}`, suffix: "años" },
      { x: 92, label: "Horizonte de inversión", value: `${years}`, suffix: "años" },
      { x: 132, label: "Ingreso mensual actual", value: income > 0 ? moneyPDF(income) : "—", suffix: income > 0 ? "(aprox.)" : "" },
      { x: 170, label: "Aportación mensual", value: moneyPDF(monthly), suffix: "" }
    ];

    columns.forEach((item, index) => {
      if (index > 0) {
        pdf.setDrawColor(150, 185, 215);
        pdf.setLineWidth(0.3);
        pdf.line(item.x - 7, 82, item.x - 7, 103);
      }

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.text(item.label, item.x, 87);

      pdf.setTextColor(...blue);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(item.value.length > 9 ? 9 : 14);
      pdf.text(item.value, item.x, 97);

      if (item.suffix) {
        pdf.setTextColor(...muted);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);
        pdf.text(item.suffix, item.x, 104);
      }
    });

    // ==========================================
    // TU PROYECCIÓN
    // ==========================================

    pdf.setFillColor(...darkBlue);
    pdf.roundedRect(12, 119, 186, 58, 5, 5, "F");

    pdf.setTextColor(...white);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Tu proyección", 20, 133);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(
      "Con un rendimiento anual del 10% y una inflación del 4%.",
      20,
      142
    );

    // Separador
    pdf.setDrawColor(110, 165, 205);
    pdf.setLineWidth(0.3);
    pdf.line(78, 151, 78, 168);
    pdf.line(137, 151, 137, 168);

    // Aportaciones
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...white);
    pdf.text("Total de tus aportaciones", 20, 153);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text(moneyPDF(totalContrib), 20, 163);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text(`en ${years} años`, 20, 170);

    // Crecimiento
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.text("Crecimiento estimado", 87, 153);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text(moneyPDF(growth), 87, 163);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text("(intereses y rendimientos)", 87, 170);

    // Capital final
    pdf.setFillColor(...softGreen);
    pdf.roundedRect(143, 147, 47, 24, 4, 4, "F");

    pdf.setTextColor(...darkBlue);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.text("Capital final", 148, 155);

    pdf.setFontSize(12);
    pdf.text(moneyPDF(futureValue), 148, 163);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.text("a la edad de retiro", 148, 169);

    // ==========================================
    // ¿CÓMO SE CONSTRUYE TU CAPITAL?
    // ==========================================

    pdf.setDrawColor(205, 225, 240);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(12, 184, 112, 57, 4, 4, "S");

    pdf.setTextColor(...blue);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("¿Cómo se construye", 19, 196);
    pdf.text("tu capital?", 19, 203);

    const total = totalContrib + growth;
    const contributionWidth =
      total > 0 ? 90 * (totalContrib / total) : 0;

    const growthWidth =
      total > 0 ? 90 * (growth / total) : 0;

    // Aportaciones
    pdf.setTextColor(...dark);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.text("Lo que tú aportas", 19, 213);

    pdf.setFillColor(225, 239, 249);
    pdf.roundedRect(19, 217, 90, 6, 2, 2, "F");

    pdf.setFillColor(...blue);

    if (contributionWidth > 0) {
      pdf.roundedRect(
        19,
        217,
        contributionWidth,
        6,
        2,
        2,
        "F"
      );
    }

    pdf.setTextColor(...blue);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(moneyPDF(totalContrib), 113, 222, {
      align: "right"
    });

    // Crecimiento
    pdf.setTextColor(...dark);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.text("Crecimiento estimado", 19, 230);

    pdf.setFillColor(225, 245, 235);
    pdf.roundedRect(19, 234, 90, 6, 2, 2, "F");

    pdf.setFillColor(...green);

    if (growthWidth > 0) {
      pdf.roundedRect(
        19,
        234,
        growthWidth,
        6,
        2,
        2,
        "F"
      );
    }

    pdf.setTextColor(...green);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(moneyPDF(growth), 113, 239, {
      align: "right"
    });

    // ==========================================
    // BENEFICIO FISCAL
    // ==========================================

    if (fiscalEnabled) {
      pdf.setFillColor(...softBlue);
      pdf.roundedRect(130, 184, 68, 57, 4, 4, "F");

      pdf.setTextColor(...blue);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("Beneficio fiscal", 137, 197);
      pdf.text("estimado", 137, 203);

      pdf.setFontSize(17);
      pdf.text(moneyPDF(fiscalBenefit), 137, 218);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text("anuales*", 137, 225);

      pdf.setTextColor(...muted);
      pdf.setFontSize(6.5);
      pdf.text(
        "Estimación equivalente al 20%",
        137,
        233
      );
      pdf.text(
        "de tus aportaciones anuales.",
        137,
        238
      );
    }

    // ==========================================
    // DESCARGA
    // ==========================================

    pdf.setFillColor(...softBlue);
    pdf.roundedRect(12, 248, 186, 24, 4, 4, "F");

    pdf.setTextColor(...blue);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Tu proyección personalizada", 20, 259);

    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text(
      "Guarda este resumen y revísalo antes de tomar una decisión.",
      20,
      266
    );

    // ==========================================
    // CTA
    // ==========================================

    pdf.setTextColor(...blue);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(
      "¿Quieres que revisemos juntos este escenario?",
      20,
      280
    );

    pdf.setTextColor(...green);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(
      "QUIERO MI ASESORÍA PERSONALIZADA",
      20,
      287
    );

    // El texto funciona como enlace dentro del PDF.
    pdf.link(20, 281.5, 82, 8, {
      url: CONFIG.calendly
    });

    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.text(
      "georgina@fondosindexados.com.mx  •  WhatsApp 55 7244 9150",
      20,
      292
    );

    // ==========================================
    // GUARDAR
    // ==========================================

    pdf.save("Proyeccion-Retiro-Georgina.pdf");

    // Mantener al prospecto en la landing y mostrar el siguiente paso.
    const postDownloadCta = $("postDownloadCta");
    if (postDownloadCta) {
      postDownloadCta.hidden = false;
      postDownloadCta.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  });
}
function renderSimpleProgress(contrib, growth) {
  const contribBar = $("contribBar");
  const growthBar = $("growthBar");

  const contribValue = $("contribLegendValue");
  const growthValue = $("growthLegendValue");

  const total = contrib + growth;

  if (!total) {
    if (contribBar) {
      contribBar.style.width = "0%";
      contribBar.style.flexBasis = "0%";
    }

    if (growthBar) {
      growthBar.style.width = "0%";
      growthBar.style.flexBasis = "0%";
    }

    return;
  }

  const contribPercent = (contrib / total) * 100;
  const growthPercent = (growth / total) * 100;

  if (contribBar) {
    contribBar.style.width = `${contribPercent}%`;
    contribBar.style.flexBasis = `${contribPercent}%`;
  }

  if (growthBar) {
    growthBar.style.width = `${growthPercent}%`;
    growthBar.style.flexBasis = `${growthPercent}%`;
  }

  if (contribValue) {
    contribValue.textContent = money(contrib);
  }

  if (growthValue) {
    growthValue.textContent = money(growth);
  }
}

// Recalcular cuando cambien los datos
["age", "retireAge", "income", "monthly"].forEach((id) => {
  const input = $(id);

  if (input) {
    input.addEventListener("input", calculate);
    input.addEventListener("change", calculate);
  }
});

// Deducción fiscal Sí / No
document.querySelectorAll("#taxChoices .choice").forEach((choice) => {
  choice.addEventListener("click", () => {
    document
      .querySelectorAll("#taxChoices .choice")
      .forEach((item) => item.classList.remove("active"));

    choice.classList.add("active");
    calculate();
  });
});

// Botón CALCULA TU RETIRO
const calculateButton = Array.from(document.querySelectorAll("button, a"))
  .find(el => el.textContent.trim().includes("CALCULA TU RETIRO"));

if (calculateButton) {
  calculateButton.addEventListener("click", (event) => {
    event.preventDefault();

    calculate();

    const resultSection = document.querySelector(".calc-result");

    if (resultSection) {
      resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
}

// Si la persona modifica manualmente el ahorro,
// ya no lo reemplazamos con el valor de la calculadora
const savingsInput = document.querySelector(
  '#leadForm input[name="savings"]'
);

if (savingsInput) {
  savingsInput.addEventListener("input", () => {
    savingsInput.dataset.userEdited = "true";
  });
}

// Formulario de prospectos
const leadForm = $("leadForm");

if (leadForm) {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    calculate();

    const formData = new FormData(leadForm);

    const age = Number($("age")?.value || 0);
    const retireAge = Number($("retireAge")?.value || 0);
    const monthly = Number($("monthly")?.value || 0);

    const months = Math.max(0, (retireAge - age) * 12);
    const r = CONFIG.annualRate / 12;

    const futureValue =
      r === 0
        ? monthly * months
        : monthly * ((Math.pow(1 + r, months) - 1) / r);

    const totalContrib = monthly * months;
    const growth = Math.max(0, futureValue - totalContrib);

    const fiscalEnabled =
      document.querySelector("#taxChoices .choice.active")?.dataset.value !== "no";

    const fiscalBenefit = fiscalEnabled
      ? monthly * 12 * 0.20
      : 0;

    const lead = {
      name: formData.get("name") || "",
      whatsapp: formData.get("whatsapp") || "",
      email: formData.get("email") || "",
      savings: formData.get("savings") || "",
      profession: formData.get("profession") || "",
      age: age,
      retireAge: retireAge,
      years: Math.max(0, retireAge - age),
      totalContrib: totalContrib,
      growth: growth,
      futureValue: futureValue,
      fiscalBenefit: fiscalBenefit
    };

    // Guardar una copia local
    try {
      localStorage.setItem(
        "tuRetiroLeadDraft",
        JSON.stringify(lead)
      );
    } catch (error) {
      console.log("No se pudo guardar copia local", error);
    }

    const message = $("formMessage");

    if (message) {
      message.textContent =
        "Perfecto. Tus datos fueron enviados. Ahora podrás elegir fecha y hora para hablar conmigo.";
    }

    // Enviar prospecto a Google Sheets
    try {
      await fetch(CONFIG.googleSheetsUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(lead)
      });
    } catch (error) {
      console.log("No se pudo enviar a Google Sheets", error);
    }

    // Preparar Calendly
    const calendlyUrl = new URL(CONFIG.calendly);

    if (lead.name) {
      calendlyUrl.searchParams.set("name", lead.name);
    }

    if (lead.email) {
      calendlyUrl.searchParams.set("email", lead.email);
    }

    calendlyUrl.searchParams.set(
      "utm_source",
      "tu_retiro_landing"
    );

    calendlyUrl.searchParams.set(
      "utm_medium",
      "lead_form"
    );

    calendlyUrl.searchParams.set(
      "utm_campaign",
      "retiro"
    );

    // Abrir Calendly
    window.open(
      calendlyUrl.toString(),
      "_blank",
      "noopener"
    );
  });
}
// Botones de WhatsApp
const whatsappUrl = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(
  "Hola Georgina, quiero hablar sobre mi retiro."
)}`;

const whatsappLinks = [
  document.getElementById("whatsappLink"),
  document.getElementById("floatingWhatsApp")
].filter(Boolean);

whatsappLinks.forEach((link) => {
  link.href = whatsappUrl;
  link.target = "_blank";
  link.rel = "noopener";

  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.open(whatsappUrl, "_blank", "noopener");
  });
});

// Ejecutar cálculo al cargar
calculate();
