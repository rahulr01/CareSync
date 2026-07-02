const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const currentYear = document.getElementById("currentYear");
const appointmentForm = document.getElementById("appointmentForm");
const formStatus = document.getElementById("formStatus");
const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const registerForm = document.getElementById("registerForm");
const registerStatus = document.getElementById("registerStatus");
const heroSection = document.getElementById("heroSection");
const welcomeOverlay = document.getElementById("welcomeOverlay");
const welcomeClose = document.getElementById("welcomeClose");
const welcomeSeconds = document.getElementById("welcomeSeconds");
const welcomeTimerFill = document.getElementById("welcomeTimerFill");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const WELCOME_POPUP_SESSION_KEY = "caresync_welcome_popup_shown";

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });
}

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

function initHeroEntrance() {
  if (!heroSection) return;
  if (prefersReducedMotion) {
    heroSection.classList.add("hero--visible");
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroSection.classList.add("hero--visible");
    });
  });
}

function initDoctorCardTilt() {
  const cards = document.querySelectorAll(".doctor-card");
  if (!cards.length || prefersReducedMotion) return;

  const maxTilt = 10;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateY = x * maxTilt * 2;
      const rotateX = -y * maxTilt * 2;
      card.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

function closeWelcomeModal() {
  if (!welcomeOverlay) return;
  welcomeOverlay.classList.remove("welcome-overlay--open");
  welcomeOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (welcomeOverlay._timerId) {
    cancelAnimationFrame(welcomeOverlay._timerId);
    welcomeOverlay._timerId = null;
  }
}

function openWelcomeModal() {
  if (!welcomeOverlay) return;
  document.body.style.overflow = "hidden";
  welcomeOverlay.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    welcomeOverlay.classList.add("welcome-overlay--open");
    if (welcomeClose) {
      welcomeClose.focus();
    }
  });

  const durationMs = 5000;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const remaining = Math.max(0, durationMs - elapsed);
    const secondsLeft =
      remaining <= 0 ? 0 : Math.floor((remaining - 1) / 1000) + 1;

    if (welcomeSeconds) {
      welcomeSeconds.textContent = String(Math.min(5, secondsLeft));
    }
    if (welcomeTimerFill) {
      welcomeTimerFill.style.transform = `scaleX(${remaining / durationMs})`;
    }

    if (remaining <= 0) {
      closeWelcomeModal();
      return;
    }
    welcomeOverlay._timerId = requestAnimationFrame(tick);
  }

  if (welcomeTimerFill) {
    welcomeTimerFill.style.transform = "scaleX(1)";
  }
  if (welcomeSeconds) {
    welcomeSeconds.textContent = "5";
  }

  welcomeOverlay._timerId = requestAnimationFrame(tick);
}

function initWelcomeModal() {
  if (!welcomeOverlay) return;

  try {
    if (sessionStorage.getItem(WELCOME_POPUP_SESSION_KEY) === "1") {
      return;
    }
    sessionStorage.setItem(WELCOME_POPUP_SESSION_KEY, "1");
  } catch {
    // If sessionStorage is blocked/disabled, fall back to showing the popup normally.
  }

  if (welcomeClose) {
    welcomeClose.addEventListener("click", closeWelcomeModal);
  }

  welcomeOverlay.addEventListener("click", (event) => {
    if (event.target === welcomeOverlay) {
      closeWelcomeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && welcomeOverlay.classList.contains("welcome-overlay--open")) {
      closeWelcomeModal();
    }
  });

  requestAnimationFrame(() => {
    openWelcomeModal();
  });
}

initHeroEntrance();
initDoctorCardTilt();
initWelcomeModal();

function setStatus(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove("success", "error");
  if (type) el.classList.add(type);
}

