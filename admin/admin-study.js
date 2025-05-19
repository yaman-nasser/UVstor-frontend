// sidebar
function togglesubmenu(button){
    button.nextElementSibling.classList.toggle('show')
    button.classList.toggle('rotate')
    };
    
    function refreshbutton(){
    location.reload();
    
    }
    //end sidebar
// sidebar


function togglesubmenu(button) {
  button.nextElementSibling.classList.toggle("show");
  button.classList.toggle("rotate");
}

function refreshbutton() {
  location.reload();
}
//end sidebar
//********************** */


function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm) return renderUsers(users);

    const filteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm)) ||
        (user.major && user.major.toLowerCase().includes(searchTerm)) ||
        (user.phone && user.phone.includes(searchTerm))
    );

    renderUsers(filteredUsers);
}


//////////////////////////////////////////////
const userId = localStorage.getItem("userId");
console.log(userId);
//////////////////////////////////////////////



async function loadBookExchangePosts() {
  try {
    const response = await fetch("https://localhost:7259/api/BookExchange");
    const posts = await response.json();

    const postsList = document.getElementById("postsList");
    postsList.innerHTML = "";

    for (const post of posts) {
      const col = document.createElement("div");
      col.classList.add("col-md-4", "mb-4");

      const card = document.createElement("div");
      card.classList.add("card-study");
      card.setAttribute("data-id", post.id); // مهم لتحديد العنصر وقت الحذف

      const userImageSrc =
        post.image?.imageBase64 && post.image?.contentType
          ? `data:${post.image.contentType};base64,${post.image.imageBase64}`
          : "1dece2c8357bdd7cee3b15036344faf5.jpg";

        const formattedDate = new Date(post.createdAt).toLocaleDateString('ar-EG', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

    

      const isMyPost = true; 
      console.log( Number(post.userId),Number(userId));

      card.innerHTML = `
       <div class="cards-container">
  <div class="card">
    <div class="card-header">
      <div class="user-icon">
        <img src="${userImageSrc}" alt="User" style="
             
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #ccc;
  " />
      </div>
      <div class="user-info">
        <h5 class="user-name">${post.userName}</h5>
        <p class="user-major">${post.major ?? "غير محدد"}</p>
      </div>
      <p class="card-text" style="font-size: 0.8rem; color: #666; margin-left: 60px;">${formattedDate}</p>
    </div>

    <div class="card-body">
      <div class="book-section">
        <div class="section-label">
          <i class="fas fa-hand-holding"></i>
          المواد المراد إعطاؤها
        </div>
            <textarea readonly class="form-control give-books" rows="3">${post.booksToGive}</textarea>


      </div>

      <div class="book-section">
        <div class="section-label">
          <i class="fas fa-hand-sparkles"></i>
          المواد المراد أخذها
        </div>
              <textarea class="form-control give-books" rows="3" readonly>${post.booksToReceive
        .split("\n")
        .map(book => book.trim())
        .join("\n")}</textarea>

      </div>
    </div>

    <div class="card-footer">
      
       <button class="btn btn-danger" onclick="deletePost(${post.id}, 1018, true)">
        حذف المنشور
      </button>
        
      <button class="btn btn-primary btn-message" onclick="startChat(${userId}, ${post.userId})">
        <i class="fas fa-comment-dots ml-2"></i> مراسلة
      </button>
      
    </div>
  </div>
</div>
`;

      col.appendChild(card);
      postsList.appendChild(col);
    }
  } catch (err) {
    console.error("فشل تحميل منشورات تبادل الكتب:", err);
  }
}




function startChat(currentUserId, postUserId) {
  console.log(currentUserId, postUserId);
  // توجه لصفحة الدردشة مع تمرير المعرفين في الرابط
  window.location.href = `https://localhost:7259/chat.html?userId=${currentUserId}&otherUserId=${postUserId}`;
}

async function confirmDelete(postId, userId) {
  const result = await Swal.fire({
    title: "هل أنت متأكد؟",
    text: "لن تتمكن من استعادة المنشور بعد حذفه!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "نعم، احذف",
    cancelButtonText: "لا، ألغِ",
  });

  if (result.isConfirmed) {
    await deletePost(postId, userId);
  }
}
async function deletePost(postId, userId, isAdmin) {
  try {
    const response = await fetch(
      `https://localhost:7259/api/BookExchange/${postId}?userId=${userId}&isAdmin=${isAdmin}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      Swal.fire("تم الحذف!", "تم حذف المنشور بنجاح.", "success");

      // حذف العنصر من الواجهة
      const postElement = document.querySelector(`div[data-id='${postId}']`);
      if (postElement && postElement.parentElement) {
        postElement.parentElement.remove(); // col-md-4
      }
    } else {
      const error = await response.json();
      Swal.fire("خطأ", error.message, "error");
    }
  } catch (err) {
    console.error("فشل في حذف المنشور:", err);
    Swal.fire("خطأ", "حدث خطأ أثناء محاولة حذف المنشور.", "error");
  }
}




// نموذج الإرسال
document
  .getElementById("modalPostForm")
  .addEventListener("submit", async function (e) {
  e.preventDefault();

  // قراءة المواد من الـ textarea
  const booksToReceiveRaw = document.getElementById("myTextarea1").value.trim();
  const booksToGiveRaw = document.getElementById("myTextarea2").value.trim();

  // التأكد من الحقول المطلوبة
  if (!booksToReceiveRaw || !booksToGiveRaw) {
    Swal.fire("تنبيه", "يرجى تعبئة الحقول المطلوبة", "warning");
    return;
  }

  // تنسيق المواد كسطور مسبوقة بـ "•"
  const booksToReceive = booksToReceiveRaw
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `• ${line}`)
    .join("\n");

  const booksToGive = booksToGiveRaw
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `• ${line}`)
    .join("\n");

  // التحقق من تسجيل الدخول
  const userId = localStorage.getItem("userId");
  if (!userId) {
    Swal.fire("خطأ", "يجب تسجيل الدخول أولاً", "error");
    return;
  }

  try {
    // جلب بيانات المستخدم من API
    const userRes = await fetch(`https://localhost:7259/api/User/${userId}`);
    const user = await userRes.json();

    if (!user.major || user.major.trim() === "") {
      Swal.fire("تنبيه", "لا يمكن النشر بدون تحديد التخصص في ملفك الشخصي", "warning");
      return;
    }

    // إعداد البيانات للإرسال
    const post = {
      userId: parseInt(userId),
      booksToGive,
      booksToReceive,
      major: user.major
    };

    const res = await fetch("https://localhost:7259/api/BookExchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post)
    });

    if (res.ok) {
      Swal.fire("تم", "✅ تم نشر طلب التبادل بنجاح", "success");

      document.getElementById("modalPostForm").reset();
      loadBookExchangePosts(); // إعادة تحميل المنشورات

      // إغلاق المودال
      const modal = bootstrap.Modal.getInstance(document.getElementById("postModal"));
      if (modal) modal.hide();
    } else {
      Swal.fire("خطأ", "❌ حدث خطأ أثناء النشر", "error");
    }

  } catch (err) {
    console.error("خطأ:", err);
    Swal.fire("خطأ", "❌ فشل الاتصال بالخادم", "error");
  }
});

