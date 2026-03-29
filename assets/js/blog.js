const owner = "SpudGunMan";
const repo = "spudgunman.github.io";
const branch = "main";
const blogFolder = "blog";
const blogContainer = document.getElementById("blog-container");
const blogStatus = document.getElementById("blog-status");
const subjectFilters = document.getElementById("subject-filters");
const footerYear = document.getElementById("year");

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const titleFromFileName = (name) =>
  name
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const bodyToSummary = (body) => {
  const cleaned = body
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "No summary provided yet.";
  }

  return cleaned.length > 220 ? `${cleaned.slice(0, 217)}...` : cleaned;
};

const parseFrontMatter = (content, fileName, filePath) => {
  const normalized = content.replace(/\r\n/g, "\n");
  const frontMatterMatch = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const frontMatter = frontMatterMatch ? frontMatterMatch[1] : "";
  const body = (frontMatterMatch ? frontMatterMatch[2] : normalized).trim();
  const meta = {};

  frontMatter.split("\n").forEach((line) => {
    if (!line.trim() || line.trim().startsWith("#")) {
      return;
    }

    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      return;
    }

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    meta[key] = value;
  });

  const subjects = (meta.subjects || "")
    .split(",")
    .map((subject) => subject.trim().toLowerCase())
    .filter(Boolean);

  return {
    title: meta.title || titleFromFileName(fileName),
    date: meta.date || "",
    subjects,
    summary: meta.summary || bodyToSummary(body),
    filePath
  };
};

const cardMarkup = (post) => {
  const subjectTags = post.subjects.map((subject) => `<span class="tag">${escapeHtml(subject)}</span>`).join("");

  return `
    <article class="card reveal" data-delay="1">
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.summary)}</p>
      <div class="meta">
        <span class="tag">${escapeHtml(formatDate(post.date))}</span>
        ${subjectTags}
      </div>
      <div class="cta-row">
        <a class="button secondary" href="${encodeURI(post.filePath)}">Read Story</a>
      </div>
    </article>
  `;
};

const sortPosts = (posts) =>
  [...posts].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (Number.isNaN(dateA) && Number.isNaN(dateB)) {
      return a.title.localeCompare(b.title);
    }

    if (Number.isNaN(dateA)) {
      return 1;
    }

    if (Number.isNaN(dateB)) {
      return -1;
    }

    return dateB - dateA;
  });

const renderPosts = (posts, activeSubject) => {
  const filteredPosts =
    activeSubject === "all"
      ? posts
      : posts.filter((post) => post.subjects.includes(activeSubject));

  if (filteredPosts.length === 0) {
    blogContainer.innerHTML = '<p class="muted">No stories match this subject yet.</p>';
    blogStatus.textContent = "0 stories displayed";
    return;
  }

  blogContainer.innerHTML = filteredPosts.map(cardMarkup).join("");
  blogStatus.textContent = `${filteredPosts.length} stories displayed`;
};

const renderFilters = (subjects, onSelect) => {
  const buttons = ["all", ...subjects].map((subject) => {
    const label = subject === "all" ? "All" : subject;
    return `<button class="filter-chip${subject === "all" ? " active" : ""}" type="button" data-subject="${escapeHtml(subject)}">${escapeHtml(label)}</button>`;
  });

  subjectFilters.innerHTML = buttons.join("");

  subjectFilters.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
      subjectFilters.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("active"));
      button.classList.add("active");
      onSelect(button.dataset.subject || "all");
    });
  });
};

const loadBlog = async () => {
  blogStatus.textContent = "Loading stories from blog/...";

  try {
    const contentsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${blogFolder}?ref=${branch}`
    );

    if (!contentsResponse.ok) {
      throw new Error(`Contents API responded with status ${contentsResponse.status}`);
    }

    const entries = await contentsResponse.json();
    const storyFiles = entries.filter(
      (entry) =>
        entry.type === "file" &&
        /\.(md|markdown|txt|html)$/i.test(entry.name)
    );

    if (storyFiles.length === 0) {
      blogContainer.innerHTML = '<p class="muted">No story files were found in blog/ yet.</p>';
      blogStatus.textContent = "0 stories displayed";
      subjectFilters.innerHTML = "";
      return;
    }

    const postResults = await Promise.allSettled(
      storyFiles.map(async (file) => {
        if (!file.download_url) {
          throw new Error(`No download URL for ${file.name}`);
        }

        const storyResponse = await fetch(file.download_url);

        if (!storyResponse.ok) {
          throw new Error(`Could not load ${file.name}`);
        }

        const content = await storyResponse.text();
        return parseFrontMatter(content, file.name, file.path);
      })
    );

    const posts = postResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    const sortedPosts = sortPosts(posts);
    const subjects = [...new Set(sortedPosts.flatMap((post) => post.subjects))].sort((a, b) =>
      a.localeCompare(b)
    );

    let currentSubject = "all";

    renderFilters(subjects, (nextSubject) => {
      currentSubject = nextSubject;
      renderPosts(sortedPosts, currentSubject);
    });

    renderPosts(sortedPosts, currentSubject);
  } catch (error) {
    blogContainer.innerHTML = `
      <div class="error-box">
        Could not load blog stories right now. Make sure the <strong>blog/</strong> folder exists in this repository.
      </div>
    `;
    blogStatus.textContent = "Error loading stories";
    subjectFilters.innerHTML = "";
    console.error(error);
  }
};

loadBlog();
