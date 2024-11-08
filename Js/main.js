const productos = document.getElementById("productos");
const productoSeleccionado = document.getElementById("producto-seleccionado");
const cantidad = document.getElementById("cantidad");
const subtotal = document.getElementById("subtotal");
const comprarBtn = document.getElementById("comprar");
const limpiarBtn = document.getElementById("limpiar");
const tablaProductos = document.getElementById("tabla-productos").querySelector("tbody");
const calcularTotalBtn = document.getElementById("calcular-total");
const eliminarSeleccionadosBtn = document.getElementById("eliminar-seleccionados");
const añadirProductoBtn = document.getElementById("añadir-producto");

// Listeners
productos.addEventListener("change", actualizarProducto);
cantidad.addEventListener("input", actualizarSubtotal);
comprarBtn.addEventListener("click", realizarCompra);
limpiarBtn.addEventListener("click", limpiarCampos);
calcularTotalBtn.addEventListener("click", calcularTotal);
eliminarSeleccionadosBtn.addEventListener("click", eliminarSeleccionados);
añadirProductoBtn.addEventListener("click", abrirAlertaAñadirProducto);

// Función para actualizar producto seleccionado y subtotal
function actualizarProducto() {
    const selectedOption = productos.options[productos.selectedIndex];
    productoSeleccionado.value = selectedOption.getAttribute('data-name');
    actualizarSubtotal();
    comprarBtn.disabled = productoSeleccionado.value === "" ? true : false;
    limpiarBtn.disabled = false;
}

// Función para actualizar subtotal según el producto y cantidad seleccionada
function actualizarSubtotal() {
    const precio = parseFloat(productos.value);
    const cantidadSeleccionada = parseInt(cantidad.value);
    const total = precio * cantidadSeleccionada;
    subtotal.value = "$" + total.toFixed(2);
}

// Función para abrir la alerta de añadir producto
function abrirAlertaAñadirProducto() {
    Swal.fire({
        title: 'Añadir nuevo producto',
        html: `
            <input type="text" id="nombre-producto" class="swal2-input" placeholder="Nombre del producto">
            <input type="number" id="precio-producto" class="swal2-input" placeholder="Precio del producto" min="0" step="0.01">
        `,
        confirmButtonText: 'Añadir',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const nombreProducto = document.getElementById('nombre-producto').value;
            const precioProducto = document.getElementById('precio-producto').value;

            if (!nombreProducto || !precioProducto || parseFloat(precioProducto) <= 0) {
                Swal.showValidationMessage('Por favor, introduce un nombre y un precio válido');
                return false;
            }
            return { nombre: nombreProducto, precio: parseFloat(precioProducto).toFixed(2) };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Añadir el nuevo producto al select de productos disponibles
            const nuevoProducto = new Option(`${result.value.nombre} - $${result.value.precio}`, result.value.precio);
            nuevoProducto.setAttribute('data-name', result.value.nombre);
            productos.add(nuevoProducto);
            Swal.fire({
                title: 'Producto añadido',
                text: `El producto ${result.value.nombre} ha sido añadido a la lista`,
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
        }
    });
}

// Función para realizar la compra y agregar el producto a la tabla
// Función para realizar la compra y agregar el producto a la tabla
function realizarCompra() {
    const producto = productoSeleccionado.value;
    const cantidadSeleccionada = parseInt(cantidad.value);
    const total = parseFloat(productos.value) * cantidadSeleccionada;

    if (producto && cantidadSeleccionada > 0) {
        const nuevaFila = `
            <tr>
                <td><input type="radio" name="eliminar-producto" class="eliminar-producto"></td>
                <td>${producto}</td>
                <td>${cantidadSeleccionada}</td>
                <td>$${total.toFixed(2)}</td>
            </tr>
        `;
        tablaProductos.insertAdjacentHTML('beforeend', nuevaFila);

        // Asociar listener al nuevo radio botón para que al seleccionarlo, habilite el botón de eliminar
        const radios = tablaProductos.querySelectorAll('.eliminar-producto');
        radios.forEach(radio => {
            radio.addEventListener('change', verificarSeleccion);
        });

        limpiarCampos();

        // Habilitar los botones
        calcularTotalBtn.disabled = false;
        verificarSeleccion();
    } else {
        alert("Por favor selecciona un producto y cantidad válidos.");
    }
}

// Función para verificar si hay productos seleccionados y habilitar/deshabilitar el botón de eliminar
function verificarSeleccion() {
    const radios = document.querySelectorAll('.eliminar-producto');
    eliminarSeleccionadosBtn.disabled = !Array.from(radios).some(radio => radio.checked);
}

// Llamar a verificarSeleccion al cargar cualquier producto nuevo para que funcione desde el principio
const radiosIniciales = document.querySelectorAll('.eliminar-producto');
radiosIniciales.forEach(radio => {
    radio.addEventListener('change', verificarSeleccion);
});


// Función para limpiar los campos
function limpiarCampos() {
    productoSeleccionado.value = "";
    cantidad.value = 1;
    subtotal.value = "";
    comprarBtn.disabled = true;
    limpiarBtn.disabled = true;

    // Si no hay filas en la tabla, desactivar los botones
    if (tablaProductos.children.length === 0) {
        calcularTotalBtn.disabled = true;
        eliminarSeleccionadosBtn.disabled = true;
    }
}

// Función para calcular el total de los productos comprados
function calcularTotal() {
    let totalGeneral = 0;
    const filas = tablaProductos.querySelectorAll("tr");

    filas.forEach(fila => {
        const totalFila = parseFloat(fila.children[3].textContent.replace("$", ""));
        totalGeneral += totalFila;
    });

    const fechaCompra = new Date().toLocaleDateString();
    
    Swal.fire({
        title: 'Total a Pagar',
        html: `<p>El total a pagar es: $${totalGeneral.toFixed(2)}</p><p>Fecha de compra: ${fechaCompra}</p>`,
        icon: 'info',
        confirmButtonText: 'Aceptar'
    }).then(() => {
        Swal.fire({
            title: 'Compra realizada',
            text: 'Su compra ha sido realizada con éxito.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });

        // Limpiar la tabla después de la compra
        tablaProductos.innerHTML = "";
        calcularTotalBtn.disabled = true;
        eliminarSeleccionadosBtn.disabled = true;
    });
}

// Función para eliminar los productos seleccionados
function eliminarSeleccionados() {
    const filas = tablaProductos.querySelectorAll("tr");
    const productosAEliminar = [];

    filas.forEach(fila => {
        const radioBtn = fila.querySelector('input[type="radio"]');
        if (radioBtn.checked) {
            productosAEliminar.push(fila);
        }
    });

    if (productosAEliminar.length > 0) {
        Swal.fire({
            title: 'Confirmación',
            text: '¿Estás seguro de que deseas eliminar los productos seleccionados?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                productosAEliminar.forEach(fila => fila.remove());
                verificarSeleccion();
            }
        });
    } else {
        Swal.fire({
            title: 'Atención',
            text: 'No hay productos seleccionados para eliminar.',
            icon: 'info',
            confirmButtonText: 'Aceptar'
        });
    }
}

// Función para verificar si hay productos seleccionados y habilitar/deshabilitar el botón de eliminar
function verificarSeleccion() {
    const radios = document.querySelectorAll('.eliminar-producto');
    eliminarSeleccionadosBtn.disabled = !Array.from(radios).some(radio => radio.checked);
}
