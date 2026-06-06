
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
    emailjs.sendForm("process.env.SERVICE_ID", "process.env.TEMPLATE_ID", form)
      .then(() => {
        // 2. Send auto-reply to user
        return emailjs.sendForm("process.env.SERVICE_ID", "process.env.AUTO_REPLY_TEMPLATE_ID", form);
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

