// Make sure to include the emailjs-com script in your HTML file, not here.

// Initialize EmailJS
(function() {
  emailjs.init("aHk1tpfTEROjRu8ie"); // replace with actual key
})();

document.getElementById("contact-form").addEventListener("submit", function(event) {
  event.preventDefault();

  // Send main message
  emailjs.sendForm("service_jdyds9v", "template_t5ie0rl", this)
    .then(function() {
      alert("✅ Message sent successfully!");
      // Send auto-reply to the user using a different template
      return emailjs.sendForm("service_jdyds9v", "template_t5ie0rl", event.target);
    })
    .then(function() {
      console.log("Auto-reply sent to user");
    })
    .catch(function(error) {
      alert("❌ Failed to send message. Check console.");
      console.error("Error:", error);
    });
});
