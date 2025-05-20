
// sidebar
function togglesubmenu(button){
    button.nextElementSibling.classList.toggle('show')
    button.classList.toggle('rotate')
    };
    
    function refreshbutton(){
    location.reload();
    
    }
    //end sidebar
    //**************************************************************** */
	
	
	function checklogin() {

		const emailInput = document.getElementById('email');
		const passwordInput = document.getElementById('password');
		const email = emailInput.value;
		const password = passwordInput.value;
	  
		// يمكنك هنا إضافة المزيد من التحقق من صحة البيانات إذا لزم الأمر
	  
		// التحقق من بيانات اعتماد المسؤول (مثال بسيط)
		if (email === 'admin@example.com' && password === 'admin123') {
		  // إعادة التوجيه إلى صفحة المسؤول
		  window.location.href = 'admin.html';
		} 
	  }
	  




const switchers = [...document.querySelectorAll('.switcher')]

switchers.forEach(item => {
	item.addEventListener('click', function() {
		switchers.forEach(item => item.parentElement.classList.remove('is-active'))
		this.parentElement.classList.add('is-active')
	})
});


// Image preview and upload functionality
const imageInput = document.getElementById("u-image");
const preview = document.getElementById("preview");

// When clicking on the image, open the file selector
preview.addEventListener("click", () => {
  imageInput.click();
});

// When selecting an image, display the preview
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "1dece2c8357bdd7cee3b15036344faf5.jpg"; // Default image
  }
});

// When pressing the register button
document.getElementById("signupButton").addEventListener("click", async (e) => {
  e.preventDefault();

  // Validate required fields
  const name = document.getElementById("u-name").value;
  const email = document.getElementById("u-email").value;
  const password = document.getElementById("u-password").value;
  const phone = document.getElementById("u-phone").value;

  if (!name || !email || !password || !phone) {
    alert("الرجاء إدخال الحقول المطلوبة: الاسم، البريد الإلكتروني، كلمة المرور، رقم الهاتف");
    return;
  }

  const formData = new FormData();
  formData.append("Name", name);
  formData.append("Email", email);
  formData.append("Password", password);
  formData.append("Phone", phone);

  // Add image - if the user selected an image, send it. If not, don't include an image.
  // The API will handle the case when no image is provided
  if (imageInput.files.length > 0) {
    formData.append("Image", imageInput.files[0]);
  }
  // No need to send default image - the backend will handle users without images

  try {
    const response = await fetch("https://localhost:7259/api/User", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      
       //////////////////////////////////
			   // إذا كانت بيانات تسجيل الدخول صحيحة، خزن الـ userId في localStorage
			   const userId = result.id;
			   localStorage.setItem('userId', userId);  
			   //////////////////////////////////
      
      alert(`مرحباً، ${name}! تم إنشاء حسابك بنجاح.`);
      // Redirect to the next page
      window.location.href = 'header.html';
    } else {
      const errorData = await response.json();
      alert(`خطأ: ${errorData.message || "حدث خطأ أثناء إنشاء المستخدم."}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("حدث خطأ أثناء الاتصال بالخادم.");
  }
});








// Login API...............
const apiUrl = "https://localhost:7259/api/User";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const messageDiv = document.getElementById("message");

async function login() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        messageDiv.textContent = "Please enter both email and password.";
        messageDiv.style.color = "red";
        return;
    }

    try {
        const response = await fetch(`${apiUrl}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
            method: "GET",
        });

        const data = await response.json();

        if (response.ok) {
			    //////////////////////////////////
			   // إذا كانت بيانات تسجيل الدخول صحيحة، خزن الـ userId في localStorage
			   const userId = data.id;
			   localStorage.setItem('userId', userId);  
			   //////////////////////////////////
            alert(`Welcome, ${email}`)
            // Redirect to the next page
		    // ✅ التحقق إذا كان admin
            if (email === "admin@gmail.com" && password === "admin404") {
                window.location.href = "admin/user-details.html";
            } else {
                window.location.href = "header.html"; // صفحة المستخدم العادي
            }
        } else {
            alert(data.message || "Login failed.")// 
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
}

//// تخزين الـ userId في localStorage
loginButton.addEventListener("click", login);