// تحميل المنشورات عند فتح الصفحة
loadBookExchangePosts();

// // دالة placeholder لزر الدردشة
// function startChat(currentUserId, targetUserName) {
//   alert(`بدء محادثة مع ${targetUserName}`);
// }

///////////////اظهار الخيار المختار على الزر /////////////////
function selectOption(optionText) {
  document.getElementById("mainButton").textContent = optionText;
}


///////////////اظهار الخيار المختار على الزر /////////////////
function selectOption(optionText) {
    document.getElementById('mainButton').textContent = optionText;
  }







////////////////////////////////
///////////ترتيب الجمل/////////////////


const textarea1 = document.getElementById('myTextarea1');
const textarea2 = document.getElementById('myTextarea2');

const output1 = document.getElementById('output-1');
const output2 = document.getElementById('output-2');

// السماح بالنزول لسطر جديد عند Enter أو Space
textarea1.addEventListener('keydown', function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    insertNewLine();
  } else if (event.key === " ") {
    event.preventDefault();
    insertNewLine();
  }
});

textarea2.addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      insertNewLine2();
    } else if (event.key === " ") {
      event.preventDefault();
      insertNewLine2();
    }
  });


function sendText() {

    const lines1 = textarea1.value.trim().split('\n');
    const lines2 = textarea2.value.trim().split('\n');

    output1.innerHTML = ''; // تفريغ الإخراج
    lines1.forEach(line => {
      if (line.trim() !== '') {
        const div = document.createElement('div');
        div.className = 'line';
        div.textContent = line.trim();
        output1.appendChild(div);
      }
    });
    textarea1.value = ''; // تفريغ textarea بعد الإرسال

    output2.innerHTML = ''; // تفريغ الإخراج
    lines2.forEach(line => {
      if (line.trim() !== '') {
        const div = document.createElement('div');
        div.className = 'line';
        div.textContent = line.trim();
        output2.appendChild(div);
      }
    });
    textarea2.value = ''; // تفريغ textarea بعد الإرسال


  }


      function insertNewLine() {
        const start = textarea1.selectionStart;
        const end = textarea1.selectionEnd;
        const text = textarea1.value;
        const before = text.substring(0, start);
        const after = text.substring(end);
        textarea1.value = before + '\n' + after;
        textarea1.selectionStart = textarea1.selectionEnd = start + 1;

      }

      function insertNewLine2() {
        const start = textarea2.selectionStart;
        const end = textarea2.selectionEnd;
        const text = textarea2.value;
        const before = text.substring(0, start);
        const after = text.substring(end);
        textarea2.value = before + '\n' + after;
        textarea2.selectionStart = textarea2.selectionEnd = start + 1;
      }



