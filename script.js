// Selección de elementos en el DOM
const productForm = document.getElementById("product-form");
const productContainer = document.querySelector(".product-container");
const noProductsMessage = document.querySelector(".no-products");

// Array para almacenar los productos
let products = [];

// Función para obtener productos desde el servidor
async function fetchProducts() {
  try {
    const response = await fetch("get_products.php");
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error("Error al obtener productos:", error);
  }
}

// Función para renderizar los productos en la página
function renderProducts() {
  productContainer.innerHTML = "";

  if (products.length === 0) {
    noProductsMessage.style.display = "block";
  } else {
    noProductsMessage.style.display = "none";
    products.forEach((product) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const productImage = document.createElement("img");
      productImage.src = product.imagen ? product.imagen : "./assets/defaultImage.png";
      productImage.alt = product.nombre;
      productImage.onclick = () => showImageModal(productImage.src); // Mostrar imagen ampliada

      const cardInfo = document.createElement("div");
      cardInfo.classList.add("card-container--info");

      const productName = document.createElement("p");
      productName.textContent = product.nombre;

      const cardValue = document.createElement("div");
      cardValue.classList.add("card-container--value");

      const productPrice = document.createElement("p");
      productPrice.textContent = `$ ${product.precio}`;

      // Botón de edición
      const editButton = document.createElement("button");
      editButton.textContent = "Editar";
      editButton.classList.add("styled-button");
      editButton.addEventListener("click", () => loadProductForEditing(product));

      // Botón de eliminación
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Eliminar";
      deleteButton.classList.add("styled-button");
      deleteButton.addEventListener("click", () => confirmDeleteProduct(product.id));

      // Agregar elementos al contenedor de valor
      cardValue.appendChild(productPrice);
      cardValue.appendChild(editButton);
      cardValue.appendChild(deleteButton);

      cardInfo.appendChild(productName);
      cardInfo.appendChild(cardValue);

      card.appendChild(productImage);
      card.appendChild(cardInfo);

      productContainer.appendChild(card);
    });
  }
}

// Función para cargar los datos del producto en el formulario para edición
function loadProductForEditing(product) {
  document.getElementById("product-name").value = product.nombre;
  document.getElementById("product-price").value = product.precio;
  document.getElementById("product-image").setAttribute("data-original-image", product.imagen); // Guardar imagen original
  editingProductId = product.id;
  document.getElementById("form-title").textContent = "Editar Producto";
}

// Función para agregar o actualizar un producto en la base de datos
async function addProduct(event) {
    event.preventDefault();

    const name = productForm.elements["product-name"].value;
    const price = productForm.elements["product-price"].value;
    const imageInput = productForm.elements["product-image"];
    let imagePath = imageInput.getAttribute("data-original-image");

    // Subir la nueva imagen si se selecciona
    if (imageInput.files && imageInput.files[0]) {
        const formData = new FormData();
        formData.append("image", imageInput.files[0]);

        try {
            const response = await fetch("upload_image.php", {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                imagePath = data.filePath; // Actualiza imagePath con la ruta de la nueva imagen
            } else {
                console.error("Error al subir la imagen:", data.error);
                return;
            }
        } catch (error) {
            console.error("Error al subir la imagen:", error);
            return;
        }
    }

    const productData = {
        nombre: name,
        precio: price,
        imagen: imagePath // Usa la ruta de la imagen en lugar de Base64
    };

    try {
        if (editingProductId) {
            // Editar producto existente
            productData.id = editingProductId;
            await fetch(`update_product.php?id=${editingProductId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productData)
            });
        } else {
            // Agregar nuevo producto
            await fetch("add_product.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productData)
            });
        }

        // Limpiar formulario y estado de edición
        productForm.reset();
        document.getElementById("form-title").textContent = "Agregar Producto";
        editingProductId = null;

        // Volver a cargar los productos
        fetchProducts();
    } catch (error) {
        console.error("Error al agregar/editar el producto:", error);
    }
}

// Función para eliminar un producto con confirmación
async function confirmDeleteProduct(productId) {
  const confirmed = confirm("¿Estás seguro de que deseas eliminar este producto?");
  if (confirmed) {
    deleteProduct(productId);
  }
}

// Función para eliminar un producto
async function deleteProduct(productId) {
  try {
    await fetch(`delete_product.php?id=${productId}`, { method: "GET" });
    fetchProducts();
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
  }
}

// Función para mostrar el modal con la imagen ampliada
function showImageModal(imageSrc) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  modal.style.display = "block";
  modalImg.src = imageSrc;
}

// Cerrar el modal al hacer clic en el botón de cerrar
const closeModal = document.querySelector(".close");
closeModal.onclick = function () {
  document.getElementById("imageModal").style.display = "none";
};

productForm.addEventListener("submit", addProduct);
fetchProducts();