function withSubmitDisabled(formEl, isDisabled, submittingText) {
  if (!formEl) return;
  const btn = formEl.querySelector('button[type="submit"]');
  if (!btn) return;
  btn.disabled = isDisabled;
  if (isDisabled && submittingText) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = submittingText;
  } else if (!isDisabled && btn.dataset.originalText) {
    btn.textContent = btn.dataset.originalText;
    delete btn.dataset.originalText;
  }
}

function isBlank(value) {
  return !String(value ?? "").trim();
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());
}

if (appointmentForm && formStatus) {
  appointmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(appointmentForm);
    const payload = Object.fromEntries(formData.entries());

    setStatus(formStatus, "Submitting your appointment request...");
    withSubmitDisabled(appointmentForm, true, "Submitting...");

    try {
      // In production, this request would go to your backend API endpoint.
      // The backend server would validate all inputs, store the appointment
      // in a database, and return a success/error response.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Simulated POST /api/appointments payload:", payload);

      setStatus(
        formStatus,
        "Appointment request submitted successfully. We will contact you shortly.",
        "success"
      );
      appointmentForm.reset();
    } catch (error) {
      setStatus(formStatus, "Something went wrong while submitting. Please try again.", "error");
      console.error("Appointment submission simulation failed:", error);
    } finally {
      withSubmitDisabled(appointmentForm, false);
    }
  });
}

if (loginForm && loginStatus) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());

    const email = payload.email;
    const password = payload.password;

    if (isBlank(email) || !validateEmail(email)) {
      setStatus(loginStatus, "Please enter a valid email address.", "error");
      return;
    }
    if (isBlank(password)) {
      setStatus(loginStatus, "Please enter your password.", "error");
      return;
    }

    setStatus(loginStatus, "Signing you in...");
    withSubmitDisabled(loginForm, true, "Signing in...");

    try {
      // In production, the backend would authenticate the user and return a session/token.
      await new Promise((resolve) => setTimeout(resolve, 900));
      console.log("Simulated POST /api/auth/login payload:", payload);

      setStatus(loginStatus, "Login successful (simulated). Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "booking.html";
      }, 700);
    } catch (error) {
      setStatus(loginStatus, "Login failed. Please try again.", "error");
      console.error("Login simulation failed:", error);
      withSubmitDisabled(loginForm, false);
    }
  });
}

if (registerForm && registerStatus) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(registerForm);
    const payload = Object.fromEntries(formData.entries());

    const name = payload.name;
    const email = payload.email;
    const password = payload.password;
    const passwordAgain = payload.passwordAgain;
    const role = payload.registrationRole;

    if (isBlank(name)) {
      setStatus(registerStatus, "Please enter the patient's name.", "error");
      return;
    }
    if (isBlank(email) || !validateEmail(email)) {
      setStatus(registerStatus, "Please enter a valid email address.", "error");
      return;
    }
    if (isBlank(password) || isBlank(passwordAgain)) {
      setStatus(registerStatus, "Please enter your password in both fields.", "error");
      return;
    }
    if (String(password) !== String(passwordAgain)) {
      setStatus(registerStatus, "Passwords do not match. Please re-enter.", "error");
      return;
    }
    if (isBlank(role)) {
      setStatus(registerStatus, "Please select a registration type option.", "error");
      return;
    }

    setStatus(registerStatus, "Creating your account...");
    withSubmitDisabled(registerForm, true, "Creating...");

    try {
      // In production, the backend would validate input (email uniqueness, password policy),
      // create the patient user record in the database, and return a success/error response.
      await new Promise((resolve) => setTimeout(resolve, 1100));
      console.log("Simulated POST /api/auth/register payload:", payload);

      setStatus(registerStatus, "Account created successfully (simulated). You can now login.", "success");
      registerForm.reset();
      setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
    } catch (error) {
      setStatus(registerStatus, "Registration failed. Please try again.", "error");
      console.error("Registration simulation failed:", error);
      withSubmitDisabled(registerForm, false);
    } finally {
      withSubmitDisabled(registerForm, false);
    }
  });
}
