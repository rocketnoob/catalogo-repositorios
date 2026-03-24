const API_BASE = 'https://api.github.com';
const SEARCH_FORM = document.getElementById('searchForm');
const LOADING = document.getElementById('loading');
const RESULTS = document.getElementById('results');

// Linguagens com cores oficiais do GitHub
const LANGUAGE_COLORS = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Java': '#b07219',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'C#': '#178600',
    'C++': '#f34b7d'
};

SEARCH_FORM.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const language = document.getElementById('language').value;

    if (!username) {
        alert('Por favor, insira um usuário do GitHub');
        return;
    }

    await searchRepos(username, language);
});

async function searchRepos(username, language) {
    try {
        LOADING.style.display = 'block';
        RESULTS.style.display = 'none';

        // Busca repositórios do usuário (até 100 mais recentes)
        const response = await fetch(`${API_BASE}/users/${username}/repos?sort=updated&per_page=100`);
        
        if (!response.ok) {
            throw new Error(`Usuário não encontrado: ${response.status}`);
        }

        const repos = await response.json();
        
        // Filtra por linguagem se especificada
        let filteredRepos = repos;
        if (language) {
            filteredRepos = repos.filter(repo => 
                repo.language && repo.language.toLowerCase() === language.toLowerCase()
            );
        }

        displayRepos(filteredRepos, username);
        
    } catch (error) {
        RESULTS.innerHTML = `
            <div class="no-results">
                <h3>❌ Erro na busca</h3>
                <p>${error.message}</p>
                <p>Tente outro usuário ou verifique a conexão.</p>
            </div>
        `;
        RESULTS.style.display = 'block';
    } finally {
        LOADING.style.display = 'none';
    }
}

function displayRepos(repos, username) {
    if (repos.length === 0) {
        RESULTS.innerHTML = `
            <div class="no-results">
                <h3>📭 Nenhum repositório encontrado</h3>
                <p>${username} não possui repositórios ${document.getElementById('language').value ? `em ${document.getElementById('language').value}` : ''}.</p>
                <p><strong>Dica:</strong> Tente "facebook", "vercel", "rails" ou seu próprio username!</p>
            </div>
        `;
        RESULTS.style.display = 'block';
        return;
    }

    const reposHTML = repos.map(repo => createRepoCard(repo)).join('');
    RESULTS.innerHTML = `
        <div class="repos-grid">
            ${reposHTML}
        </div>
        <div style="padding: 0 30px 30px; text-align: center; color: #6c757d;">
            <p>Mostrando ${repos.length} repositório${repos.length !== 1 ? 's' : ''} de <strong>${username}</strong></p>
        </div>
    `;
    RESULTS.style.display = 'block';
}

function createRepoCard(repo) {
    const languageClass = repo.language ? 
        `language-tag ${repo.language.toLowerCase().replace(/[^a-z]/g, '')}` : 
        'language-tag other';
    
    const languageStyle = repo.language && LANGUAGE_COLORS[repo.language] ? 
        `style="background-color: ${LANGUAGE_COLORS[repo.language]}; color: ${isLightColor(LANGUAGE_COLORS[repo.language]) ? '#000' : '#fff'};"` : 
        '';

    return `
        <div class="repo-card">
            <div class="repo-header">
                <div class="repo-title">
                    <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                    ${repo.private ? '🔒' : '⭐'}
                </div>
                <div class="repo-stats">
                    <div class="stat">⭐ ${repo.stargazers_count.toLocaleString()}</div>
                    <div class="stat">🍴 ${repo.forks_count.toLocaleString()}</div>
                    <div class="stat">📂 ${repo.language || 'Sem linguagem'}</div>
                </div>
            </div>
            <div class="repo-body">
                ${repo.description ? 
                    `<p class="repo-description">${repo.description}</p>` : 
                    '<p class="repo-description" style="color: #6c757d; font-style: italic;">Sem descrição</p>'
                }
                ${repo.language ? `
                    <div class="repo-languages">
                        <span class="language-tag ${languageClass}" ${languageStyle}>${repo.language}</span>
                    </div>
                ` : ''}
            </div>
            <div class="repo-footer">
                <span>👤 ${repo.owner?.login}</span>
                <span>📅 ${new Date(repo.updated_at).toLocaleDateString('pt-BR')}</span>
            </div>
        </div>
    `;
}

function isLightColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}

// 🔄 Busca automática ao carregar a página
window.addEventListener('load', () => {
    searchRepos('facebook', '');
});