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

    const leadSection = $("leadSection");

    if (leadSection) {
      leadSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    setTimeout(() => {
      const nameInput = document.querySelector('#leadForm input[name="name"]');

      if (nameInput) {
        nameInput.focus();
      }
    }, 700);
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
