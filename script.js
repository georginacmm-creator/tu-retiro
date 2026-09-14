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
    const retireAge = Math.max(age + 1, Number($("retireAge")?.value || 65));
    const monthly = Math.max(0, Number($("monthly")?.value || 0));

    const years = retireAge - age;
    const months = years * 12;
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

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const blue = [0, 76, 151];
    const green = [24, 165, 88];
    const dark = [35, 45, 55];
    const lightBlue = [240, 247, 252];

    const moneyPDF = (value) =>
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0
      }).format(Math.round(value));

    // Fondo
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 210, 297, "F");

    // Encabezado azul
    pdf.setFillColor(...blue);
    pdf.rect(0, 0, 210, 42, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("INVIERTE+", 20, 14);

    pdf.setFontSize(21);
    pdf.text("TU PROYECCIÓN DE RETIRO", 20, 25);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Un vistazo a tu futuro financiero", 20, 33);

    // Escenario
    pdf.setTextColor(...dark);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("Tu escenario", 20, 56);

    pdf.setFillColor(...lightBlue);
    pdf.roundedRect(20, 62, 170, 38, 4, 4, "F");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(90, 100, 110);

    pdf.text("Edad actual", 28, 72);
    pdf.text("Edad de retiro", 78, 72);
    pdf.text("Horizonte", 128, 72);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...dark);

    pdf.text(`${age} años`, 28, 82);
    pdf.text(`${retireAge} años`, 78, 82);
    pdf.text(`${years} años`, 128, 82);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(90, 100, 110);
    pdf.text("Aportación mensual", 28, 94);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...dark);
    pdf.text(moneyPDF(monthly), 78, 94);

    // Proyección
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...dark);
    pdf.text("Tu proyección", 20, 118);

    const rows = [
      ["Total de tus aportaciones", moneyPDF(totalContrib)],
      ["Crecimiento estimado", moneyPDF(growth)]
    ];

    let y = 130;

    rows.forEach(([label, value]) => {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(80, 90, 100);
      pdf.text(label, 20, y);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(...dark);
      pdf.text(value, 190, y, { align: "right" });

      y += 13;
    });

    // Barras
    const total = totalContrib + growth;
    const barWidth = 170;

    const contribWidth = total > 0
      ? barWidth * (totalContrib / total)
      : 0;

    pdf.setFillColor(...blue);
    pdf.roundedRect(20, 158, contribWidth, 8, 2, 2, "F");

    pdf.setFillColor(...green);
    pdf.roundedRect(
      20 + contribWidth,
      158,
      Math.max(0, barWidth - contribWidth),
      8,
      2,
      2,
      "F"
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(80, 90, 100);

    pdf.text("Lo que tú aportas", 20, 173);
    pdf.text("Crecimiento estimado", 115, 173);

    // Capital final
    pdf.setFillColor(...blue);
    pdf.roundedRect(20, 184, 170, 35, 4, 4, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("CAPITAL FINAL A LA EDAD DE RETIRO", 30, 195);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(21);
    pdf.text(moneyPDF(futureValue), 30, 208);

    // Beneficio fiscal
    let footerY = 231;

    if (fiscalEnabled) {
      pdf.setFillColor(244, 250, 246);
      pdf.roundedRect(20, 227, 170, 25, 4, 4, "F");

      pdf.setTextColor(...green);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Beneficio fiscal estimado", 28, 237);

      pdf.setTextColor(...dark);
      pdf.setFontSize(13);
      pdf.text(moneyPDF(fiscalBenefit), 28, 247);

      footerY = 260;
    }

    // CTA
    pdf.setTextColor(...blue);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("¿Quieres que revisemos juntos este escenario?", 20, footerY);

    pdf.setTextColor(...dark);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(
      "Agenda una asesoría personalizada con Georgina.",
      20,
      footerY + 7
    );

    pdf.setTextColor(...green);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("georgina@fondosindexados.com.mx", 20, footerY + 16);

    pdf.setTextColor(90, 100, 110);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    pdf.text(
      "Proyección ilustrativa con supuesto de 10% anual nominal,",
      20,
      286
    );

    pdf.text(
      "inflación de 4% anual y capitalización mensual.",
      20,
      291
    );

    pdf.save("Proyeccion-Retiro-Georgina.pdf");
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
