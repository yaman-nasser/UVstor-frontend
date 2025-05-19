// Admin Dashboard - Products Management
// Handles displaying and managing all user products

// Sidebar functionality
function toggleSubmenu(button) {
  button.nextElementSibling.classList.toggle("show");
  button.classList.toggle("rotate");
}

function refreshButton() {
  location.reload();
}

// Get admin user ID from localStorage
const adminId = localStorage.getItem('userId');
console.log("Admin ID:", adminId);

// Function to start chat with product owner
function startChat(adminId, productUserId) {
  console.log("Starting chat between:", adminId, productUserId);
  // Redirect to chat page with both IDs in the URL
  window.location.href = `https://localhost:7259/chat.html?userId=${adminId}&otherUserId=${productUserId}`;
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI elements
  const modalPostForm = document.getElementById("modalPostForm");
  const modalTitleInput = document.getElementById("modalTitleInput");
  const modalDescriptionInput = document.getElementById("modalDescriptionInput");
  const modalPriceInput = document.getElementById("modalPriceInput");
  const modalPhoneInput = document.getElementById("modalPhoneInput");
  const modalCategoryInput = document.getElementById("modalCategoryInput");
  const modalImageInput = document.getElementById("modalImageInput");
  const postModal = new bootstrap.Modal(document.getElementById("postModal"));
  const viewPostContent = document.getElementById("viewPostContent");
  const viewPostModal = new bootstrap.Modal(document.getElementById("viewPostModal"));
  
  // Global arrays to store data
  let allPosts = []; // Array to store all products
  let selectedImages = []; // Array to store selected images for adding new products
  
  // Get DOM elements
  const postsList = document.getElementById("postsList"); // Products container
  const filterButtons = document.querySelectorAll(".filter-btn"); // Filter buttons

  

  // Function to fetch and display products from API
  const renderPosts = async () => {
    postsList.innerHTML = ""; // Clear current content

    try {
      // Fetch all products from API once
      const response = await fetch(`https://localhost:7259/api/Product/All?userId=${adminId}`);
      allPosts = await response.json();
      console.log("All products loaded:", allPosts);
      displayPosts(allPosts);
    } catch (error) {
      console.error("Error fetching products:", error.message);
      alert("Error retrieving products");
    }
  };

  // Function to display products
  const displayPosts = (posts) => {
    postsList.innerHTML = "";
    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.className = "post-card card shadow-sm";
      postElement.innerHTML = `
        <div class="body-post row g-0">
            <div class="body-picture col-md-4">
                <button class="btn btn-info open-modal-btn mt-2">Show Details</button>
                
                <!-- Carousel -->
                <div id="carousel-${post.id}" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        ${post.images
                          .map(
                            (image, index) => `
                            <div class="carousel-item ${index === 0 ? "active" : ""}">
                                <div class="image-wrapper">
                                    <img src="data:image/${image.contentType};base64,${image.imageBase64}" 
                                         alt="${image.name}" 
                                         class="d-block w-100 resize-image">
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${post.id}" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carousel-${post.id}" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
            </div>
            <div class="card-body">
               
                
                <h6 style="color:#d2d2d2;" class="card-title">${post.name}</h6>
                <p rows="5" cols="30" class="card-text">${post.caption}</p>
                <p class="text-primary">Phone: ${post.pHnum}</p>
                <p class="text-price">Price: ${post.price} JD</p>

                <!-- Chat Button -->
                <button class="btn btn-primary btn-sm chat-modal" onclick="startChat('${adminId}', '${post.userId}')">
                    Message <i class="fas fa-comment-dots"></i>
                </button>
                
                <!-- Admin Action Buttons -->
                <div class="mt-2">
                    <button class="btn btn-warning btn-sm edit-product" data-product-id="${post.id}">
                        Edit <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-product btnclass-del" data-product-id="${post.id}">
                        Delete <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
      `;
      
      postsList.appendChild(postElement);

      // Add event listener for "Show Details" button
      const openBtn = postElement.querySelector(".open-modal-btn");
      openBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event bubbling
        openPostModal(post);
      });
      
      // Add event listener for "Edit Product" button
      const editBtn = postElement.querySelector(".edit-product");
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        editProduct(post);
      });
      
      // Add event listener for "Delete Product" button
      const deleteBtn = postElement.querySelector(".delete-product");
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteProduct(post.id);
      });
      
     

       
    });
  };

  // Function to open post details modal
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
              <p class="text-success">Price: ${post.price} JD</p>
              <p style="color: black; font-size: 15px;">Phone Number: ${post.pHnum}</p>
              <p style="color: black; font-size: 15px;">Category: ${post.type}</p>
              <p style="color: black; font-size: 15px;">Seller ID: ${post.userId}</p>
          </div>
      </div>

      <div>
        <h6>Overall Rating:</h6>
        <div id="averageRatingWrapper" class="d-flex align-items-center gap-2">
          <div id="averageRatingStars"></div>
          <span id="averageRatingValue" style="font-weight: bold;"></span>
        </div>
        <small id="ratingCount" style="color: gray;"></small>
        <button id="rateButton" class="btn btn-warning btn-sm mt-2">Rate Product</button>
      </div>

      <div class="comments-section mt-4">
        <h4>Comments:</h4>
        <div id="modalCommentsList" style="border: 1px solid #ddd; padding: 10px; border-radius: 6px; background-color: #f9f9f9;">
          <!-- Comments will be loaded here -->
        </div>
        <a href="#" id="toggleCommentsLink" style="display: none; margin-top: 10px; color: #00b4be; cursor: pointer;">Show More</a>

        <form id="modalAddCommentForm" class="mt-3">
          <div class="mb-3">
            <textarea id="modalCommentText" class="form-control" placeholder="Write your comment..."></textarea>
          </div>
          <button type="submit" class="btn" style="background-color: #00b4be; color: white;">Add Comment</button>
        </form>
      </div>
    `;

    // Load comments from API
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

            const createdAt = new Date(comment.createdAt).toLocaleString("ar-EG", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const isOwner = Number(comment.userId) === Number(adminId);
            // For admin, allow deleting any comment
            const canDelete = true;

            commentItem.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #0d234b;">${comment.name}</strong>
                ${canDelete ? `<button class="btn btn-sm btn-danger delete-comment-btn" data-id="${comment.id}">🗑️</button>` : ""}
              </div>
              <p style="font-size: 16px; color: #212529; margin: 5px 0;">${comment.content}</p>
              <small style="color: #888;">${createdAt}</small>
            `;

            container.appendChild(commentItem);
          });

          // Activate delete buttons (if any)
          document.querySelectorAll(".delete-comment-btn").forEach((btn) => {
            btn.addEventListener("click", async () => {
              const commentId = btn.getAttribute("data-id");
              const result = await Swal.fire({
                title: "Are you sure?",
                text: "This comment will be permanently deleted.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonText: "Cancel",
                confirmButtonText: "Yes, delete it",
              });

              if (result.isConfirmed) {
                const res = await fetch(`https://localhost:7259/api/Comment/${commentId}`, {
                  method: "DELETE",
                });

                if (res.ok) {
                  Swal.fire("Done!", "Comment deleted.", "success");
                  openPostModal(post); // Reload
                } else {
                  Swal.fire("Error", "Failed to delete comment.", "error");
                }
              }
            });
          });
        }

        // Show first 3 comments only
        render(maxInitial);

        // Enable "Show More" link if more than 3 comments
        if (comments.length > maxInitial) {
          toggleLink.style.display = "block";

          toggleLink.onclick = (e) => {
            e.preventDefault();
            if (!showingAll) {
              render(comments.length);
              toggleLink.textContent = "Show Less";
              showingAll = true;
            } else {
              render(maxInitial);
              toggleLink.textContent = "Show More";
              showingAll = false;
            }
          };
        } else {
          toggleLink.style.display = "none";
        }
      });

    // Handle new comment submission
    document.getElementById("modalAddCommentForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const commentText = document.getElementById("modalCommentText").value;
      if (commentText.trim() === "") return;

      const comment = {
        userId: adminId,
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
          openPostModal(post); // Refresh
        }
      });
    });

    // Show overall rating
    fetch(`https://localhost:7259/api/Product/${post.id}/average-rating`)
      .then((res) => res.json())
      .then((data) => {
        const starsContainer = document.getElementById("averageRatingStars");
        const ratingText = document.getElementById("averageRatingValue");
        const countText = document.getElementById("ratingCount");

        const rounded = Math.round(data.average);

        starsContainer.innerHTML = [...Array(5)]
          .map((_, i) => `
            <span style="font-size: 20px; color: ${i < rounded ? "#FFD700" : "#ccc"};">&#9733;</span>
          `)
          .join("");

        ratingText.textContent = data.average.toFixed(1);
        countText.textContent = `from ${data.count} user${data.count === 1 ? "" : "s"}`;
      });

    // Handle rating button click
    document.getElementById("rateButton").addEventListener("click", () => {
      Swal.fire({
        title: "Rate Product",
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
        confirmButtonText: "Submit Rating",
        preConfirm: () => {
          const selected = document.querySelector('input[name="swal-rating"]:checked');
          if (!selected) {
            Swal.showValidationMessage("Please select a rating");
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
              userId: adminId,
              rating: ratingValue,
            }),
          }).then((res) => {
            if (res.ok) {
              Swal.fire("✅ Done!", `Rated ${ratingValue} stars`, "success");
              openPostModal(post); // Reload modal to update overall rating
            } else {
              Swal.fire("❌ Error", "Failed to submit rating", "error");
            }
          });
        }
      });

      // Style the rating stars
      setTimeout(() => {
        const labels = document.querySelectorAll(".rating label");
        labels.forEach((label, index) => {
          label.addEventListener("click", () => {
            const value = parseInt(label.getAttribute("for").replace("swal-star", ""));

            // Color the stars from right to left according to the selected value
            labels.forEach((l, i) => {
              const currentValue = parseInt(l.getAttribute("for").replace("swal-star", ""));
              l.style.color = currentValue <= value ? "#00b4be" : "#ccc";
            });

            // Mark the selected star
            document.getElementById(`swal-star${value}`).checked = true;
          });
        });
      }, 100);
    });

    viewPostModal.show();
  }

  // Function to edit product
  function editProduct(product) {
    // Populate modal with current product data
    modalTitleInput.value = product.name;
    modalDescriptionInput.value = product.caption;
    modalPriceInput.value = product.price;
    modalPhoneInput.value = product.pHnum;
    modalCategoryInput.value = product.type;
    
    // Set a data attribute to identify which product is being edited
    modalPostForm.setAttribute('data-edit-id', product.id);
    
    // Show the modal
    postModal.show();
    
    // Set form submit handler for edit
    modalPostForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append("id", product.id);
      formData.append("Name", modalTitleInput.value);
      formData.append("caption", modalDescriptionInput.value);
      formData.append("price", modalPriceInput.value);
      formData.append("PHnum", modalPhoneInput.value);
      formData.append("type", modalCategoryInput.value);
      formData.append("userId", product.userId);
      
      // Add new images if selected
      if (modalImageInput.files.length > 0) {
        for (let i = 0; i < modalImageInput.files.length; i++) {
          formData.append("images", modalImageInput.files[i]);
        }
      }
      
      try {
        const response = await fetch(`https://localhost:7259/api/Product/update-product`, {
          method: "PUT",
          body: formData
        });

        if (!response.ok) {
          throw new Error("Failed to update product");
        }

        alert("Product updated successfully!");
        modalPostForm.reset();
        postModal.hide();
        renderPosts(); // Refresh product list
      } catch (error) {
        console.error("Error updating product:", error);
        alert(`Error: ${error.message}`);
      }
    };
  }

  // Function to delete product
  async function deleteProduct(productId) {
    // Show confirmation dialog
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
      confirmButtonText: "Yes, delete it"
    });
    
    if (confirmation.isConfirmed) {
      try {
        const response = await fetch(`https://localhost:7259/api/Product/${productId}`, {
          method: "DELETE"
        });
        
        if (!response.ok) {
          throw new Error("Failed to delete product");
        }
        
        Swal.fire("Deleted!", "Product has been deleted.", "success");
        renderPosts(); // Refresh product list
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire("Error", `Failed to delete: ${error.message}`, "error");
      }
    }
  }

  // Filter products when clicking the buttons
  filterButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      // Remove "active" class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add "active" class to clicked button
      event.target.classList.add("active");

      // Get selected filter type
      const filterValue = event.target.getAttribute("data-filter");

      // Filter data based on selected type
      if (filterValue === "all") {
        displayPosts(allPosts); // Show all products
      } else {
        const filteredPosts = allPosts.filter((post) => post.type === filterValue);
        displayPosts(filteredPosts); // Show filtered products
      }
    });
  });

  // Handle adding new product
  modalPostForm.addEventListener("submit", async (e) => {
    // Check if we're in edit mode
    if (modalPostForm.hasAttribute('data-edit-id')) {
      // Submit is handled by the edit function
      return;
    }
    
    e.preventDefault();

    // Validate form
    if (!modalImageInput.files || modalImageInput.files.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    const formData = new FormData();
    formData.append("Name", modalTitleInput.value);
    formData.append("caption", modalDescriptionInput.value);
    formData.append("price", modalPriceInput.value);
    formData.append("PHnum", modalPhoneInput.value);
    formData.append("type", modalCategoryInput.value);
    formData.append("userId", adminId);

    // Add images to FormData
    for (let i = 0; i < modalImageInput.files.length; i++) {
      formData.append("images", modalImageInput.files[i]);
    }
    
    try {
      const response = await fetch("https://localhost:7259/api/Product/add-product", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to save product");
      }

      const result = await response.json();
      alert("Product created successfully!");

      modalPostForm.reset();
      postModal.hide();
      renderPosts(); // Refresh products display
    } catch (error) {
      console.error("Error posting data:", error.message);
      alert(`Error: ${error.message}`);
    }
  });

  // Handle image selection for product creation
  modalImageInput.addEventListener("change", function() {
    selectedImages = this.files;
    
    // Display preview of selected images
    const previewContainer = document.getElementById("imagePreviewContainer");
    if (previewContainer) {
      previewContainer.innerHTML = "";
      
      for (let i = 0; i < this.files.length; i++) {
        const reader = new FileReader();
        const preview = document.createElement("div");
        preview.className = "image-preview-item";
        
        reader.onload = function(e) {
          preview.innerHTML = `
            <img src="${e.target.result}" class="img-thumbnail" style="height: 100px; width: auto; margin: 5px;">
          `;
        };
        
        reader.readAsDataURL(this.files[i]);
        previewContainer.appendChild(preview);
      }
    }
  });

  // Logout functionality
  const logoutLi = document.getElementById("logout-li");
  if (logoutLi) {
    logoutLi.addEventListener("click", () => {
      const confirmation = confirm("Do you want to log out?");
      if (confirmation) {
        localStorage.removeItem("userId"); // Clear userId from localStorage
        location.href = "main.html"; // Redirect to login page
      }
    });
  }

  // Initialize data on page load
  renderPosts();
});