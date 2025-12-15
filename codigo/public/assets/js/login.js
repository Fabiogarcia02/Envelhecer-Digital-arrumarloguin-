(() => {
    const LOGIN_URL = "login.html";
    // Mantenha o endpoint da API, assumindo que seja um JSON-Server rodando localmente
    const API_URL = `/usuarios`; 

    let usuarioCorrente = {};

    // Gera UUID... (Função mantida)
    function generateUUID() {
        var d = new Date().getTime();
        var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16;
            if (d > 0) {
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    function initLoginApp() {
        const usuarioCorrenteJSON = localStorage.getItem('usuarioCorrente');
        if (usuarioCorrenteJSON) {
            usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
        }
    }

    // Função de login CORRIGIDA
    async function loginUser(login, senha) {
        try {
            // Tenta buscar o usuário APENAS pelo login.
            // Isso aumenta a chance de sucesso na consulta GET do JSON-Server.
            const res = await fetch(`${API_URL}?login=${login}`);
            const users = await res.json();

            if (users.length > 0) {
                const usuario = users[0];
                
                // Valida a senha (já que não há criptografia)
                if (usuario.senha === senha) {
                    usuarioCorrente = {
                        id: usuario.id,
                        login: usuario.login,
                        email: usuario.email,
                        nome: usuario.nome
                    };
                    localStorage.setItem('usuarioCorrente', JSON.stringify(usuarioCorrente));
                    return true; // Login bem-sucedido
                } else {
                    // Usuário encontrado, mas senha incorreta
                    return false;
                }
            } else {
                // Usuário não encontrado
                return false; 
            }
        } catch (err) {
            // Erro de rede ou de API
            console.error("Erro ao tentar logar:", err);
            return false;
        }
    }

    // Função addUser (Mantida, pois já estava correta para o cadastro)
    async function addUser(nome, login, senha, email) {
        const novoUsuario = {
            id: generateUUID(),
            login,
            senha,
            nome,
            email
        };

        try {
            // Verifica se o login já existe antes de cadastrar
            const checkRes = await fetch(`${API_URL}?login=${login}`);
            const existingUsers = await checkRes.json();
            
            if (existingUsers.length > 0) {
                alert(`O login "${login}" já está em uso. Por favor, escolha outro.`);
                return;
            }

            // Realiza o POST
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novoUsuario)
            });

            if (res.ok) {
                console.log("Usuário criado com sucesso.");
                alert('Usuário salvo com sucesso. Proceda com o login.');
                
                // Fecha o modal após sucesso
                const modalEl = document.getElementById('loginModal');
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) {
                    modalInstance.hide();
                }

            } else {
                console.error("Erro ao criar usuário:", res.statusText);
                alert("Erro ao salvar o usuário. Verifique o console.");
            }
        } catch (err) {
            console.error("Erro de rede ao adicionar usuário:", err);
            alert("Erro ao salvar o usuário. Verifique o console.");
        }
    }

    async function processaFormLogin(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const resultadoLogin = await loginUser(username, password);

        if (resultadoLogin) {
            window.location.href = 'index.html';
        } else {
            alert('Usuário ou senha incorretos');
        }
    }

    function salvaLogin(event) {
        event.preventDefault();

        const login = document.getElementById('txt_login').value.trim();
        const nome = document.getElementById('txt_nome').value.trim();
        const email = document.getElementById('txt_email').value.trim();
        const senha = document.getElementById('txt_senha').value;
        const senha2 = document.getElementById('txt_senha2').value;

        if (!login || !nome || !email || !senha || !senha2) {
            alert('Preencha todos os campos.');
            return;
        }

        if (senha !== senha2) {
            alert('As senhas informadas não conferem.');
            return;
        }

        addUser(nome, login, senha, email);
        // A mensagem de sucesso e fechamento do modal agora estão dentro do addUser
    }

    // Adiciona o evento de logout ao botão Sair e impede voltar após logout
    function setupLogoutButton() {
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', function () {
                // Limpa o usuário e impede voltar para a página anterior
                usuarioCorrente = {};
                localStorage.setItem('usuarioCorrente', JSON.stringify(usuarioCorrente));
                // Redireciona e limpa histórico
                window.location.replace('login.html');
            });
        }
    }

    // Chama a função ao carregar a página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupLogoutButton);
    } else {
        setupLogoutButton();
    }

    initLoginApp();

    // Verificação de existência dos elementos antes de adicionar listeners
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', processaFormLogin);
    }

    const btnSalvar = document.getElementById('btn_salvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', salvaLogin);
    }

    const openModalBtn = document.getElementById('openModalBtn');
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            // Certifique-se de que o Bootstrap está carregado
            if (window.bootstrap && bootstrap.Modal) {
                const modal = new bootstrap.Modal(document.getElementById('loginModal'));
                modal.show();
            } else {
                console.error("Bootstrap Modal não está carregado. Verifique o seu HTML.");
            }
        });
    }
})();