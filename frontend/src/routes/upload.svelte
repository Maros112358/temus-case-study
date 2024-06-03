<script>
  import { onMount } from 'svelte';
  let file;
  let files = [];
  let selectedFileName = 'Choose File';
  let uploadStatus = '';
  let isUploading = false;

  const handleFileChange = (event) => {
    file = event.target.files[0];
    if (file) {
      selectedFileName = file.name;
    } else {
      selectedFileName = 'Choose File';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    uploadStatus = '';
    isUploading = true;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    isUploading = false;

    if (response.ok) {
      uploadStatus = 'File uploaded successfully!';
      await fetchFiles(); // Refresh the file list after upload
      selectedFileName = 'Choose File'; // Reset the file input label
    } else {
      uploadStatus = 'File upload failed. Please try again.';
    }
  };

  const fetchFiles = async () => {
    const response = await fetch('/api/files');
    if (response.ok) {
      files = await response.json();
    } else {
      console.error('Failed to fetch files');
    }
  };

  onMount(() => {
    fetchFiles();
  });
</script>

<div class="upload-panel" class:is-uploading={isUploading}>
  <form on:submit={handleSubmit} class="upload-form">
    <input type="file" accept="application/pdf" on:change={handleFileChange} id="fileInput" />
    <label for="fileInput" class="custom-file-input">{selectedFileName}</label>
    <button type="submit" class="upload-button">Upload</button>
  </form>
  <p class="upload-status">
    {#if isUploading}
      <span class="spinner">⏳</span>
    {:else}
      {uploadStatus}
    {/if}
  </p>
  <ul class="file-list">
    {#each files as file}
      <li class="file-item">
        <span class="file-icon">📄</span>
        <span class="file-name">{file}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
.upload-panel {
  background-color: #2c2f33;
  height: 100vh;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #ffffff;
  width: 20%;
}

.upload-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

#fileInput {
  display: none;
}

.custom-file-input {
  background-color: #7289da;
  color: white;
  padding: 0.5em 1em;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}

.upload-button {
  background-color: #7289da;
  color: white;
  padding: 0.5em 1em;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.upload-button:hover, .custom-file-input:hover {
  background-color: #5b6eae;
}

.upload-status {
  margin: 10px 0;
  color: #ffffff;
}

.spinner {
  font-size: 1.2em;
}

.file-list {
  list-style-type: none;
  padding: 0;
  width: 100%;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  color: #ffffff;
}

.file-icon {
  margin-right: 10px;
}

.file-name {
  flex-grow: 1;
}

.is-uploading {
  cursor: wait;
}
</style>
