let activeEvents =[];
let pastEvents =[];
let userData = 0;
let page = 1;
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Requisição para obter os dados do usuário autenticado
    const userResponse = await fetch('http://localhost:3000/user', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Certifique-se de que o token está sendo enviado
        }
    });

    if (userResponse.ok) {
        userData = await userResponse.json(); // userData se mantém salvo
        console.log("seu id: ", userData.id);

        // Requisição para a rota /userEvents
        const eventsResponse = await fetch(`http://localhost:3000/userEvents?userId=${userData.id}`, {
            method: 'GET'
        });

        

        if (eventsResponse.ok) {
             const eventsData = await eventsResponse.json();
    const now = new Date();

    console.log("Eventos do usuário:", eventsData.allEvents);

    for (const event of eventsData.allEvents) {
        const eventDate = new Date(event.event_date); // Apenas a data
        const eventTime = event.event_time; // Horário no formato "HH:mm:ss"

        if (isNaN(eventDate.getTime())) {
            console.warn("Data inválida encontrada:", event.event_date);
            continue; // Ignorar eventos com datas inválidas
        }

        // Dividir o tempo em horas, minutos e segundos para montar a data completa
        const [hours, minutes, seconds] = eventTime.split(':').map(Number);
        eventDate.setHours(hours, minutes, seconds); // Adiciona o horário à data

        console.log("Data e hora do evento (convertida):", eventDate);

        if (eventDate < now) {
            pastEvents.push(event); // Evento já aconteceu
        } else {
            activeEvents.push(event); // Evento ainda ativo
        }
            }
            console.log(activeEvents[0])
            
                
           

            console.log("Eventos passados:", pastEvents);
            console.log("Eventos ativos:", activeEvents);
        } else {
            console.error("Erro ao buscar eventos do usuário.");
        }
    } else {
        console.log('Erro ao obter dados do usuário.');
    }
    renderCards(0);
    
});//fim do DOMContentLoaded

 async function renderCards(action){
    let pageQuantity = pastEvents.length/6
    
    
    for(let index = 0; index < activeEvents.length;index++){//carrega eventos programados
        let label = "ver";
        if(activeEvents[index].organizer_id == userData.id){
            label = "editar";
        }
        
        const cepData = await cepSearch(activeEvents[index].CEP);
        
        const data = activeEvents[index].event_date.slice(0, -14);
        const partes = data.split("-")

        document.getElementById(`activeCard${index}`).innerHTML = `
        <h3 id="activeName0">${activeEvents[index].name}</h3>
                    <div class="divide">
                        <p  id="activeType0"><strong>Tipo:</strong>${activeEvents[index].event_type}</p>
                    </div>
                    <div class="divide">
                        <p id="activeDate0"><strong>Data:</strong> ${partes[2]+"/"+partes[1]+"/"+partes[0]}</p>
                        <p id="activeTime0"><strong>Hora:</strong> ${activeEvents[index].event_time.slice(0, -3)}</p>
                    </div>
                    <p id="activeAddress0"><strong>Endereço:</strong> ${cepData.bairro+" - "+cepData.localidade+" - "+cepData.uf}</p>
                    <button id="activeButton${index}" value="${[index,activeEvents[index].organizer_id ]}" onclick="entrarCardEvento(this)">${label}</button>
    `;
    document.getElementById(`activeCard${index}`).style.display = "flex";
    document.getElementById(`createIcon${index}`).style.display = "none"
    }
    
    switch(action){
        case 0:
        if(page==1 ){
            document.getElementById("back").disabled = true;
        }else if(page-1==1){
            document.getElementById("back").disabled = true;
            page = page-1
        }
        else{
            page = page -1;
        }
        document.getElementById("next").disabled = false;
        if(pastEvents.length ==0 ){
            document.getElementById("next").disabled = true;
        }
        break;
        case 1:
            if(!pastEvents[6*(page+1)]){
                document.getElementById("next").disabled = true;
            }
            page = page + 1;
            document.getElementById("back").disabled = false;
        break;
    }

    for(let index2 = (6*page)-6, index = 0; index < 6 ;index++, index2++){//carrega cada evento que já
        if(!pastEvents[index2]){
            document.getElementById(`pastCard${index}`).innerHTML = `
            
        `;
        }
        else{

                
                const cepData = await cepSearch(pastEvents[index2].CEP);
                
                const data = pastEvents[index2].event_date.slice(0, -14);
                const partes = data.split("-")

                document.getElementById(`pastCard${index}`).innerHTML = `
                <h3 id="activeName0">${pastEvents[index2].name}</h3>
                            <div class="divide">
                                <p  id="activeType0"><strong>Tipo:</strong>${pastEvents[index2].event_type}</p>
                            </div>
                            <div class="divide">
                                <p id="activeDate0"><strong>Data:</strong> ${partes[2]+"/"+partes[1]+"/"+partes[0]}</p>
                                <p id="activeTime0"><strong>Hora:</strong> ${pastEvents[index2].event_time.slice(0, -3)}</p>
                            </div>
                            <p id="activeAddress0"><strong>Endereço:</strong> ${cepData.bairro+" - "+cepData.localidade+" - "+cepData.uf}</p>
                            <button id="pastButton${index2}" value="${[index2, pastEvents[index2].organizer_id]}" onclick="entrarCardEvento(this)">ver</button>
            `;
            
            }
        }
        if(pastEvents.length/6 != parseInt(pastEvents.length/6)){
            pageQuantity = parseInt(pastEvents.length/6) +1
        }//Determina o número total de página para preencher o contador de páginas da página
        document.getElementById("pageNumber").textContent = `${page}/${pageQuantity}`
}

