// sidebar
function togglesubmenu(button) {
    button.nextElementSibling.classList.toggle('show');
    button.classList.toggle('rotate');
}

function startChat(currentUserId, postUserId) {
  console.log(currentUserId, postUserId);
  // توجه لصفحة الدردشة مع تمرير المعرفين في الرابط
  window.location.href = `https://localhost:7259/chat.html?userId=${currentUserId}&otherUserId=${postUserId}`;
}


document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector('#addItemModal form');
    const userId = localStorage.getItem("userId"); // تأكد أن المستخدم مسجل الدخول

    console.log("User ID:", userId); // تحقق من قيمة userId
    const lostSection = document.getElementById("lost-items-section");
    const foundSection = document.getElementById("found-items-section");

    async function fetchLostItems() {
        try {
            const res = await fetch("https://localhost:7259/api/LostItems/all");
            const data = await res.json();

            lostSection.innerHTML = "";
            foundSection.innerHTML = "";

            data.forEach(item => {
                const isLost = item.type === "ضائع" || item.type === "فقدت شيئاً";
                const target = isLost ? lostSection : foundSection;

                const imageSrc = (item.images && item.images.length > 0)
                    ? `data:${item.images[0].contentType};base64,${item.images[0].imageBase64}`
                    : `logo-removebg-preview.png?text=${isLost ? "عنصر+مفقود" : "عنصر+موجود"}`;

                const card = document.createElement("div");
                card.className = "col-md-5 col-lg-4 mt-2";
                card.innerHTML = `
                    <div class="lost-item-card card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <span class="badge ${isLost ? 'bg-danger status-lost' : 'bg-success status-found'}">
                                <i class="bi ${isLost ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}"></i> 
                                ${isLost ? 'مفقود' : 'موجود'}
                            </span>
                            ${item.userId == userId ? `
                                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${item.id}">
                                    🗑️
                                </button>` : ''
                            }
                        </div>
                        <img src="${imageSrc}" class="item-image card-img-top" alt="${item.title}">
                        <div class="cardd-body p-2">
                            <h5 class="t-title">${item.title}</h5>
                            <p class="t-text"><strong>التفاصيل:</strong> ${item.description}</p>
                            <ul class="list-group list-group-flush mb-3">
                                <li class="list-group-item"><i class="bi bi-calendar"></i> <strong>التاريخ:</strong> ${item.date.split('T')[0]}</li>
                                <li class="list-group-item"><i class="bi bi-geo-alt"></i> <strong>المكان:</strong> ${item.location}</li>
                                <li class="list-group-item"><i class="bi bi-person"></i> <strong>التواصل:</strong> ${item.phoneNumber}</li>
                            </ul>
                        </div>
                        <button class="btn btn-primary btn-sm chat-modal" onclick="startChat(${userId}, ${item.userId})">
                          مراسلة <i class="fas fa-comment-dots"></i>
                      </button>
                    </div>
                `;
                target.appendChild(card);

                // حذف المنشور
                const deleteBtn = card.querySelector(".delete-btn");
if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
        const result = await Swal.fire({
            title: "هل أنت متأكد؟",
            text: "سيتم حذف هذا المنشور نهائيًا.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "نعم، احذفه",
            cancelButtonText: "إلغاء"
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`https://localhost:7259/api/LostItems/${item.id}?userId=${userId}`, {
                    method: "DELETE"
                });

                if (res.ok) {
                    await Swal.fire("تم الحذف!", "تم حذف المنشور بنجاح.", "success");
                    fetchLostItems();
                } else {
                    Swal.fire("خطأ", "فشل في حذف المنشور.", "error");
                }
            } catch (error) {
                Swal.fire("خطأ", "حدث خطأ أثناء الاتصال بالخادم.", "error");
                console.error("خطأ الحذف:", error);
            }
        }
    });
}

            });
        } catch (err) {
            console.error("فشل تحميل المنشورات:", err);
        }
    }

    fetchLostItems();

    // إرسال النموذج
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const isLost = document.getElementById("lostItem").checked;
        const title = document.getElementById("itemTitle").value;
        const desc = document.getElementById("itemDescription").value;
        const location = document.getElementById("itemLocation").value;
        const date = document.getElementById("itemDate").value;
        const contact = document.getElementById("userContact").value;
        const imageFile = document.getElementById("itemImage").files[0];

        const formData = new FormData();
        formData.append("Type", isLost ? "ضائع" : "تم العثور عليه");
        formData.append("Title", title);
        formData.append("Description", desc);
        formData.append("Location", location);
        formData.append("Date", date);
        formData.append("PhoneNumber", contact);
        formData.append("UserId", userId);

        if (imageFile) {
    formData.append("ImageFiles", imageFile); // لاحقًا يمكن دعم أكثر من صورة
}

try {
    const res = await fetch("https://localhost:7259/api/LostItems/add", {
        method: "POST",
        body: formData
    });

    if (res.ok) {
        await Swal.fire({
            title: "تم النشر!",
            text: "✅ تم نشر الإعلان بنجاح.",
            icon: "success",
            confirmButtonText: "حسنًا"
        });

        form.reset();
        bootstrap.Modal.getInstance(document.getElementById('addItemModal')).hide();
        fetchLostItems(); // تحديث القائمة
    } else {
        const errText = await res.text();
        Swal.fire({
            title: "خطأ",
            text: "❌ " + errText,
            icon: "error",
            confirmButtonText: "حسنًا"
        });
    }
} catch (err) {
    console.error("فشل إرسال البيانات:", err);
    Swal.fire({
        title: "خطأ",
        text: "حدث خطأ أثناء الاتصال بالخادم.",
        icon: "error",
        confirmButtonText: "موافق"
    });
}

    });
});
