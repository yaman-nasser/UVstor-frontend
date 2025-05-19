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

    

      const isMyPost = Number(post.userId) === Number(userId);
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
      ${isMyPost ? `
        <button class="btn btn-danger btn-delete" onclick="confirmDelete(${post.id}, ${userId})">
          <i class="fas fa-trash-alt ml-2"></i> حذف
        </button>` : ""}
        
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
async function deletePost(postId, userId) {
  try {
    const response = await fetch(
      `https://localhost:7259/api/BookExchange/${postId}?userId=${userId}`,
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
