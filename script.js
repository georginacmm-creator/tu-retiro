const CONFIG = {
  annualRate: 0.10,      // 10% anual nominal, ilustrativo
  annualInflation: 0.04, // 4% anual, ilustrativo
  calendly: "https://calendly.com/georgina-inviertemas/fondosindexados",
  whatsapp: "525572449150"
};

const $ = (id) => document.getElementById(id);
const money = (n) => new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
}).format(Math.round(n));

function calculate() {
  const age = Math.max(18, Number($("age").value) || 38);
  let retireAge = Number($("retireAge").value) || 65;
  retireAge = Math.max(age + 1, retireAge);
  const monthly = Math.max(0, Number($("monthly").value) || 0);
  const years = retireAge - age;
  const months = years * 12;
  const r = CONFIG.annualRate / 12;

  const futureValue = r === 0
    ? monthly * months
    : monthly * ((Math.pow(1 + r, months) - 1) / r);

  const totalContrib = monthly * months;
  const growth = Math.max(0, futureValue - totalContrib);

  const taxChoice = document.querySelector("#taxChoices .choice.active")?.dataset.value;
  const fiscalBenefit = taxChoice === "no" ? 0 : monthly * 12 * 0.20;

  // Actualiza todo el panel derecho en tiempo real.
  $("summaryYears").textContent = `${years} ${years === 1 ? "año" : "años"}`;
  $("summaryAge").textContent = `${retireAge} años`;
  $("summaryContrib").textContent = money(totalContrib);
  $("summaryGrowth").textContent = money(growth);
  $("futureValue").textContent = money(futureValue);
  $("fiscalValue").textContent = money(fiscalBenefit);
  $("contribLegendValue").textContent = money(totalContrib);
  $("growthLegendValue").textContent = money(growth);

  renderSimpleProgress(totalContrib, growth);
}

function renderSimpleProgress(contrib, growth) {
  const total = Math.max(1, contrib + growth);
  $("contribBar").style.width = `${(contrib / total) * 100}%`;
  $("contribBar").style.flexBasis = `${(contrib / total) * 100}%`;
  $("growthBar").style.width = `${(growth / total) * 100}%`;
  $("growthBar").style.flexBasis = `${(growth / total) * 100}%`;
}

// Actualización inmediata mientras el usuario escribe.
["age", "retireAge", "income", "monthly"].forEach((id) => {
  const field = $(id);
  if (!field) return;
  field.addEventListener("input", calculate);
  field.addEventListener("change", calculate);
});

// Sí / No también actualiza el resultado fiscal al instante.
document.querySelectorAll("#taxChoices .choice").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#taxChoices .choice").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    calculate();
  });
});

// El botón verde lleva al formulario de agenda.
$("calculate")?.addEventListener("click", () => {
  calculate();

  // Lleva al formulario el ahorro mensual que el prospecto indicó en la calculadora.
  // El campo queda editable para que pueda ajustarlo antes de enviar sus datos.
  const savingsField = document.querySelector('#leadForm input[name="savings"]');
  const monthlyField = $("monthly");
  if (savingsField && monthlyField) {
    savingsField.value = monthlyField.value || "";
  }

  const leadSection = $("leadSection");
  if (leadSection) {
    leadSection.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => $("leadForm")?.querySelector('input[name="name"]')?.focus(), 550);
  }
});

// Formulario: después de enviar, abre Calendly.
$("leadForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = $("formMessage");
  if (message) message.textContent = "¡Listo! Ahora elige el día y horario que mejor te funcione.";
  setTimeout(() => {
    window.location.href = CONFIG.calendly;
  }, 350);
});

function setWhatsApp() {
  const number = CONFIG.whatsapp.replace(/\D/g, "");
  const url = `https://wa.me/${number}?text=${encodeURIComponent("Hola Georgina, quiero hablar sobre mi retiro.")}`;
  [$("whatsappLink"), $("floatingWhatsApp")].filter(Boolean).forEach((a) => {
    a.href = url;
  });
}

setWhatsApp();
if ($("year")) $("year").textContent = new Date().getFullYear();
calculate();
