// sidebar functions
function togglesubmenu(button) {
  button.nextElementSibling.classList.toggle("show");
  button.classList.toggle("rotate");
}

function refreshbutton() {
  location.reload();
}

// Main user account management
document.addEventListener("DOMContentLoaded", function () {
  // Get user ID from localStorage
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("يجب تسجيل الدخول أولاً");
    window.location.href = "login.html";
    return;
  }

  // UI elements
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const majorInput = document.getElementById("major");
  const changeImageLink = document.querySelector(".change-image");
  const editButton = document.querySelector(".button-edit button");
  const imgContainer = document.getElementById("p-image");

  // Hidden file input for image upload
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  let selectedImageBase64 = null;

  // Load user data when page loads
  loadUserData(userId);

  // Event listeners
  changeImageLink.addEventListener("click", function (e) {
    e.preventDefault();
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        // Create and display the new image
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Profile Image";
        img.style.width = "150px";
        img.style.height = "150px";
        img.style.borderRadius = "50%";
        img.style.objectFit = "cover";
        img.style.border = "3px solid #00b4be";
        img.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
        imgContainer.innerHTML = "";
        imgContainer.appendChild(img);
        
        selectedImageBase64 = e.target.result.split(',')[1]; // Extract base64 part
      };
      reader.readAsDataURL(fileInput.files[0]);
    }
  });

  editButton.addEventListener("click", updateUserData);

  /**
   * Load user data from API
   * @param {number} userId 
   */
  async function loadUserData(userId) {
    try {
      const response = await fetch(`https://localhost:7259/api/User/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();

      // Fill form fields
      usernameInput.value = data.name || "";
      emailInput.value = data.email || "";
      phoneInput.value = data.phone || "";
      majorInput.value = data.major || "";

      // Display profile image
      if (data.profileImage) {
        const img = document.createElement("img");
        img.src = `data:${data.profileImage.contentType};base64,${data.profileImage.imageBase64}`;
        img.alt = "Profile Image";
        img.style.width = "150px";
        img.style.height = "150px";
        img.style.borderRadius = "50%";
        img.style.objectFit = "cover";
        img.style.border = "3px solid #00b4be";
        img.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
        imgContainer.innerHTML = "";
        imgContainer.appendChild(img);
      } else {
        imgContainer.innerHTML = `
          <img src="1dece2c8357bdd7cee3b15036344faf5.jpg" 
               alt="Default profile image" 
               style="width: 150px; height: 150px; border-radius: 50%; 
                      object-fit: cover; border: 3px solid #00b4be;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.1);"/>`;
      }
    } catch (error) {
      console.error("Error:", error);
      alert("فشل في تحميل بيانات المستخدم");
    }
  }

  /**
   * Update user data
   */
  async function updateUserData() {
    try {
      const userData = {
        Name: usernameInput.value.trim(),
        Email: emailInput.value.trim(),
        Phone: phoneInput.value.trim(),
        Major: majorInput.value.trim()
      };

      // If image was selected, include it
      if (selectedImageBase64) {
        userData.profileImage = {
          imageBase64: selectedImageBase64,
          contentType: fileInput.files[0].type
        };
      }

      const response = await fetch(`https://localhost:7259/api/User/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      const result = await response.json();
      alert("تم تحديث البيانات بنجاح");
      loadUserData(userId); // Refresh data
      selectedImageBase64 = null; // Reset image
    } catch (error) {
      console.error("Error:", error);
      alert("فشل في تحديث البيانات");
    }
  }
});