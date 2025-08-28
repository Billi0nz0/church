
  // Initialize EmailJS
  emailjs.init("aHk1tpfTEROjRu8ie");

  const form = document.getElementById("contact-form");
  const spinner = document.getElementById("spinner");
  const statusMessage = document.getElementById("statusMessage");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Reset status
    spinner.style.display = "block";
    statusMessage.style.display = "none";

    // 1. Send the main message
    emailjs.sendForm("service_jdyds9v", "template_mq5thcl", form)
      .then(() => {
        // 2. Send auto-reply to user
        return emailjs.sendForm("service_jdyds9v", "template_t5ie0rl", form);
      })
      .then(() => {
        // Success
        spinner.style.display = "none";
        statusMessage.style.display = "block";
        statusMessage.style.color = "green";
        statusMessage.textContent = "Message sent successfully! Check your inbox for confirmation.";
        form.reset();
      })
      .catch((error) => {
        // Failure
        spinner.style.display = "none";
        statusMessage.style.display = "block";
        statusMessage.style.color = "red";
        statusMessage.textContent = "Failed to send message. Please try again.";
        console.error("EmailJS Error:", error);
      });
  });

