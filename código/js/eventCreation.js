document.addEventListener('DOMContentLoaded', async () => {

    const token = localStorage.getItem('token'); 
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch('http://localhost:3000/user', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Certifique-se de que o token está sendo enviado
        }
    });

    if (response.ok) {
        userData = await response.json();
        console.log("seu id: ",userData.id);
    } else {
        console.log('Erro ao obter dados do usuário.');
    }

    const eventDateInput = document.getElementById('event_date');
    eventDateInput.addEventListener('input', () => {
        const today = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD
        if (eventDateInput.value < today) {
            alert('A data do evento não pode ser em um dia anterior ao atual!');
            eventDateInput.value = ''; // Limpa o campo
        }
    });

    document.getElementById('eventRegisterForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtém os valores dos campos de entrada
        const name = document.getElementById('name').value;
        const organizer_id = userData.id;
        const description = document.getElementById('description').value;
        const event_type = document.getElementById('event_type').value;
        const participants = document.getElementById('participants').value;
        const event_date = document.getElementById('event_date').value;
        const event_time = document.getElementById('event_time').value;
        const CEP = document.getElementById('cep').value;
        const phone_number = document.getElementById('phone_number').value;
        
        // Capture o arquivo de imagem
        const imageInput = document.getElementById('image');  // Aqui está a captura do input da imagem
        const formData = new FormData();
        formData.append('name', name);
        formData.append('organizer_id', organizer_id);
        formData.append('description', description);
        formData.append('event_type', event_type);
        formData.append('participants', participants);
        formData.append('event_date', event_date);
        formData.append('event_time', event_time);
        formData.append('CEP', CEP);
        formData.append('phone_number', phone_number);
        formData.append('image', imageInput.files[0]); // Pega o arquivo da imagem

        const messageElement = document.getElementById('message');

        const response = await fetch('http://localhost:3000/eventRegister', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            messageElement.textContent = 'Evento registrado com sucesso!';
        } else {
            const errorMessage = await response.text();
            messageElement.textContent = errorMessage;
        }
    });

});
