<script>
  import { createEventDispatcher } from 'svelte'
  import { writable } from 'svelte/store'

  let promptText = '';
  const dispatch = createEventDispatcher();
  let messages = writable([
    {
      role: 'system',
      content: 'You are a chatbot that provides factual answers to user questions, by referring to a knowledge base created from the PDF files of financial reports of big listed public companies. In your answer, you specify from which pdf files and pages of those files you extracted your answer. File names are stored in field "files" of context, pages in "pages".',
      visibleContent: null
    }
  ]);
  let isLoading = writable(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    messages.update(currentMessages => {
      const updatedMessages = [
        ...currentMessages, 
        { role: 'user', visibleContent: promptText, content: null}
      ];
      isLoading.set(true);
      fetchConversation(updatedMessages);
      return updatedMessages;
    });

    // Clear the prompt text
    promptText = '';
  };

  const fetchConversation = async (conversation) => {
    try {
      const response = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversation })
      });

      if (response.ok) {
        const data = await response.json();
        // Add the bot's response to the messages list
        messages.set(data.newConversation);
        dispatch('success', { data });
      } else {
        const error = await response.text();
        dispatch('error', { error });
      }
    } catch (error) {
      dispatch('error', { error: error.message });
    } finally {
      isLoading.set(false);
    }
  };
</script>

<div class="chat-container">
  <ul class="messages">
    {#each $messages as message}
      {#if message.visibleContent}
        <li class={message.role}><strong>{message.role}:</strong> {message.visibleContent}</li>
      {/if}
    {/each}
  </ul>

  {#if $isLoading}
    <div class="loading">Processing...</div>
  {/if}

  <form on:submit={handleSubmit} class="input-form">
    <input type="text" bind:value={promptText} placeholder="Enter prompt" required />
    <button type="submit">Send</button>
  </form>
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100vh;
    width: 100%;
    margin: 0 auto;
    padding: 1em;
    box-sizing: border-box;
  }

  .messages {
    list-style-type: none;
    padding: 0;
    margin: 0;
    width: 100%;
    overflow-y: auto;
    flex-grow: 1;
  }

  .messages li {
    margin: 0.5em 0;
    padding: 0.5em;
    border-radius: 10px;
    max-width: 60%;
  }

  .messages li strong {
    text-transform: capitalize;
  }

  .messages li.user {
    background-color: #d1e7dd;
    margin-left: auto;
    text-align: right;
  }

  .messages li.assistant {
    background-color: #f8d7da;
    margin-right: auto;
    text-align: left;
  }

  .loading {
    margin: 1em;
    font-size: 1.2em;
    color: #555;
  }

  .input-form {
    display: flex;
    width: 100%;
    max-width: 600px;
  }

  .input-form input {
    flex-grow: 1;
    padding: 0.5em;
    border: 1px solid #ccc;
    border-radius: 10px 0 0 10px;
  }

  .input-form button {
    padding: 0.5em 1em;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 0 10px 10px 0;
    cursor: pointer;
  }

  .input-form button:hover {
    background-color: #0056b3;
  }
</style>
