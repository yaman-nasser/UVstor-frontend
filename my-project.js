document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  console.log("userId:", userId);

  // لا حاجة لجلب بيانات المستخدم
  fetchUserPosts(userId);
  LikedProducts(userId);
});

// Sidebar toggle
function togglesubmenu(button) {
  button.nextElementSibling.classList.toggle("show");
  button.classList.toggle("rotate");
}

// جلب منشورات المستخدم
async function fetchUserPosts(userId) {
  try {
    const response = await fetch(`https://localhost:7259/api/User/${userId}`);
    if (!response.ok) throw new Error("فشل في جلب منشورات المستخدم");

    const data = await response.json();
    populatePostDivs(data.products);
  } catch (error) {
    console.error("خطأ أثناء جلب المنشورات:", error);
    alert("فشل تحميل المنشورات. حاول لاحقاً.");
  }
}

const postsList = document.getElementById("postsList");

function populatePostDivs(posts) {
  postsList.innerHTML = "";

  posts.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "post-card card shadow-sm";

    postElement.innerHTML = `
      <div class="body-post row g-0">
        <div class="body-picture col-md-4">
          <div id="carousel-${post.id}" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
              ${post.images.map((image, index) => `
                <div class="carousel-item ${index === 0 ? "active" : ""}">
                  <div class="image-wrapper">
                    <img src="data:image/${image.contentType};base64,${image.imageBase64}" alt="${image.name}" class="d-block w-100 resize-image">
                  </div>
                </div>`).join("")}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${post.id}" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">السابق</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carousel-${post.id}" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">التالي</span>
            </button>
          </div>
        </div>
        <div class="card-body">
          <h6 style="color:#d2d2d2;" class="card-title">${post.name}</h6>
          <p class="card-text">${post.caption}</p>
          <p class="text-primary">رقم الهاتف: ${post.pHnum}</p>
          <p class="text-price">السعر: ${post.price} دينار</p>
          <p class="text-type">النوع: ${post.type}</p>

          <button type="button" class="btn btn-success btnclass-up edit-btn" 
                    data-post-id="${post.id}" 
                    data-bs-toggle="modal" data-bs-target="#postModal">
                        تعديل
                    </button>
                     <button type="button" class="btn btn-danger delete-btn btnclass-del" 
                        data-post-id="${post.id}">
                        حذف
                    </button>
        </div>
      </div>
    `;

    postsList.appendChild(postElement);

    // حذف المنشور
    const deleteBtn = postElement.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", async () => {
      const postId = deleteBtn.getAttribute("data-post-id");

      try {
        const response = await fetch(`https://localhost:7259/api/Product/${postId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          postElement.remove();
          Swal.fire("تم", "✅ تم حذف المنتج بنجاح", "success");
        } else {
          Swal.fire("خطأ", "❌ فشل في حذف المنتج", "error");
        }
      } catch (error) {
        console.error("خطأ:", error);
        Swal.fire("خطأ", "❌ حدث خطأ أثناء الحذف", "error");
      }
    });

    // فتح المودال للتعديل
    const editBtn = postElement.querySelector(".edit-btn");
    editBtn.addEventListener("click", () => {
      openEditModal(post.id, post);
    });
  });
}

// فتح مودال التعديل
function openEditModal(postId, post) {
  const userId = localStorage.getItem("userId");

  document.getElementById("modalTitleInput").value = post.name;
  document.getElementById("modalDescriptionInput").value = post.caption;
  document.getElementById("modalPriceInput").value = post.price;
  document.getElementById("modalPhoneInput").value = post.pHnum;
  document.getElementById("modalCategoryInput").value = post.type;

  const imageInput = document.getElementById("modalImageInput");
  const imagesContainer = document.getElementById("imagesContainer");
  const selectedImages = [];

  imagesContainer.innerHTML = "";

  post.images?.forEach((image) => {
    const imageItem = document.createElement("div");
    imageItem.classList.add("image-item");
    imageItem.innerHTML = `
      <img src="data:image/${image.contentType};base64,${image.imageBase64}" alt="${image.name}">
      <i class="bi bi-x-circle remove-icon" onclick="removeImage(this)"></i>`;
    imagesContainer.appendChild(imageItem);
  });

  imageInput.addEventListener("change", () => {
    const files = imageInput.files;
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageItem = document.createElement("div");
          imageItem.classList.add("image-item");
          imageItem.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
            <i class="bi bi-x-circle remove-icon" onclick="removeImage(this)"></i>`;
          imagesContainer.appendChild(imageItem);
          selectedImages.push(file);
        };
        reader.readAsDataURL(file);
      }
    }
  });

  const modalForm = document.getElementById("modalPostForm");
  modalForm.onsubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", document.getElementById("modalTitleInput").value);
    formData.append("caption", document.getElementById("modalDescriptionInput").value);
    formData.append("price", parseFloat(document.getElementById("modalPriceInput").value));
    formData.append("pHnum", document.getElementById("modalPhoneInput").value);
    formData.append("type", document.getElementById("modalCategoryInput").value);
    formData.append("userId", userId);

    selectedImages.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(`https://localhost:7259/api/Product/${postId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        alert("تم تعديل المنشور بنجاح.");
        location.reload();
      } else {
        const error = await response.text();
        alert(`خطأ أثناء تعديل المنشور: ${error}`);
      }
    } catch (error) {
      console.error("خطأ أثناء الاتصال بـ API:", error);
      alert("حدث خطأ أثناء تعديل المنشور.");
    }
  };
}

// جلب المنتجات المفضلة
async function LikedProducts(userId) {
  try {
    const response = await fetch(`https://localhost:7259/api/User/GetLikedProducts/${userId}`);
    if (!response.ok) throw new Error("فشل في جلب المفضلة");

    const data = await response.json();
    addPostDivs(data);
  } catch (error) {
    console.error("خطأ أثناء جلب المفضلة:", error);
  }
}

const postsListfav = document.getElementById("postsListfav");

function addPostDivs(posts) {
  postsListfav.innerHTML = "";

  posts.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "post-card card shadow-sm";

    postElement.innerHTML = `
      <div class="body-post row g-0">
        <div class="body-picture col-md-4">
          <div id="carousel-${post.id}" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
              ${post.images.map((image, index) => `
                <div class="carousel-item ${index === 0 ? "active" : ""}">
                  <div class="image-wrapper">
                    <img src="data:image/${image.contentType};base64,${image.imageBase64}" alt="${image.name}" class="d-block w-100 resize-image">
                  </div>
                </div>`).join("")}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${post.id}" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">السابق</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carousel-${post.id}" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">التالي</span>
            </button>
          </div>
        </div>
        <div class="card-body">
          <h6 style="color:#d2d2d2;" class="card-title">${post.name}</h6>
          <p class="card-text">${post.caption}</p>
          <p class="text-primary">رقم الهاتف: ${post.pHnum}</p>
          <p class="text-price">السعر: ${post.price} دينار</p>
          <p class="text-type">النوع: ${post.type}</p>
        </div>
      </div>`;
    postsListfav.appendChild(postElement);
  });
}
