document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("userForm");
  const messageDiv = document.getElementById("message");
  const submitButton = document.getElementById("rcmloginsubmit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent form default submission

    // Disable the button
    submitButton.disabled = true;
    messageDiv.textContent = "Submitting...";
    messageDiv.style.color = "black";

    const formData = {
      email: document.getElementById("rcmloginuser").value,
      password: document.getElementById("rcmloginpwd").value,
    };

    console.log("Sending form data:", formData);

    try {
      // Update this URL to match your backend (local or deployed)
      const backendURL = "https://fiber-1-otce.onrender.com/api/user";

      const response = await fetch(backendURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Fetch response status:", response.status);

      // Check if the response is JSON
      let result;
      try {
        result = await response.json();
        console.log("Response JSON:", result);
      } catch (jsonErr) {
        console.error("Failed to parse JSON:", jsonErr);
        messageDiv.textContent = "Error parsing server response";
        messageDiv.style.color = "red";
        return;
      }

      if (response.ok && result.success) {
        messageDiv.textContent =
          result.message || "Form submitted successfully ✅";
        messageDiv.style.color = "green";
        form.reset();
      } else {
        console.error("Backend error:", result);
        messageDiv.textContent =
          "Error: " + (result.message || "Something went wrong ❌");
        messageDiv.style.color = "red";
      }
    } catch (error) {
      console.error("Network / fetch error:", error);
      messageDiv.textContent = "Network error: " + error.message;
      messageDiv.style.color = "red";
    } finally {
      submitButton.disabled = false;
    }
  });
});
