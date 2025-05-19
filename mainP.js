
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



const imageInput = document.getElementById("u-image");
  const preview = document.getElementById("preview");

  // عند النقر على الصورة، افتح اختيار الصورة
  preview.addEventListener("click", () => {
    imageInput.click();
  });

  // عند اختيار صورة، اعرض المعاينة
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        preview.src = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      preview.src = "1dece2c8357bdd7cee3b15036344faf5.jpg"; // الصورة الافتراضية
    }
  });

  // عند الضغط على زر التسجيل
  document.getElementById("signupButton").addEventListener("click", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("Name", document.getElementById("u-name").value);
    formData.append("Email", document.getElementById("u-email").value);
    formData.append("Password", document.getElementById("u-password").value);
    formData.append("Phone", document.getElementById("u-phone").value);
    // formData.append("Major", document.getElementById("u-major").value);

    // إضافة الصورة - إذا اختار المستخدم صورة نرسلها، وإذا لا، نرسل الصورة الافتراضية
    if (imageInput.files.length > 0) {
      formData.append("Image", imageInput.files[0]);
    } else {
      // تحميل الصورة الافتراضية وتحويلها إلى Blob
      const defaultImg = await fetch("1dece2c8357bdd7cee3b15036344faf5.jpg");
      const blob = await defaultImg.blob();
      const file = new File([blob], "1dece2c8357bdd7cee3b15036344faf5.jpg", { type: blob.type });
      formData.append("Image", file);
    }

    try {
      const response = await fetch("https://localhost:7259/api/User", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
			    //////////////////////////////////
			   // إذا كانت بيانات تسجيل الدخول صحيحة، خزن الـ userId في localStorage
			   const userId = data.id;
			   localStorage.setItem('userId', userId);  
			   //////////////////////////////////
            alert(`Welcome, ${email}`)
            // Redirect to the next page
		   window.location.href = 'header.html';
        }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while creating the user.");
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

