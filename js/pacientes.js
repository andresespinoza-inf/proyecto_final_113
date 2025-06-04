// Cerrar sesión
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// Base de datos de pacientes
let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

// ========== FUNCIÓN PRINCIPAL: RENDERIZAR PACIENTES ========== //
function renderPacientes() {
    const tbody = document.getElementById('pacientesBody');
    tbody.innerHTML = '';

    // Ordenar por gravedad (Crítico > Urgente > Moderado > Leve)
    const ordenGravedad = { 'Crítico': 4, 'Urgente': 3, 'Moderado': 2, 'Leve': 1 };
    pacientes.sort((a, b) => ordenGravedad[b.gravedad] - ordenGravedad[a.gravedad]);

    // Llenar tabla
    pacientes.forEach((paciente, index) => {
        const row = document.createElement('tr');
        
        // Color según gravedad
        let badgeClass = '';
        switch (paciente.gravedad) {
            case 'Crítico': badgeClass = 'bg-danger'; break;
            case 'Urgente': badgeClass = 'bg-warning text-dark'; break;
            case 'Moderado': badgeClass = 'bg-info text-dark'; break;
            case 'Leve': badgeClass = 'bg-success'; break;
        }

        row.innerHTML = `
            <td>${paciente.nombre}</td>
            <td>${paciente.edad}</td>
            <td><span class="badge ${badgeClass}">${paciente.gravedad}</span></td>
            <td>${paciente.doctor}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Agregar eventos de eliminación
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.closest('button').getAttribute('data-index');
            pacientes.splice(index, 1);
            localStorage.setItem('pacientes', JSON.stringify(pacientes));
            renderPacientes();
            actualizarContador();
        });
    });

    // Actualizar contador
    actualizarContador();
}

// ========== CONTADOR DE PACIENTES POR GRAVEDAD ========== //
function actualizarContador() {
    const contador = {
        Crítico: pacientes.filter(p => p.gravedad === 'Crítico').length,
        Urgente: pacientes.filter(p => p.gravedad === 'Urgente').length,
        Moderado: pacientes.filter(p => p.gravedad === 'Moderado').length,
        Leve: pacientes.filter(p => p.gravedad === 'Leve').length
    };

    // Opcional: Mostrar en consola o en la interfaz
    console.log('Pacientes por gravedad:', contador);
    /* 
    // Si quieres mostrarlo en la UI, agrega este HTML en dashboard.html:
    <div class="d-flex justify-content-around mb-3" id="contadorGravedad"></div>
    Y descomenta este código:
    const contadorUI = document.getElementById('contadorGravedad');
    contadorUI.innerHTML = `
        <span class="badge bg-danger">Crítico: ${contador.Crítico}</span>
        <span class="badge bg-warning text-dark">Urgente: ${contador.Urgente}</span>
        <span class="badge bg-info text-dark">Moderado: ${contador.Moderado}</span>
        <span class="badge bg-success">Leve: ${contador.Leve}</span>
    `;
    */
}

// ========== REGISTRO DE NUEVO PACIENTE ========== //
document.getElementById('pacienteForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validar CI (7 dígitos)
    const ci = document.getElementById('documento').value;
    if (!/^\d{7}$/.test(ci)) {
        alert('❌ El C.I. debe tener 7 dígitos numéricos');
        return;
    }

    // Crear objeto paciente
    const paciente = {
        nombre: document.getElementById('nombre').value,
        edad: document.getElementById('edad').value,
        genero: document.getElementById('genero').value,
        documento: ci,
        sintomas: document.getElementById('sintomas').value,
        gravedad: document.getElementById('gravedad').value,
        doctor: document.getElementById('doctor').value,
        telefono: document.getElementById('telefono').value,
        examenes: document.querySelector('input[name="examenCheck"]:checked').value === 'si' 
                 ? document.getElementById('examenes').value 
                 : 'No requerido',
        fechaRegistro: new Date().toLocaleString()
    };

    // Agregar paciente
    pacientes.push(paciente);
    localStorage.setItem('pacientes', JSON.stringify(pacientes));

    // Actualizar interfaz
    renderPacientes();
    document.getElementById('pacienteForm').reset();

    // Generar ticket (tu función existente)
    generarTicket(paciente);

    // Alerta si es crítico
    if (paciente.gravedad === 'Crítico') {
        alert('🚨 ¡Paciente en estado Crítico! Priorice atención inmediata.');
    }
});

// ========== INICIALIZACIÓN ========== //
document.addEventListener('DOMContentLoaded', () => {
    // Redirigir si no hay sesión
    if (!localStorage.getItem('currentUser')) {
        window.location.href = 'index.html';
        return;
    }

// Mostrar nombre de usuario
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.username) {
        const username = currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1);
        document.getElementById('welcomeMessage').textContent = `Bienvenido, ${username}`;
    }

    
    // Cargar pacientes al inicio
    renderPacientes();

    // Mostrar/ocultar campo de exámenes
    document.querySelectorAll('input[name="examenCheck"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('examenes').style.display = 
                this.value === 'si' ? 'block' : 'none';
        });
    });
});

// ========== FUNCIÓN PARA GENERAR TICKET ========== //
function generarTicket(paciente) {
    // Calcular fecha de cita
    const ahora = new Date();
    let fechaCita;
    
    if (paciente.gravedad === 'Crítico') fechaCita = new Date(ahora.getTime() + 5 * 60000);
    else if (paciente.gravedad === 'Urgente') fechaCita = new Date(ahora.getTime() + 24 * 3600 * 1000);
    else if (paciente.gravedad === 'Moderado') fechaCita = new Date(ahora.getTime() + 4 * 24 * 3600 * 1000);
    else fechaCita = new Date(ahora.getTime() + 7 * 24 * 3600 * 1000);

    // Generar código único
    const codigoTicket = `PP-${Math.floor(1000 + Math.random() * 9000)}`;

    // Crear contenido del ticket
    const ticketHTML = `
        <div class="text-center mb-3">
            <h4 class="mb-0">PRINCETON-PLAINSBORO</h4>
            <small>Teaching Hospital</small>
            <hr class="my-2">
        </div>
        <div class="row">
            <div class="col-md-6">
                <p><strong>PACIENTE:</strong> ${paciente.nombre}</p>
                <p><strong>C.I.:</strong> ${paciente.documento}</p>
                <p><strong>EDAD:</strong> ${paciente.edad}</p>
            </div>
            <div class="col-md-6">
                <p><strong>GRAVEDAD:</strong> <span class="badge ${getBadgeClass(paciente.gravedad)}">${paciente.gravedad}</span></p>
                <p><strong>DOCTOR:</strong> ${paciente.doctor}</p>
                <p><strong>FECHA:</strong> ${fechaCita.toLocaleString()}</p>
            </div>
        </div>
        <hr class="my-2">
        <div class="mb-2">
            <strong>SÍNTOMAS:</strong><br>
            ${paciente.sintomas}
        </div>
        <div class="mb-2">
            <strong>RECOMENDACIÓN:</strong><br>
            "Repose, ingiera alimentos blancos, tome ibuprofeno 500mg."
        </div>
        <hr class="my-2">
        <div class="text-center text-muted small">
            <strong>N° TICKET:</strong> ${codigoTicket}<br>
            <small>Gracias por confiar en nosotros</small>
        </div>
    `;

    // Mostrar ticket
    const ticketContainer = document.getElementById('ticketContainer');
    const ticketContent = document.getElementById('ticketContent');
    
    ticketContent.innerHTML = ticketHTML;
    ticketContainer.classList.remove('d-none');

    // Configurar impresión
    document.getElementById('imprimirTicketBtn').onclick = () => {
        const printWindow = window.open('', '', 'width=600,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket de Paciente</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { padding: 20px; font-size: 14px; }
                    .badge { font-size: 12px; padding: 4px 8px; }
                </style>
            </head>
            <body>
                ${ticketContent.innerHTML}
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 200);
                    }
                </script>
            </body>
            </html>
        `);
    };
}

// Función auxiliar para colores de gravedad
function getBadgeClass(gravedad) {
    switch(gravedad) {
        case 'Crítico': return 'bg-danger';
        case 'Urgente': return 'bg-warning text-dark';
        case 'Moderado': return 'bg-info text-dark';
        case 'Leve': return 'bg-success';
        default: return 'bg-secondary';
    }
}