function entrarCardEvento(button){
    document.getElementById('backgroundLocker').style.display = "flex"
    
    if(button.id.slice(0,-1) == 'activeButton'){
        document.getElementById('rateOrganizer').style.display = "none"
        document.getElementById('participantsHonor').style.display = "none"
        console.log(button.value[0], activeEvents[button.value[0]])//button.value[0] possui o index do array onde o evento está
        document.getElementById('backgroundLocker').style.justifyContent = "center"

        renderActiveCard(button)
    }else{


        renderPastCard(button);
    }
}
async function renderPastCard(button){
    if(button.value[2] != userData.id){//se o usuário for dono do evento
        document.getElementById('rateOrganizer').style.display = "flex"
    }else{
        document.getElementById('rateOrganizer').style.display = "none"
    }
    
    document.getElementById('participantsHonor').style.display = "flex"

    document.getElementById('backgroundLocker').style.justifyContent = "space-evenly"

    let index = button.value[0];

    const participantsData2 = await participantsInfo(pastEvents[index].id)
    console.log(participantsData2.result)
    fillHonorCards(participantsData2.result);
       
    console.log(button.value[0], pastEvents[index]);
        const cepData = await cepSearch(pastEvents[index].CEP);
    
        const data = pastEvents[index].event_date.slice(0, -14);
            const partes = data.split("-")
    
            const participantsData = await participantsQuantity(pastEvents[index].id)
        if(button.value[2] != userData.id){//Se o if do usuário for diferente do de quem criou o evento
        }
            
    
            const userIdResponse = await fetch(`http://localhost:3000/userId?id=${button.value[2]}`);
            if (!userIdResponse.ok) {
                throw new Error(`Erro: ${userIdResponse.statusText}`);
            }
            const organizerData = await userIdResponse.json();//usado para resgatar o nome do criador do grupo
    
            document.getElementById(`card`).innerHTML = `
            <h3 id="activeName0">${pastEvents[index].name}</h3>
                        <a>${organizerData.name}</a>
                        <p id="description">${pastEvents[index].description}</p>
                        <p>${pastEvents[index].event_type}</p>
                        <div class="divide">
                            <p id="activeDate0"><strong>Data:</strong> ${partes[2]+"/"+partes[1]+"/"+partes[0]}</p>
                            <p id="activeTime0"><strong>Hora:</strong> ${pastEvents[index].event_time.slice(0, -3)}</p>
                        </div>
                        <p>participantes: ${participantsData.participants}/${pastEvents[index].participants}</p>
                        <a href = "https://api.whatsapp.com/send?phone=55${pastEvents[index].phone_number.replace(/[()]/g, "").trim()}">Entrar em contato</a>
                        <p id="activeAddress0"><strong>Endereço:</strong> ${cepData.bairro+" - "+cepData.localidade+" - "+cepData.uf}</p>
                        
        `;
            console.log('você não é o dono deste evento')
        
    }
