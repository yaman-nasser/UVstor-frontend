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

function startChat(currentUserId, postUserId) {
  console.log(currentUserId, postUserId);
  // توجه لصفحة الدردشة مع تمرير المعرفين في الرابط
  window.location.href = `https://localhost:7259/chat.html?userId=${currentUserId}&otherUserId=${postUserId}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const modalPostForm = document.getElementById("modalPostForm");
  const modalTitleInput = document.getElementById("modalTitleInput");
  const modalDescriptionInput = document.getElementById(
    "modalDescriptionInput"
  );
  const modalPriceInput = document.getElementById("modalPriceInput");
  const modalPhoneInput = document.getElementById("modalPhoneInput");
  const modalCategoryInput = document.getElementById("modalCategoryInput");
  const modalImageInput = document.getElementById("modalImageInput");
  const postModal = new bootstrap.Modal(document.getElementById("postModal"));
  const viewPostContent = document.getElementById("viewPostContent");
  const viewPostModal = new bootstrap.Modal(
    document.getElementById("viewPostModal")
  );
  const posts = []; // مصفوفة لتخزين المنشورات

  //احضار اسم وemail المستخدم الحالي وح
  const renderUserDetails = async () => {
    try {
      const response = await fetch(`https://localhost:7259/api/User/${userId}`);
      const userData = await response.json();

      document.getElementById("p-email").textContent = userData.email;
      document.getElementById("p-username").textContent = userData.name;

      // إضافة الصورة الشخصية إن وُجدت
      const imgContainer = document.getElementById("p-image");
      if (userData.profileImage) {
        const img = document.createElement("img");
        img.src = `data:${userData.profileImage.contentType};base64,${userData.profileImage.imageBase64}`;
        img.alt = "Profile Image";
        img.style.width = "50px";
        img.style.height = "50px";
        img.style.borderRadius = "50%";
        img.style.objectFit = "cover";
        img.style.border = "2px solid #ccc";
        imgContainer.innerHTML = ""; // تنظيف أي محتوى قديم
        imgContainer.appendChild(img);
      } else {
        imgContainer.innerHTML =
          "<img src='1dece2c8357bdd7cee3b15036344faf5.jpg' alt='default image' style='width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #ccc;'/>";
      }
    } catch (err) {
      console.error("فشل تحميل بيانات المستخدم:", err);
    }
  };

  renderUserDetails();

  let allPosts = []; // مصفوفة لتخزين جميع المنتجات
  const postsList = document.getElementById("postsList"); // حاوية المنتجات
  const filterButtons = document.querySelectorAll(".filter-btn"); // جميع أزرار التصفية

  // دالة لعرض المنتجات المضافة من الـ API
  const renderPosts = async () => {
    postsList.innerHTML = ""; // تفريغ المحتوى الحالي

    try {
      // جلب جميع المنتجات من الـ API مرة واحدة
      const response = await fetch(
        `https://localhost:7259/api/Product/All/?userId=${userId}`
      );
      allPosts = await response.json();
      console.log(allPosts);
      displayPosts(allPosts);
    } catch (error) {
      console.error("Error fetching products:", error.message);
      alert("حدث خطأ أثناء استرجاع المنتجات");
    }
  };

  // دالة لعرض المنتجات
  const displayPosts = (posts) => {
    postsList.innerHTML = "";
    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.className = "post-card card shadow-sm";
      postElement.innerHTML = `
            <div class="body-post row g-0">
                <div class="body-picture col-md-4">

                <button class="btn btn-info open-modal-btn mt-2">عرض التفاصيل</button>
                    
                   
                 <!-- Carousel -->
                    <div id="carousel-${
                      post.id
                    }" class="carousel slide" data-bs-ride="carousel">
                        <div class="carousel-inner">
                            ${post.images
                              .map(
                                (image, index) => `
                                <div class="carousel-item ${
                                  index === 0 ? "active" : ""
                                }">
                                    <div class="image-wrapper">
                                        <img src="data:image/${
                                          image.contentType
                                        };base64,${image.imageBase64}" alt="${
                                  image.name
                                }" class="d-block w-100 resize-image">
                                    </div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${
                          post.id
                        }" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#carousel-${
                          post.id
                        }" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                  <!-- أيقونة القلب لإضافة المنتج إلى المفضلة -->
                   <button class="btn favorite-btn" data-product-id="${
                     post.id
                   }">
            <i class="bi ${
              post.isLiked ? "bi-heart-fill liked" : "bi-heart"
            } heart-icon"></i>
          </button>
                    <h6 style="color:#d2d2d2;" class="card-title">${
                      post.name
                    }</h6>
                    <p rows="5" cols="30" class="card-text">${post.caption}</p>
                    <p class="text-primary">رقم الهاتف: ${post.pHnum}</p>
                    <p class="text-price">السعر: ${post.price} دينار</p>

                      <button class="btn btn-primary btn-sm chat-modal" onclick="startChat(${userId}, ${post.userId})">
                          مراسلة <i class="fas fa-comment-dots"></i>
                      </button>

                </div>

            </div>


      `;
      postsList.appendChild(postElement);

      // بعد إنشاء postElement وإضافته للـ DOM
      const openBtn = postElement.querySelector(".open-modal-btn");
      openBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // يمنع الفقاعة (bubble) لو في أحداث أخرى
        openPostModal(post);
      });

      function openPostModal(post) {
        viewPostContent.innerHTML = `
    <div class="row g-0">
        <div class="col-md-6">
            <div class="d-flex flex-wrap gap-2 justify-content-center">
                ${post.images
                  .map(
                    (image) => `
                    <img src="data:image/${image.contentType};base64,${image.imageBase64}" 
                         class="img-fluid" style="max-width: 48%; border-radius: 8px;" 
                         alt="${image.name}">
                `
                  )
                  .join("")}
            </div>
        </div>
        <div class="col-md-6 p-3">
            <h5>${post.name}</h5>
            <p style="font-size: 18px; color: #333; font-weight: 500; font-family: Arial, sans-serif;">
                 ${post.caption}
            </p>
            <p class="text-success">  السعر: ${post.price} دينار</p>


            
          <p style="color: black; font-size: 15px;">رقم الهاتف: ${
            post.pHnum
          }</p>

            <p style="color: black; font-size: 15px;"  > النوع: ${post.type}</p>
            
        </div>
    </div>



 <div>
  <h6>التقييم الكلي:</h6>
  <div id="averageRatingWrapper" class="d-flex align-items-center gap-2">
    <div id="averageRatingStars"></div>
    <span id="averageRatingValue" style="font-weight: bold;"></span>
  </div>
  <small id="ratingCount" style="color: gray;"></small>

  <button id="rateButton" class="btn btn-warning btn-sm mt-2">قيّم المنتج</button>

  </div>