/////////////////////////////////



    //**************************************************************** */
    
    // كبسة اختيار التخصص

    function toggleDropdown() {
        var dropdownContent = document.querySelector('.dropdown-content');
        
        // التبديل بين إظهار وإخفاء القائمة المنسدلة
        if (dropdownContent.style.display === "block") {
            dropdownContent.style.display = "none";
        } else {
            dropdownContent.style.display = "block";
        }
    }

    //
    
    
    // /////////////////////جلب اليوزر من الداتا/////////////////////////
    // const userId = localStorage.getItem('userId');
    // console.log(userId);
    // //////////////////////////////////////////////


    /////////////لإضافة الوظيفة لزر الـ "chat"///////////////

    document.addEventListener('DOMContentLoaded', () => {
        const chatButton = document.querySelector('.chat-button');
    
        chatButton.addEventListener('click', () => {
            alert('Starting chat with Aevar...'); // يمكن تغيير هذه الوظيفة حسب الحاجة
        });
    });

    
    ////////////////////تخزين البيانات واعداد العناصر////////////////////
        document.addEventListener('DOMContentLoaded', () => {
            // الحصول على العناصر
            const chatButton = document.querySelector('.chat-button');
            const majorElement = document.querySelector('.major');
            const userElement = document.querySelector('.user');
            const descriptionElement = document.querySelector('.Description');
            const userIcon = document.querySelector('.Usericon img');
            const posts = []; // مصفوفة لتخزين المنشورات

     //احضار اسم وemail المستخدم الحالي وح
    const renderUserDetails = async () => {
            const response = await fetch(`https://localhost:7259/api/User/id?id=${userId}`);
            const userData = await response.json();
            document.getElementById('p-email').textContent=userData.email;
            document.getElementById('p-username').textContent=userData.name;
    };
    renderUserDetails();
    ///////////////////////////////////////
    

    ////////////عرض المنشورات////////////
    let allPosts = [];  // مصفوفة لتخزين جميع المنتجات
    const postsList = document.getElementById('postsList'); // حاوية المنتجات
    const filterButtons = document.querySelectorAll('.filter-btn'); // جميع أزرار التصفية
    

    //////////////////////////////////////
    // دالة لعرض المنتجات المضافة من الـ API
    const renderPosts = async () => {
        postsList.innerHTML = ''; // تفريغ المحتوى الحالي
    
        try {
            // جلب جميع المنتجات من الـ API مرة واحدة
            const response = await fetch('https://localhost:7259/api/Product');
            allPosts = await response.json(); // تخزين جميع المنتجات في الذاكرة
    
            // عرض جميع المنتجات عند تحميل الصفحة
            displayPosts(allPosts); // عرض المنتجات
        } catch (error) {
            console.error('Error fetching products:', error.message);
            alert('حدث خطأ أثناء استرجاع المنتجات');
        }
    };

//////////////////////////////

// دالة لعرض البطاقة باستخدام بيانات المستخدم
const renderCard = (user) => {
    const postsList = document.getElementById('postsList'); // حاوية المنتجات

    // إنشاء عنصر جديد لتمثيل البطاقة
    const postElement = document.createElement('div');
    postElement.className = 'card-study'; // إضافة الكلاس الخاص بالكارد

   

    // إضافة البطاقة إلى حاوية المنشورات
    postsList.appendChild(postElement);

    // إضافة وظيفة عند الضغط على زر "chat"
    const chatButton = postElement.querySelector('.chat-button');
    chatButton.addEventListener('click', () => {
        alert(`بدأت محادثة مع ${user.username || 'المستخدم'}`); // رسالة عند الضغط على زر chat
    });
};

// مثال على كيفية استدعاء الدالة لعرض بطاقة مستخدم
const sampleUser = {
    profileImage: 'صورة لينكدان.jpg',
    major: 'CIS',
    username: 'Aevar',
    description: 'وصف المستخدم هنا.',
};
 // تعيين المحتوى داخل البطاقة باستخدام بيانات المستخدم
 postElement.innerHTML = `
 <div class="imge">
     <div class="Usericon">
         <img src="${user.profileImage || 'صورة لينكدان.jpg'}" alt="no picture">
     </div>
     <p class="major">${user.major || ''}</p>
     <p class="user">${user.username || ''}</p>
 </div>

 <div class="Description">${user.description || ''}</div>

 <div>
     <button class="chat-button">chat</button>
 </div>
`;

renderCard(sampleUser); // استدعاء الدالة لعرض البطاقة



///////////////////////////////////////////////////////


    // دالة لعرض المنتجات
    const displayPosts = (posts) => {
        postsList.innerHTML = ''; // تفريغ المحتوى الحالي
        posts.forEach((post) => {
            const postElement = document.createElement('div');
            postElement.className = 'card-study'; // استخدام الكلاس الخاص بالكارد
    
            postElement.innerHTML = `
                <div class="imge">
                    <div class="Usericon">
                        <img src="${post.profileImage || 'صورة لينكدان.jpg'}" alt="no picthur">
                    </div>
                    <p class="major">${post.major || 'CIS'}</p>
                    <p class="user">${post.username || 'Aevar'}</p>
                </div>
    
                <div class="Description">${post.description || 'sssssssssssssss'}</div>
    
                <div>
                    <button class="chat-button">chat</button>
                </div>
            `;
              
            postsList.appendChild(postElement);
         
        });
    };
    /////////////////////////////////////////////////////////
    
    
     
    // استدعاء الدالة عند تحميل الصفحة
    renderPosts();
    
    ////////////////////////////////
    // عند إضافة المنتج، نقوم بتحديث عرض المنتجات
           
        modalPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
    
            const formData = new FormData();
            formData.append("Name", modalTitleInput.value);
            formData.append("caption", modalDescriptionInput.value);
            formData.append("userId", userId); // استبدل بـ userId الديناميكي
           
            try {
                const response = await fetch("https://localhost:7259/api/Product/add-product", {
                    method: "POST",
                    body: formData
                });
    
                if (!response.ok) {
                    throw new Error("Failed to save post.");
                }
    
                const result = await response.json();
                alert("Product created successfully!");
    
                // إعادة تحميل المنتجات بعد إضافة المنتج الجديد
                posts.push(result);
                modalPostForm.reset();
                postModal.hide();
                renderPosts(); // تحديث عرض المنتجات بعد الإضافة
    
            } catch (error) {
                console.error("Error posting data:", error.message);
                alert(`Error: ${error.message}`);
            }
        });
    
    }); 
    
    
    var dropdownBtn = document.querySelector(".dropbtn");
var dropdownContent = document.querySelector(".dropdown-content");

// أضف مستمع حدث للنقر على الزر
dropdownBtn.addEventListener("click", function() {
  // قم بتبديل فئة لإظهار/إخفاء المحتوى
  dropdownContent.classList.toggle("show");
});


// أغلق القائمة المنسدلة إذا نقر المستخدم في أي مكان خارجها
window.addEventListener("click", function(event) {
  if (!event.target.matches('.dropbtn')) {
    if (dropdownContent.classList.contains('show')) {
      dropdownContent.classList.remove('show');
    }
  }
});