async function renderActiveCard(button){
    let index = button.value[0];
    const cepData = await cepSearch(activeEvents[index].CEP);

    const data = activeEvents[index].event_date.slice(0, -14);
        const partes = data.split("-")

        const participantsData = await participantsQuantity(activeEvents[index].id)
        
    if(button.value[2] != userData.id){//Se o if do usuário for diferente do de quem criou o evento

        

        const userIdResponse = await fetch(`http://localhost:3000/userId?id=${button.value[2]}`);
        if (!userIdResponse.ok) {
            throw new Error(`Erro: ${userIdResponse.statusText}`);
        }
        const organizerData = await userIdResponse.json();//usado para resgatar o nome do criador do grupo

        document.getElementById(`card`).innerHTML = `
        <h3 id="activeName0">${activeEvents[index].name}</h3>
                    <a>${organizerData.name}</a>
                    <p id="description">${activeEvents[index].description}</p>
                    <p>${activeEvents[index].event_type}</p>
                    <div class="divide">
                        <p id="activeDate0"><strong>Data:</strong> ${partes[2]+"/"+partes[1]+"/"+partes[0]}</p>
                        <p id="activeTime0"><strong>Hora:</strong> ${activeEvents[index].event_time.slice(0, -3)}</p>
                    </div>
                    <p>participantes: ${participantsData.participants}/${activeEvents[index].participants}</p>
                    <a href = "https://api.whatsapp.com/send?phone=55${activeEvents[index].phone_number.replace(/[()]/g, "").trim()}">Entrar em contato</a>
                    <p id="activeAddress0"><strong>Endereço:</strong> ${cepData.bairro+" - "+cepData.localidade+" - "+cepData.uf}</p>
                    <button onclick="deleteUserEvent(${index})"> sair </button>
                    
    `;
        console.log('você não é o dono deste evento')
    }else{
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0]; // Retorna no formato "YYYY-MM-DD"
        };
        
        // Converter o horário para o formato esperado pelo `<input type="time">`
        const formatTime = (timeString) => {
            const [hours, minutes] = timeString.split(':');
            return `${hours}:${minutes}`; // Retorna no formato "HH:MM"
        };
        
        // Construindo o innerHTML com os valores interpolados
        document.getElementById(`card`).innerHTML = `
            <form id="editForm" enctype="multipart/form-data">
                
                <label for="name">Nome do Evento:</label>
                <input type="text" id="name" name="name" placeholder="Digite o nome do evento" value="${activeEvents[index].name}" required>
                
                <label for="description">Descrição:</label>
                <textarea id="description" name="description" placeholder="Digite a descrição do evento" required>${activeEvents[index].description}</textarea>
                
                <label for="event_type">Tipo de Evento:</label>
                <select id="event_type" name="event_type" required>
                    <option value="" disabled ${activeEvents[index].event_type ? "selected" : ""}>Selecione o tipo do evento</option>
                    <option value="Encontro social" ${activeEvents[index].event_type === "Encontro social" ? "selected" : ""}>Encontro social</option>
                    <option value="Rodas de Apoio" ${activeEvents[index].event_type === "Rodas de Apoio" ? "selected" : ""}>Rodas de Apoio</option>
                    <option value="Geek" ${activeEvents[index].event_type === "Geek" ? "selected" : ""}>Geek</option>
                    <option value="Cultural" ${activeEvents[index].event_type === "Cultural" ? "selected" : ""}>Cultural</option>
                </select>
                
                <label for="participants">Número de Participantes:</label>
                <input type="number" id="participants" name="participants" placeholder="Digite o número de participantes" min="2" value="${activeEvents[index].participants}" required>
                
                <label for="event_date">Data do Evento:</label>
                <input type="date" id="event_date" name="event_date" value="${formatDate(activeEvents[index].event_date)}" required>
                
                <label for="event_time">Horário do Evento:</label>
                <input type="time" id="event_time" name="event_time" value="${formatTime(activeEvents[index].event_time)}" required>
                
                <label for="cep">CEP:</label>
                <input type="text" id="cep" name="cep" placeholder="Digite o CEP" maxlength="9" pattern="[0-9]{5}-[0-9]{3}" title="Digite o CEP no formato 12345-678" value="${activeEvents[index].CEP}" required>
                
                <label for="phone_number">Telefone:</label>
                <input type="text" id="phone_number" name="phone_number" placeholder="Digite o telefone" maxlength="15" pattern="^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$" title="Digite um número de telefone válido com DDD (ex: (51) 99776-7055)" value="${activeEvents[index].phone_number}" required>
                
                <button type="submit">Confirmar Edição</button>
            </form>

            <button id="deleteButton" value="${activeEvents[index].id}" onclick="deleteEvent(${activeEvents[index].id})"> Excluir evento </button>
        `;
    }
}