</div>


    

      <div class="comments-section">
  <h4>التعليقات:</h4>

  <div id="modalCommentsList" style="border: 1px solid #ddd; padding: 10px; border-radius: 6px; background-color: #f9f9f9;">
    <!-- التعليقات تنضاف هنا -->
  </div>

  <a href="#" id="toggleCommentsLink" style="display: none; margin-top: 10px; color: #00b4be; cursor: pointer;">عرض المزيد</a>

  <form id="modalAddCommentForm" class="mt-3">
    <div class="mb-3">
      <textarea id="modalCommentText" class="form-control" placeholder="اكتب تعليقك..."></textarea>
    </div>
    <button type="submit" class="btn" style="background-color: #00b4be; color: white;">إضافة تعليق</button>
  </form>
</div>


            `;

        // تحميل التعليقات من الـ API
        fetch(`https://localhost:7259/api/Comment/product/${post.id}`)
          .then((res) => res.json())
          .then((comments) => {
            const container = document.getElementById("modalCommentsList");
            const toggleLink = document.getElementById("toggleCommentsLink");

            const maxInitial = 3;
            let showingAll = false;

            function render(limit) {
              container.innerHTML = "";

              const visibleComments = comments.slice(0, limit);
              visibleComments.forEach((comment) => {
                const commentItem = document.createElement("div");
                commentItem.classList.add("comment-item", "p-3", "mb-3");
                commentItem.style.border = "1px solid #ddd";
                commentItem.style.borderRadius = "8px";
                commentItem.style.backgroundColor = "#fff";

                const createdAt = new Date(comment.createdAt).toLocaleString(
                  "ar-EG",
                  {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

                const isOwner = Number(comment.userId) === Number(userId);

                commentItem.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #0d234b;">${comment.name}</strong>
            ${
              isOwner
                ? `<button class="btn btn-sm btn-danger delete-comment-btn" data-id="${comment.id}">🗑️</button>`
                : ""
            }
          </div>
          <p style="font-size: 16px; color: #212529; margin: 5px 0;">${
            comment.content
          }</p>
          <small style="color: #888;">${createdAt}</small>
        `;

                container.appendChild(commentItem);
              });

              // تفعيل أزرار الحذف (إن وجدت)
              document
                .querySelectorAll(".delete-comment-btn")
                .forEach((btn) => {
                  btn.addEventListener("click", async () => {
                    const commentId = btn.getAttribute("data-id");
                    const result = await Swal.fire({
                      title: "هل أنت متأكد؟",
                      text: "سيتم حذف هذا التعليق نهائيًا.",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#d33",
                      cancelButtonText: "إلغاء",
                      confirmButtonText: "نعم، احذف",
                    });

                    if (result.isConfirmed) {
                      const res = await fetch(
                        `https://localhost:7259/api/Comment/${commentId}`,
                        {
                          method: "DELETE",
                        }
                      );

                      if (res.ok) {
                        Swal.fire("تم!", "تم حذف التعليق.", "success");
                        openPostModal(post); // إعادة التحميل
                      } else {
                        Swal.fire("خطأ", "فشل حذف التعليق.", "error");
                      }
                    }
                  });
                });
            }

            // عرض أول 3 تعليقات فقط
            render(maxInitial);

            // تفعيل رابط "عرض المزيد" إذا وُجد أكثر من 3
            if (comments.length > maxInitial) {
              toggleLink.style.display = "block";

              toggleLink.onclick = (e) => {
                e.preventDefault();
                if (!showingAll) {
                  render(comments.length);
                  toggleLink.textContent = "عرض أقل";
                  showingAll = true;
                } else {
                  render(maxInitial);
                  toggleLink.textContent = "عرض المزيد";
                  showingAll = false;
                }
              };
            } else {
              toggleLink.style.display = "none";
            }
          });

        // إرسال تعليق جديد
        document
          .getElementById("modalAddCommentForm")
          .addEventListener("submit", function (e) {
            e.preventDefault();
            const commentText =
              document.getElementById("modalCommentText").value;
            if (commentText.trim() === "") return;

            const comment = {
              userId: userId,
              productId: post.id,
              content: commentText,
            };

            fetch("https://localhost:7259/api/Comment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(comment),
            }).then((res) => {
              if (res.ok) {
                openPostModal(post); // تحديث
              }
            });
          });

        // عرض التقييم الكلي
        fetch(`https://localhost:7259/api/Product/${post.id}/average-rating`)
          .then((res) => res.json())
          .then((data) => {
            const starsContainer =
              document.getElementById("averageRatingStars");
            const ratingText = document.getElementById("averageRatingValue");
            const countText = document.getElementById("ratingCount");

            const rounded = Math.round(data.average);

            starsContainer.innerHTML = [...Array(5)]
              .map(
                (_, i) => `
      <span style="font-size: 20px; color: ${
        i < rounded ? "#FFD700" : "#ccc"
      };">&#9733;</span>
    `
              )
              .join("");

            ratingText.textContent = data.average.toFixed(1);
            countText.textContent = `من ${data.count} مستخدم${
              data.count === 1 ? "" : "ين"
            }`;
          });

        document.getElementById("rateButton").addEventListener("click", () => {
          Swal.fire({
            title: "قيّم المنتج",
            html: `
      <div class="rating" style="display: flex; justify-content: center; gap: 10px; direction: rtl;">
        ${[5, 4, 3, 2, 1]
          .map(
            (val) => `
          <input type="radio" id="swal-star${val}" name="swal-rating" value="${val}" hidden />
          <label for="swal-star${val}" style="font-size: 30px; color: #ccc; cursor: pointer;">&#9733;</label>
        `
          )
          .join("")}
      </div>
    `,
            showCancelButton: true,
            confirmButtonText: "إرسال التقييم",
            preConfirm: () => {
              const selected = document.querySelector(
                'input[name="swal-rating"]:checked'
              );
              if (!selected) {
                Swal.showValidationMessage("يرجى اختيار تقييم");
                return false;
              }
              return parseInt(selected.value);
            },
          }).then((result) => {
            if (result.isConfirmed) {
              const ratingValue = result.value;

              fetch("https://localhost:7259/api/Product/rate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  productId: post.id,
                  userId: userId,
                  rating: ratingValue,
                }),
              }).then((res) => {
                if (res.ok) {
                  Swal.fire(
                    "✅ تم!",
                    `تم التقييم بـ ${ratingValue} نجوم`,
                    "success"
                  );
                  openPostModal(post); // إعادة تحميل المودال لتحديث التقييم الكلي
                } else {
                  Swal.fire("❌ خطأ", "فشل إرسال التقييم", "error");
                }
              });
            }
          });

          setTimeout(() => {
            const labels = document.querySelectorAll(".rating label");
            labels.forEach((label, index) => {
              label.addEventListener("click", () => {
                const value = parseInt(
                  label.getAttribute("for").replace("swal-star", "")
                );

                // نلوّن النجوم من اليمين لليسار حسب القيمة المختارة
                labels.forEach((l, i) => {
                  const currentValue = parseInt(
                    l.getAttribute("for").replace("swal-star", "")
                  );
                  l.style.color = currentValue <= value ? "#00b4be" : "#ccc";
                });

                // تأشير النجمة المختارة
                document.getElementById(`swal-star${value}`).checked = true;
              });
            });
          }, 100);
        });

        viewPostModal.show();
      }

      // زر المفضلة
      const favoriteBtn = postElement.querySelector(".favorite-btn");
      const heartIcon = favoriteBtn.querySelector("i");

      favoriteBtn.addEventListener("click", async () => {
        const productId = favoriteBtn.getAttribute("data-product-id");

        try {
          const res = await fetch(
            "https://localhost:7259/api/User/ToggleLike",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, productId }),
            }
          );

          const message = await res.text();
          if (res.ok) {
            heartIcon.classList.toggle("bi-heart-fill");
            heartIcon.classList.toggle("bi-heart");
            heartIcon.classList.toggle("liked");
            alert(
              `تم ${
                heartIcon.classList.contains("liked") ? "إضافة" : "إزالة"
              } المنتج من المفضلة`
            );
          } else {
            alert(`خطأ: ${message}`);
          }
        } catch (error) {
          console.error("فشل الاتصال بـ API:", error);
          alert("حدث خطأ عند إضافة/إزالة المفضلة");
        }
      });
    });
  };

  // تصفية المنتجات عند الضغط على الأزرار
  filterButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      // إزالة الكلاس "active" من جميع الأزرار
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // إضافة الكلاس "active" على الزر الذي تم الضغط عليه
      event.target.classList.add("active");

      // الحصول على النوع المحدد
      const filterValue = event.target.getAttribute("data-filter");

      // تصفية البيانات بناءً على النوع المحدد
      if (filterValue === "all") {
        displayPosts(allPosts); // عرض جميع المنتجات
      } else {
        const filteredPosts = allPosts.filter(
          (post) => post.type === filterValue
        );
        displayPosts(filteredPosts); // عرض المنتجات التي تطابق النوع المحدد
      }
    });
  });

  // استدعاء الدالة عند تحميل الصفحة
  renderPosts();

  // عند إضافة المنتج، نقوم بتحديث عرض المنتجات

  modalPostForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const imageFile = modalImageInput.files[0];
    if (!imageFile) {
      alert("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("Name", modalTitleInput.value);
    formData.append("caption", modalDescriptionInput.value);
    formData.append("price", modalPriceInput.value);
    formData.append("PHnum", modalPhoneInput.value);
    formData.append("type", modalCategoryInput.value);
    formData.append("userId", userId); // استبدل بـ userId الديناميكي
    // formData.append("images", imageFile);

    // إضافة الصور من المصفوفة إلى FormData
    for (let i = 0; i < selectedImages.length; i++) {
      formData.append("images", selectedImages[i]);
    }
    try {
      const response = await fetch(
        "https://localhost:7259/api/Product/add-product",
        {
          method: "POST",
          body: formData,
        }
      );

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

  /****************logout**********************/
  // حدد العنصر
  const logoutLi = document.getElementById("logout-li");

  // أضف مستمع حدث للنقر
  logoutLi.addEventListener("click", () => {
    // أظهر نافذة تأكيد
    const confirmation = confirm("هل تريد تسجيل الخروج من الحساب؟");

    if (confirmation) {
      // إذا اختار "موافق"، أعد التوجيه إلى صفحة تسجيل الخروج
      location.href = "main.html"; // استبدل 'logout.html' بعنوان صفحة تسجيل الخروج أو أي إجراء آخر
    }
  });
});
