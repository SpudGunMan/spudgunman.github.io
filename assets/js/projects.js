const username = "SpudGunMan";
const projectsContainer = document.getElementById("projects-container");
const projectStatus = document.getElementById("project-status");
const forksToggle = document.getElementById("include-forks");
const footerYear = document.getElementById("year");

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

const formatDate = (iso) => {
  const value = new Date(iso);
  return value.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const cardMarkup = (repo) => {
  const language = repo.language ? `<span class="tag">${repo.language}</span>` : "";
  const topics = (repo.topics || []).slice(0, 3).map((topic) => `<span class="tag">${topic}</span>`).join("");

  return `
    <article class="card reveal" data-delay="1">
      <h3>${repo.name}</h3>
      <p>${repo.description || "No description provided yet."}</p>
      <div class="meta">
        <span class="tag">Stars ${repo.stargazers_count}</span>
        <span class="tag">Updated ${formatDate(repo.pushed_at)}</span>
        ${language}
        ${repo.fork ? '<span class="tag">Fork</span>' : ""}
        ${topics}
      </div>
      <div class="cta-row">
        <a class="button secondary" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">Open Repository</a>
      </div>
    </article>
  `;
};

const renderProjects = (repos, includeForks) => {
  const filtered = repos
    .filter((repo) => includeForks || !repo.fork)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

  if (filtered.length === 0) {
    projectsContainer.innerHTML = "<p class=\"muted\">No repositories match the current filter.</p>";
    projectStatus.textContent = "0 repositories displayed";
    return;
  }

  projectsContainer.innerHTML = filtered.map(cardMarkup).join("");
  projectStatus.textContent = `${filtered.length} repositories displayed`;
};

const loadProjects = async () => {
  projectStatus.textContent = "Loading repositories from GitHub...";

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`);
    }

    const repos = await response.json();
    renderProjects(repos, forksToggle.checked);

    forksToggle.addEventListener("change", () => {
      renderProjects(repos, forksToggle.checked);
    });
  } catch (error) {
    projectsContainer.innerHTML = `
      <div class="error-box">
        Could not load repositories right now. You can still browse directly at
        <a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer">github.com/${username}</a>.
      </div>
    `;
    projectStatus.textContent = "Error loading repositories";
    console.error(error);
  }
};

loadProjects();