async function cepSearch(cep){
 
    const cepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!cepResponse.ok) {
        throw new Error(`Erro ao buscar CEP: ${cepResponse.statusText}`);
    }
    const cepData = await cepResponse.json();

    
    return cepData
}

async function participantsQuantity(groupId){
    const participantsResponse = await fetch(`http://localhost:3000/participants?groupId=${groupId}`);
        if (!participantsResponse.ok) {
            throw new Error(`Erro: ${participantsResponse.statusText}`);
        }
        participantsData = await participantsResponse.json();

        return participantsData
}

  document.getElementById('card').addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'editForm') {
    e.preventDefault();
        const token = localStorage.getItem('token');
        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const event_type = document.getElementById('event_type').value;
        const participants = document.getElementById('participants').value;
        const event_date = document.getElementById('event_date').value;
        const event_time = document.getElementById('event_time').value;
        const CEP = document.getElementById('cep').value;
        const phone_number = document.getElementById('phone_number').value;
        const groupId = document.getElementById("deleteButton").value;
        const updateResponse = await fetch('http://localhost:3000/editEvent', {
            method: 'PUT', // Método HTTP PUT para atualização
            headers: {
                'Content-Type': 'application/json', // Define o tipo de conteúdo como JSON
                'Authorization': `Bearer ${token}` // Envia o token no cabeçalho para autenticação
            },
            body: JSON.stringify({ newName: name , newDescription: description, newEvent_Type: event_type, newParticipants: participants , newEvent_Date: event_date, newEvent_Time: event_time , newCep: CEP, newPhoneNumber: phone_number, event_id: groupId  }) // Envia os novos dados no corpo da requisição
            //newName, newDescription, newEvent_Type, newParticipants, newEvent_Date, newEvent_Time, newCep, newPhoneNumber, organizer_id
        });
        
        

        console.log(document.getElementById("deleteButton").value)
    }
  });

  async function deleteEvent(id){
    const deleteResponse = await fetch('http://localhost:3000/event', {
        method: 'DELETE', // Método HTTP DELETE
        headers: {
          'Content-Type': 'application/json', // Tipo do conteúdo enviado
        },
        body: JSON.stringify({ eventId: id }), // Corpo da requisição enviado como JSON
      });
    console.log(document.getElementById("deleteButton").value)
  }
  async function deleteUserEvent(eventIndex) {
    
    try {
        const response = await fetch('http://localhost:3000/leaveEvent', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userData.id, event_id: activeEvents[eventIndex].id }),
          });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error('Erro:', result);
        return;
      }
  
      console.log('Sucesso:', result.message);
      location.reload();
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  }
 
async function participantsInfo(groupId){
const participantsResponse = await fetch(`http://localhost:3000/participantsInfo?groupId=${groupId}`);
        if (!participantsResponse.ok) {
            throw new Error(`Erro: ${participantsResponse.statusText}`);
        }
        participantsData = await participantsResponse.json();

        return participantsData
}
  
async function fillHonorCards(participants){
    for(let i = 0;i<participants.length;i++){
        console.log(participants)
        const div = document.createElement('div');
        div.classList.add('eventCard');
        
        div.innerHTML = `
            <h3>${participants[i].name}</h3>
            
            <button>teste</button>
        `;
        
        document.getElementById("participantsHonor").appendChild(div); 
    }
    
    
}

